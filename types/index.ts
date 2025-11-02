export interface Member {
  id: string;
  name: string;
  icon: string; // Kept for backward compatibility, but we'll use avatarColor
  avatarColor: string; // Color for initials avatar
}

export interface TaskCompletion {
  memberId: string;
  completedAt: string; // ISO date string
}

export interface TaskSkip {
  memberId: string;
  skippedAt: string; // ISO date string
}

export interface GroupActivity {
  id: string;
  type: 'task_completed' | 'task_skipped' | 'task_created' | 'task_deleted' | 'member_added' | 'member_deleted' | 'group_created';
  timestamp: string; // ISO date string
  actorId?: string; // Member ID who performed the action (optional)
  targetId?: string; // Task ID or Member ID that was affected
  metadata?: {
    taskName?: string;
    taskIcon?: string;
    memberName?: string;
  };
}

export interface Task {
  id: string;
  name: string;
  icon: string; // Icon name from lucide-react-native
  frequency: 'daily' | 'weekly' | 'monthly';
  assignedIndex: number;
  memberIds: string[];
  lastCompletedAt: string | null; // ISO date string for completion tracking
  completionHistory: TaskCompletion[]; // History of completions
  skipHistory: TaskSkip[]; // History of skips
  // Scheduling options (optional, only used when frequency is weekly or monthly)
  scheduleWeek?: number; // For monthly: 1-4 (first, second, third, fourth week)
  scheduleDay?: number; // 0-6 (Sunday = 0, Monday = 1, ..., Saturday = 6)
  scheduleTime?: string; // HH:MM format (24-hour), e.g., "14:30" for 2:30 PM
}

export interface Group {
  id: string;
  name: string;
  icon: string; // Icon name from lucide-react-native
  colorStart: string; // Gradient start color
  colorEnd: string; // Gradient end color
  members: Member[];
  tasks: Task[];
  createdAt: string; // ISO date string - when group was created
  activities: GroupActivity[]; // Activity feed for this group
}

export interface AppData {
  version: string;
  groups: Group[];
}
