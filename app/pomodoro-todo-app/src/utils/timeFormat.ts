/**
 * Time formatting utilities for the Pomodoro Timer
 * Provides various time display formats and calculation helpers
 */

/**
 * Formats seconds into MM:SS display format
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "25:00", "04:30")
 *
 * @example
 * formatTime(1500) // "25:00"
 * formatTime(90)   // "01:30"
 * formatTime(5)    // "00:05"
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) {
    seconds = 0;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const paddedMinutes = String(minutes).padStart(2, '0');
  const paddedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${paddedMinutes}:${paddedSeconds}`;
}

/**
 * Formats seconds into a human-readable duration string in Chinese
 * @param seconds - Time in seconds
 * @returns Formatted duration string (e.g., "25分0秒", "1分30秒")
 *
 * @example
 * formatDuration(1500) // "25分0秒"
 * formatDuration(90)   // "1分30秒"
 * formatDuration(3665) // "61分5秒"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) {
    seconds = 0;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}小时`);
  }

  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}分`);
  }

  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds}秒`);
  }

  return parts.join('');
}

/**
 * Formats seconds into a compact duration string
 * @param seconds - Time in seconds
 * @returns Compact formatted string (e.g., "25m", "1h 30m")
 *
 * @example
 * formatDurationCompact(1500) // "25m"
 * formatDurationCompact(3665) // "1h 1m"
 * formatDurationCompact(90)   // "1m 30s"
 */
export function formatDurationCompact(seconds: number): string {
  if (seconds < 0) {
    seconds = 0;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  if (remainingSeconds > 0 && parts.length === 0) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(' ') || '0s';
}

/**
 * Calculates progress percentage between two timestamps
 * @param start - Start timestamp in milliseconds
 * @param end - End timestamp in milliseconds
 * @param current - Current timestamp (defaults to Date.now())
 * @returns Progress percentage between 0 and 1
 *
 * @example
 * getProgressPercentage(Date.now() - 60000, Date.now() + 24000) // 0.714...
 */
export function getProgressPercentage(
  start: number,
  end: number,
  current: number = Date.now()
): number {
  if (start >= end) {
    return 1;
  }

  const totalDuration = end - start;
  const elapsed = current - start;

  return Math.max(0, Math.min(1, elapsed / totalDuration));
}

/**
 * Calculates progress percentage from remaining time
 * @param remainingTime - Remaining time in seconds
 * @param totalTime - Total time in seconds
 * @returns Progress percentage between 0 and 1
 */
export function getProgressFromRemaining(
  remainingTime: number,
  totalTime: number
): number {
  if (totalTime <= 0) {
    return 0;
  }

  const elapsed = totalTime - remainingTime;
  return Math.max(0, Math.min(1, elapsed / totalTime));
}

/**
 * Converts seconds to milliseconds
 * @param seconds - Time in seconds
 * @returns Time in milliseconds
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

/**
 * Converts milliseconds to seconds
 * @param ms - Time in milliseconds
 * @returns Time in seconds
 */
export function msToSeconds(ms: number): number {
  return Math.floor(ms / 1000);
}

/**
 * Converts minutes to seconds
 * @param minutes - Time in minutes
 * @returns Time in seconds
 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}

/**
 * Converts seconds to a Date object
 * @param seconds - Time in seconds
 * @param from - Base timestamp (defaults to current time)
 * @returns Date object representing the target time
 */
export function secondsToDate(
  seconds: number,
  from: number = Date.now()
): Date {
  return new Date(from + secondsToMs(seconds));
}

/**
 * Checks if a timestamp is within a specific range
 * @param timestamp - Timestamp to check
 * @param start - Range start timestamp
 * @param end - Range end timestamp
 * @returns True if timestamp is within range
 */
export function isWithinRange(
  timestamp: number,
  start: number,
  end: number
): boolean {
  return timestamp >= start && timestamp <= end;
}

/**
 * Formats a timestamp to a localized time string
 * @param timestamp - Timestamp in milliseconds
 * @param locale - Locale string (defaults to system locale)
 * @returns Formatted time string
 */
export function formatTimestamp(
  timestamp: number,
  locale: string = undefined
): string {
  return new Date(timestamp).toLocaleTimeString(locale || undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formats a timestamp to a localized date string
 * @param timestamp - Timestamp in milliseconds
 * @param locale - Locale string (defaults to system locale)
 * @returns Formatted date string
 */
export function formatDate(
  timestamp: number,
  locale: string = undefined
): string {
  return new Date(timestamp).toLocaleDateString(locale || undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a timestamp to an ISO date string (YYYY-MM-DD)
 * @param timestamp - Timestamp in milliseconds
 * @returns ISO date string
 */
export function toISODate(timestamp: number = Date.now()): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

/**
 * Parses a time string in HH:MM format to seconds
 * @param timeString - Time string in HH:MM or MM:SS format
 * @returns Time in seconds
 * @throws Error if format is invalid
 */
export function parseTimeString(timeString: string): number {
  const parts = timeString.split(':').map(Number);

  if (parts.length !== 2 || parts.some(isNaN)) {
    throw new Error(
      `Invalid time format: ${timeString}. Expected HH:MM or MM:SS`
    );
  }

  const [major, minor] = parts;

  // Assume HH:MM format if major > 0 and minor <= 59
  if (major > 0 && minor <= 59) {
    return major * 3600 + minor * 60;
  }

  // Otherwise treat as MM:SS
  return major * 60 + minor;
}

/**
 * Gets the end of the current day in milliseconds
 * @returns Timestamp for end of day
 */
export function getEndOfDay(): number {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now.getTime();
}

/**
 * Gets the start of the current day in milliseconds
 * @returns Timestamp for start of day
 */
export function getStartOfDay(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime();
}

/**
 * Formats seconds into HH:MM:SS display format
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "1:25:30", "25:00")
 */
export function formatTimeWithHours(seconds: number): string {
  if (seconds < 0) {
    seconds = 0;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}
