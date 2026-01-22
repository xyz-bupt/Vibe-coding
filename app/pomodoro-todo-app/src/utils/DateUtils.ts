/**
 * Date Utilities
 * 日期时间处理工具函数
 */

/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param timestamp 时间戳
 * @returns 格式化的日期字符串
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取今天的日期字符串（YYYY-MM-DD）
 * @returns 今天的日期字符串
 */
export function getTodayDateString(): string {
  return formatDate(Date.now());
}

/**
 * 获取今天开始时间戳（00:00:00）
 * @returns 今天开始时间戳
 */
export function getTodayStartTimestamp(): number {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * 获取今天结束时间戳（23:59:59）
 * @returns 今天结束时间戳
 */
export function getTodayEndTimestamp(): number {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date.getTime();
}

/**
 * 获取本周开始时间戳（周一 00:00:00）
 * @returns 本周开始时间戳
 */
export function getWeekStartTimestamp(): number {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * 获取本月开始时间戳（1日 00:00:00）
 * @returns 本月开始时间戳
 */
export function getMonthStartTimestamp(): number {
  const date = new Date();
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/**
 * 获取指定天数前的日期字符串
 * @param days 天数
 * @returns 日期字符串数组
 */
export function getLastNDays(days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date.getTime()));
  }
  return dates;
}

/**
 * 判断两个时间戳是否在同一天
 * @param timestamp1 时间戳1
 * @param timestamp2 时间戳2
 * @returns 是否在同一天
 */
export function isSameDay(timestamp1: number, timestamp2: number): number {
  return formatDate(timestamp1) === formatDate(timestamp2);
}

/**
 * 判断时间戳是否为今天
 * @param timestamp 时间戳
 * @returns 是否为今天
 */
export function isToday(timestamp: number): boolean {
  return isSameDay(timestamp, Date.now());
}

/**
 * 格式化时长（分钟）为可读格式
 * @param minutes 分钟数
 * @returns 格式化的时长字符串（如 "1h 30m"）
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}

/**
 * 格式化秒数为可读格式
 * @param seconds 秒数
 * @returns 格式化的时长字符串（如 "01:30:00"）
 */
export function formatSeconds(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  } else {
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

/**
 * 获取相对时间描述
 * @param timestamp 时间戳
 * @returns 相对时间字符串（如 "2小时前"）
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return '刚刚';
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return formatDate(timestamp);
  }
}

/**
 * 计算两个日期之间的天数差
 * @param date1 日期1
 * @param date2 日期2
 * @returns 天数差
 */
export function getDaysDiff(date1: Date, date2: Date): number {
  const timestamp1 = new Date(date1).setHours(0, 0, 0, 0);
  const timestamp2 = new Date(date2).setHours(0, 0, 0, 0);
  return Math.round((timestamp2 - timestamp1) / (1000 * 60 * 60 * 24));
}

/**
 * 检查日期是否在范围内
 * @param timestamp 要检查的时间戳
 * @param startTimestamp 开始时间戳
 * @param endTimestamp 结束时间戳
 * @returns 是否在范围内
 */
export function isInRange(timestamp: number, startTimestamp: number, endTimestamp: number): boolean {
  return timestamp >= startTimestamp && timestamp <= endTimestamp;
}
