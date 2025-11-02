import { Task, Group } from '@/types';

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
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  // Parse scheduled time if available, otherwise use default time
  let scheduledHour = DEFAULT_NOTIFICATION_HOUR;
  let scheduledMinute = DEFAULT_NOTIFICATION_MINUTE;
  
  if (task.scheduleTime) {
    const [hours, minutes] = task.scheduleTime.split(':').map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      scheduledHour = hours;
      scheduledMinute = minutes;
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
    // For monthly tasks, find the next occurrence of scheduled week + day
    const targetWeek = task.scheduleWeek !== undefined ? task.scheduleWeek : 1; // Default to first week
    const targetDay = task.scheduleDay !== undefined ? task.scheduleDay : 1; // Default to Monday
    
    const dueDate = new Date(now);
    dueDate.setDate(1); // Start from first day of current month
    dueDate.setHours(scheduledHour, scheduledMinute, 0, 0);
    
    // Find the first occurrence of target day in the month
    while (dueDate.getDay() !== targetDay) {
      dueDate.setDate(dueDate.getDate() + 1);
    }
    
    // Move to the correct week (0 = first week, 1 = second week, etc.)
    const weekOffset = targetWeek - 1;
    dueDate.setDate(dueDate.getDate() + weekOffset * 7);
    
    // If this date has already passed this month, move to next month
    if (dueDate.getTime() <= now.getTime()) {
      dueDate.setMonth(dueDate.getMonth() + 1);
      dueDate.setDate(1);
      
      // Find the first occurrence of target day in the new month
      while (dueDate.getDay() !== targetDay) {
        dueDate.setDate(dueDate.getDate() + 1);
      }
      
      // Move to the correct week
      dueDate.setDate(dueDate.getDate() + weekOffset * 7);
    }
    
    return dueDate;
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
    return 'Someone';
  }
  
  // Ensure assignedIndex is within bounds
  const safeAssignedIndex = Math.min(task.assignedIndex, assignedMembers.length - 1);
  const assignedMember = assignedMembers[safeAssignedIndex];
  
  return assignedMember?.name || 'Someone';
}

