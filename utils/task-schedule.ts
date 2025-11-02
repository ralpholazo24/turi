import { Task } from '@/types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKS = ['First', 'Second', 'Third', 'Fourth'];

/**
 * Format schedule information for display
 */
export function formatScheduleInfo(task: Task): string {
  if (task.frequency === 'daily') {
    if (task.scheduleTime) {
      return `Daily at ${formatTime(task.scheduleTime)}`;
    }
    return 'Daily';
  }

  if (task.frequency === 'weekly') {
    const parts: string[] = [];
    if (task.scheduleDay !== undefined) {
      parts.push(`Every ${DAYS[task.scheduleDay]}`);
    } else {
      parts.push('Weekly');
    }
    if (task.scheduleTime) {
      parts.push(`at ${formatTime(task.scheduleTime)}`);
    }
    return parts.join(' ');
  }

  if (task.frequency === 'monthly') {
    const parts: string[] = [];
    if (task.scheduleWeek !== undefined) {
      parts.push(`${WEEKS[task.scheduleWeek - 1]}`);
    }
    if (task.scheduleDay !== undefined) {
      parts.push(DAYS[task.scheduleDay]);
    }
    if (task.scheduleTime) {
      parts.push(`at ${formatTime(task.scheduleTime)}`);
    }
    if (parts.length === 0) {
      return 'Monthly';
    }
    return `Monthly: ${parts.join(' ')}`;
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

