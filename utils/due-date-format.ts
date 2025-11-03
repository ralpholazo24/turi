import { Task } from '@/types';
import { calculateNextDueDate } from './notification-schedule';
import { getDaysDifference, startOfDay } from './date-helpers';
import i18n from '@/i18n';

/**
 * Format relative time until next due date
 * Returns strings like "Due today", "Due tomorrow", "Due in 2 days", etc.
 */
export function formatNextDueDate(task: Task): string {
  const nextDueDate = calculateNextDueDate(task);
  
  if (!nextDueDate) {
    // Fallback if we can't calculate due date
    if (task.frequency === 'daily') return i18n.t('task.dueToday');
    if (task.frequency === 'weekly') return i18n.t('task.dueThisWeek');
    return i18n.t('task.dueThisMonth');
  }

  const now = new Date();
  const today = startOfDay(now);
  const dueDateStart = startOfDay(nextDueDate);
  
  const daysDiff = getDaysDifference(today, dueDateStart);
  
  if (daysDiff === 0) {
    return i18n.t('task.dueToday');
  } else if (daysDiff === 1) {
    return i18n.t('task.dueTomorrow');
  } else if (daysDiff > 1 && daysDiff <= 7) {
    return i18n.t('task.dueInDays', { count: daysDiff });
  } else if (daysDiff > 7 && daysDiff <= 31) {
    const weeks = Math.floor(daysDiff / 7);
    const remainingDays = daysDiff % 7;
    
    if (remainingDays === 0) {
      return i18n.t('task.dueInWeeks', { count: weeks });
    } else {
      // Use pluralization handling
      const weekKey = weeks === 1 ? 'dueInWeeksAndDays' : 'dueInWeeksAndDays_plural';
      return i18n.t(weekKey, { weeks, days: remainingDays });
    }
  } else {
    // More than a month away - show month approximation
    const months = Math.floor(daysDiff / 30);
    return i18n.t('task.dueInMonths', { count: months });
  }
}

/**
 * Format detailed next due date with date and time
 * Returns strings like "Due: Tomorrow at 2:30 PM" or "Due: Jan 15 at 9:00 AM"
 */
export function formatDetailedNextDueDate(task: Task): string {
  const nextDueDate = calculateNextDueDate(task);
  
  if (!nextDueDate) {
    return formatNextDueDate(task);
  }

  const now = new Date();
  const today = startOfDay(now);
  const dueDateStart = startOfDay(nextDueDate);
  
  const daysDiff = getDaysDifference(today, dueDateStart);
  
  // Format time
  const hours = nextDueDate.getHours();
  const minutes = nextDueDate.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  const timeString = `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  
  // Format date part
  let dateString: string;
  
  if (daysDiff === 0) {
    dateString = i18n.t('common.today');
  } else if (daysDiff === 1) {
    dateString = i18n.t('common.tomorrow');
  } else if (daysDiff <= 7) {
    // Show day name for this week
    const dayNames = [
      i18n.t('task.sunday'),
      i18n.t('task.monday'),
      i18n.t('task.tuesday'),
      i18n.t('task.wednesday'),
      i18n.t('task.thursday'),
      i18n.t('task.friday'),
      i18n.t('task.saturday'),
    ];
    dateString = dayNames[nextDueDate.getDay()];
  } else {
    // Show formatted date for dates further away
    const monthNames = [
      i18n.t('common.january'),
      i18n.t('common.february'),
      i18n.t('common.march'),
      i18n.t('common.april'),
      i18n.t('common.may'),
      i18n.t('common.june'),
      i18n.t('common.july'),
      i18n.t('common.august'),
      i18n.t('common.september'),
      i18n.t('common.october'),
      i18n.t('common.november'),
      i18n.t('common.december'),
    ];
    const monthName = monthNames[nextDueDate.getMonth()] || `${nextDueDate.getMonth() + 1}`;
    dateString = `${monthName} ${nextDueDate.getDate()}`;
  }
  
  if (task.scheduleTime) {
    return i18n.t('task.nextDueAt', { date: dateString, time: timeString });
  } else {
    return i18n.t('task.nextDueOn', { date: dateString });
  }
}

/**
 * Get countdown text for task detail screen
 * Returns more detailed countdown like "Due in 2 days, 3 hours"
 * If task has no scheduled time, shows days/hours only (no minutes)
 */
export function getDueDateCountdown(task: Task): string {
  const nextDueDate = calculateNextDueDate(task);
  
  if (!nextDueDate) {
    return formatNextDueDate(task);
  }

  const now = new Date();
  const diffMs = nextDueDate.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return i18n.t('task.dueToday');
  }
  
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  // If task has no scheduled time, don't show minutes precision
  const hasScheduledTime = !!task.scheduleTime;
  
  if (days > 0) {
    if (hours > 0) {
      const key = days === 1 && hours === 1 ? 'dueInDaysAndHours' : 'dueInDaysAndHours_plural';
      return i18n.t(key, { days, hours });
    }
    return i18n.t('task.dueInDays', { count: days });
  } else if (hours > 0) {
    // Only show minutes if task has scheduled time
    if (hasScheduledTime && minutes > 0) {
      const key = hours === 1 && minutes === 1 ? 'dueInHoursAndMinutes' : 'dueInHoursAndMinutes_plural';
      return i18n.t(key, { hours, minutes });
    }
    return i18n.t('task.dueInHours', { count: hours });
  } else {
    // Only show minutes if task has scheduled time
    if (hasScheduledTime) {
      return i18n.t('task.dueInMinutes', { count: minutes });
    }
    // If no scheduled time and less than an hour, show "Due today"
    return i18n.t('task.dueToday');
  }
}


