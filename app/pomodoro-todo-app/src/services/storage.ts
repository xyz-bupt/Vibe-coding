/**
 * Storage Service - Main Entry Point
 *
 * Unified storage service that uses IndexedDB with LocalStorage fallback.
 * Automatically handles storage selection based on availability and provides
 * a consistent API regardless of the underlying storage mechanism.
 *
 * Features:
 * - Automatic fallback from IndexedDB to LocalStorage
 * - Data backup to LocalStorage for key data
 * - Event emission for data changes
 * - Statistics calculation
 * - Data export/import
 */

import type {
  Task,
  Session,
  TimerSettings,
  AppSettings,
  DailyStats,
  Statistics,
  BackupData,
  StorageEvent,
  StorageEventType,
  StorageEventListener,
  IStorageService,
} from '../types/index.js';

import type {
  TaskPriority,
  TaskStatus,
  SessionType,
  Project,
} from '../types/index.js';

// Import repositories
import {
  TaskRepository,
  SessionRepository,
  SettingsRepository,
  StatisticsRepository,
  ProjectRepository,
  generateId,
} from './repositories.js';

// Import IndexedDB wrapper
import {
  IndexedDB,
  indexedDBInstance,
  IndexedDB as IndexedDBClass,
  STORE_NAMES,
} from './indexeddb.js';

import {
  StorageError,
  QuotaExceededError,
  TransactionError,
} from '../types/index.js';

// ============================================================================
// Constants
// ============================================================================

/**
 * LocalStorage keys for fallback and backup
 */
const LS_KEYS = {
  TASKS_BACKUP: 'pomodoro_tasks_backup',
  SETTINGS_BACKUP: 'pomodoro_settings_backup',
  STORAGE_TYPE: 'pomodoro_storage_type',
  LAST_SYNC: 'pomodoro_last_sync',
} as const;

/**
 * Storage type enumeration
 */
export enum StorageType {
  INDEXED_DB = 'indexeddb',
  LOCAL_STORAGE = 'localstorage',
  MEMORY = 'memory',
}

/**
 * Days to keep old sessions before auto-cleanup
 */
const SESSION_RETENTION_DAYS = 90;

/**
 * Maximum sessions to keep in LocalStorage mode
 */
const MAX_SESSIONS_LS = 500;

// ============================================================================
// LocalStorage Fallback Implementation
// ============================================================================

/**
 * LocalStorage-based storage implementation (fallback)
 */
class LocalStorageFallback {
  private readonly available: boolean;

  constructor() {
    this.available = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  isAvailable(): boolean {
    return this.available;
  }

  get<T>(key: string): T | null {
    if (!this.available) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): boolean {
    if (!this.available) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  remove(key: string): boolean {
    if (!this.available) return false;
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  clear(): void {
    if (!this.available) return;
    Object.values(LS_KEYS).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore
      }
    });
  }

  getUsage(): { used: number; total: number } {
    if (!this.available) return { used: 0, total: 0 };

    let used = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('pomodoro_')) {
        const value = localStorage.getItem(key);
        if (value) used += key.length + value.length;
      }
    }

    // Assume 5MB limit (typical for localStorage)
    return { used, total: 5 * 1024 * 1024 };
  }
}

// ============================================================================
// In-Memory Storage (Last Resort Fallback)
// ============================================================================

/**
 * In-memory storage implementation (last resort when nothing else works)
 */
class InMemoryStorage {
  private tasks: Map<string, Task> = new Map();
  private sessions: Map<string, Session> = new Map();
  private settings: AppSettings | null = null;
  private stats: Map<string, DailyStats> = new Map();
  private projects: Map<string, Project> = new Map();

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async saveTask(task: Task): Promise<void> {
    this.tasks.set(task.id, { ...task, updatedAt: Date.now() });
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  async getSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values());
  }

  async saveSession(session: Session): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async getSettings(): Promise<AppSettings | null> {
    return this.settings ? { ...this.settings } : null;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    this.settings = { ...settings };
  }

  async getStats(): Promise<DailyStats[]> {
    return Array.from(this.stats.values());
  }

  async saveStats(stats: DailyStats): Promise<void> {
    this.stats.set(stats.date, stats);
  }

  clear(): void {
    this.tasks.clear();
    this.sessions.clear();
    this.settings = null;
    this.stats.clear();
    this.projects.clear();
  }
}

