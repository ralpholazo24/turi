import { Task } from '@/types';
import i18n from '@/i18n';
import { calculateNextDueDate } from './notification-schedule';
import { startOfDay, getDaysDifference } from './date-helpers';
import { isTaskOverdue } from './task-completion';

const DAY_NAMES = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
};

/**
 * Format date in Apple Reminders style: "Dec 1, 2025"
 */
function formatDateAppleStyle(date: Date, lang: string): string {
  const monthNames = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    es: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  };
  
  const months = monthNames[lang as keyof typeof monthNames] || monthNames.en;
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
}

/**
 * Format schedule information for display with next due date (Apple Reminders style)
 * Returns format like "Monthly - Dec 1, 2025"
 */
export function formatScheduleInfo(task: Task, isOverdue?: boolean): { text: string; dateText: string; isOverdue: boolean } {
  const lang = i18n.language || 'en';
  const dayNames = DAY_NAMES[lang as keyof typeof DAY_NAMES] || DAY_NAMES.en;
  const schedule = task.schedule;
  
  // Check if task is overdue (use provided value or calculate)
  const taskIsOverdue = isOverdue !== undefined ? isOverdue : isTaskOverdue(task);
  
  // Get next due date
  const nextDueDate = calculateNextDueDate(task);
  let dateText = '';
  
  // If task is overdue, show today's date instead of next due date
  if (taskIsOverdue) {
    const now = new Date();
    const today = startOfDay(now);
    dateText = i18n.t('common.today');
  } else if (nextDueDate) {
    // Check if the due date is today or tomorrow
    const now = new Date();
    const today = startOfDay(now);
    const dueDateStart = startOfDay(nextDueDate);
    const daysDiff = getDaysDifference(today, dueDateStart);
    
    // Handle negative daysDiff (due date in past - should be rare but handle gracefully)
    if (daysDiff < 0) {
      // Due date is in the past, format normally (this shouldn't happen but handle it)
      dateText = formatDateAppleStyle(nextDueDate, lang);
    } else if (daysDiff === 0) {
      // Due date is today - show "Today"
      dateText = i18n.t('common.today');
    } else if (daysDiff === 1) {
      // Due date is tomorrow - show "Tomorrow"
      dateText = i18n.t('common.tomorrow');
    } else {
      // Format the date normally
      dateText = formatDateAppleStyle(nextDueDate, lang);
    }
  }
  
  let repeatText: string;
  
  switch (schedule.repeat) {
    case 'daily':
      repeatText = i18n.t('schedule.repeat.daily');
      break;
    
    case 'weekdays':
      repeatText = i18n.t('schedule.repeat.weekdays');
      break;
    
    case 'weekends':
      repeatText = i18n.t('schedule.repeat.weekends');
      break;
    
    case 'weekly':
      if (schedule.dayOfWeek !== undefined && schedule.dayOfWeek >= 0 && schedule.dayOfWeek < dayNames.length) {
        repeatText = i18n.t('schedule.repeat.weekly') + ' - ' + dayNames[schedule.dayOfWeek];
      } else {
        repeatText = i18n.t('schedule.repeat.weekly');
      }
      break;
    
    case 'biweekly':
      if (schedule.dayOfWeek !== undefined && schedule.dayOfWeek >= 0 && schedule.dayOfWeek < dayNames.length) {
        repeatText = i18n.t('schedule.repeat.biweekly') + ' - ' + dayNames[schedule.dayOfWeek];
      } else {
        repeatText = i18n.t('schedule.repeat.biweekly');
      }
      break;
    
    case 'monthly':
      repeatText = i18n.t('schedule.repeat.monthly');
      break;
    
    case 'every3months':
      repeatText = i18n.t('schedule.repeat.every3months');
      break;
    
    case 'every6months':
      repeatText = i18n.t('schedule.repeat.every6months');
      break;
    
    case 'yearly':
      repeatText = i18n.t('schedule.repeat.yearly');
      break;
    
    default:
      repeatText = '';
  }
  
  // Combine repeat text with date
  const fullText = dateText ? `${repeatText} - ${dateText}` : repeatText;
  
  return {
    text: fullText,
    dateText,
    isOverdue: taskIsOverdue,
  };
}
