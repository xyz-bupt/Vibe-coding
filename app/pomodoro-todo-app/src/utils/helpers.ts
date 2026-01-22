/**
 * Utility Helper Functions
 *
 * Common utility functions used throughout the application
 */

import { Task, TaskPriority, TaskStatus, Session, SessionType } from '../types/index';

// ============================================================================
// TIME UTILITIES
// ============================================================================

/**
 * Format seconds to MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to HH:MM:SS
 */
export function formatTimeLong(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to human-readable duration
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m`;
  }
  return `${seconds}s`;
}

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) {
    return 'just now';
  } else if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  } else if (hours < 24) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else if (days < 7) {
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  } else {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  }
}

/**
 * Format timestamp to date string
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format timestamp to date and time string
 */
export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get start of week (Monday)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/**
 * Get end of week (Sunday)
 */
export function getWeekEnd(date: Date = new Date()): Date {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

/**
 * Check if a date is today
 */
export function isToday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if a date is within the current week
 */
export function isThisWeek(timestamp: number): boolean {
  const date = new Date(timestamp);
  const start = getWeekStart();
  const end = getWeekEnd();
  return date >= start && date <= end;
}

// ============================================================================
// TASK UTILITIES
// ============================================================================

/**
 * Sort tasks by priority
 */
export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  return [...tasks].sort((a, b) => {
    const aPriority = priorityOrder[a.priority] ?? 2;
    const bPriority = priorityOrder[b.priority] ?? 2;
    return aPriority - bPriority;
  });
}

/**
 * Sort tasks by due date
 */
export function sortTasksByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aDue = a.dueDate ?? Infinity;
    const bDue = b.dueDate ?? Infinity;
    return aDue - bDue;
  });
}

/**
 * Sort tasks by created date
 */
export function sortTasksByCreatedDate(tasks: Task[], descending = true): Task[] {
  return [...tasks].sort((a, b) => {
    return descending ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
  });
}

/**
 * Filter tasks by status
 */
export function filterTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter(t => t.status === status);
}

/**
 * Filter tasks by priority
 */
export function filterTasksByPriority(tasks: Task[], priority: TaskPriority): Task[] {
  return tasks.filter(t => t.priority === priority);
}

/**
 * Filter tasks that are due today
 */
export function filterTasksDueToday(tasks: Task[]): Task[] {
  const today = getTodayDate();
  const todayTimestamp = new Date(today).getTime();

  return tasks.filter(t => {
    if (!t.dueDate) return false;
    const dueDate = new Date(t.dueDate);
    return dueDate.toDateString() === new Date(todayTimestamp).toDateString();
  });
}

/**
 * Filter tasks that are overdue
 */
export function filterTasksOverdue(tasks: Task[]): Task[] {
  const now = Date.now();
  return tasks.filter(t => {
    if (!t.dueDate || t.status === TaskStatus.COMPLETED) return false;
    return t.dueDate < now;
  });
}

/**
 * Get task completion percentage
 */
export function getTaskCompletionPercentage(task: Task): number {
  if (!task.estimatedPomodoros || task.estimatedPomodoros === 0) {
    return 0;
  }
  return Math.min(100, Math.round((task.completedPomodoros / task.estimatedPomodoros) * 100));
}

/**
 * Check if task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate || task.status === TaskStatus.COMPLETED) {
    return false;
  }
  return task.dueDate < Date.now();
}

/**
 * Get task priority color class
 */
export function getPriorityColor(priority: TaskPriority): string {
  switch (priority) {
    case TaskPriority.URGENT:
      return 'red';
    case TaskPriority.HIGH:
      return 'orange';
    case TaskPriority.MEDIUM:
      return 'yellow';
    case TaskPriority.LOW:
      return 'green';
    default:
      return 'gray';
  }
}

/**
 * Get task status text
 */
export function getStatusText(status: TaskStatus): string {
  switch (status) {
    case TaskStatus.TODO:
      return 'To Do';
    case TaskStatus.IN_PROGRESS:
      return 'In Progress';
    case TaskStatus.COMPLETED:
      return 'Completed';
    case TaskStatus.ARCHIVED:
      return 'Archived';
    default:
      return 'Unknown';
  }
}

// ============================================================================
// SESSION UTILITIES
// ============================================================================

/**
 * Get total focus time from sessions
 */
export function getTotalFocusTime(sessions: Session[]): number {
  return sessions
    .filter(s => s.type === SessionType.WORK && s.wasCompleted)
    .reduce((total, s) => total + s.actualDuration, 0);
}

/**
 * Get completed sessions count
 */
export function getCompletedSessionsCount(sessions: Session[], type?: SessionType): number {
  return sessions.filter(s => {
    if (!s.wasCompleted) return false;
    if (type !== undefined) return s.type === type;
    return true;
  }).length;
}

/**
 * Get sessions for today
 */
export function getTodaySessions(sessions: Session[]): Session[] {
  const today = getTodayDate();
  const startOfDay = new Date(today).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

  return sessions.filter(s => s.startedAt >= startOfDay && s.startedAt < endOfDay);
}

/**
 * Get sessions for week
 */
export function getWeekSessions(sessions: Session[]): Session[] {
  const start = getWeekStart().getTime();
  const end = getWeekEnd().getTime();

  return sessions.filter(s => s.startedAt >= start && s.startedAt <= end);
}

/**
 * Calculate average session length
 */
export function getAverageSessionLength(sessions: Session[]): number {
  const workSessions = sessions.filter(s => s.type === SessionType.WORK && s.wasCompleted);
  if (workSessions.length === 0) return 0;

  const total = workSessions.reduce((sum, s) => sum + s.actualDuration, 0);
  return Math.round(total / workSessions.length);
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Generate a slug from text
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// ============================================================================
// DOM UTILITIES
// ============================================================================

/**
 * Query selector with null check
 */
export function qs<T extends Element = Element>(selector: string, parent: ParentNode = document): T | null {
  return parent.querySelector<T>(selector);
}

/**
 * Query selector all
 */
export function qsa<T extends Element = Element>(selector: string, parent: ParentNode = document): T[] {
  return Array.from(parent.querySelectorAll<T>(selector));
}

/**
 * Create element with attributes and children
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Record<string, string> = {},
  children: (string | Element)[] = []
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element.setAttribute(key, value);
    }
  });

  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Element) {
      element.appendChild(child);
    }
  });

  return element;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate email address
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate task title
 */
export function isValidTaskTitle(title: string): boolean {
  return title.trim().length > 0 && title.trim().length <= 200;
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Remove duplicate items from array
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Group array items by key
 */
export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((result, item) => {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round to decimal places
 */
export function roundTo(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Map value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

// ============================================================================
// COLOR UTILITIES
// ============================================================================

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

/**
 * Get contrast color (black or white) based on background
 */
export function getContrastColor(hexColor: string): string {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  // Time
  formatTime,
  formatTimeLong,
  formatDuration,
  formatRelativeTime,
  formatDate,
  formatDateTime,
  getTodayDate,
  getWeekStart,
  getWeekEnd,
  isToday,
  isThisWeek,

  // Tasks
  sortTasksByPriority,
  sortTasksByDueDate,
  sortTasksByCreatedDate,
  filterTasksByStatus,
  filterTasksByPriority,
  filterTasksDueToday,
  filterTasksOverdue,
  getTaskCompletionPercentage,
  isTaskOverdue,
  getPriorityColor,
  getStatusText,

  // Sessions
  getTotalFocusTime,
  getCompletedSessionsCount,
  getTodaySessions,
  getWeekSessions,
  getAverageSessionLength,

  // Strings
  escapeHtml,
  truncate,
  slugify,
  capitalize,
  generateId,

  // DOM
  qs,
  qsa,
  createElement,
  debounce,
  throttle,

  // Validation
  isValidEmail,
  isValidUrl,
  isValidTaskTitle,

  // Arrays
  unique,
  groupBy,
  chunk,

  // Numbers
  clamp,
  roundTo,
  mapRange,

  // Colors
  hexToRgb,
  getContrastColor
};
