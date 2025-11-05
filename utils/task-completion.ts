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
 * Calculate the previous due date (the one that should have been completed)
 * This is useful for checking if a never-completed task is overdue
 */
function calculatePreviousDueDate(task: Task): Date | null {
  const now = new Date();
  const today = startOfDay(now);
  const schedule = task.schedule;

  // Parse scheduled time if available, otherwise use default time
  let scheduledHour = 9; // DEFAULT_NOTIFICATION_HOUR
  let scheduledMinute = 0; // DEFAULT_NOTIFICATION_MINUTE
  
  if (schedule) {
    const time = schedule.time;
    if (time) {
      // Import parseTime dynamically to avoid circular dependency
      const { parseTime } = require('./date-helpers');
      const parsed = parseTime(time);
      if (parsed) {
        scheduledHour = parsed.hours;
        scheduledMinute = parsed.minutes;
      }
    }
  }

  if (task.frequency === 'daily') {
    // For daily tasks, check if today's scheduled time has passed
    // If it has, then today was the due date (and we're checking after it passed, so it's overdue)
    // If it hasn't, then we can't determine if it's overdue yet (task might have been created today)
    const todayDue = new Date(today);
    todayDue.setHours(scheduledHour, scheduledMinute, 0, 0);
    
    // Only return a previous due date if today's time has passed
    // This prevents newly created tasks from being marked overdue immediately
    if (todayDue.getTime() <= now.getTime()) {
      // Today's time has passed, so today was the due date
      return todayDue;
    }
    
    // Time hasn't passed yet, so we can't determine if task is overdue
    // (task might have been created today and due today)
    return null;
  }

  if (task.frequency === 'weekly') {
    if (!schedule || schedule.frequency !== 'weekly' || schedule.day === undefined) {
      // For weekly tasks without schedule, can't determine exact overdue
      return null;
    }
    
    const targetDay = schedule.day;
    const currentDay = now.getDay();
    
    // Calculate today's due date if today is the target day
    const todayDue = new Date(today);
    todayDue.setHours(scheduledHour, scheduledMinute, 0, 0);
    
    // Days since last occurrence of target day
    let daysAgo = (currentDay - targetDay + 7) % 7;
    
    // If today is the target day
    if (daysAgo === 0) {
      // If time has passed today, today is the due date
      if (todayDue.getTime() <= now.getTime()) {
        return todayDue;
      }
      // Time hasn't passed yet, so last week was the due date
      const lastWeekDue = new Date(todayDue);
      lastWeekDue.setDate(lastWeekDue.getDate() - 7);
      return lastWeekDue;
    }
    
    // Today is not the target day, go back to the last occurrence
    const lastOccurrenceDue = new Date(todayDue);
    lastOccurrenceDue.setDate(lastOccurrenceDue.getDate() - daysAgo);
    return lastOccurrenceDue;
  }

  if (task.frequency === 'monthly') {
    if (!schedule || schedule.frequency !== 'monthly') {
      return null;
    }
    
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Import helper functions dynamically
    const { getValidMonthlyDate, getLastOccurrenceOfDay } = require('./date-helpers');
    
    if (schedule.type === 'dayOfMonth' && schedule.dayOfMonth !== undefined) {
      const targetDay = schedule.dayOfMonth;
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const validDay = Math.min(targetDay, daysInMonth);
      
      const thisMonthDue = new Date(currentYear, currentMonth, validDay);
      thisMonthDue.setHours(scheduledHour, scheduledMinute, 0, 0);
      
      // If this month's due date has passed, it's the previous due date
      if (thisMonthDue.getTime() <= now.getTime()) {
        return thisMonthDue;
      }
      // If this month's due date hasn't passed yet, we can't determine if task is overdue
      // (task might have been created today and due this month)
      return null;
    } else if (schedule.type === 'lastDayOfMonth' && schedule.dayOfWeek !== undefined) {
      const targetDay = schedule.dayOfWeek;
      
      // Try current month first
      const thisMonthDue = getLastOccurrenceOfDay(currentYear, currentMonth, targetDay);
      thisMonthDue.setHours(scheduledHour, scheduledMinute, 0, 0);
      
      if (thisMonthDue.getTime() <= now.getTime()) {
        return thisMonthDue;
      }
      // If this month's due date hasn't passed yet, we can't determine if task is overdue
      return null;
    } else {
      // Default: dayOfWeek - nth occurrence of a day
      const targetWeek = schedule.week !== undefined ? schedule.week : 1;
      const targetDay = schedule.dayOfWeek !== undefined ? schedule.dayOfWeek : 1;
      
      const thisMonthDue = getValidMonthlyDate(currentYear, currentMonth, targetWeek, targetDay);
      thisMonthDue.setHours(scheduledHour, scheduledMinute, 0, 0);
      
      if (thisMonthDue.getTime() <= now.getTime()) {
        return thisMonthDue;
      }
      // If this month's due date hasn't passed yet, we can't determine if task is overdue
      return null;
    }
  }

  return null;
}

/**
 * Check if a task is overdue (should have been completed but hasn't been)
 * Uses actual due dates from schedule instead of simple day/month differences
 * @param task - The task to check
 * @returns true if the task is overdue, false otherwise
 */
export function isTaskOverdue(task: Task): boolean {
  const lastCompletedAt = getLastCompletedAt(task);
  const now = new Date();
  
  // Import calculateNextDueDate dynamically to avoid circular dependency issues
  const { calculateNextDueDate } = require('./notification-schedule');
  
  // If task was never completed, check if a due date has passed
  if (!lastCompletedAt) {
    // Get task creation date to avoid marking newly created tasks as overdue
    const taskCreatedAt = task.createdAt;
    
    const previousDueDate = calculatePreviousDueDate(task);
    if (!previousDueDate) {
      return false; // Can't determine due date, so can't be overdue
    }
    
    // If we have task creation date, ensure the due date is after task creation
    if (taskCreatedAt) {
      const taskCreated = new Date(taskCreatedAt);
      // Only mark as overdue if the due date is after the task was created
      // This prevents newly created tasks from being marked overdue immediately
      if (previousDueDate.getTime() < taskCreated.getTime()) {
        return false; // Due date is before task was created, so not overdue
      }
    }
    
    // Check if the previous due date is in the past
    // For daily tasks, previousDueDate will be today if time has passed, so we check if it's before now
    // For weekly/monthly, we check if it's before today
    const previousDueTime = previousDueDate.getTime();
    const nowTime = now.getTime();
    
    // If previous due date is in the past, the task is overdue
    return previousDueTime < nowTime;
  }

  // Task has been completed before - check if we've missed a due date since then
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




