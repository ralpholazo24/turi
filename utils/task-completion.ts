import { Task } from '@/types';
import i18n from '@/i18n';
import { getDaysDifference, isSameDay, isSameISOWeek, isSameMonth, startOfDay } from './date-helpers';

/**
 * Get the last completed date from completion history
 * @param task - The task to check
 * @returns ISO date string or null if never completed
 */
export function getLastCompletedAt(task: Task): string | null {
  if (!task.completionHistory || task.completionHistory.length === 0) {
    return null;
  }
  // Sort by timestamp descending and get the most recent
  const sorted = [...task.completionHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return sorted[0]?.timestamp || null;
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
  const lastCompletedAt = getLastCompletedAt(task);
  if (!lastCompletedAt) {
    return { isCompleted: false, message: '' };
  }

  const now = new Date();
  const today = startOfDay(now);

  const lastCompleted = startOfDay(new Date(lastCompletedAt));

  if (task.frequency === 'daily') {
    // For daily tasks, check if completed today
    if (isSameDay(lastCompleted, today)) {
      return {
        isCompleted: true,
        message: i18n.t('task.doneForToday'),
      };
    }
  } else if (task.frequency === 'weekly') {
    // For weekly tasks, check if completed this week (using ISO week)
    if (isSameISOWeek(lastCompleted, today)) {
      return {
        isCompleted: true,
        message: i18n.t('task.doneForThisWeek'),
      };
    }
  } else if (task.frequency === 'monthly') {
    // For monthly tasks, check if completed this month
    if (isSameMonth(lastCompleted, today)) {
      return {
        isCompleted: true,
        message: i18n.t('task.doneForThisMonth'),
      };
    }
  }

  return { isCompleted: false, message: '' };
}

/**
 * Check if a task is overdue (should have been completed but hasn't been)
 * Uses actual due dates from schedule instead of simple day/month differences
 * @param task - The task to check
 * @returns true if the task is overdue, false otherwise
 */
export function isTaskOverdue(task: Task): boolean {
  const lastCompletedAt = getLastCompletedAt(task);
  if (!lastCompletedAt) {
    // If never completed, don't mark as overdue immediately
    // Could check if task creation date + one period has passed, but for now keep it simple
    return false;
  }

  // Import calculateNextDueDate dynamically to avoid circular dependency issues
  const { calculateNextDueDate } = require('./notification-schedule');
  
  const now = new Date();
  const lastCompleted = new Date(lastCompletedAt);
  const lastCompletedStart = startOfDay(lastCompleted);
  
  // Calculate the next due date based on the current task state
  const nextDueDate = calculateNextDueDate(task);
  
  if (!nextDueDate) {
    return false; // Can't determine due date, so can't be overdue
  }
  
  // Check if the next due date is before the last completed date
  // If so, we've missed a due date
  const nextDueDateStart = startOfDay(nextDueDate);
  
  // If next due date is before last completed, we're definitely overdue
  if (nextDueDateStart.getTime() < lastCompletedStart.getTime()) {
    return true;
  }
  
  // For more accurate checking, we need to see if we've passed a due date
  // between lastCompleted and now
  
  if (task.frequency === 'daily') {
    // For daily tasks, overdue if last completed was more than 1 day ago
    const daysDiff = getDaysDifference(lastCompleted, now);
    return daysDiff > 1;
  } else if (task.frequency === 'weekly') {
    // For weekly tasks, check if we've passed the scheduled day without completion
    const daysDiff = getDaysDifference(lastCompleted, now);
    if (daysDiff <= 7) {
      return false; // Still within the week
    }
    
    // More than 7 days have passed - check if next due date is in the past
    return nextDueDate.getTime() < now.getTime();
  } else if (task.frequency === 'monthly') {
    // For monthly tasks, check if we've passed the scheduled date without completion
    const daysDiff = getDaysDifference(lastCompleted, now);
    if (daysDiff < 28) {
      // Within a month, check if we've passed the scheduled date this month
      return nextDueDate.getTime() < now.getTime();
    }
    
    // More than a month has passed - definitely overdue
    return true;
  }

  return false;
}




