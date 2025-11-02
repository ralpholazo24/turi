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
 * Format schedule information for display
 */
export function formatScheduleInfo(task: Task): string {
  const lang = i18n.language || 'en';
  const dayNames = DAY_NAMES[lang as keyof typeof DAY_NAMES] || DAY_NAMES.en;
  const weekNames = WEEK_NAMES[lang as keyof typeof WEEK_NAMES] || WEEK_NAMES.en;
  
  if (task.frequency === 'daily') {
    if (task.scheduleTime) {
      return i18n.t('task.schedule.dailyAt', { time: formatTime(task.scheduleTime) });
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
    const parts: string[] = [];
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

