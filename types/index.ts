export interface Member {
  id: string;
  name: string;
  icon: string; // Icon name from lucide-react-native
  streakCount: number;
  lastStreakDate: string | null; // ISO date string
}

export interface TaskCompletion {
  memberId: string;
  completedAt: string; // ISO date string
  memberStreakAtTime: number; // Streak count when completed
}

export interface Task {
  id: string;
  name: string;
  icon: string; // Icon name from lucide-react-native
  frequency: 'daily' | 'weekly';
  assignedIndex: number;
  memberIds: string[];
  lastCompletedAt: string | null; // ISO date string for streak calculation
  completionHistory: TaskCompletion[]; // History of completions
}

export interface Group {
  id: string;
  name: string;
  icon: string; // Icon name from lucide-react-native
  colorStart: string; // Gradient start color
  colorEnd: string; // Gradient end color
  members: Member[];
  tasks: Task[];
}

export interface AppData {
  version: string;
  groups: Group[];
}
