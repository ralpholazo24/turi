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
  
  const schedule = task.schedule;
  
  if (task.frequency === 'daily') {
    if (schedule && schedule.frequency === 'daily' && schedule.time) {
      return i18n.t('task.scheduleFormat.dailyAt', { time: formatTime(schedule.time) });
    }
    return i18n.t('notifications.daily');
  }

  if (task.frequency === 'weekly') {
    const parts: string[] = [];
    if (schedule && schedule.frequency === 'weekly') {
      parts.push(i18n.t('notifications.every') + ' ' + dayNames[schedule.day]);
      if (schedule.time) {
        parts.push(i18n.t('notifications.at') + ' ' + formatTime(schedule.time));
      }
    } else {
      parts.push(i18n.t('notifications.weekly'));
    }
    return parts.join(' ');
  }

  if (task.frequency === 'monthly') {
    if (!schedule || schedule.frequency !== 'monthly') {
      return i18n.t('notifications.monthly');
    }
    
    const parts: string[] = [];
    
    if (schedule.type === 'dayOfMonth' && schedule.dayOfMonth !== undefined) {
      // e.g., "Every 5th day of the month"
      const ordinalDay = formatOrdinalDay(schedule.dayOfMonth);
      parts.push(i18n.t('notifications.everyNthDayOfMonth', { day: ordinalDay }));
      if (schedule.time) {
        parts.push(i18n.t('notifications.at') + ' ' + formatTime(schedule.time));
      }
      return parts.join(' ');
    } else if (schedule.type === 'lastDayOfMonth' && schedule.dayOfWeek !== undefined) {
      // e.g., "Monthly: Last Friday"
      parts.push(i18n.t('notifications.monthly') + ': ' + i18n.t('common.last') + ' ' + dayNames[schedule.dayOfWeek]);
      if (schedule.time) {
        parts.push(i18n.t('notifications.at') + ' ' + formatTime(schedule.time));
      }
      return parts.join(' ');
    } else {
      // Default: dayOfWeek - nth occurrence
      if (schedule.week !== undefined) {
        parts.push(weekNames[schedule.week - 1]);
      }
      if (schedule.dayOfWeek !== undefined) {
        parts.push(dayNames[schedule.dayOfWeek]);
      }
      if (schedule.time) {
        parts.push(i18n.t('notifications.at') + ' ' + formatTime(schedule.time));
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
  const period = hours >= 12 ? i18n.t('common.pm') : i18n.t('common.am');
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}
