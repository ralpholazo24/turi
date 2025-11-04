export interface Member {
  id: string;
  name: string;
  avatarColor: string; // Color for initials avatar
}

export interface User {
  id: string;
  name: string;
  avatarColor: string; // Color for initials avatar
}

export interface TaskHistoryEntry {
  memberId: string;
  timestamp: string; // ISO date string
}

export interface TaskCompletion extends TaskHistoryEntry {
  type: "completed";
}

export interface TaskSkip extends TaskHistoryEntry {
  type: "skipped";
}

export type GroupActivityMetadata =
  | {
      type: "task_completed" | "task_skipped" | "task_created" | "task_deleted";
      taskName: string;
      taskIcon: string;
    }
  | { type: "member_added" | "member_deleted"; memberName: string }
  | { type: "group_created" };

export interface GroupActivity {
  id: string;
  type:
    | "task_completed"
    | "task_skipped"
    | "task_created"
    | "task_deleted"
    | "member_added"
    | "member_deleted"
    | "group_created";
  timestamp: string; // ISO date string
  actorId?: string; // Member ID who performed the action (optional)
  targetId?: string; // Task ID or Member ID that was affected
  metadata?: GroupActivityMetadata;
}

export type TaskSchedule =
  | { frequency: "daily"; time?: string }
  | { frequency: "weekly"; day: number; time?: string }
  | {
      frequency: "monthly";
      type: "dayOfWeek" | "dayOfMonth" | "lastDayOfMonth";
      dayOfWeek?: number; // when type is 'dayOfWeek' or 'lastDayOfMonth' (0-6, Sunday = 0)
      week?: number; // when type is 'dayOfWeek' (1-4)
      dayOfMonth?: number; // when type is 'dayOfMonth' (1-31)
      time?: string;
    };

export interface Task {
  id: string;
  name: string;
  icon: string; // Icon name from lucide-react-native
  frequency: "daily" | "weekly" | "monthly";
  assignedIndex: number;
  memberIds: string[];
  completionHistory: TaskCompletion[]; // History of completions
  skipHistory: TaskSkip[]; // History of skips
  schedule?: TaskSchedule; // Scheduling options
}

export interface Group {
  id: string;
  name: string;
  icon: string; // Icon name from lucide-react-native
  colorPreset: string; // Name of the color preset (e.g., 'Red-Orange')
  ownerId: string; // User ID of the group owner/creator
  members: Member[];
  tasks: Task[];
  createdAt: string; // ISO date string - when group was created
  activities: GroupActivity[]; // Activity feed for this group
}

export interface AppData {
  version: string;
  groups: Group[];
  user?: User; // Current user identity
  onboardingCompleted?: boolean; // Whether user has completed onboarding
}
