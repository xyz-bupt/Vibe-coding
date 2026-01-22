/**
 * Storage Layer - Public API
 *
 * This module exports all storage-related functionality for the Pomodoro To-Do app.
 *
 * Usage:
 * ```typescript
 * import { storageService, initStorage } from '@/services';
 *
 * // Initialize storage
 * await initStorage();
 *
 * // Get tasks
 * const tasks = await storageService.getTasks();
 *
 * // Save a task
 * await storageService.saveTask(task);
 * ```
 */

// ============================================================================
// Main Storage Service
// ============================================================================

export {
  StorageService,
  storageService,
  initStorage,
  createTask,
  createSession,
  StorageType,
  LS_KEYS,
} from './storage.js';

// ============================================================================
// Repositories
// ============================================================================

export {
  TaskRepository,
  SessionRepository,
  SettingsRepository,
  StatisticsRepository,
  ProjectRepository,
  generateId,
  getTodayDateString,
  toDateString,
  isToday,
  isThisWeek,
  isThisMonth,
} from './repositories.js';

// ============================================================================
// IndexedDB Wrapper
// ============================================================================

export {
  IndexedDB,
  indexedDBInstance,
  STORE_NAMES,
  DB_NAME,
  DB_VERSION,
  TransactionMode,
  lowerBound,
  upperBound,
  bound,
  only,
  createDateRange,
  createTodayRange,
  createWeekRange,
  createMonthRange,
  // Error classes
  StorageError as IndexedDBStorageError,
  DatabaseNotFoundError,
  TransactionError,
  QuotaExceededError,
} from './indexeddb.js';

// ============================================================================
// Migration System
// ============================================================================

export {
  MigrationManager,
  migrationManager,
  runMigrations,
  needsMigration,
  getCurrentVersion,
  CURRENT_VERSION,
  MigrationState,
  // Migration helpers
  createObjectStore,
  deleteObjectStore,
  renameObjectStore,
  addIndex,
  migrateData,
  validateData,
} from './migration.js';

// ============================================================================
// Type Re-exports (for convenience)
// ============================================================================

export type {
  // Entity types
  Task,
  Session,
  Project,
  // Settings types
  TimerSettings,
  AppSettings,
  // Statistics types
  DailyStats,
  Statistics,
  // Storage types
  BackupData,
  StorageEvent,
  StorageEventListener,
  StorageEventType,
  // Repository interfaces
  ITaskRepository,
  ISessionRepository,
  ISettingsRepository,
  IStatisticsRepository,
  IProjectRepository,
  IStorageService,
  // Other types
  TaskStatus,
  TaskPriority,
  SessionType,
  SessionStatus,
  TimerState,
  TimerEventType,
  TimerEvent,
  TimerObserver,
  StoreConfig,
  Migration,
  MigrationFunction,
  MigrationRecord,
  MigrationContext,
  MigrationLogger,
  MigrationOptions,
  MigrationResult,
} from '../types/index.js';

// Re-export error types
export type {
  StorageError,
  DatabaseNotFoundError,
  TransactionError,
  QuotaExceededError,
  MigrationError,
} from '../types/index.js';

// ============================================================================
// New Services
// ============================================================================

export {
  KeyboardShortcutManager,
  DefaultShortcuts,
  getKeyboardManager,
  destroyKeyboardManager
} from './keyboard.js';

export {
  AutoSaveManager,
  createAutoSaveManager
} from './autoSave.js';

export type {
  ShortcutKey,
  ShortcutOptions,
  ShortcutHandler,
  AutoSaveConfig,
  AutoSaveStatus,
  SaveResult,
  AutoSaveEvent,
  AutoSaveEventListener,
  AutoSaveStats
} from '../types/index.js';
