/**
 * Date utility helpers for task scheduling
 * Provides consistent date calculations across the app
 */

/**
 * Get ISO week number for a date
 * ISO week starts on Monday, week 1 is the first week with a Thursday
 */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Convert Sunday (0) to 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // Move to Thursday of the week
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Get the year for ISO week (week can span across years)
 */
export function getISOWeekYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  return d.getUTCFullYear();
}

/**
 * Check if two dates are in the same ISO week
 */
export function isSameISOWeek(date1: Date, date2: Date): boolean {
  return (
    getISOWeekNumber(date1) === getISOWeekNumber(date2) &&
    getISOWeekYear(date1) === getISOWeekYear(date2)
  );
}

/**
 * Check if two dates are in the same month
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Check if two dates are on the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}

/**
 * Get the nth occurrence of a day in a month
 * @param year - The year
 * @param month - The month (0-11)
 * @param dayOfWeek - Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * @param occurrence - Which occurrence (1 = first, 2 = second, 3 = third, 4 = fourth)
 * @returns Date object for the nth occurrence, or null if it doesn't exist
 */
export function getNthOccurrenceOfDay(
  year: number,
  month: number,
  dayOfWeek: number,
  occurrence: number
): Date | null {
  // Start from the first day of the month
  const firstDay = new Date(year, month, 1);
  
  // Find the first occurrence of the target day
  let currentDate = new Date(firstDay);
  while (currentDate.getDay() !== dayOfWeek) {
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Move to the nth occurrence (occurrence - 1 because we already have the first)
  currentDate.setDate(currentDate.getDate() + (occurrence - 1) * 7);
  
  // Check if we're still in the same month
  if (currentDate.getMonth() !== month) {
    // If the nth occurrence doesn't exist, return the last occurrence
    // Go back a week to get the last valid occurrence
    currentDate.setDate(currentDate.getDate() - 7);
    return currentDate;
  }
  
  return currentDate;
}

/**
 * Get the last occurrence of a day in a month
 * @param year - The year
 * @param month - The month (0-11)
 * @param dayOfWeek - Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * @returns Date object for the last occurrence
 */
export function getLastOccurrenceOfDay(
  year: number,
  month: number,
  dayOfWeek: number
): Date {
  // Start from the last day of the month
  const lastDay = new Date(year, month + 1, 0);
  
  // Work backwards to find the last occurrence of the target day
  let currentDate = new Date(lastDay);
  while (currentDate.getDay() !== dayOfWeek) {
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return currentDate;
}

/**
 * Get a valid monthly date considering edge cases
 * If the nth occurrence doesn't exist (e.g., 4th Friday in February),
 * returns the last occurrence of that day in the month
 * @param year - The year
 * @param month - The month (0-11)
 * @param week - Week number (1-4 for first through fourth)
 * @param dayOfWeek - Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * @returns Date object for the valid occurrence
 */
export function getValidMonthlyDate(
  year: number,
  month: number,
  week: number,
  dayOfWeek: number
): Date {
  // Try to get the nth occurrence
  const nthOccurrence = getNthOccurrenceOfDay(year, month, dayOfWeek, week);
  
  if (nthOccurrence && nthOccurrence.getMonth() === month) {
    return nthOccurrence;
  }
  
  // If nth occurrence doesn't exist, return the last occurrence
  return getLastOccurrenceOfDay(year, month, dayOfWeek);
}

/**
 * Get days difference between two dates
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const d1 = new Date(date1);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(date2);
  d2.setHours(0, 0, 0, 0);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Set time to start of day (00:00:00.000)
 */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Parse time string (HH:MM) and return hours and minutes
 */
export function parseTime(timeString: string): { hours: number; minutes: number } | null {
  const parts = timeString.split(':');
  if (parts.length !== 2) return null;
  
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  
  if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }
  
  return { hours, minutes };
}

