/**
 * Pomodoro Timer - Core Module Exports
 *
 * Main entry point for the timer functionality
 */

// Types
export * from './types/index';

// Timer core
export { PomodoroTimer, createPomodoroTimer } from './services/timer';

// Timer controller
export {
  TimerController,
  createTimerController,
} from './services/timerController';

// Audio manager
export {
  AudioManager,
  getAudioManager,
  resetAudioManager,
  SoundType,
} from './services/audioManager';

// Notification manager
export {
  NotificationManager,
  getNotificationManager,
  resetNotificationManager,
  requestNotificationPermission,
  checkNotificationPermission,
  NotificationAction,
} from './services/notificationManager';

// Storage service
export {
  LocalStorageService,
  InMemoryStorageService,
  createStorageService,
  getStorageService,
  createTask,
  createSession,
  StorageError,
} from './services/storage';

// Utilities
export {
  formatTime,
  formatDuration,
  formatDurationCompact,
  getProgressPercentage,
  getProgressFromRemaining,
  secondsToMs,
  msToSeconds,
  minutesToSeconds,
  secondsToDate,
  isWithinRange,
  formatTimestamp,
  formatDate,
  toISODate,
  parseTimeString,
  getEndOfDay,
  getStartOfDay,
  formatTimeWithHours,
} from './utils/timeFormat';

// Convenience exports
export {
  TimerState,
  SessionType,
  TaskPriority,
  TaskStatus,
  TimerEventType,
} from './types/index';
