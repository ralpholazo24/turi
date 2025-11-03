import { Task } from '@/types';
import i18n from '@/i18n';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKS = ['First', 'Second', 'Third', 'Fourth'];

const DAY_NAMES = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
};

const WEEK_NAMES = {
  en: ['First', 'Second', 'Third', 'Fourth'],
  es: ['Primera', 'Segunda', 'Tercera', 'Cuarta'],
};

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinalSuffix(day: number): string {
  const lang = i18n.language || 'en';
  
  if (lang === 'es') {
    // Spanish ordinals
    if (day === 1) return 'er';
    return 'º';
  }
  
  // English ordinals
  const j = day % 10;
  const k = day % 100;
  
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

/**
 * Format a day number with ordinal suffix (e.g., "5th", "1st", "22nd")
 */
function formatOrdinalDay(day: number): string {
  const suffix = getOrdinalSuffix(day);
  return `${day}${suffix}`;
}

/**
 * Format schedule information for display
 */
export function formatScheduleInfo(task: Task): string {
  const lang = i18n.language || 'en';
  const dayNames = DAY_NAMES[lang as keyof typeof DAY_NAMES] || DAY_NAMES.en;
  const weekNames = WEEK_NAMES[lang as keyof typeof WEEK_NAMES] || WEEK_NAMES.en;
  
  if (task.frequency === 'daily') {
    if (task.scheduleTime) {
      return i18n.t('task.scheduleFormat.dailyAt', { time: formatTime(task.scheduleTime) });
    }
    return i18n.t('notifications.daily');
  }

  if (task.frequency === 'weekly') {
    const parts: string[] = [];
    if (task.scheduleDay !== undefined) {
      parts.push(i18n.t('notifications.every') + ' ' + dayNames[task.scheduleDay]);
    } else {
      parts.push(i18n.t('notifications.weekly'));
    }
    if (task.scheduleTime) {
      parts.push(i18n.t('notifications.at') + ' ' + formatTime(task.scheduleTime));
    }
    return parts.join(' ');
  }

  if (task.frequency === 'monthly') {
    const scheduleType = task.scheduleType || 'dayOfWeek'; // Default for backward compatibility
    const parts: string[] = [];
    
    if (scheduleType === 'dayOfMonth' && task.scheduleDayOfMonth !== undefined) {
      // e.g., "Every 5th day of the month"
      const ordinalDay = formatOrdinalDay(task.scheduleDayOfMonth);
      parts.push(i18n.t('notifications.everyNthDayOfMonth', { day: ordinalDay }));
      if (task.scheduleTime) {
        parts.push(i18n.t('notifications.at') + ' ' + formatTime(task.scheduleTime));
      }
      return parts.join(' ');
    } else if (scheduleType === 'lastDayOfMonth' && task.scheduleDay !== undefined) {
      // e.g., "Monthly: Last Friday"
      parts.push(i18n.t('notifications.monthly') + ': ' + i18n.t('common.last') + ' ' + dayNames[task.scheduleDay]);
      if (task.scheduleTime) {
        parts.push(i18n.t('notifications.at') + ' ' + formatTime(task.scheduleTime));
      }
      return parts.join(' ');
    } else {
      // Default: dayOfWeek - nth occurrence
      if (task.scheduleWeek !== undefined) {
        parts.push(weekNames[task.scheduleWeek - 1]);
      }
      if (task.scheduleDay !== undefined) {
        parts.push(dayNames[task.scheduleDay]);
      }
      if (task.scheduleTime) {
        parts.push(i18n.t('notifications.at') + ' ' + formatTime(task.scheduleTime));
      }
      if (parts.length === 0) {
        return i18n.t('notifications.monthly');
      }
      return i18n.t('notifications.monthly') + ': ' + parts.join(' ');
    }
  }

  return '';
}

/**
 * Format time from HH:MM to readable format (e.g., "2:30 PM")
 */
function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
