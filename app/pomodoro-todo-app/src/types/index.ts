/**
 * Core type definitions for the Pomodoro To-Do Application
 */

/**
 * Timer state enumeration representing all possible states of the pomodoro timer
 */
export enum TimerStateEnum {
  IDLE = 'idle',
  WORKING = 'working',
  SHORT_BREAK = 'short_break',
  LONG_BREAK = 'long_break',
  PAUSED = 'paused'
}

/**
 * Task priority levels
 */
export enum TaskPriorityEnum {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Task status enumeration
 */
export enum TaskStatusEnum {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

/**
 * Task entity representing a todo item
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriorityEnumEnum;
  status: TaskStatusEnumEnum;
  estimatedPomodoros?: number;
  completedPomodoros: number;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  projectId?: string;
}

/**
 * Session type for tracking different timer sessions
 */
export enum SessionType {
  WORK = 'work',
  SHORT_BREAK = 'short_break',
  LONG_BREAK = 'long_break'
}

/**
 * Timer session record
 */
export interface Session {
  id: string;
  taskId: string | null;
  type: SessionType;
  duration: number;
  actualDuration: number;
  startedAt: number;
  completedAt: number;
  wasCompleted: boolean;
  wasSkipped: boolean;
  status?: SessionStatus; // Added to match indexeddb schema
  notes?: string;
}

/**
 * Session status enum
 */
export enum SessionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  CANCELLED = 'cancelled'
}

/**
 * Timer settings configuration
 */
export interface TimerSettings {
  workDuration: number;           // in seconds, default 1500 (25 minutes)
  shortBreakDuration: number;     // in seconds, default 300 (5 minutes)
  longBreakDuration: number;      // in seconds, default 900 (15 minutes)
  longBreakInterval: number;      // number of work sessions before long break, default 4
  autoStartBreak: boolean;        // auto-start break after work session
  autoStartWork: boolean;         // auto-start work after break
  notificationEnabled: boolean;   // enable browser notifications
  soundEnabled: boolean;          // enable sound notifications
  volume: number;                 // sound volume 0-1
}

/**
 * Daily statistics
 */
export interface DailyStats {
  date: string;                   // ISO date string
  workSessions: number;
  totalWorkTime: number;          // in seconds
  totalBreakTime: number;         // in seconds
  completedTasks: number;
  longestStreak: number;          // consecutive pomodoros
}

/**
 * Timer event types for state changes
 */
export enum TimerEventType {
  STARTED = 'started',
  PAUSED = 'paused',
  RESUMED = 'resumed',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  RESET = 'reset',
  STATE_CHANGED = 'state_changed'
}

/**
 * Timer event payload
 */
export interface TimerEvent {
  type: TimerEventType;
  state: TimerStateEnum;
  remainingTime: number;
  timestamp: number;
  taskId?: string;
  sessionType?: SessionType;
}

/**
 * Observer callback type for timer events
 */
export type TimerObserver = (event: TimerEvent) => void;

/**
 * Project for task organization
 */
export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  createdAt: number;
  taskIds: string[];
}

/**
 * Storage interface for persistence operations
 */
export interface IStorageService {
  getTasks(): Promise<Task[]>;
  getTask(id: string): Promise<Task | null>;
  saveTask(task: Task): Promise<void>;
  deleteTask(id: string): Promise<void>;

  getSessions(): Promise<Session[]>;
  getSessionsByTask(taskId: string): Promise<Session[]>;
  getSessionsByDateRange(start: number, end: number): Promise<Session[]>;
  saveSession(session: Session): Promise<void>;
  getLatestSessions(limit: number): Promise<Session[]>;

  getSettings(): Promise<TimerSettings>;
  saveSettings(settings: Partial<TimerSettings>): Promise<void>;

  getDailyStats(date: string): Promise<DailyStats | null>;
  saveDailyStats(stats: DailyStats): Promise<void>;
}

/**
 * Audio event types
 */
export enum AudioEventType {
  START = 'start',
  COMPLETE = 'complete',
  BREAK_START = 'break_start',
  PAUSE = 'pause'
}

// ============================================================================
// Additional types for Store and Controllers
// ============================================================================

/**
 * Complete application state
 */
export interface AppState {
  tasks: Task[];
  activeTaskId: string | null;
  timerState: TimerStateEnum;
  remainingTime: number;
  currentSessionType: SessionType | null;
  completedSessionsSinceLastLongBreak: number;
  settings: TimerSettings;
  sessions: Session[];
  dailyStats: Map<string, DailyStats>;
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}

