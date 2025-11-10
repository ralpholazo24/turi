import i18n from "@/i18n";
import { Group, Task } from "@/types";
import {
  getNextWeekday,
  getNextWeekendDay,
  isWeekday,
  isWeekend,
  parseTime,
  startOfDay,
} from "./date-helpers";

/**
 * Calculate the next due date/time for a task based on its schedule
 * If the task was completed, calculates from the completion date, otherwise from now
 */
export function calculateNextDueDate(task: Task): Date | null {
  const now = new Date();
  const schedule = task.schedule;
  const startDate = new Date(schedule.startDate);
  const startDateDay = startOfDay(startDate);

  // If task was completed, calculate next due date from the completion date
  // This ensures that completing a daily task today shows tomorrow as the next due date
  let baseDate = now;
  let isFromCompletion = false;
  if (task.completionHistory && task.completionHistory.length > 0) {
    // Get the most recent completion
    const sorted = [...task.completionHistory].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const lastCompleted = new Date(sorted[0].timestamp);
    // Use the completion date as the base, but ensure we're looking forward
    baseDate = lastCompleted;
    isFromCompletion = true;
  }

  // Parse scheduled time if available, otherwise default to 9:00 AM
  let scheduledHour: number | null = null;
  let scheduledMinute: number | null = null;

  if (schedule.time) {
    const parsed = parseTime(schedule.time);
    if (parsed) {
      scheduledHour = parsed.hours;
      scheduledMinute = parsed.minutes;
    }
  }

  // Helper to set time on a date
  // If no time is scheduled, default to 9:00 AM
  const setTimeOnDate = (date: Date): Date => {
    const result = new Date(date);
    if (scheduledHour !== null && scheduledMinute !== null) {
      result.setHours(scheduledHour, scheduledMinute, 0, 0);
    } else {
      // No scheduled time - default to 9:00 AM
      result.setHours(9, 0, 0, 0);
    }
    return result;
  };

  // Helper to find next occurrence starting from a date
  // maxDepth prevents infinite recursion (should never be needed, but safety check)
  const findNextFromDate = (
    fromDate: Date,
    fromCompletion: boolean = false,
    maxDepth: number = 10
  ): Date | null => {
    if (maxDepth <= 0) {
      // Safety: prevent infinite recursion, return startDate as fallback
      console.warn("findNextFromDate: max depth reached, returning startDate");
      return startDate;
    }

    const fromDay = startOfDay(fromDate);
    let candidate: Date | null = null;

    switch (schedule.repeat) {
      case "daily": {
        candidate = new Date(fromDay);
        candidate = setTimeOnDate(candidate);

        // Special handling when start date is today
        // If fromDate is before startDate, the next due date is the startDate itself
        if (fromDate.getTime() < startDateDay.getTime()) {
          candidate = new Date(startDate);
          candidate = setTimeOnDate(candidate);
          break;
        }

        // If we're on the start date and not from a completion, the due date is today
        if (!fromCompletion && fromDay.getTime() === startDateDay.getTime()) {
          // We're on the start date - due date is today
          candidate = new Date(startDate);
          candidate = setTimeOnDate(candidate);
          break;
        }

        // If calculating from a completion, always move to the next day
        // Otherwise, only move if time has passed
        if (fromCompletion || candidate.getTime() <= fromDate.getTime()) {
          candidate = new Date(fromDay);
          candidate.setDate(candidate.getDate() + 1);
          candidate = setTimeOnDate(candidate);
        }
        break;
      }

      case "weekdays": {
        // If we're on the start date and not from a completion, check if today is a weekday
        if (!fromCompletion && fromDay.getTime() === startDateDay.getTime()) {
          // Check if today is a weekday
          if (isWeekday(new Date(fromDate))) {
            // We're on the start date and it's a weekday - due date is today
            candidate = new Date(startDate);
            candidate = setTimeOnDate(candidate);
            break;
          }
        }

        candidate = getNextWeekday(fromDay);
        candidate = setTimeOnDate(candidate);
        // If calculating from a completion, always move to the next weekday
        // Otherwise, only move if time has passed
        if (fromCompletion || candidate.getTime() <= fromDate.getTime()) {
          candidate = getNextWeekday(candidate);
          candidate = setTimeOnDate(candidate);
        }
        break;
      }

      case "weekends": {
        // If we're on the start date and not from a completion, check if today is a weekend
        if (!fromCompletion && fromDay.getTime() === startDateDay.getTime()) {
          // Check if today is a weekend
          if (isWeekend(new Date(fromDate))) {
            // We're on the start date and it's a weekend - due date is today
            candidate = new Date(startDate);
            candidate = setTimeOnDate(candidate);
            break;
          }
        }

        candidate = getNextWeekendDay(fromDay);
        candidate = setTimeOnDate(candidate);
        // If calculating from a completion, always move to the next weekend day
        // Otherwise, only move if time has passed
        if (fromCompletion || candidate.getTime() <= fromDate.getTime()) {
          candidate = getNextWeekendDay(candidate);
          candidate = setTimeOnDate(candidate);
        }
        break;
      }

      case "weekly": {
        if (
          schedule.dayOfWeek === undefined ||
          schedule.dayOfWeek < 0 ||
          schedule.dayOfWeek > 6
        ) {
          return null;
        }
        const targetDay = schedule.dayOfWeek;

        // If fromDate is before startDate, find the first occurrence of targetDay >= startDate
        if (fromDate.getTime() < startDateDay.getTime()) {
          candidate = new Date(startDate);
          candidate = setTimeOnDate(candidate);
          const startDayOfWeek = candidate.getDay();
          let daysUntilTarget = (targetDay - startDayOfWeek + 7) % 7;
          if (daysUntilTarget === 0) {
            // Start date is already on the target day, use it
            candidate = new Date(startDate);
            candidate = setTimeOnDate(candidate);
          } else {
            candidate.setDate(candidate.getDate() + daysUntilTarget);
            candidate = setTimeOnDate(candidate);
          }
          break;
        }

        // If we're on the start date and not from a completion, check if today is the target day
        if (!fromCompletion && fromDay.getTime() === startDateDay.getTime()) {
          const currentDay = fromDay.getDay();
          if (currentDay === targetDay) {
            // We're on the start date and it's the target day - due date is today
            candidate = new Date(startDate);
            candidate = setTimeOnDate(candidate);
            break;
          }
        }

        candidate = new Date(fromDay);
        candidate = setTimeOnDate(candidate);

        // Calculate days until next occurrence of target day
        const currentDay = candidate.getDay();
        let daysUntilTarget = (targetDay - currentDay + 7) % 7;

        // If today is the target day and (time has passed OR calculating from completion), schedule for next week
        if (
          daysUntilTarget === 0 &&
          (fromCompletion || candidate.getTime() <= fromDate.getTime())
        ) {
          daysUntilTarget = 7;
        }

        candidate.setDate(candidate.getDate() + daysUntilTarget);
        break;
      }

      case "biweekly": {
        if (
          schedule.dayOfWeek === undefined ||
          schedule.dayOfWeek < 0 ||
          schedule.dayOfWeek > 6
        ) {
          return null;
        }
        const targetDay = schedule.dayOfWeek;

        // If fromDate is before startDate, the next due date is the startDate itself
        if (fromDate.getTime() < startDateDay.getTime()) {
          candidate = new Date(startDate);
          candidate = setTimeOnDate(candidate);
          break;
        }

        // If we're on the start date and not from a completion, check if today is the target day
        if (!fromCompletion && fromDay.getTime() === startDateDay.getTime()) {
          const currentDay = fromDay.getDay();
          if (currentDay === targetDay) {
            // We're on the start date and it's the target day - due date is today
            candidate = new Date(startDate);
            candidate = setTimeOnDate(candidate);
            break;
          }
        }

        candidate = new Date(fromDay);
        candidate = setTimeOnDate(candidate);

        // Find the next occurrence that's a multiple of 14 days from startDate
        // First, find the next occurrence of the day of week
        const currentDay = candidate.getDay();
        let daysUntilTarget = (targetDay - currentDay + 7) % 7;
        if (
          daysUntilTarget === 0 &&
          (fromCompletion || candidate.getTime() <= fromDate.getTime())
        ) {
          daysUntilTarget = 7;
        }
        candidate.setDate(candidate.getDate() + daysUntilTarget);

        // Now check if this is a valid biweekly occurrence (14 days from startDate)
        const daysFromStart = Math.floor(
          (candidate.getTime() - startDateDay.getTime()) / (1000 * 60 * 60 * 24)
        );
        const weeksFromStart = daysFromStart / 7;

        // If not an even number of weeks (0, 2, 4, 6...), move to next biweekly occurrence
        if (weeksFromStart % 2 !== 0) {
          candidate.setDate(candidate.getDate() + 7);
        }
        break;
      }

      case "monthly": {
        // Use the day of month from startDate
        const targetDay = startDate.getDate();

        // If fromDate is before startDate, the next due date is the startDate itself
        if (fromDate.getTime() < startDateDay.getTime()) {
          candidate = new Date(startDate);
          candidate = setTimeOnDate(candidate);
          break;
        }

        // If we're on the start date and not from a completion, check if today is the target day
        if (!fromCompletion && fromDay.getTime() === startDateDay.getTime()) {
          const currentDay = fromDay.getDate();
          if (currentDay === targetDay) {
            // We're on the start date and it's the target day - due date is today
            candidate = new Date(startDate);
            candidate = setTimeOnDate(candidate);
            break;
          }
        }

        candidate = new Date(fromDay);
        candidate.setDate(targetDay);
        candidate = setTimeOnDate(candidate);

        // Handle months with fewer days (e.g., Feb 31 -> Feb 28/29)
        const daysInMonth = new Date(
          candidate.getFullYear(),
          candidate.getMonth() + 1,
          0
        ).getDate();
        if (targetDay > daysInMonth) {
          candidate.setDate(daysInMonth);
          candidate = setTimeOnDate(candidate);
        }

        // If calculating from completion or date has passed, move to next month
        if (fromCompletion || candidate.getTime() <= fromDate.getTime()) {
          candidate.setMonth(candidate.getMonth() + 1);
          candidate.setDate(targetDay);
          const nextDaysInMonth = new Date(
            candidate.getFullYear(),
            candidate.getMonth() + 1,
            0
          ).getDate();
          if (targetDay > nextDaysInMonth) {
            candidate.setDate(nextDaysInMonth);
          }
          candidate = setTimeOnDate(candidate);
        }
        break;
      }

      case "every3months": {
        const targetDay = startDate.getDate();

        // If fromDate is before startDate, the next due date is the startDate itself
        if (fromDate.getTime() < startDateDay.getTime()) {
          candidate = new Date(startDate);
          candidate = setTimeOnDate(candidate);
          break;
        }

        // If we're on the start date and not from a completion, check if today is the target day
        if (!fromCompletion && fromDay.getTime() === startDateDay.getTime()) {
          const currentDay = fromDay.getDate();
          if (currentDay === targetDay) {
            // We're on the start date and it's the target day - due date is today
            candidate = new Date(startDate);
            candidate = setTimeOnDate(candidate);
            break;
          }
        }

        candidate = new Date(fromDay);
        candidate.setDate(targetDay);
        candidate = setTimeOnDate(candidate);

        // Handle months with fewer days
        const daysInMonth = new Date(
          candidate.getFullYear(),
          candidate.getMonth() + 1,
          0
        ).getDate();
        if (targetDay > daysInMonth) {
          candidate.setDate(daysInMonth);
          candidate = setTimeOnDate(candidate);
        }

        // If calculating from completion or date has passed, move forward by 3 months
        if (fromCompletion || candidate.getTime() <= fromDate.getTime()) {
          candidate.setMonth(candidate.getMonth() + 3);
          candidate.setDate(targetDay);
          const nextDaysInMonth = new Date(
            candidate.getFullYear(),
            candidate.getMonth() + 1,
            0
          ).getDate();
          if (targetDay > nextDaysInMonth) {
            candidate.setDate(nextDaysInMonth);
          }
          candidate = setTimeOnDate(candidate);
        }
        break;
      }

      case "every6months": {
        const targetDay = startDate.getDate();

        // If fromDate is before startDate, the next due date is the startDate itself
        if (fromDate.getTime() < startDateDay.getTime()) {
          candidate = new Date(startDate);
          candidate = setTimeOnDate(candidate);
          break;
        }

        // If we're on the start date and not from a completion, check if today is the target day
        if (!fromCompletion && fromDay.getTime() === startDateDay.getTime()) {
          const currentDay = fromDay.getDate();
          if (currentDay === targetDay) {
            // We're on the start date and it's the target day - due date is today
            candidate = new Date(startDate);
            candidate = setTimeOnDate(candidate);
            break;
          }
        }

        candidate = new Date(fromDay);
        candidate.setDate(targetDay);
        candidate = setTimeOnDate(candidate);

        // Handle months with fewer days
        const daysInMonth = new Date(
          candidate.getFullYear(),
          candidate.getMonth() + 1,
          0
        ).getDate();
        if (targetDay > daysInMonth) {
          candidate.setDate(daysInMonth);
          candidate = setTimeOnDate(candidate);
        }

        // If calculating from completion or date has passed, move forward by 6 months
        if (fromCompletion || candidate.getTime() <= fromDate.getTime()) {
          candidate.setMonth(candidate.getMonth() + 6);
          candidate.setDate(targetDay);
          const nextDaysInMonth = new Date(
            candidate.getFullYear(),
            candidate.getMonth() + 1,
            0
          ).getDate();
          if (targetDay > nextDaysInMonth) {
            candidate.setDate(nextDaysInMonth);
          }
          candidate = setTimeOnDate(candidate);
        }
        break;
      }

      case "yearly": {
        const targetMonth = startDate.getMonth();
        const targetDay = startDate.getDate();
        // Helper to check if a year is a leap year
        const isLeapYear = (year: number) =>
          (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

        // If fromDate is before startDate, the next due date is the startDate itself
        if (fromDate.getTime() < startDateDay.getTime()) {
          candidate = new Date(startDate);
          candidate = setTimeOnDate(candidate);
          break;
        }

        // If we're on the start date and not from a completion, check if today is the target date
        if (!fromCompletion && fromDay.getTime() === startDateDay.getTime()) {
          const currentMonth = fromDay.getMonth();
          const currentDay = fromDay.getDate();
          if (currentMonth === targetMonth && currentDay === targetDay) {
            // We're on the start date and it's the target date - due date is today
            candidate = new Date(startDate);
            candidate = setTimeOnDate(candidate);
            break;
          }
        }

        candidate = new Date(fromDay);
        candidate.setMonth(targetMonth);
        candidate.setDate(targetDay);
        candidate = setTimeOnDate(candidate);

        // Handle leap years (Feb 29)
        if (targetMonth === 1 && targetDay === 29) {
          if (!isLeapYear(candidate.getFullYear())) {
            candidate.setDate(28);
            candidate = setTimeOnDate(candidate);
          }
        }

        // If calculating from completion or date has passed, move to next year
        if (fromCompletion || candidate.getTime() <= fromDate.getTime()) {
          candidate.setFullYear(candidate.getFullYear() + 1);
          if (
            targetMonth === 1 &&
            targetDay === 29 &&
            !isLeapYear(candidate.getFullYear())
          ) {
            candidate.setDate(28);
          }
          candidate = setTimeOnDate(candidate);
        }
        break;
      }

      default:
        return null;
    }

    // Ensure candidate was set and is not before startDate
    if (!candidate) {
      return null;
    }

    if (candidate.getTime() < startDateDay.getTime()) {
      return findNextFromDate(startDate, false, maxDepth - 1);
    }

    return candidate;
  };

  // Start searching from baseDate (now or last completion) or startDate, whichever is later
  // For completed tasks, we want to find the NEXT occurrence after the completion
  // So we add a small buffer to ensure we get the next occurrence, not the same one
  const searchDate = new Date(baseDate);
  searchDate.setMinutes(searchDate.getMinutes() + 1); // Add 1 minute to ensure we get next occurrence

  const searchStart =
    searchDate.getTime() > startDate.getTime() ? searchDate : startDate;
  return findNextFromDate(searchStart, isFromCompletion);
}

/**
 * Calculate when to send the notification (due date minus reminder minutes)
 */
export function calculateNotificationDate(
  task: Task,
  reminderMinutes: number
): Date | null {
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
    return i18n.t("activity.someone");
  }

  // Ensure assignedIndex is within bounds
  const safeAssignedIndex = Math.min(
    task.assignedIndex,
    assignedMembers.length - 1
  );
  const assignedMember = assignedMembers[safeAssignedIndex];

  return assignedMember?.name || i18n.t("activity.someone");
}
