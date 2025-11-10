/**
 * Hours and Time Utilities
 *
 * Helper functions for working with operating hours
 */

import { format, parse, isWithinInterval } from 'date-fns';

/**
 * Day name mapping
 */
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Check if a resource is open now based on hours array
 * @param {Array} hours - Array of { day, open, close } objects
 * @returns {boolean}
 */
export function isOpenNow(hours) {
  if (!hours || hours.length === 0) {
    return false;
  }

  const now = new Date();
  const currentDay = DAYS[now.getDay()];
  const currentTime = format(now, 'HH:mm');

  // Find hours for current day
  const todayHours = hours.find(h => h.day === currentDay);

  if (!todayHours) {
    return false;
  }

  // Check if current time is within open hours
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
}

/**
 * Format hours array into a human-readable string
 * @param {Array} hours - Array of { day, open, close } objects
 * @returns {string}
 */
export function formatHours(hours) {
  if (!hours || hours.length === 0) {
    return 'Hours not available';
  }

  // Group consecutive days with same hours
  const grouped = [];
  let currentGroup = null;

  DAYS.forEach(day => {
    const dayHours = hours.find(h => h.day === day);

    if (!dayHours) {
      // Day is closed, finish current group
      if (currentGroup) {
        grouped.push(currentGroup);
        currentGroup = null;
      }
      return;
    }

    const timeRange = `${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`;

    if (!currentGroup) {
      // Start new group
      currentGroup = {
        days: [day],
        hours: timeRange,
      };
    } else if (currentGroup.hours === timeRange) {
      // Add to current group
      currentGroup.days.push(day);
    } else {
      // Different hours, finish current group and start new one
      grouped.push(currentGroup);
      currentGroup = {
        days: [day],
        hours: timeRange,
      };
    }
  });

  // Add last group
  if (currentGroup) {
    grouped.push(currentGroup);
  }

  // Format groups
  return grouped.map(group => {
    const dayRange = group.days.length === 1
      ? group.days[0]
      : `${group.days[0]} - ${group.days[group.days.length - 1]}`;

    return `${dayRange}: ${group.hours}`;
  }).join('\n');
}

/**
 * Format time string from HH:mm to 12-hour format
 * @param {string} time - Time in HH:mm format
 * @returns {string}
 */
export function formatTime(time) {
  if (!time || !time.match(/^\d{2}:\d{2}$/)) {
    return time;
  }

  try {
    const parsed = parse(time, 'HH:mm', new Date());
    return format(parsed, 'h:mm a');
  } catch {
    return time;
  }
}

/**
 * Get today's hours for a resource
 * @param {Array} hours - Array of { day, open, close } objects
 * @returns {object|null}
 */
export function getTodayHours(hours) {
  if (!hours || hours.length === 0) {
    return null;
  }

  const now = new Date();
  const currentDay = DAYS[now.getDay()];

  return hours.find(h => h.day === currentDay) || null;
}
