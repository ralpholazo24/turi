import { AppData, Group, Member, Task } from '@/types';
import { getRandomAvatarColor } from '@/utils/member-avatar';
import { isSoloMode } from '@/utils/solo-mode';
import { loadData, saveData } from '@/utils/storage';
import { create } from 'zustand';

// Helper function to get week number for weekly task validation
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
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
  createGroup: (name: string, icon: string, colorStart: string, colorEnd: string) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  
  addMember: (groupId: string, name: string, icon: string) => Promise<void>;
  updateMember: (groupId: string, memberId: string, updates: Partial<Member>) => Promise<void>;
  deleteMember: (groupId: string, memberId: string) => Promise<void>;
  
  addTask: (groupId: string, task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (groupId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
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
      set({ groups: data.groups, isLoading: false });
    } catch (error) {
      console.error('Error initializing app:', error);
      set({ isLoading: false });
    }
  },
  
  persist: async () => {
    const { groups } = get();
    const appData: AppData = {
      version: '1.0.0',
      groups,
    };
    await saveData(appData);
  },
  
  createGroup: async (name: string, icon: string, colorStart: string, colorEnd: string) => {
    const newGroup: Group = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      icon,
      colorStart,
      colorEnd,
      members: [],
      tasks: [],
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
    set((state) => ({
      groups: state.groups.filter((group) => group.id !== groupId),
    }));
    
    await get().persist();
  },
  
  addMember: async (groupId: string, name: string, icon: string) => {
    const newMember: Member = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      icon, // Keep for backward compatibility
      avatarColor: getRandomAvatarColor(), // Random color for avatar
    };
    
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId
          ? { ...group, members: [...group.members, newMember] }
          : group
      ),
    }));
    
    await get().persist();
  },
  
  updateMember: async (groupId: string, memberId: string, updates: Partial<Member>) => {
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
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              members: group.members.filter((member) => member.id !== memberId),
              tasks: group.tasks.map((task) => ({
                ...task,
                memberIds: task.memberIds.filter((id) => id !== memberId),
              })),
            }
          : group
      ),
    }));
    
    await get().persist();
  },
  
  addTask: async (groupId: string, taskData: Omit<Task, 'id'>) => {
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
    
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...finalTaskData,
      assignedIndex: finalTaskData.assignedIndex ?? 0,
      lastCompletedAt: null,
      completionHistory: finalTaskData.completionHistory || [],
    };
    
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId
          ? { ...group, tasks: [...group.tasks, newTask] }
          : group
      ),
    }));
    
    await get().persist();
  },
  
  updateTask: async (groupId: string, taskId: string, updates: Partial<Task>) => {
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
  },
  
  deleteTask: async (groupId: string, taskId: string) => {
    set((state) => ({
      groups: state.groups.map((group) =>
        group.id === groupId
          ? { ...group, tasks: group.tasks.filter((task) => task.id !== taskId) }
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
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    if (task.lastCompletedAt) {
      const lastCompleted = new Date(task.lastCompletedAt);
      lastCompleted.setHours(0, 0, 0, 0);
      
      if (task.frequency === 'daily') {
        // For daily tasks, check if completed today
        const daysDiff = Math.floor(
          (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysDiff === 0) {
          // Already completed today, don't allow another completion
          return;
        }
      } else if (task.frequency === 'weekly') {
        // For weekly tasks, check if completed this week
        const lastCompletedWeek = getWeekNumber(lastCompleted);
        const currentWeek = getWeekNumber(today);
        if (lastCompletedWeek === currentWeek) {
          // Already completed this week, don't allow another completion
          return;
        }
      } else if (task.frequency === 'monthly') {
        // For monthly tasks, check if completed this month
        const lastCompletedMonth = lastCompleted.getMonth();
        const lastCompletedYear = lastCompleted.getFullYear();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        if (lastCompletedMonth === currentMonth && lastCompletedYear === currentYear) {
          // Already completed this month, don't allow another completion
          return;
        }
      }
    }
    
    // Get current assigned member
    const currentMember = assignedMembers[task.assignedIndex];
    
    // In solo mode, don't rotate - just update completion time
    const isSolo = isSoloMode(group);
    const nextIndex = isSolo ? task.assignedIndex : (task.assignedIndex + 1) % assignedMembers.length;
    
    // Update task: rotate assignment (or keep same in solo mode) and update completion time
    const nowISO = now.toISOString();
    
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
                      lastCompletedAt: nowISO,
                      completionHistory: [
                        ...(t.completionHistory || []),
                        {
                          memberId: currentMember.id,
                          completedAt: nowISO,
                        },
                      ],
                    }
                  : t
              ),
            }
          : g
      ),
    }));
    
    await get().persist();
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
    
    // Calculate next index (rotate)
    const nextIndex = (task.assignedIndex + 1) % assignedMembers.length;
    
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
                    }
                  : t
              ),
            }
          : g
      ),
    }));
    
    await get().persist();
  },
}));