// ============================================================================
// Main Storage Service
// ============================================================================

/**
 * Main Storage Service class
 *
 * Provides unified access to all data storage operations with automatic
 * fallback from IndexedDB to LocalStorage to in-memory storage.
 */
export class StorageService implements IStorageService {
  private db: IndexedDBClass;
  private taskRepo: TaskRepository;
  private sessionRepo: SessionRepository;
  private settingsRepo: SettingsRepository;
  private statsRepo: StatisticsRepository;
  private projectRepo: ProjectRepository;

  private ls: LocalStorageFallback;
  private memory: InMemoryStorage;

  private storageType: StorageType;
  private eventListeners: Map<StorageEventType, Set<StorageEventListener>> =
    new Map();

  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(dbInstance?: IndexedDBClass) {
    this.db = dbInstance || indexedDBInstance;
    this.taskRepo = new TaskRepository(this.db);
    this.sessionRepo = new SessionRepository(this.db);
    this.settingsRepo = new SettingsRepository(this.db);
    this.statsRepo = new StatisticsRepository(this.db);
    this.projectRepo = new ProjectRepository(this.db);

    this.ls = new LocalStorageFallback();
    this.memory = new InMemoryStorage();

    // Detect storage type from previous session
    const savedType = this.ls.get<StorageType>(LS_KEYS.STORAGE_TYPE);
    this.storageType = savedType || StorageType.INDEXED_DB;
  }

  /**
   * Initialize the storage service
   */
  async init(): Promise<StorageType> {
    if (this.initialized) {
      return this.storageType;
    }

    if (this.initPromise) {
      await this.initPromise;
      return this.storageType;
    }

    this.initPromise = this._init();
    await this.initPromise;
    this.initPromise = null;

    return this.storageType;
  }

  private async _init(): Promise<void> {
    // Try IndexedDB first
    if (
      IndexedDBClass.isSupported() &&
      !(await IndexedDBClass.isPrivateMode())
    ) {
      try {
        await this.db.init();
        this.storageType = StorageType.INDEXED_DB;
        this.ls.set(LS_KEYS.STORAGE_TYPE, StorageType.INDEXED_DB);
        this.initialized = true;

        // Backup critical data to LocalStorage
        await this.backupToLocalStorage();
        return;
      } catch (error) {
        console.warn(
          '[Storage] IndexedDB initialization failed, falling back to LocalStorage:',
          error
        );
      }
    }

    // Fallback to LocalStorage
    if (this.ls.isAvailable()) {
      this.storageType = StorageType.LOCAL_STORAGE;
      this.ls.set(LS_KEYS.STORAGE_TYPE, StorageType.LOCAL_STORAGE);
      this.initialized = true;

      // Try to migrate any IndexedDB data if available
      await this.migrateFromIndexedDB();
      return;
    }

    // Last resort: in-memory storage
    this.storageType = StorageType.MEMORY;
    this.ls.set(LS_KEYS.STORAGE_TYPE, StorageType.MEMORY);
    this.initialized = true;
    console.warn(
      '[Storage] Using in-memory storage - data will be lost on refresh'
    );
  }

  /**
   * Get the current storage type
   */
  getStorageType(): StorageType {
    return this.storageType;
  }

  /**
   * Check if storage is ready
   */
  isReady(): boolean {
    return this.initialized;
  }

  // ========================================================================
  // Task Operations
  // ========================================================================

