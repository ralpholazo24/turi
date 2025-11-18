import i18n from "@/i18n";
import { Task } from "@/types";
import { getDaysDifference, parseTime, startOfDay } from "./date-helpers";
import { calculateNextDueDate } from "./notification-schedule";
import { isTaskOverdue } from "./task-completion";

/**
 * Get month abbreviation from month index (0-11)
 */
function getMonthAbbr(monthIndex: number): string {
  const monthKeys = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ];
  return i18n.t(`common.monthAbbr.${monthKeys[monthIndex]}`);
}

/**
 * Get day name from day index (0-6, Sunday = 0)
 */
function getDayName(dayIndex: number): string {
  const dayKeys = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  return i18n.t(`common.dayNames.${dayKeys[dayIndex]}`);
}

/**
 * Format date in Apple Reminders style: "Dec 1, 2025"
 */
function formatDateAppleStyle(date: Date): string {
  const month = getMonthAbbr(date.getMonth());
  const day = date.getDate();
  const year = date.getFullYear();

  return `${month} ${day}, ${year}`;
}

/**
 * Format time from HH:MM to 12-hour format (e.g., "2:30 PM")
 */
function formatTime(timeString: string): string {
  const parsed = parseTime(timeString);
  if (!parsed) return timeString;

  const { hours, minutes } = parsed;
  const period = hours >= 12 ? i18n.t("common.pm") : i18n.t("common.am");
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const displayMinutes = minutes.toString().padStart(2, "0");

  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Format schedule information for display with next due date (Apple Reminders style)
 * Returns format like "Monthly - Dec 1, 2025"
 */
export function formatScheduleInfo(
  task: Task,
  isOverdue?: boolean
): {
  text: string;
  dateText: string;
  timeText: string | null;
  isOverdue: boolean;
} {
  const schedule = task.schedule;

  // Check if task is overdue (use provided value or calculate)
  const taskIsOverdue =
    isOverdue !== undefined ? isOverdue : isTaskOverdue(task);

  // Get next due date
  const nextDueDate = calculateNextDueDate(task);
  let dateText = "";

  // If task is overdue, show today's date instead of next due date
  if (taskIsOverdue) {
    const now = new Date();
    const today = startOfDay(now);
    dateText = i18n.t("common.today");
  } else if (nextDueDate) {
    // Check if the due date is today or tomorrow
    const now = new Date();
    const today = startOfDay(now);
    const dueDateStart = startOfDay(nextDueDate);
    const daysDiff = getDaysDifference(today, dueDateStart);

    // Handle negative daysDiff (due date in past - should be rare but handle gracefully)
    if (daysDiff < 0) {
      // Due date is in the past, format with day name (this shouldn't happen but handle it)
      const dayName = getDayName(nextDueDate.getDay());
      const formattedDate = formatDateAppleStyle(nextDueDate);
      dateText = `${dayName}, ${formattedDate}`;
    } else if (daysDiff === 0) {
      // Due date is today - show "Today"
      dateText = i18n.t("common.today");
    } else if (daysDiff === 1) {
      // Due date is tomorrow - show "Tomorrow"
      dateText = i18n.t("common.tomorrow");
    } else {
      // Format the date with day name: "Monday, Dec 1, 2025"
      const dayName = getDayName(nextDueDate.getDay());
      const formattedDate = formatDateAppleStyle(nextDueDate);
      dateText = `${dayName}, ${formattedDate}`;
    }
  }

  let repeatText: string;

  switch (schedule.repeat) {
    case "daily":
      repeatText = i18n.t("schedule.repeat.daily");
      break;

    case "weekdays":
      repeatText = i18n.t("schedule.repeat.weekdays");
      break;

    case "weekends":
      repeatText = i18n.t("schedule.repeat.weekends");
      break;

    case "weekly":
      if (
        schedule.dayOfWeek !== undefined &&
        schedule.dayOfWeek >= 0 &&
        schedule.dayOfWeek < 7
      ) {
        repeatText =
          i18n.t("schedule.repeat.weekly") +
          " - " +
          getDayName(schedule.dayOfWeek);
      } else {
        repeatText = i18n.t("schedule.repeat.weekly");
      }
      break;

    case "biweekly":
      if (
        schedule.dayOfWeek !== undefined &&
        schedule.dayOfWeek >= 0 &&
        schedule.dayOfWeek < 7
      ) {
        repeatText =
          i18n.t("schedule.repeat.biweekly") +
          " - " +
          getDayName(schedule.dayOfWeek);
      } else {
        repeatText = i18n.t("schedule.repeat.biweekly");
      }
      break;

    case "monthly":
      repeatText = i18n.t("schedule.repeat.monthly");
      break;

    case "every3months":
      repeatText = i18n.t("schedule.repeat.every3months");
      break;

    case "every6months":
      repeatText = i18n.t("schedule.repeat.every6months");
      break;

    case "yearly":
      repeatText = i18n.t("schedule.repeat.yearly");
      break;

    default:
      repeatText = "";
  }

  // Format time if available
  let timeText: string | null = null;
  if (schedule.time) {
    timeText = formatTime(schedule.time);
  }

  // Combine repeat text with date
  const fullText = dateText ? `${repeatText} - ${dateText}` : repeatText;

  return {
    text: fullText,
    dateText,
    timeText,
    isOverdue: taskIsOverdue,
  };
}