/**
 * State change listener callback
 */
export type StateListener = (state: Readonly<AppState>) => void;

/**
 * Unsubscribe function type for removing listeners
 */
export type UnsubscribeFn = () => void;

/**
 * Statistics summary for UI display
 */
export interface Statistics {
  today: {
    workSessions: number;
    totalWorkTime: number;
    completedTasks: number;
    focusPercentage: number;
  };
  week: {
    workSessions: number;
    totalWorkTime: number;
    completedTasks: number;
    averageDailySessions: number;
  };
  overall: {
    totalWorkSessions: number;
    totalWorkTime: number;
    totalCompletedTasks: number;
    longestStreak: number;
  };
}

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Toast notification data
 */
export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/**
 * Filter options for task list
 */
export interface TaskFilter {
  status?: TaskStatusEnum | 'all';
  priority?: TaskPriorityEnum | 'all';
  projectId?: string | 'all';
  searchQuery?: string;
  tags?: string[];
  hideCompleted?: boolean;
}

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
  enabled?: boolean;
}

/**
 * Auto-save configuration
 */
export interface AutoSaveConfig {
  enabled: boolean;
  debounceMs: number;
  onSave?: () => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// Storage Layer Types
// ============================================================================

/**
 * Enhanced Session entity with status tracking
 */
export interface EnhancedSession extends Session {
  status: SessionStatus;
  remainingTime?: number;
  startedAt?: number;
  completedAt?: number;
  cancelledAt?: number;
  pausedAt?: number;
  createdAt: number;
}

/**
 * Modern App settings configuration (extends TimerSettings)
 */
export interface AppSettingsModern extends TimerSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dailyGoal: number;
  workingHours: {
    start: string;
    end: string;
  };
  weekStart: 'monday' | 'sunday' | 'saturday';
  createdAt: number;
  updatedAt: number;
}

/**
 * Storage event types for data changes
 */
export type StorageEventType =
  | 'taskCreated'
  | 'taskUpdated'
  | 'taskDeleted'
  | 'sessionCreated'
  | 'sessionUpdated'
  | 'sessionDeleted'
  | 'settingsUpdated';

/**
 * Storage event payload
 */
export interface StorageEvent<T = any> {
  type: StorageEventType;
  data: T;
  timestamp: number;
}

/**
 * Storage event listener type
 */
export type StorageEventListener<T = any> = (event: StorageEvent<T>) => void;

/**
 * Backup data structure for export/import
 */
export interface BackupData {
  version: number;
  exportedAt: string;
  tasks: Task[];
  sessions: Session[];
  settings: AppSettings;
  projects?: Project[];
}

/**
 * Repository interfaces for data access
 */
