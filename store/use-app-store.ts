import { create } from 'zustand';
import { AppData, Group, Member, Task } from '@/types';
import { loadData, saveData } from '@/utils/storage';

interface AppState {
  groups: Group[];
  isLoading: boolean;
  
  // Actions
  initialize: () => Promise<void>;
  createGroup: (name: string, emoji: string, colorStart: string, colorEnd: string) => Promise<void>;
  updateGroup: (groupId: string, updates: Partial<Group>) => Promise<void>;
  deleteGroup: (groupId: string) => Promise<void>;
  
  addMember: (groupId: string, name: string, emoji: string) => Promise<void>;
  updateMember: (groupId: string, memberId: string, updates: Partial<Member>) => Promise<void>;
  deleteMember: (groupId: string, memberId: string) => Promise<void>;
  
  addTask: (groupId: string, task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (groupId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (groupId: string, taskId: string) => Promise<void>;
  markTaskDone: (groupId: string, taskId: string) => Promise<void>;
  
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
  
  createGroup: async (name: string, emoji: string, colorStart: string, colorEnd: string) => {
    const newGroup: Group = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      emoji,
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
  
  addMember: async (groupId: string, name: string, emoji: string) => {
    const newMember: Member = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      emoji,
      streakCount: 0,
      lastStreakDate: null,
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
    
    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...taskData,
      assignedIndex: 0,
      lastCompletedAt: null,
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
    
    // Get current assigned member
    const currentMember = assignedMembers[task.assignedIndex];
    
    // Calculate next index (rotate)
    const nextIndex = (task.assignedIndex + 1) % assignedMembers.length;
    
    // Update task: rotate assignment and update completion time
    const now = new Date().toISOString();
    
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
                      lastCompletedAt: now,
                    }
                  : t
              ),
              // Update member streak
              members: g.members.map((m) => {
                if (m.id !== currentMember.id) return m;
                
                const lastStreakDate = m.lastStreakDate
                  ? new Date(m.lastStreakDate)
                  : null;
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                // Check if streak should continue or reset
                if (lastStreakDate) {
                  const streakDate = new Date(lastStreakDate);
                  streakDate.setHours(0, 0, 0, 0);
                  const daysDiff = Math.floor(
                    (today.getTime() - streakDate.getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  // If completed yesterday or today, continue streak
                  if (daysDiff === 0 || daysDiff === 1) {
                    return {
                      ...m,
                      streakCount: daysDiff === 0 ? m.streakCount + 1 : m.streakCount + 1,
                      lastStreakDate: now,
                    };
                  }
                }
                
                // Start new streak
                return {
                  ...m,
                  streakCount: 1,
                  lastStreakDate: now,
                };
              }),
            }
          : g
      ),
    }));
    
    await get().persist();
  },
}));

