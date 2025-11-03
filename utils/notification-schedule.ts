import { Task, Group } from '@/types';
import i18n from '@/i18n';
import {
  getValidMonthlyDate,
  getLastOccurrenceOfDay,
  parseTime,
  startOfDay,
} from './date-helpers';

/**
 * Default time for tasks without a scheduled time
 * Tasks without a specific time are considered "due" at the start of the day
 */
const DEFAULT_NOTIFICATION_HOUR = 9; // 9:00 AM
const DEFAULT_NOTIFICATION_MINUTE = 0;

/**
 * Calculate the next due date/time for a task based on its schedule
 */
export function calculateNextDueDate(task: Task): Date | null {
  const now = new Date();
  const today = startOfDay(now);

  // Parse scheduled time if available, otherwise use default time
  let scheduledHour = DEFAULT_NOTIFICATION_HOUR;
  let scheduledMinute = DEFAULT_NOTIFICATION_MINUTE;
  
  if (task.scheduleTime) {
    const parsed = parseTime(task.scheduleTime);
    if (parsed) {
      scheduledHour = parsed.hours;
      scheduledMinute = parsed.minutes;
    }
  }

  if (task.frequency === 'daily') {
    // For daily tasks, next due date is today or tomorrow at scheduled time
    const dueDate = new Date(today);
    dueDate.setHours(scheduledHour, scheduledMinute, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow
    if (dueDate.getTime() <= now.getTime()) {
      dueDate.setDate(dueDate.getDate() + 1);
    }
    
    return dueDate;
  }

  if (task.frequency === 'weekly') {
    // For weekly tasks, find the next occurrence of the scheduled day
    const targetDay = task.scheduleDay !== undefined ? task.scheduleDay : now.getDay();
    
    const dueDate = new Date(today);
    dueDate.setHours(scheduledHour, scheduledMinute, 0, 0);
    
    // Calculate days until next occurrence of target day
    const currentDay = now.getDay();
    let daysUntilTarget = (targetDay - currentDay + 7) % 7;
    
    // If today is the target day but time has passed, schedule for next week
    if (daysUntilTarget === 0 && dueDate.getTime() <= now.getTime()) {
      daysUntilTarget = 7;
    }
    
    dueDate.setDate(dueDate.getDate() + daysUntilTarget);
    return dueDate;
  }

  if (task.frequency === 'monthly') {
    const scheduleType = task.scheduleType || 'dayOfWeek'; // Default to dayOfWeek for backward compatibility
    
    if (scheduleType === 'dayOfMonth' && task.scheduleDayOfMonth !== undefined) {
      // Schedule on a specific day of the month (e.g., 15th of every month)
      const targetDay = task.scheduleDayOfMonth;
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Try current month first
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const validDay = Math.min(targetDay, daysInMonth); // Handle months with fewer days
      
      let dueDate = new Date(currentYear, currentMonth, validDay);
      dueDate.setHours(scheduledHour, scheduledMinute, 0, 0);
      
      // If this date has already passed this month, move to next month
      if (dueDate.getTime() <= now.getTime()) {
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        const nextDaysInMonth = new Date(nextYear, nextMonth + 1, 0).getDate();
        const nextValidDay = Math.min(targetDay, nextDaysInMonth);
        dueDate = new Date(nextYear, nextMonth, nextValidDay);
        dueDate.setHours(scheduledHour, scheduledMinute, 0, 0);
      }
      
      return dueDate;
    } else if (scheduleType === 'lastDayOfMonth' && task.scheduleDay !== undefined) {
      // Schedule on the last occurrence of a day in the month (e.g., last Friday)
      const targetDay = task.scheduleDay;
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Try current month first
      let dueDate = getLastOccurrenceOfDay(currentYear, currentMonth, targetDay);
      dueDate.setHours(scheduledHour, scheduledMinute, 0, 0);
      
      // If this date has already passed this month, move to next month
      if (dueDate.getTime() <= now.getTime()) {
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        dueDate = getLastOccurrenceOfDay(nextYear, nextMonth, targetDay);
        dueDate.setHours(scheduledHour, scheduledMinute, 0, 0);
      }
      
      return dueDate;
    } else {
      // Default: dayOfWeek - nth occurrence of a day (e.g., first Monday, second Friday)
      const targetWeek = task.scheduleWeek !== undefined ? task.scheduleWeek : 1; // Default to first week
      const targetDay = task.scheduleDay !== undefined ? task.scheduleDay : 1; // Default to Monday
      
      // Try current month first
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      let dueDate = getValidMonthlyDate(currentYear, currentMonth, targetWeek, targetDay);
      dueDate.setHours(scheduledHour, scheduledMinute, 0, 0);
      
      // If this date has already passed this month, move to next month
      if (dueDate.getTime() <= now.getTime()) {
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        dueDate = getValidMonthlyDate(nextYear, nextMonth, targetWeek, targetDay);
        dueDate.setHours(scheduledHour, scheduledMinute, 0, 0);
      }
      
      return dueDate;
    }
  }

  return null;
}

/**
 * Calculate when to send the notification (due date minus reminder minutes)
 */
export function calculateNotificationDate(task: Task, reminderMinutes: number): Date | null {
  const dueDate = calculateNextDueDate(task);
  if (!dueDate) return null;
  
  const notificationDate = new Date(dueDate);
  notificationDate.setMinutes(notificationDate.getMinutes() - reminderMinutes);
  
  // Don't schedule notifications in the past
  if (notificationDate.getTime() <= Date.now()) {
    return null;
  }
  
  return notificationDate;
}

/**
 * Get the assigned member name for a notification
 */
export function getAssignedMemberName(task: Task, group: Group): string {
  const assignedMembers = group.members.filter((m) =>
    task.memberIds.includes(m.id)
  );
  
  if (assignedMembers.length === 0) {
    return i18n.t('activity.someone');
  }
  
  // Ensure assignedIndex is within bounds
  const safeAssignedIndex = Math.min(task.assignedIndex, assignedMembers.length - 1);
  const assignedMember = assignedMembers[safeAssignedIndex];
  
  return assignedMember?.name || i18n.t('activity.someone');
}


