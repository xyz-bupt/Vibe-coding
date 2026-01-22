/**
 * Unit tests for time formatting utilities
 */

import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatDuration,
  formatDurationCompact,
  getProgressPercentage,
  getProgressFromRemaining,
  secondsToMs,
  msToSeconds,
  minutesToSeconds,
  toISODate,
  parseTimeString,
  formatTimeWithHours,
} from '../../src/utils/timeFormat';

describe('formatTime', () => {
  it('should format seconds as MM:SS', () => {
    expect(formatTime(1500)).toBe('25:00');
    expect(formatTime(90)).toBe('01:30');
    expect(formatTime(5)).toBe('00:05');
  });

  it('should handle zero', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('should handle large values', () => {
    expect(formatTime(3600)).toBe('60:00');
    expect(formatTime(3661)).toBe('61:01');
  });

  it('should handle negative values by clamping to zero', () => {
    expect(formatTime(-10)).toBe('00:00');
  });
});

describe('formatDuration', () => {
  it('should format seconds as Chinese duration string', () => {
    expect(formatDuration(1500)).toBe('25分0秒');
    expect(formatDuration(90)).toBe('1分30秒');
    expect(formatDuration(5)).toBe('5秒');
  });

  it('should include hours when applicable', () => {
    expect(formatDuration(3665)).toBe('1小时1分5秒');
    expect(formatDuration(7200)).toBe('2小时0分0秒');
  });

  it('should handle zero', () => {
    expect(formatDuration(0)).toBe('0秒');
  });

  it('should handle negative values', () => {
    expect(formatDuration(-10)).toBe('0秒');
  });
});

describe('formatDurationCompact', () => {
  it('should format seconds as compact duration', () => {
    expect(formatDurationCompact(1500)).toBe('25m');
    expect(formatDurationCompact(90)).toBe('1m 30s');
    expect(formatDurationCompact(5)).toBe('5s');
  });

  it('should include hours when applicable', () => {
    expect(formatDurationCompact(3665)).toBe('1h 1m');
    expect(formatDurationCompact(7200)).toBe('2h');
  });

  it('should handle zero', () => {
    expect(formatDurationCompact(0)).toBe('0s');
  });
});

describe('getProgressPercentage', () => {
  it('should calculate progress between two timestamps', () => {
    const start = Date.now();
    const end = start + 10000; // 10 seconds later

    // At start, progress should be 0
    expect(getProgressPercentage(start, end, start)).toBe(0);

    // At end, progress should be 1
    expect(getProgressPercentage(start, end, end)).toBe(1);

    // Halfway, progress should be 0.5
    const middle = start + 5000;
    expect(getProgressPercentage(start, end, middle)).toBe(0.5);
  });

  it('should use current time when not specified', () => {
    const start = Date.now() - 5000;
    const end = Date.now() + 5000;

    const progress = getProgressPercentage(start, end);
    expect(progress).toBeGreaterThan(0.4);
    expect(progress).toBeLessThan(0.6);
  });

  it('should return 1 when start >= end', () => {
    const now = Date.now();
    expect(getProgressPercentage(now, now)).toBe(1);
    expect(getProgressPercentage(now, now - 1000)).toBe(1);
  });

  it('should clamp values between 0 and 1', () => {
    const start = Date.now();
    const end = start + 10000;

    // Before start
    expect(getProgressPercentage(start, end, start - 1000)).toBe(0);

    // After end
    expect(getProgressPercentage(start, end, end + 1000)).toBe(1);
  });
});

describe('getProgressFromRemaining', () => {
  it('should calculate progress from remaining time', () => {
    expect(getProgressFromRemaining(1500, 1500)).toBe(0);
    expect(getProgressFromRemaining(0, 1500)).toBe(1);
    expect(getProgressFromRemaining(750, 1500)).toBe(0.5);
  });

  it('should handle zero total duration', () => {
    expect(getProgressFromRemaining(0, 0)).toBe(0);
    expect(getProgressFromRemaining(100, 0)).toBe(0);
  });

  it('should clamp values between 0 and 1', () => {
    expect(getProgressFromRemaining(-10, 100)).toBe(0);
    expect(getProgressFromRemaining(110, 100)).toBe(1);
  });
});

describe('secondsToMs', () => {
  it('should convert seconds to milliseconds', () => {
    expect(secondsToMs(1)).toBe(1000);
    expect(secondsToMs(0.5)).toBe(500);
    expect(secondsToMs(0)).toBe(0);
  });
});

describe('msToSeconds', () => {
  it('should convert milliseconds to seconds', () => {
    expect(msToSeconds(1000)).toBe(1);
    expect(msToSeconds(1500)).toBe(1);
    expect(msToSeconds(500)).toBe(0);
  });
});

describe('minutesToSeconds', () => {
  it('should convert minutes to seconds', () => {
    expect(minutesToSeconds(1)).toBe(60);
    expect(minutesToSeconds(25)).toBe(1500);
    expect(minutesToSeconds(0)).toBe(0);
  });
});

describe('toISODate', () => {
  it('should convert timestamp to ISO date string', () => {
    const timestamp = new Date('2024-01-15T12:00:00Z').getTime();
    expect(toISODate(timestamp)).toBe('2024-01-15');
  });

  it('should use current time when not specified', () => {
    const result = toISODate();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('parseTimeString', () => {
  it('should parse HH:MM format', () => {
    expect(parseTimeString('01:30')).toBe(5400); // 1h 30m
    expect(parseTimeString('00:25')).toBe(1500); // 25m
  });

  it('should parse MM:SS format when appropriate', () => {
    expect(parseTimeString('25:00')).toBe(1500);
    expect(parseTimeString('01:30')).toBe(90); // Could be 1h 30m or 1m 30s
  });

  it('should throw error for invalid format', () => {
    expect(() => parseTimeString('invalid')).toThrow();
    expect(() => parseTimeString('1')).toThrow();
    expect(() => parseTimeString('1:2:3')).toThrow();
  });
});

describe('formatTimeWithHours', () => {
  it('should format time as HH:MM:SS when hours > 0', () => {
    expect(formatTimeWithHours(3661)).toBe('1:01:01');
    expect(formatTimeWithHours(7200)).toBe('2:00:00');
  });

  it('should format time as MM:SS when hours = 0', () => {
    expect(formatTimeWithHours(1500)).toBe('25:00');
    expect(formatTimeWithHours(90)).toBe('01:30');
    expect(formatTimeWithHours(5)).toBe('00:05');
  });

  it('should handle zero', () => {
    expect(formatTimeWithHours(0)).toBe('00:00');
  });

  it('should handle negative values', () => {
    expect(formatTimeWithHours(-10)).toBe('00:00');
  });
});
