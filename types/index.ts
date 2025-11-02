export interface Member {
  id: string;
  name: string;
  emoji: string;
  streakCount: number;
  lastStreakDate: string | null; // ISO date string
}

export interface Task {
  id: string;
  name: string;
  emoji: string;
  frequency: 'daily' | 'weekly';
  assignedIndex: number;
  memberIds: string[];
  lastCompletedAt: string | null; // ISO date string for streak calculation
}

export interface Group {
  id: string;
  name: string;
  emoji: string;
  colorStart: string; // Gradient start color
  colorEnd: string; // Gradient end color
  members: Member[];
  tasks: Task[];
}

export interface AppData {
  version: string;
  groups: Group[];
}
