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
  } else if (task.frequency === 'weekly') {
    // For weekly tasks, check if completed this week
    const lastCompletedWeek = getWeekNumber(lastCompleted);
    const currentWeek = getWeekNumber(today);
    if (lastCompletedWeek === currentWeek) {
      return {
        isCompleted: true,
        message: 'Done for this week!',
      };
    }
  } else if (task.frequency === 'monthly') {
    // For monthly tasks, check if completed this month
    const lastCompletedMonth = lastCompleted.getMonth();
    const lastCompletedYear = lastCompleted.getFullYear();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    if (lastCompletedMonth === currentMonth && lastCompletedYear === currentYear) {
      return {
        isCompleted: true,
        message: 'Done for this month!',
      };
    }
  }

  return { isCompleted: false, message: '' };
}

/**
 * Check if a task is overdue (should have been completed but hasn't been)
 * @param task - The task to check
 * @returns true if the task is overdue, false otherwise
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.lastCompletedAt) {
    // If never completed, check if it's past the initial due date
    // For now, we'll consider tasks overdue if they haven't been completed and it's been at least one period
    // This is a simple check - we could enhance it with scheduleWeek/scheduleDay for more accuracy
    return false; // Don't mark as overdue if never started
  }

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const lastCompleted = new Date(task.lastCompletedAt);
  lastCompleted.setHours(0, 0, 0, 0);

  if (task.frequency === 'daily') {
    // For daily tasks, overdue if last completed was more than 1 day ago
    const daysDiff = Math.floor(
      (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff > 1; // Overdue if more than 1 day has passed
  } else if (task.frequency === 'weekly') {
    // For weekly tasks, overdue if last completed was more than 7 days ago
    const daysDiff = Math.floor(
      (today.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysDiff > 7; // Overdue if more than 7 days has passed
  } else if (task.frequency === 'monthly') {
    // For monthly tasks, overdue if last completed was more than 1 month ago
    const lastCompletedMonth = lastCompleted.getMonth();
    const lastCompletedYear = lastCompleted.getFullYear();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Check if it's been more than a month
    const monthsDiff = (currentYear - lastCompletedYear) * 12 + (currentMonth - lastCompletedMonth);
    return monthsDiff > 1; // Overdue if more than 1 month has passed
  }

  return false;
}

