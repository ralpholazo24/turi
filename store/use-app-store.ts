import { DEFAULT_GROUP_COLOR } from "@/constants/groups";
import { AppData, Group, GroupActivity, Member, Task } from "@/types";
import { getRandomAvatarColor } from "@/utils/member-avatar";
import {
  cancelAllTaskNotifications,
  cancelTaskNotification,
  rescheduleGroupNotifications,
  scheduleTaskNotification,
} from "@/utils/notification-service";
import { isSoloMode } from "@/utils/solo-mode";
import { loadData, saveData } from "@/utils/storage";
import { getTaskCompletionStatus } from "@/utils/task-completion";
import * as Notifications from "expo-notifications";
import { create } from "zustand";
import { useNotificationStore } from "./use-notification-store";
import { useUserStore } from "./use-user-store";

// Helper function to get week number for weekly task validation
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

interface AppState {
  groups: Group[];
  isLoading: boolean;

  // Actions
  initialize: () => Promise<void>;
  createGroup: (
    name: string,
    icon: string,
    colorPreset: string
  ) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;

  addMember: (groupId: string, name: string) => Promise<void>;
  updateMember: (
    groupId: string,
    memberId: string,
    updates: Partial<Member>
  ) => Promise<void>;
  deleteMember: (groupId: string, memberId: string) => Promise<void>;

  addTask: (groupId: string, task: Omit<Task, "id">) => Promise<void>;
  updateTask: (
    groupId: string,
    taskId: string,
    updates: Partial<Task>
  ) => Promise<void>;
  deleteTask: (groupId: string, taskId: string) => Promise<void>;
  markTaskDone: (groupId: string, taskId: string) => Promise<void>;
  skipTurn: (groupId: string, taskId: string) => Promise<void>;

  // Helper to persist data
  persist: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  groups: [],
  isLoading: false,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const data = await loadData();
      // Migrate groups from colorStart/colorEnd to colorPreset if needed
      // Also ensure ownerId exists for backward compatibility
      const migratedGroups = data.groups.map((group) => {
        // Check if group has old format (colorStart/colorEnd) or missing colorPreset
        const oldGroup = group as Group & {
          colorStart?: string;
          colorEnd?: string;
          ownerId?: string;
        };

        let updatedGroup = oldGroup;

        // Migrate color preset
        if (
          (oldGroup.colorStart && oldGroup.colorEnd && !oldGroup.colorPreset) ||
          !oldGroup.colorPreset
        ) {
          // Try to find matching preset
          const { GROUP_COLOR_PRESETS } = require("@/constants/groups");
          const matchingPreset =
            oldGroup.colorStart && oldGroup.colorEnd
              ? GROUP_COLOR_PRESETS.find(
                  (p: { start: string; end: string }) =>
                    p.start === oldGroup.colorStart &&
                    p.end === oldGroup.colorEnd
                )
              : null;

          if (matchingPreset) {
            const { colorStart, colorEnd, ...rest } = oldGroup;
            updatedGroup = {
              ...rest,
              colorPreset: matchingPreset.name,
            } as Group & { ownerId?: string };
          } else {
            // Default to first preset if no match found or no old colors
            const { colorStart, colorEnd, ...rest } = oldGroup;
            updatedGroup = {
              ...rest,
              colorPreset: DEFAULT_GROUP_COLOR.name,
            } as Group & { ownerId?: string };
          }
        }

        // Ensure ownerId exists (migration for existing groups)
        if (!updatedGroup.ownerId) {
          updatedGroup = {
            ...updatedGroup,
            ownerId:
              updatedGroup.members.length > 0
                ? updatedGroup.members[0].id
                : `user_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`,
          };
        }

        return updatedGroup as Group;
      });

      // Save migrated data if migration occurred
      if (migratedGroups.some((g, i) => g !== data.groups[i])) {
        const migratedData: AppData = {
          version: "1.0.0",
          groups: migratedGroups,
        };
        await saveData(migratedData);
      }