export interface ITaskRepository {
  save(task: Task): Promise<void>;
  saveMany(tasks: Task[]): Promise<void>;
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  findByStatus(status: TaskStatusEnumEnum): Promise<Task[]>;
  findByPriority(priority: TaskPriorityEnumEnum): Promise<Task[]>;
  findDueToday(): Promise<Task[]>;
  findByTag(tag: string): Promise<Task[]>;
  findByProject(projectId: string): Promise<Task[]>;
  delete(id: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
  updateStatus(id: string, status: TaskStatusEnumEnum): Promise<void>;
  updateStatusMany(ids: string[], status: TaskStatusEnumEnum): Promise<void>;
  exists(id: string): Promise<boolean>;
  count(): Promise<number>;
  countByStatus(status: TaskStatusEnumEnum): Promise<number>;
}

export interface ISessionRepository {
  save(session: Session): Promise<void>;
  saveMany(sessions: Session[]): Promise<void>;
  findById(id: string): Promise<Session | null>;
  findByTaskId(taskId: string): Promise<Session[]>;
  findTodaySessions(): Promise<Session[]>;
  findWeekSessions(): Promise<Session[]>;
  findMonthSessions(): Promise<Session[]>;
  findSessionsByDateRange(startDate: number, endDate: number): Promise<Session[]>;
  findCompletedSessions(): Promise<Session[]>;
  delete(id: string): Promise<void>;
  deleteByTaskId(taskId: string): Promise<void>;
  deleteOldSessions(beforeDate: number): Promise<void>;
  count(): Promise<number>;
  countTodayCompleted(): Promise<number>;
}

/**
 * IndexedDB store configuration
 */
export interface StoreConfig {
  name: string;
  keyPath: string | string[];
  autoIncrement?: boolean;
  indexes?: Array<{
    name: string;
    keyPath: string | string[];
    options?: IDBIndexParameters;
  }>;
}

/**
 * Migration function type
 */
export type MigrationFunction = (db: IDBDatabase, transaction: IDBTransaction) => Promise<void>;

/**
 * Migration definition
 */
export interface Migration {
  version: number;
  name: string;
  up: MigrationFunction;
  down?: MigrationFunction;
}

// ============================================================================
// Storage Error Types
// ============================================================================

/**
 * Custom storage error base class
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export class DatabaseNotFoundError extends StorageError {
  constructor(originalError?: Error) {
    super('Database not found', 'DATABASE_NOT_FOUND', originalError);
    this.name = 'DatabaseNotFoundError';
  }
}

export class TransactionError extends StorageError {
  constructor(message: string, originalError?: Error) {
    super(message, 'TRANSACTION_ERROR', originalError);
    this.name = 'TransactionError';
  }
}

export class QuotaExceededError extends StorageError {
  constructor(originalError?: Error) {
    super('Storage quota exceeded', 'QUOTA_EXCEEDED', originalError);
    this.name = 'QuotaExceededError';
  }
}

export class MigrationError extends StorageError {
  constructor(message: string, originalError?: Error) {
    super(message, 'MIGRATION_ERROR', originalError);
    this.name = 'MigrationError';
  }
}

// ============================================================================
// Legacy Types for Backward Compatibility
// These types are used by the existing Chinese codebase
// ============================================================================

/**
 * Legacy timer mode
 */
export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

/**
 * Legacy timer state (primary export for existing codebase)
 */
export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

/**
 * Legacy task priority (primary export for existing codebase)
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Legacy task status (primary export for existing codebase)
 */
export type TaskStatus = 'active' | 'completed';

/**
 * Legacy task entity (primary export for existing codebase)
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriorityEnumEnum;
  status: TaskStatusEnumEnum;
  estimatedPomodoros: number;
  completedPomodoros: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/**
 * Legacy timer info interface
 */
export interface TimerInfo {
  mode: TimerMode;
  state: TimerStateEnum;
  timeRemaining: number;
  totalTime: number;
  completedPomodoros: number;
  currentTaskId?: string;
}

/**
 * Legacy daily statistics
 */
export interface DailyStatistics {
  date: Date;
  pomodoroCount: number;
  focusTime: number;
  completedTasks: number;
  goal: number;
}

/**
 * Legacy total statistics
 */
export interface TotalStatistics {
  totalPomodoros: number;
  totalFocusTime: number;
  totalTasks: number;
  averageDailyPomodoros: number;
  streak: number;
}

/**
 * Legacy calendar day
 */
export interface CalendarDay {
  date: Date;
  pomodoroCount: number;
  isToday: boolean;
}

/**
 * Legacy application settings
 */
export interface AppSettings {
  timer: {
    pomodoroDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    longBreakInterval: number;
  };
  notifications: {
    enabled: boolean;
    sound: boolean;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
  };
  dailyGoal: number;
}

/**
 * Legacy settings form data
 */
export interface SettingsFormData {
  pomodoroDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  dailyGoal: number;
  enableNotifications: boolean;
  enableSound: boolean;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  theme: 'light' | 'dark' | 'auto';
}

/**
 * Legacy task form data
 */
export interface TaskFormData {
  title: string;
  description?: string;
  priority: TaskPriorityEnumEnum;
  estimatedPomodoros: number;
}

/**
 * Legacy task filter
 */
export type TaskFilter = 'all' | 'active' | 'completed';

/**
 * Legacy event type
 */
export type EventType =
  | 'timer:start'
  | 'timer:pause'
  | 'timer:reset'
  | 'timer:complete'
  | 'timer:skip'
  | 'timer:modeChange'
  | 'task:add'
  | 'task:update'
  | 'task:delete'
  | 'task:complete'
  | 'task:activate'
  | 'settings:update';

/**
 * Legacy event listener
 */
export type EventListener = (data?: any) => void;

/**
 * Legacy toast action
 */
export interface ToastAction {
  label: string;
  onClick: () => void;
  primary?: boolean;
}