  /**
   * Get all tasks
   */
  async getTasks(): Promise<Task[]> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      return this.taskRepo.findAll();
    } else if (this.storageType === StorageType.LOCAL_STORAGE) {
      const tasks = this.ls.get<Task[]>(LS_KEYS.TASKS_BACKUP);
      return tasks || [];
    } else {
      return this.memory.getTasks();
    }
  }

  /**
   * Get a specific task by ID
   */
  async getTask(id: string): Promise<Task | null> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      return this.taskRepo.findById(id);
    } else if (this.storageType === StorageType.LOCAL_STORAGE) {
      const tasks = await this.getTasks();
      return tasks.find((t) => t.id === id) || null;
    } else {
      const tasks = await this.memory.getTasks();
      return tasks.find((t) => t.id === id) || null;
    }
  }

  /**
   * Save a task (create or update)
   */
  async saveTask(task: Task): Promise<void> {
    await this.init();

    const taskToSave = {
      ...task,
      updatedAt: Date.now(),
      createdAt: task.createdAt || Date.now(),
    };

    if (this.storageType === StorageType.INDEXED_DB) {
      await this.taskRepo.save(taskToSave);
    } else if (this.storageType === StorageType.LOCAL_STORAGE) {
      const tasks = await this.getTasks();
      const index = tasks.findIndex((t) => t.id === task.id);
      if (index >= 0) {
        tasks[index] = taskToSave;
      } else {
        tasks.push(taskToSave);
      }
      this.ls.set(LS_KEYS.TASKS_BACKUP, tasks);
    } else {
      await this.memory.saveTask(taskToSave);
    }

    this.emit('taskUpdated', taskToSave);
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      await this.taskRepo.delete(id);
    } else if (this.storageType === StorageType.LOCAL_STORAGE) {
      const tasks = (await this.getTasks()).filter((t) => t.id !== id);
      this.ls.set(LS_KEYS.TASKS_BACKUP, tasks);
    } else {
      await this.memory.deleteTask(id);
    }

    this.emit('taskDeleted', { id });
  }

  /**
   * Update task status
   */
  async updateTaskStatus(id: string, status: TaskStatus): Promise<void> {
    const task = await this.getTask(id);
    if (!task) {
      throw new StorageError(`Task not found: ${id}`, 'TASK_NOT_FOUND');
    }

    await this.saveTask({
      ...task,
      status,
      completedAt:
        status === TaskStatus.COMPLETED ? Date.now() : task.completedAt,
    });
  }

  // ========================================================================
  // Session Operations
  // ========================================================================

  /**
   * Get all sessions
   */
  async getSessions(): Promise<Session[]> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      return this.sessionRepo.findAll();
    } else if (this.storageType === StorageType.LOCAL_STORAGE) {
      const sessions = this.ls.get<Session[]>('pomodoro_sessions');
      return sessions || [];
    } else {
      return this.memory.getSessions();
    }
  }

  /**
   * Get sessions for a specific task
   */
  async getSessionsByTask(taskId: string): Promise<Session[]> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      return this.sessionRepo.findByTaskId(taskId);
    } else {
      const sessions = await this.getSessions();
      return sessions.filter((s) => s.taskId === taskId);
    }
  }

  /**
   * Get sessions within a date range
   */
  async getSessionsByDateRange(start: number, end: number): Promise<Session[]> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      return this.sessionRepo.findSessionsByDateRange(start, end);
    } else {
      const sessions = await this.getSessions();
      return sessions.filter(
        (s) =>
          (s.startedAt || s.createdAt) >= start &&
          (s.startedAt || s.createdAt) <= end
      );
    }
  }

  /**
   * Get latest sessions
   */
  async getLatestSessions(limit: number = 10): Promise<Session[]> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      return this.sessionRepo.findLatestSessions(limit);
    } else {
      const sessions = await this.getSessions();
      return sessions
        .sort(
          (a, b) => (b.startedAt || b.createdAt) - (a.startedAt || a.createdAt)
        )
        .slice(0, limit);
    }
  }

  /**
   * Save a session
   */
  async saveSession(session: Session): Promise<void> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      await this.sessionRepo.save(session);
    } else if (this.storageType === StorageType.LOCAL_STORAGE) {
      const sessions = await this.getSessions();
      const index = sessions.findIndex((s) => s.id === session.id);

      if (index >= 0) {
        sessions[index] = session;
      } else {
        sessions.push(session);
      }

      // Limit sessions to prevent overflow
      const limited = sessions
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, MAX_SESSIONS_LS);

      this.ls.set('pomodoro_sessions', limited);
    } else {
      await this.memory.saveSession(session);
    }

    this.emit('sessionUpdated', session);
  }

  /**
   * Create and start a new session
   */
  async startSession(
    taskId: string | null,
    type: SessionType,
    duration: number
  ): Promise<Session> {
    const session: Session = {
      id: generateId(),
      taskId,
      type,
      duration,
      actualDuration: 0,
      startedAt: Date.now(),
      completedAt: undefined,
      wasCompleted: false,
      wasSkipped: false,
      createdAt: Date.now(),
    };

    await this.saveSession(session);
    this.emit('sessionCreated', session);
    return session;
  }

  /**
   * Complete a session
   */
  async completeSession(
    sessionId: string,
    actualDuration: number
  ): Promise<void> {
    if (this.storageType === StorageType.INDEXED_DB) {
      await this.sessionRepo.complete(sessionId, actualDuration);
    } else {
      const sessions = await this.getSessions();
      const index = sessions.findIndex((s) => s.id === sessionId);

      if (index >= 0) {
        const session = sessions[index];
        session.actualDuration = actualDuration;
        session.completedAt = Date.now();
        session.wasCompleted = true;

        // Update task pomodoro count
        if (session.taskId && session.type === SessionType.WORK) {
          const task = await this.getTask(session.taskId);
          if (task) {
            await this.saveTask({
              ...task,
              completedPomodoros: task.completedPomodoros + 1,
            });
          }
        }

        await this.saveSession(session);
      }
    }
  }

  // ========================================================================
  // Settings Operations
  // ========================================================================

  /**
   * Get current settings
   */
  async getSettings(): Promise<AppSettings> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      const settings = await this.settingsRepo.get();
      if (settings) return settings;
      return this.settingsRepo.resetToDefaults();
    } else if (this.storageType === StorageType.LOCAL_STORAGE) {
      const settings = this.ls.get<AppSettings>(LS_KEYS.SETTINGS_BACKUP);
      return settings || this.getDefaultSettings();
    } else {
      const settings = await this.memory.getSettings();
      return settings || this.getDefaultSettings();
    }
  }

  /**
   * Save settings
   */
  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    await this.init();

    const current = await this.getSettings();
    const updated = {
      ...current,
      ...settings,
      updatedAt: Date.now(),
    };

    if (this.storageType === StorageType.INDEXED_DB) {
      await this.settingsRepo.save(updated);
    } else if (this.storageType === StorageType.LOCAL_STORAGE) {
      this.ls.set(LS_KEYS.SETTINGS_BACKUP, updated);
    } else {
      await this.memory.saveSettings(updated);
    }

    this.emit('settingsUpdated', updated);
  }

  /**
   * Update timer settings
   */
  async updateTimerSettings(settings: Partial<TimerSettings>): Promise<void> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      await this.settingsRepo.updateTimerSettings(settings);
    } else {
      const current = await this.getSettings();
      await this.saveSettings({
        timer: {
          ...current.timer,
          ...settings,
        },
      });
    }
  }

  /**
   * Get default settings
   */
  getDefaultSettings(): AppSettings {
    return {
      timer: {
        workDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        longBreakInterval: 4,
        autoStartBreak: false,
        autoStartWork: false,
        notificationEnabled: true,
        soundEnabled: true,
        tickSoundEnabled: false,
        volume: 0.7,
      },
      theme: 'auto',
      language: 'en',
      dailyGoal: 8,
      workingHours: {
        start: '09:00',
        end: '18:00',
      },
      weekStart: 'monday',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }

  // ========================================================================
  // Statistics Operations
  // ========================================================================

  /**
   * Get daily stats for a specific date
   */
  async getDailyStats(date: string): Promise<DailyStats | null> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      return this.statsRepo.getDailyStats(date);
    } else {
      const stats = this.ls.get<Record<string, DailyStats>>('pomodoro_stats');
      return stats?.[date] || null;
    }
  }

  /**
   * Save daily stats
   */
  async saveDailyStats(stats: DailyStats): Promise<void> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      await this.statsRepo.saveDailyStats(stats);
    } else if (this.storageType === StorageType.LOCAL_STORAGE) {
      const allStats =
        this.ls.get<Record<string, DailyStats>>('pomodoro_stats') || {};
      allStats[stats.date] = stats;
      this.ls.set('pomodoro_stats', allStats);
    } else {
      await this.memory.saveStats(stats);
    }
  }

  /**
   * Calculate comprehensive statistics
   */
  async getStatistics(): Promise<Statistics> {
    await this.init();

    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date();
    monthStart.setMonth(monthStart.getMonth() - 1);

    const [todayStats, weekSessions, monthSessions, allSessions] =
      await Promise.all([
        this.calculateDailyStats(today),
        this.getSessionsByDateRange(weekStart.getTime(), Date.now()),
        this.getSessionsByDateRange(monthStart.getTime(), Date.now()),
        this.getSessions(),
      ]);

    const completedWorkSessions = (sessions: Session[]) =>
      sessions.filter((s) => s.type === SessionType.WORK && s.wasCompleted);

    const weekTotals = {
      workSessions: completedWorkSessions(weekSessions).length,
      totalWorkTime: weekSessions
        .filter((s) => s.type === SessionType.WORK)
        .reduce((sum, s) => sum + (s.actualDuration || 0), 0),
      completedTasks: 0, // Would need task aggregation
    };

    const monthTotals = {
      workSessions: completedWorkSessions(monthSessions).length,
      totalWorkTime: monthSessions
        .filter((s) => s.type === SessionType.WORK)
        .reduce((sum, s) => sum + (s.actualDuration || 0), 0),
      completedTasks: 0,
    };

    const allTimeTotals = {
      workSessions: completedWorkSessions(allSessions).length,
      totalWorkTime: allSessions
        .filter((s) => s.type === SessionType.WORK)
        .reduce((sum, s) => sum + (s.actualDuration || 0), 0),
      completedTasks: 0,
    };

    return {
      today: todayStats,
      week: await this.calculateWeekStats(),
      weekTotals,
      monthTotals,
      allTimeTotals,
    };
  }

  /**
   * Calculate daily statistics for a specific date
   */
  async calculateDailyStats(date: string): Promise<DailyStats> {
    if (this.storageType === StorageType.INDEXED_DB) {
      return this.statsRepo.calculateTodayStats();
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const sessions = await this.getSessionsByDateRange(
      startOfDay.getTime(),
      endOfDay.getTime()
    );
    const tasks = await this.getTasks();

    const workSessions = sessions.filter((s) => s.type === SessionType.WORK);
    const breakSessions = sessions.filter(
      (s) =>
        s.type === SessionType.SHORT_BREAK || s.type === SessionType.LONG_BREAK
    );

    return {
      date,
      workSessions: workSessions.filter((s) => s.wasCompleted).length,
      totalWorkTime: workSessions.reduce(
        (sum, s) => sum + (s.actualDuration || 0),
        0
      ),
      totalBreakTime: breakSessions.reduce(
        (sum, s) => sum + (s.actualDuration || 0),
        0
      ),
      completedTasks: tasks.filter(
        (t) =>
          t.completedAt &&
          t.completedAt >= startOfDay.getTime() &&
          t.completedAt <= endOfDay.getTime()
      ).length,
      tasksCreated: tasks.filter(
        (t) =>
          t.createdAt >= startOfDay.getTime() &&
          t.createdAt <= endOfDay.getTime()
      ).length,
      longestStreak: this.calculateLongestStreak(workSessions),
    };
  }

  /**
   * Calculate week statistics
   */
  async calculateWeekStats(): Promise<DailyStats[]> {
    const stats: DailyStats[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      stats.push(await this.calculateDailyStats(dateStr));
    }

    return stats;
  }

  /**
   * Calculate longest streak of consecutive work sessions
   */
  private calculateLongestStreak(sessions: Session[]): number {
    let longestStreak = 0;
    let currentStreak = 0;

    for (const session of sessions.sort(
      (a, b) => (a.createdAt || 0) - (b.createdAt || 0)
    )) {
      if (session.type === SessionType.WORK && session.wasCompleted) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (
        session.type === SessionType.SHORT_BREAK ||
        session.type === SessionType.LONG_BREAK
      ) {
        // Breaks don't reset streak
      } else {
        currentStreak = 0;
      }
    }

    return longestStreak;
  }

  // ========================================================================
  // Backup & Export
  // ========================================================================

  /**
   * Backup critical data to LocalStorage
   */
  async backupToLocalStorage(): Promise<void> {
    if (!this.ls.isAvailable() || this.storageType !== StorageType.INDEXED_DB) {
      return;
    }

    try {
      const [tasks, settings] = await Promise.all([
        this.taskRepo.findAll(),
        this.settingsRepo.get(),
      ]);

      this.ls.set(LS_KEYS.TASKS_BACKUP, tasks);
      if (settings) {
        this.ls.set(LS_KEYS.SETTINGS_BACKUP, settings);
      }

      this.ls.set(LS_KEYS.LAST_SYNC, Date.now());
    } catch (error) {
      console.warn('[Storage] Failed to backup to LocalStorage:', error);
    }
  }

  /**
   * Export all data as a backup object
   */
  async exportData(): Promise<BackupData> {
    await this.init();

    const [tasks, sessions, settings, projects] = await Promise.all([
      this.getTasks(),
      this.getSessions(),
      this.getSettings(),
      this.getProjects(),
    ]);

    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks,
      sessions,
      settings,
      projects,
    };
  }

  /**
   * Import data from a backup object
   */
  async importData(data: BackupData): Promise<void> {
    await this.init();

    // Validate data structure
    if (
      !data.version ||
      !Array.isArray(data.tasks) ||
      !Array.isArray(data.sessions)
    ) {
      throw new StorageError('Invalid backup data', 'INVALID_BACKUP');
    }

    // Clear existing data
    await this.clearAll();

    // Import tasks
    if (this.storageType === StorageType.INDEXED_DB) {
      await this.taskRepo.saveMany(data.tasks);
    } else if (this.storageType === StorageType.LOCAL_STORAGE) {
      this.ls.set(LS_KEYS.TASKS_BACKUP, data.tasks);
    }

    // Import sessions
    if (this.storageType === StorageType.INDEXED_DB) {
      await this.sessionRepo.saveMany(data.sessions);
    } else {
      this.ls.set('pomodoro_sessions', data.sessions);
    }

    // Import settings
    if (data.settings) {
      await this.saveSettings(data.settings);
    }

    // Import projects
    if (data.projects && this.storageType === StorageType.INDEXED_DB) {
      await this.projectRepo.saveMany(data.projects);
    }
  }

  /**
   * Clear all stored data
   */
  async clearAll(): Promise<void> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      await this.taskRepo.deleteMany(
        (await this.taskRepo.findAll()).map((t) => t.id)
      );
      await this.sessionRepo.deleteMany(
        (await this.sessionRepo.findAll()).map((s) => s.id)
      );
    } else if (this.storageType === StorageType.LOCAL_STORAGE) {
      this.ls.clear();
    } else {
      this.memory.clear();
    }
  }

  /**
   * Delete the entire database
   */
  async deleteDatabase(): Promise<void> {
    if (this.storageType === StorageType.INDEXED_DB) {
      await this.db.delete();
    } else if (this.storageType === StorageType.LOCAL_STORAGE) {
      this.ls.clear();
    } else {
      this.memory.clear();
    }

    this.ls.remove(LS_KEYS.STORAGE_TYPE);
    this.initialized = false;
  }

  // ========================================================================
  // Project Operations
  // ========================================================================

  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      return this.projectRepo.findAll();
    } else {
      return this.ls.get<Project[]>('pomodoro_projects') || [];
    }
  }

  /**
   * Save a project
   */
  async saveProject(project: Project): Promise<void> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      await this.projectRepo.save(project);
    } else {
      const projects = await this.getProjects();
      const index = projects.findIndex((p) => p.id === project.id);
      if (index >= 0) {
        projects[index] = project;
      } else {
        projects.push(project);
      }
      this.ls.set('pomodoro_projects', projects);
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      await this.projectRepo.delete(id);
    } else {
      const projects = (await this.getProjects()).filter((p) => p.id !== id);
      this.ls.set('pomodoro_projects', projects);
    }
  }

  // ========================================================================
  // Event Handling
  // ========================================================================

  /**
   * Add an event listener
   */
  addEventListener<T = any>(
    eventType: StorageEventType,
    listener: StorageEventListener<T>
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Remove an event listener
   */
  removeEventListener(
    eventType: StorageEventType,
    listener: StorageEventListener<any>
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventType);
      }
    }
  }

  /**
   * Emit an event to all listeners
   */
  private emit<T = any>(eventType: StorageEventType, data: T): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const event: StorageEvent<T> = {
        type: eventType,
        data,
        timestamp: Date.now(),
      };
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error(
            `[Storage] Error in event listener for ${eventType}:`,
            error
          );
        }
      });
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllEventListeners(): void {
    this.eventListeners.clear();
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  /**
   * Get storage usage information
   */
  async getStorageUsage(): Promise<{ used: number; total: number }> {
    await this.init();

    if (this.storageType === StorageType.INDEXED_DB) {
      return {
        used: await this.db.getEstimatedSize(),
        total: Number.MAX_SAFE_INTEGER, // No reliable way to get total
      };
    } else if (this.storageType === StorageType.LOCAL_STORAGE) {
      return this.ls.getUsage();
    } else {
      return { used: 0, total: 0 };
    }
  }

  /**
   * Compact storage by deleting old data
   */
  async compact(daysToKeep: number = SESSION_RETENTION_DAYS): Promise<void> {
    await this.init();

    const cutoffDate = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;

    if (this.storageType === StorageType.INDEXED_DB) {
      await this.db.compact(daysToKeep);
    } else if (this.storageType === StorageType.LOCAL_STORAGE) {
      const sessions = await this.getSessions();
      const filtered = sessions.filter(
        (s) => (s.completedAt || s.createdAt) > cutoffDate
      );
      this.ls.set('pomodoro_sessions', filtered);
    }
  }

  /**
   * Migrate data from IndexedDB to LocalStorage (during fallback)
   */
  private async migrateFromIndexedDB(): Promise<void> {
    if (!IndexedDBClass.isSupported()) return;

    try {
      const request = indexedDB.open('PomodoroTodoDB');

      request.onsuccess = async () => {
        const db = request.result;
        try {
          // Try to read tasks
          const tx = db.transaction(['tasks'], 'readonly');
          const store = tx.objectStore('tasks');
          const getAllRequest = store.getAll();

          getAllRequest.onsuccess = async () => {
            const tasks = getAllRequest.result as Task[];
            if (tasks.length > 0) {
              this.ls.set(LS_KEYS.TASKS_BACKUP, tasks);
              console.log(
                `[Storage] Migrated ${tasks.length} tasks to LocalStorage`
              );
            }
            db.close();
          };
        } catch (error) {
          db.close();
        }
      };

      request.onerror = () => {
        // Database doesn't exist or can't be opened
      };
    } catch {
      // Ignore migration errors
    }
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Global storage service instance
 */
export const storageService = new StorageService();

/**
 * Initialize the storage service
 */
export async function initStorage(): Promise<StorageService> {
  await storageService.init();
  return storageService;
}

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Create a new task with default values
 */
export function createTask(data: Partial<Task> = {}): Task {
  const now = Date.now();
  return {
    id: data.id || generateId(),
    title: data.title || 'New Task',
    description: data.description,
    priority: data.priority || ('medium' as TaskPriority),
    status: data.status || ('todo' as TaskStatus),
    estimatedPomodoros: data.estimatedPomodoros || 1,
    completedPomodoros: data.completedPomodoros || 0,
    tags: data.tags || [],
    createdAt: data.createdAt || now,
    updatedAt: now,
    dueDate: data.dueDate,
    projectId: data.projectId,
  };
}

/**
 * Create a new session with default values
 */
export function createSession(data: Partial<Session> = {}): Session {
  const now = Date.now();
  return {
    id: data.id || generateId(),
    taskId: data.taskId ?? null,
    type: data.type || ('work' as SessionType),
    duration: data.duration || 25 * 60,
    actualDuration: data.actualDuration || 0,
    startedAt: data.startedAt || now,
    completedAt: data.completedAt,
    wasCompleted: data.wasCompleted || false,
    wasSkipped: data.wasSkipped || false,
    notes: data.notes,
    createdAt: data.createdAt || now,
  };
}

// Re-export types for convenience
export type {
  Task,
  Session,
  TimerSettings,
  AppSettings,
  DailyStats,
  Statistics,
  BackupData,
  StorageEvent,
  StorageEventListener,
};

export { StorageType, LS_KEYS };