      set({ groups: migratedGroups, isLoading: false });

      // Ensure notification store is initialized before reading its state
      const notificationStore = useNotificationStore.getState();
      if (notificationStore.isLoading) {
        // Initialize notification store if not already initialized
        await notificationStore.initializeNotifications();
      }

      // Reschedule all notifications on app initialization
      const { notificationsEnabled, reminderMinutes } =
        useNotificationStore.getState();
      if (notificationsEnabled && data.groups.length > 0) {
        // Cancel all existing notifications first to avoid duplicates
        const allNotifications =
          await Notifications.getAllScheduledNotificationsAsync();
        for (const notification of allNotifications) {
          if (notification.content.data?.type === "task_reminder") {
            await Notifications.cancelScheduledNotificationAsync(
              notification.identifier
            );
          }
        }

        // Reschedule notifications for all groups
        for (const group of data.groups) {
          await rescheduleGroupNotifications(group, reminderMinutes);
        }
      }
    } catch (error) {
      console.error("Error initializing app:", error);
      set({ isLoading: false });
    }
  },

  persist: async () => {
    const { groups } = get();
    const appData: AppData = {
      version: "1.0.0",
      groups,
    };
    await saveData(appData);
  },

  createGroup: async (name: string, icon: string, colorPreset: string) => {
    const nowISO = new Date().toISOString();
    const user = useUserStore.getState().user;

    // Ensure user exists before creating group
    if (!user) {
      console.error(
        "Cannot create group: user not set. Please complete onboarding first."
      );
      return;
    }

    // Auto-add user as first member and owner
    const ownerMember: Member = {
      id: user.id,
      name: user.name,
      avatarColor: user.avatarColor,
    };

    const newGroup: Group = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      icon,
      colorPreset,
      ownerId: user.id,
      members: [ownerMember],
      tasks: [],
      createdAt: nowISO,
      activities: [
        {
          id: `activity_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          type: "group_created",
          timestamp: nowISO,
        },
      ],
    };

    set((state) => ({
      groups: [...state.groups, newGroup],
    }));

    await get().persist();
  },

  updateGroup: async (groupId: string, updates: Partial<Group>) => {
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId ? { ...group, ...updates } : group
      ),
    }));

    await get().persist();
  },

  deleteGroup: async (groupId: string) => {
    // Cancel all notifications for this group before deleting
    await cancelAllTaskNotifications(groupId);

    set((state) => ({
      groups: state.groups.filter((group) => group.id !== groupId),
    }));

    await get().persist();
  },

  addMember: async (groupId: string, name: string) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group) return;

    const newMember: Member = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      avatarColor: getRandomAvatarColor(), // Random color for avatar
    };

    const nowISO = new Date().toISOString();
    const activity: GroupActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "member_added",
      timestamp: nowISO,
      targetId: newMember.id,
      metadata: {
        type: "member_added",
        memberName: name,
      },
    };

    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: [...group.members, newMember],
              activities: [...(group.activities || []), activity],
            }
          : group
      ),
    }));

    await get().persist();
  },

  updateMember: async (
    groupId: string,
    memberId: string,
    updates: Partial<Member>
  ) => {
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: group.members.map((member) =>
                member.id === memberId ? { ...member, ...updates } : member
              ),
            }
          : group
      ),
    }));

    await get().persist();
  },

  deleteMember: async (groupId: string, memberId: string) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group) return;

    const member = group.members.find((m) => m.id === memberId);
    const nowISO = new Date().toISOString();
    const activity: GroupActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "member_deleted",
      timestamp: nowISO,
      targetId: memberId,
      metadata: {
        type: "member_deleted",
        memberName: member?.name || "Unknown",
      },
    };

    // Get remaining members after deletion
    const remainingMembers = group.members.filter(
      (member) => member.id !== memberId
    );

    const updatedGroup = get()
      .groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: remainingMembers,
              tasks: group.tasks.map((task) => {
                // Remove deleted member from task assignments
                const updatedMemberIds = task.memberIds.filter(
                  (id) => id !== memberId
                );

                // If task would have 0 members, assign to first available member (if any)
                let finalMemberIds = updatedMemberIds;
                let finalAssignedIndex = task.assignedIndex;

                if (
                  updatedMemberIds.length === 0 &&
                  remainingMembers.length > 0
                ) {
                  // Task has no members, assign to first available
                  finalMemberIds = [remainingMembers[0].id];
                  finalAssignedIndex = 0;
                } else if (updatedMemberIds.length > 0) {
                  // Ensure assignedIndex is within bounds
                  finalAssignedIndex = Math.min(
                    task.assignedIndex,
                    updatedMemberIds.length - 1
                  );
                  // If current assigned member was deleted, reset to first member
                  if (
                    !updatedMemberIds.includes(
                      task.memberIds[task.assignedIndex] || ""
                    )
                  ) {
                    finalAssignedIndex = 0;
                  } else {
                    // Find new index for the current member
                    finalAssignedIndex = updatedMemberIds.indexOf(
                      task.memberIds[task.assignedIndex]
                    );
                  }
                }

                return {
                  ...task,
                  memberIds: finalMemberIds,
                  assignedIndex: finalAssignedIndex,
                };
              }),
              activities: [...(group.activities || []), activity],
            }
          : group
      )
      .find((g) => g.id === groupId);

    set({
      groups: updatedGroup
        ? get().groups.map((group) =>
            group.id === groupId ? updatedGroup : group
          )
        : get().groups,
    });

    await get().persist();

    // Reschedule notifications for all tasks in the group (in case assignments changed)
    if (updatedGroup) {
      const { notificationsEnabled, reminderMinutes } =
        useNotificationStore.getState();
      if (notificationsEnabled) {
        await rescheduleGroupNotifications(updatedGroup, reminderMinutes);
      }
    }
  },

  addTask: async (groupId: string, taskData: Omit<Task, "id">) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group) return;

    // In solo mode, automatically assign to the single member
    let finalTaskData = taskData;
    if (isSoloMode(group)) {
      const soloMember = group.members[0];
      finalTaskData = {
        ...taskData,
        memberIds: [soloMember.id],
        assignedIndex: 0,
      };
    }

    // Ensure task has at least one member assigned
    if (!finalTaskData.memberIds || finalTaskData.memberIds.length === 0) {
      if (group.members.length > 0) {
        // Auto-assign to first member if none selected
        finalTaskData.memberIds = [group.members[0].id];
        finalTaskData.assignedIndex = 0;
      } else {
        // No members in group, cannot create task
        console.error("Cannot create task: group has no members");
        return;
      }
    }

    // Ensure assignedIndex is within bounds
    const validAssignedIndex = Math.min(
      finalTaskData.assignedIndex ?? 0,
      finalTaskData.memberIds.length - 1
    );

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...finalTaskData,
      assignedIndex: validAssignedIndex,
      completionHistory: finalTaskData.completionHistory || [],
      skipHistory: [],
    };

    const nowISO = new Date().toISOString();
    const activity: GroupActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "task_created",
      timestamp: nowISO,
      targetId: newTask.id,
      metadata: {
        type: "task_created",
        taskName: newTask.name,
        taskIcon: newTask.icon,
      },
    };

    const updatedGroup = get()
      .groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              tasks: [...group.tasks, newTask],
              activities: [...(group.activities || []), activity],
            }
          : group
      )
      .find((g) => g.id === groupId);

    set({
      groups: updatedGroup
        ? get().groups.map((group) =>
            group.id === groupId ? updatedGroup : group
          )
        : get().groups,
    });

    await get().persist();

    // Schedule notification if enabled
    if (updatedGroup) {
      const { notificationsEnabled, reminderMinutes } =
        useNotificationStore.getState();
      if (notificationsEnabled) {
        await scheduleTaskNotification(newTask, updatedGroup, reminderMinutes);
      }
    }
  },

  updateTask: async (
    groupId: string,
    taskId: string,
    updates: Partial<Task>
  ) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group) return;

    const task = group.tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Validate memberIds - ensure at least one member is assigned
    if (updates.memberIds !== undefined) {
      if (updates.memberIds.length === 0) {
        // Cannot have task with 0 members - auto-assign to first member if available
        if (group.members.length > 0) {
          updates.memberIds = [group.members[0].id];
          updates.assignedIndex = 0;
        } else {
          console.error("Cannot update task: group has no members");
          return;
        }
      }
    }

    // Ensure assignedIndex is within bounds if memberIds are being updated
    if (updates.memberIds !== undefined) {
      const finalMemberIds = updates.memberIds;
      let finalAssignedIndex = updates.assignedIndex ?? task.assignedIndex;

      // If assignedIndex is being updated, validate it
      if (updates.assignedIndex !== undefined) {
        finalAssignedIndex = Math.min(
          updates.assignedIndex,
          finalMemberIds.length - 1
        );
      } else {
        // If memberIds changed but assignedIndex didn't, ensure it's still valid
        finalAssignedIndex = Math.min(
          task.assignedIndex,
          finalMemberIds.length - 1
        );

        // If current assigned member is not in new list, reset to first member
        const currentMemberId = task.memberIds[task.assignedIndex];
        if (!finalMemberIds.includes(currentMemberId)) {
          finalAssignedIndex = 0;
        } else {
          // Find new index for current member
          finalAssignedIndex = finalMemberIds.indexOf(currentMemberId);
        }
      }

      updates.assignedIndex = finalAssignedIndex;
      updates.memberIds = finalMemberIds;
    } else if (updates.assignedIndex !== undefined) {
      // Only assignedIndex is being updated, validate it against current memberIds
      const currentMemberIds = task.memberIds;
      updates.assignedIndex = Math.min(
        updates.assignedIndex,
        currentMemberIds.length - 1
      );
    }

    // Cancel old notification before updating
    await cancelTaskNotification(taskId);

    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              tasks: group.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updates } : task
              ),
            }
          : group
      ),
    }));

    await get().persist();

    // Schedule new notification if enabled
    const updatedGroup = get().groups.find((g) => g.id === groupId);
    const updatedTask = updatedGroup?.tasks.find((t) => t.id === taskId);
    if (updatedGroup && updatedTask) {
      const { notificationsEnabled, reminderMinutes } =
        useNotificationStore.getState();
      if (notificationsEnabled) {
        await scheduleTaskNotification(
          updatedTask,
          updatedGroup,
          reminderMinutes
        );
      }
    }
  },

  deleteTask: async (groupId: string, taskId: string) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group) return;

    // Cancel notification before deleting
    await cancelTaskNotification(taskId);

    const task = group.tasks.find((t) => t.id === taskId);
    const nowISO = new Date().toISOString();
    const activity: GroupActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "task_deleted",
      timestamp: nowISO,
      targetId: taskId,
      metadata: {
        type: "task_deleted",
        taskName: task?.name || "Unknown",
        taskIcon: task?.icon || "",
      },
    };

    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              tasks: group.tasks.filter((task) => task.id !== taskId),
              activities: [...(group.activities || []), activity],
            }
          : group
      ),
    }));

    await get().persist();
  },

  markTaskDone: async (groupId: string, taskId: string) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group) return;

    const task = group.tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Get assigned members for this task
    const assignedMembers = group.members.filter((m) =>
      task.memberIds.includes(m.id)
    );

    if (assignedMembers.length === 0) return;

    // Check if task was already completed in the current period
    const completionStatus = getTaskCompletionStatus(task);
    if (completionStatus.isCompleted) {
      // Already completed in current period, don't allow another completion
      return;
    }

    // Ensure assignedIndex is within bounds (in case members were deleted)
    const safeAssignedIndex = Math.min(
      task.assignedIndex,
      assignedMembers.length - 1
    );

    // Get current assigned member
    const currentMember = assignedMembers[safeAssignedIndex];

    if (!currentMember) return; // Safety check

    // In solo mode, don't rotate - just update completion time
    const isSolo = isSoloMode(group);
    const nextIndex = isSolo
      ? safeAssignedIndex
      : (safeAssignedIndex + 1) % assignedMembers.length;

    // Update task: rotate assignment (or keep same in solo mode) and update completion time
    const now = new Date();
    const nowISO = now.toISOString();

    const activity: GroupActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "task_completed",
      timestamp: nowISO,
      actorId: currentMember.id,
      targetId: taskId,
      metadata: {
        type: "task_completed",
        taskName: task.name,
        taskIcon: task.icon,
      },
    };

    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              tasks: g.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      assignedIndex: nextIndex,
                      completionHistory: [
                        ...(t.completionHistory || []),
                        {
                          type: "completed" as const,
                          memberId: currentMember.id,
                          timestamp: nowISO,
                        },
                      ],
                    }
                  : t
              ),
              activities: [...(g.activities || []), activity],
            }
          : g
      ),
    }));

    await get().persist();

    // Cancel old notification and reschedule for next occurrence
    await cancelTaskNotification(taskId);
    const updatedGroup = get().groups.find((g) => g.id === groupId);
    const updatedTask = updatedGroup?.tasks.find((t) => t.id === taskId);
    if (updatedGroup && updatedTask) {
      const { notificationsEnabled, reminderMinutes } =
        useNotificationStore.getState();
      if (notificationsEnabled) {
        await scheduleTaskNotification(
          updatedTask,
          updatedGroup,
          reminderMinutes
        );
      }
    }
  },

  skipTurn: async (groupId: string, taskId: string) => {
    const group = get().groups.find((g) => g.id === groupId);
    if (!group) return;

    const task = group.tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Get assigned members for this task
    const assignedMembers = group.members.filter((m) =>
      task.memberIds.includes(m.id)
    );

    if (assignedMembers.length === 0) return;

    // Ensure assignedIndex is within bounds (in case members were deleted)
    const safeAssignedIndex = Math.min(
      task.assignedIndex,
      assignedMembers.length - 1
    );

    // Get current assigned member
    const currentMember = assignedMembers[safeAssignedIndex];

    if (!currentMember) return; // Safety check

    // Calculate next index (rotate)
    const nextIndex = (safeAssignedIndex + 1) % assignedMembers.length;

    // Record skip in history
    const now = new Date();
    const nowISO = now.toISOString();

    const activity: GroupActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: "task_skipped",
      timestamp: nowISO,
      actorId: currentMember.id,
      targetId: taskId,
      metadata: {
        type: "task_skipped",
        taskName: task.name,
        taskIcon: task.icon,
      },
    };

    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              tasks: g.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      assignedIndex: nextIndex,
                      skipHistory: [
                        ...(t.skipHistory || []),
                        {
                          type: "skipped" as const,
                          memberId: currentMember.id,
                          timestamp: nowISO,
                        },
                      ],
                    }
                  : t
              ),
              activities: [...(g.activities || []), activity],
            }
          : g
      ),
    }));

    await get().persist();

    // Reschedule notification since assignment changed
    await cancelTaskNotification(taskId);
    const updatedGroup = get().groups.find((g) => g.id === groupId);
    const updatedTask = updatedGroup?.tasks.find((t) => t.id === taskId);
    if (updatedGroup && updatedTask) {
      const { notificationsEnabled, reminderMinutes } =
        useNotificationStore.getState();
      if (notificationsEnabled) {
        await scheduleTaskNotification(
          updatedTask,
          updatedGroup,
          reminderMinutes
        );
      }
    }
  },
}));
