import { Task } from '@/types';

/**
 * Helper function to get week number for weekly task validation
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Check if a task is already completed in the current period
 * @param task - The task to check
 * @returns Object with isCompleted flag and status message
 */
export function getTaskCompletionStatus(task: Task): {
  isCompleted: boolean;
  message: string;
} {
  if (!task.lastCompletedAt) {
    return { isCompleted: false, message: '' };
  }

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const lastCompleted = new Date(task.lastCompletedAt);
  lastCompleted.setHours(0, 0, 0, 0);

  if (task.frequency === 'daily') {
    // For daily tasks, check if completed today
    const daysDiff = Math.floor(
      (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff === 0) {
      return {
        isCompleted: true,
        message: 'Done for today!',
      };
    }
  } else {
    // For weekly tasks, check if completed this week
    const lastCompletedWeek = getWeekNumber(lastCompleted);
    const currentWeek = getWeekNumber(today);
    if (lastCompletedWeek === currentWeek) {
      return {
        isCompleted: true,
        message: 'Done for this week!',
      };
    }
  }

  return { isCompleted: false, message: '' };
}

