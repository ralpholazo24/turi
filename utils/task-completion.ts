import { Task } from '@/types';
import i18n from '@/i18n';
import { getDaysDifference, isSameDay, isSameISOWeek, isSameMonth, startOfDay, isWeekday, isWeekend, parseTime } from './date-helpers';

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
  const schedule = task.schedule;

  switch (schedule.repeat) {
    case 'daily': {
      // For daily tasks, check if completed today
      if (isSameDay(lastCompleted, today)) {
        return {
          isCompleted: true,
          message: i18n.t('task.doneForToday'),
        };
      }
      break;
    }

    case 'weekdays': {
      // For weekdays, check if completed on a weekday this week
      if (isSameISOWeek(lastCompleted, today) && isWeekday(new Date(lastCompletedAt))) {
        return {
          isCompleted: true,
          message: i18n.t('task.doneForThisWeek'),
        };
      }
      break;
    }

    case 'weekends': {
      // For weekends, check if completed on a weekend this week
      if (isSameISOWeek(lastCompleted, today) && isWeekend(new Date(lastCompletedAt))) {
        return {
          isCompleted: true,
          message: i18n.t('task.doneForThisWeek'),
        };
      }
      break;
    }

    case 'weekly': {
      // For weekly tasks, check if completed this week (using ISO week)
      if (isSameISOWeek(lastCompleted, today)) {
        return {
          isCompleted: true,
          message: i18n.t('task.doneForThisWeek'),
        };
      }
      break;
    }

    case 'biweekly': {
      // For biweekly, check if completed in current 2-week cycle
      // Calculate which 2-week cycle we're in based on startDate
      const startDate = startOfDay(new Date(schedule.startDate));
      const daysFromStart = getDaysDifference(startDate, today);
      const weeksFromStart = Math.floor(daysFromStart / 14);
      const cycleStart = new Date(startDate);
      cycleStart.setDate(cycleStart.getDate() + weeksFromStart * 14);
      const cycleEnd = new Date(cycleStart);
      cycleEnd.setDate(cycleEnd.getDate() + 13);
      
      if (lastCompleted.getTime() >= cycleStart.getTime() && lastCompleted.getTime() <= cycleEnd.getTime()) {
        return {
          isCompleted: true,
          message: i18n.t('task.doneForThisWeek'),
        };
      }
      break;
    }

    case 'monthly':
    case 'every3months':
    case 'every6months': {
      // For monthly tasks, check if completed this month
      if (isSameMonth(lastCompleted, today)) {
        return {
          isCompleted: true,
          message: i18n.t('task.doneForThisMonth'),
        };
      }
      break;
    }

    case 'yearly': {
      // For yearly tasks, check if completed this year
      if (lastCompleted.getFullYear() === today.getFullYear()) {
        return {
          isCompleted: true,
          message: i18n.t('task.doneForThisMonth'), // Reuse message, or add new one
        };
      }
      break;
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
  const startDate = startOfDay(new Date(schedule.startDate));

  // Parse scheduled time if available, otherwise use start of day (midnight)
  let scheduledHour: number | null = null;
  let scheduledMinute: number | null = null;
  
  if (schedule.time) {
    const parsed = parseTime(schedule.time);
    if (parsed) {
      scheduledHour = parsed.hours;
      scheduledMinute = parsed.minutes;
    }
  }

  const setTimeOnDate = (date: Date): Date => {
    const result = new Date(date);
    if (scheduledHour !== null && scheduledMinute !== null) {
      result.setHours(scheduledHour, scheduledMinute, 0, 0);
    } else {
      // No scheduled time - use start of day (midnight)
      result.setHours(0, 0, 0, 0);
    }
    return result;
  };

  // Can't be overdue before start date
  if (today.getTime() < startDate.getTime()) {
    return null;
  }

  switch (schedule.repeat) {
    case 'daily': {
      const todayDue = setTimeOnDate(today);
      
      // Apple Reminders logic:
      // - If task has a scheduled time: overdue after that time passes
      // - If task has no scheduled time: overdue after the day ends (23:59:59)
      
      if (schedule.time) {
        // Has scheduled time - check if today's time has passed
        if (today.getTime() === startDate.getTime()) {
          // Start date is today
          if (todayDue.getTime() <= now.getTime()) {
            return todayDue; // Overdue (time has passed)
          }
          return null; // Not overdue yet (time hasn't passed)
        }
        // Start date is in the past - check if today's time has passed
        if (todayDue.getTime() <= now.getTime() && todayDue.getTime() >= startDate.getTime()) {
          return todayDue;
        }
        // If today's time hasn't passed, check yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDue = setTimeOnDate(yesterday);
        if (yesterdayDue.getTime() >= startDate.getTime()) {
          return yesterdayDue;
        }
      } else {
        // No scheduled time - only overdue after the day ends (23:59:59)
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDue = setTimeOnDate(yesterday);
        
        if (yesterdayDue.getTime() >= startDate.getTime()) {
          return yesterdayDue; // Yesterday's day has passed
        }
        
        // If start date is today, it's not overdue yet (day hasn't ended)
        if (today.getTime() === startDate.getTime()) {
          return null;
        }
      }
      
      return null;
    }

    case 'weekdays': {
      // Apple Reminders logic: check if time-based or day-based
      let candidate = new Date(today);
      if (!isWeekday(candidate)) {
        // If today is weekend, go back to Friday
        const dayOfWeek = candidate.getDay();
        const daysBack = dayOfWeek === 0 ? 2 : 1; // Sunday -> Friday, Saturday -> Friday
        candidate.setDate(candidate.getDate() - daysBack);
      }
      candidate = setTimeOnDate(candidate);
      
      if (schedule.time) {
        // Has scheduled time - check if today's weekday time has passed
        if (isWeekday(new Date(today)) && today.getTime() >= startDate.getTime()) {
          if (candidate.getTime() <= now.getTime()) {
            return candidate; // Overdue (time has passed)
          }
        }
        // If today's weekday time hasn't passed, go back to previous weekday
        if (candidate.getTime() > now.getTime() || !isWeekday(new Date(today))) {
          candidate.setDate(candidate.getDate() - (candidate.getDay() === 1 ? 3 : 1)); // Monday -> Friday, others -> previous day
          candidate = setTimeOnDate(candidate);
        }
      } else {
        // No scheduled time - only overdue after the day ends
        // If today is a weekday, go back to previous weekday
        if (isWeekday(new Date(today))) {
          candidate.setDate(candidate.getDate() - (candidate.getDay() === 1 ? 3 : 1)); // Monday -> Friday, others -> previous day
          candidate = setTimeOnDate(candidate);
        }
      }
      
      // Check if this weekday is on or after start date
      if (candidate.getTime() >= startDate.getTime()) {
        return candidate;
      }
      return null;
    }

    case 'weekends': {
      // Apple Reminders logic: check if time-based or day-based
      let candidate = new Date(today);
      if (!isWeekend(candidate)) {
        // If today is weekday, go back to last Sunday
        const dayOfWeek = candidate.getDay();
        candidate.setDate(candidate.getDate() - dayOfWeek);
      }
      candidate = setTimeOnDate(candidate);
      
      if (schedule.time) {
        // Has scheduled time - check if today's weekend time has passed
        if (isWeekend(new Date(today)) && today.getTime() >= startDate.getTime()) {
          if (candidate.getTime() <= now.getTime()) {
            return candidate; // Overdue (time has passed)
          }
        }
        // If today's weekend time hasn't passed, go back to previous weekend
        if (candidate.getTime() > now.getTime() || !isWeekend(new Date(today))) {
          candidate.setDate(candidate.getDate() - 7);
          candidate = setTimeOnDate(candidate);
        }
      } else {
        // No scheduled time - only overdue after the day ends
        // If today is a weekend, go back to previous weekend
        if (isWeekend(new Date(today))) {
          candidate.setDate(candidate.getDate() - 7);
          candidate = setTimeOnDate(candidate);
        }
      }
      
      // Check if this weekend day is on or after start date
      if (candidate.getTime() >= startDate.getTime()) {
        return candidate;
      }
      return null;
    }

    case 'weekly': {
      if (schedule.dayOfWeek === undefined) {
        return null;
      }
      const targetDay = schedule.dayOfWeek;
      const currentDay = now.getDay();
      const todayDue = setTimeOnDate(today);
      
      // Apple Reminders logic: check if time-based or day-based
      let daysAgo = (currentDay - targetDay + 7) % 7;
      
      if (daysAgo === 0) {
        // Today is the target day
        if (schedule.time) {
          // Has scheduled time - check if time has passed
          if (today.getTime() >= startDate.getTime()) {
            if (todayDue.getTime() <= now.getTime()) {
              return todayDue; // Overdue (time has passed)
            }
            // Time hasn't passed yet, go back to last week
            daysAgo = 7;
          } else {
            // No scheduled time - go back to last week (day hasn't ended)
            daysAgo = 7;
          }
        } else {
          // No scheduled time - go back to last week (day hasn't ended)
          daysAgo = 7;
        }
      }
      
      const lastOccurrenceDue = new Date(todayDue);
      lastOccurrenceDue.setDate(lastOccurrenceDue.getDate() - daysAgo);
      if (lastOccurrenceDue.getTime() >= startDate.getTime()) {
        return lastOccurrenceDue;
      }
      return null;
    }

    case 'biweekly': {
      if (schedule.dayOfWeek === undefined) {
        return null;
      }
      const targetDay = schedule.dayOfWeek;
      const currentDay = now.getDay();
      const todayDue = setTimeOnDate(today);
      
      // Apple Reminders logic: check if time-based or day-based
      let daysAgo = (currentDay - targetDay + 7) % 7;
      
      if (daysAgo === 0) {
        // Today is the target day
        if (schedule.time) {
          // Has scheduled time - check if time has passed
          if (today.getTime() >= startDate.getTime()) {
            if (todayDue.getTime() <= now.getTime()) {
              // Check if this is a valid biweekly occurrence
              const daysFromStart = Math.floor((todayDue.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
              const weeksFromStart = daysFromStart / 7;
              if (weeksFromStart % 2 === 0) {
                return todayDue; // Overdue (time has passed and valid occurrence)
              }
            }
            // Time hasn't passed or not valid occurrence, go back
            daysAgo = 7;
          } else {
            daysAgo = 7;
          }
        } else {
          // No scheduled time - go back to last occurrence (day hasn't ended)
          daysAgo = 7;
        }
      }
      
      let lastOccurrence = new Date(todayDue);
      lastOccurrence.setDate(lastOccurrence.getDate() - daysAgo);
      
      // Check if it's a valid biweekly occurrence (even number of weeks from start)
      const daysFromStart = Math.floor((lastOccurrence.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const weeksFromStart = daysFromStart / 7;
      
      // If not even, go back another 2 weeks
      if (weeksFromStart % 2 !== 0) {
        lastOccurrence.setDate(lastOccurrence.getDate() - 14);
      }
      
      if (lastOccurrence.getTime() >= startDate.getTime()) {
        return lastOccurrence;
      }
      return null;
    }

    case 'monthly':
    case 'every3months':
    case 'every6months': {
      // Apple Reminders logic: check if time-based or day-based
      const targetDay = startDate.getDate();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      
      let checkMonth = currentMonth;
      let checkYear = currentYear;
      
      if (currentDay < targetDay) {
        // This month's due date hasn't arrived yet, check last month
        checkMonth = currentMonth - 1;
        if (checkMonth < 0) {
          checkMonth = 11;
          checkYear = currentYear - 1;
        }
      } else if (currentDay === targetDay) {
        // Today is the due date
        const todayDue = setTimeOnDate(today);
        if (schedule.time) {
          // Has scheduled time - check if time has passed
          if (todayDue.getTime() <= now.getTime() && todayDue.getTime() >= startDate.getTime()) {
            return todayDue; // Overdue (time has passed)
          }
          return null; // Not overdue yet (time hasn't passed)
        } else {
          // No scheduled time - not overdue yet (day hasn't ended)
          return null;
        }
      }
      // If currentDay > targetDay, this month's due date has passed (by day)
      
      const daysInMonth = new Date(checkYear, checkMonth + 1, 0).getDate();
      const validDay = Math.min(targetDay, daysInMonth);
      
      const lastMonthDue = new Date(checkYear, checkMonth, validDay);
      const lastMonthDueWithTime = setTimeOnDate(lastMonthDue);
      
      if (lastMonthDueWithTime.getTime() >= startDate.getTime()) {
        return lastMonthDueWithTime;
      }
      return null;
    }

    case 'yearly': {
      // Apple Reminders logic: check if time-based or day-based
      const targetMonth = startDate.getMonth();
      const targetDay = startDate.getDate();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      
      // Check if this year's due date has passed
      let checkYear = currentYear;
      if (currentMonth < targetMonth || (currentMonth === targetMonth && currentDay < targetDay)) {
        // This year's due date hasn't arrived yet, check last year
        checkYear = currentYear - 1;
      } else if (currentMonth === targetMonth && currentDay === targetDay) {
        // Today is the due date
        const todayDue = setTimeOnDate(today);
        if (schedule.time) {
          // Has scheduled time - check if time has passed
          if (todayDue.getTime() <= now.getTime() && todayDue.getTime() >= startDate.getTime()) {
            return todayDue; // Overdue (time has passed)
          }
          return null; // Not overdue yet (time hasn't passed)
        } else {
          // No scheduled time - not overdue yet (day hasn't ended)
          return null;
        }
      }
      
      const lastYearDue = new Date(checkYear, targetMonth, targetDay);
      // Handle leap years
      if (targetMonth === 1 && targetDay === 29) {
        const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
        if (!isLeapYear(checkYear)) {
          lastYearDue.setDate(28);
        }
      }
      const lastYearDueWithTime = setTimeOnDate(lastYearDue);
      
      if (lastYearDueWithTime.getTime() >= startDate.getTime()) {
        return lastYearDueWithTime;
      }
      return null;
    }

    default:
      return null;
  }
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
  const schedule = task.schedule;
  
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
    
    // If we have task creation date, ensure the due date is on or after the day the task was created
    // This prevents newly created tasks from being marked overdue if the due date is on a past day
    if (taskCreatedAt) {
      const taskCreated = new Date(taskCreatedAt);
      const taskCreatedDay = startOfDay(taskCreated);
      const previousDueDay = startOfDay(previousDueDate);
      
      // Only mark as overdue if the due date is on a day after (not before) the task was created
      // If it's the same day, allow it to be overdue if the time has passed
      if (previousDueDay.getTime() < taskCreatedDay.getTime()) {
        return false; // Due date is on a day before task was created, so not overdue
      }
    }
    
    // Apple Reminders logic:
    // - If task has a scheduled time: overdue after that time passes
    // - If task has no scheduled time: overdue after the day ends (23:59:59)
    if (schedule.time) {
      // Has scheduled time - check if the time has passed
      const previousDueTime = previousDueDate.getTime();
      const nowTime = now.getTime();
      return previousDueTime < nowTime;
    } else {
      // No scheduled time - only overdue after the day ends
      const previousDueDay = startOfDay(previousDueDate);
      const today = startOfDay(now);
      return previousDueDay.getTime() < today.getTime();
    }
  }

  // Task has been completed before - check if we've missed a due date since then
  const lastCompleted = new Date(lastCompletedAt);
  const lastCompletedStart = startOfDay(lastCompleted);
  
  // Calculate the next due date based on the current task state
  const nextDueDate = calculateNextDueDate(task);
  
  if (!nextDueDate) {
    return false; // Can't determine due date, so can't be overdue
  }
  
  // Check if the next due date's day is before the last completed day
  // If so, we've missed a due date
  const nextDueDateStart = startOfDay(nextDueDate);
  
  // If next due date's day is before last completed day, we're definitely overdue
  if (nextDueDateStart.getTime() < lastCompletedStart.getTime()) {
    return true;
  }
  
  // Apple Reminders logic:
  // - If task has a scheduled time: overdue after that time passes
  // - If task has no scheduled time: overdue after the day ends (23:59:59)
  if (schedule.time) {
    // Has scheduled time - check if the time has passed
    return nextDueDate.getTime() < now.getTime();
  } else {
    // No scheduled time - only overdue after the day ends
    const today = startOfDay(now);
    return nextDueDateStart.getTime() < today.getTime();
  }
}





