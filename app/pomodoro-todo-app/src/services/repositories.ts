/**
 * Repository Pattern Implementation
 *
 * Data access layer that provides a clean abstraction over IndexedDB operations.
 * Each repository is responsible for a specific entity type.
 *
 * Benefits:
 * - Separation of concerns
 * - Easier testing (can mock repositories)
 * - Centralized query logic
 * - Type-safe database operations
 */

import type {
  Task,
  TaskStatus,
  TaskPriority,
  Session,
  SessionType,
  SessionStatus,
  DailyStats,
  TimerSettings,
  AppSettings,
  Project,
  ITaskRepository,
  ISessionRepository,
  ISettingsRepository,
  IStatisticsRepository,
  IProjectRepository,
} from '../types/index.js';

import {
  IndexedDB,
  indexedDBInstance,
  STORE_NAMES,
  TransactionMode,
  StorageError,
  createTodayRange,
  createWeekRange,
  createMonthRange,
  createDateRange,
  lowerBound,
  upperBound,
  bound,
} from './indexeddb.js';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get today's date string in YYYY-MM-DD format
 */
function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get date string for a timestamp
 */
function toDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

/**
 * Check if a date is today
 */
function isToday(timestamp: number): boolean {
  return toDateString(timestamp) === getTodayDateString();
}

/**
 * Check if a date is within the current week
 */
function isThisWeek(timestamp: number): boolean {
  const date = new Date(timestamp);
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);
  return date >= weekStart && date < weekEnd;
}

/**
 * Check if a date is within the current month
 */
function isThisMonth(timestamp: number): boolean {
  const date = new Date(timestamp);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

// ============================================================================
// Task Repository
// ============================================================================

/**
 * Repository for Task entity operations
 */
export class TaskRepository implements ITaskRepository {
  constructor(private db: IndexedDB = indexedDBInstance) {}

  /**
   * Save a single task (create or update)
   */
  async save(task: Task): Promise<void> {
    const taskToSave = {
      ...task,
      updatedAt: Date.now(),
      createdAt: task.createdAt || Date.now(),
    };

    await this.db.put(STORE_NAMES.TASKS, taskToSave, 'taskUpdated');
  }

  /**
   * Save multiple tasks in a single transaction
   */
  async saveMany(tasks: Task[]): Promise<void> {
    const tasksToSave = tasks.map((task) => ({
      ...task,
      updatedAt: Date.now(),
      createdAt: task.createdAt || Date.now(),
    }));

    await this.db.putMany(STORE_NAMES.TASKS, tasksToSave, 'taskUpdated');
  }

  /**
   * Find all tasks
   */
  async findAll(): Promise<Task[]> {
    return this.db.getAll<Task>(STORE_NAMES.TASKS);
  }

  /**
   * Find a task by ID
   */
  async findById(id: string): Promise<Task | null> {
    return this.db.get<Task>(STORE_NAMES.TASKS, id);
  }

  /**
   * Find tasks by status
   */
  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return this.db.getAllByIndex<Task>(STORE_NAMES.TASKS, 'status', status);
  }

  /**
   * Find tasks by priority
   */
  async findByPriority(priority: TaskPriority): Promise<Task[]> {
    return this.db.getAllByIndex<Task>(STORE_NAMES.TASKS, 'priority', priority);
  }

  /**
   * Find tasks due today
   */
  async findDueToday(): Promise<Task[]> {
    const allTasks = await this.findAll();
    return allTasks.filter((task) => {
      if (!task.dueDate) return false;
      return isToday(task.dueDate);
    });
  }

  /**
   * Find tasks due before a specific date
   */
  async findDueBefore(date: number): Promise<Task[]> {
    const allTasks = await this.findAll();
    return allTasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate < date;
    });
  }

  /**
   * Find tasks by tag
   */
  async findByTag(tag: string): Promise<Task[]> {
    const allTasks = await this.findAll();
    return allTasks.filter((task) =>
      task.tags?.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  }

  /**
   * Find tasks by project
   */
  async findByProject(projectId: string): Promise<Task[]> {
    return this.db.getAllByIndex<Task>(STORE_NAMES.TASKS, 'projectId', projectId);
  }

  /**
   * Find subtasks by parent ID
   */
  async findSubtasks(parentId: string): Promise<Task[]> {
    return this.db.getAllByIndex<Task>(STORE_NAMES.TASKS, 'parentId', parentId);
  }

  /**
   * Delete a task by ID
   */
  async delete(id: string): Promise<void> {
    // First, delete all associated sessions
    const sessions = await this.db.getAllByIndex<Session>(
      STORE_NAMES.SESSIONS,
      'taskId',
      id
    );
    for (const session of sessions) {
      await this.db.delete(STORE_NAMES.SESSIONS, session.id);
    }

    // Delete subtasks
    const subtasks = await this.findSubtasks(id);
    for (const subtask of subtasks) {
      await this.db.delete(STORE_NAMES.TASKS, subtask.id);
    }

    // Delete the task
    await this.db.delete(STORE_NAMES.TASKS, id, 'taskDeleted');
  }

  /**
   * Delete multiple tasks by IDs
   */
  async deleteMany(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.delete(id);
    }
  }

  /**
   * Update the status of a task
   */
  async updateStatus(id: string, status: TaskStatus): Promise<void> {
    const task = await this.findById(id);
    if (!task) {
      throw new StorageError(`Task not found: ${id}`, 'TASK_NOT_FOUND');
    }

    const updatedTask: Task = {
      ...task,
      status,
      updatedAt: Date.now(),
      completedAt: status === TaskStatus.COMPLETED ? Date.now() : task.completedAt,
    };

    await this.save(updatedTask);
  }

  /**
   * Update the status of multiple tasks
   */
  async updateStatusMany(ids: string[], status: TaskStatus): Promise<void> {
    for (const id of ids) {
      await this.updateStatus(id, status);
    }
  }

  /**
   * Check if a task exists
   */
  async exists(id: string): Promise<boolean> {
    return (await this.findById(id)) !== null;
  }

  /**
   * Count all tasks
   */
  async count(): Promise<number> {
    return this.db.count(STORE_NAMES.TASKS);
  }

  /**
   * Count tasks by status
   */
  async countByStatus(status: TaskStatus): Promise<number> {
    return this.db.countByIndex(STORE_NAMES.TASKS, 'status', status);
  }

  /**
   * Get the next order value for new tasks
   */
  async getNextOrder(): Promise<number> {
    const tasks = await this.findAll();
    if (tasks.length === 0) return 0;
    return Math.max(...tasks.map((t) => t.order ?? 0)) + 1;
  }

  /**
   * Reorder tasks based on the provided ID sequence
   */
  async reorder(taskIds: string[]): Promise<void> {
    const tasks = await this.findAll();
    const taskMap = new Map(tasks.map((t) => [t.id, t]));

    const updatedTasks = taskIds
      .map((id, index) => {
        const task = taskMap.get(id);
        if (task) {
          return { ...task, order: index, updatedAt: Date.now() };
        }
        return null;
      })
      .filter((t): t is Task => t !== null);

    await this.saveMany(updatedTasks);
  }

  /**
   * Search tasks by title or description
   */
  async search(query: string): Promise<Task[]> {
    const allTasks = await this.findAll();
    const lowerQuery = query.toLowerCase();

    return allTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get active task (task with status IN_PROGRESS)
   */
  async getActiveTask(): Promise<Task | null> {
    const tasks = await this.findByStatus(TaskStatus.IN_PROGRESS);
    return tasks[0] || null;
  }
}

// ============================================================================
// Session Repository
// ============================================================================

/**
 * Repository for Session entity operations
 */
export class SessionRepository implements ISessionRepository {
  constructor(private db: IndexedDB = indexedDBInstance) {}

  /**
   * Save a single session (create or update)
   */
  async save(session: Session): Promise<void> {
    const sessionToSave = {
      ...session,
      createdAt: session.createdAt || Date.now(),
    };

    await this.db.put(STORE_NAMES.SESSIONS, sessionToSave, 'sessionUpdated');
  }

  /**
   * Save multiple sessions in a single transaction
   */
  async saveMany(sessions: Session[]): Promise<void> {
    const sessionsToSave = sessions.map((session) => ({
      ...session,
      createdAt: session.createdAt || Date.now(),
    }));

    await this.db.putMany(STORE_NAMES.SESSIONS, sessionsToSave, 'sessionUpdated');
  }

  /**
   * Find a session by ID
   */
  async findById(id: string): Promise<Session | null> {
    return this.db.get<Session>(STORE_NAMES.SESSIONS, id);
  }

  /**
   * Find all sessions for a specific task
   */
  async findByTaskId(taskId: string): Promise<Session[]> {
    return this.db.getAllByIndex<Session>(STORE_NAMES.SESSIONS, 'taskId', taskId);
  }

  /**
   * Find sessions by status
   */
  async findByStatus(status: SessionStatus): Promise<Session[]> {
    return this.db.getAllByIndex<Session>(STORE_NAMES.SESSIONS, 'status', status);
  }

  /**
   * Find all sessions from today
   */
  async findTodaySessions(): Promise<Session[]> {
    const allSessions = await this.findAll();
    return allSessions.filter((session) =>
      session.startedAt ? isToday(session.startedAt) : false
    );
  }

  /**
   * Find all sessions from this week
   */
  async findWeekSessions(): Promise<Session[]> {
    const allSessions = await this.findAll();
    return allSessions.filter((session) =>
      session.startedAt ? isThisWeek(session.startedAt) : false
    );
  }

  /**
   * Find all sessions from this month
   */
  async findMonthSessions(): Promise<Session[]> {
    const allSessions = await this.findAll();
    return allSessions.filter((session) =>
      session.startedAt ? isThisMonth(session.startedAt) : false
    );
  }

  /**
   * Find sessions within a date range
   */
  async findSessionsByDateRange(startDate: number, endDate: number): Promise<Session[]> {
    const range = createDateRange(new Date(startDate), new Date(endDate));
    const allSessions = await this.findAll();

    return allSessions.filter((session) => {
      if (!session.startedAt) return false;
      return session.startedAt >= startDate && session.startedAt <= endDate;
    });
  }

  /**
   * Find all completed sessions
   */
  async findCompletedSessions(): Promise<Session[]> {
    const allSessions = await this.findAll();
    return allSessions.filter((s) => s.wasCompleted);
  }

  /**
   * Find the latest N sessions
   */
  async findLatestSessions(limit: number): Promise<Session[]> {
    const allSessions = await this.findAll();
    return allSessions
      .sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0))
      .slice(0, limit);
  }

  /**
   * Find all sessions
   */
  async findAll(): Promise<Session[]> {
    return this.db.getAll<Session>(STORE_NAMES.SESSIONS);
  }

  /**
   * Delete a session by ID
   */
  async delete(id: string): Promise<void> {
    await this.db.delete(STORE_NAMES.SESSIONS, id, 'sessionDeleted');
  }

  /**
   * Delete all sessions for a specific task
   */
  async deleteByTaskId(taskId: string): Promise<void> {
    const sessions = await this.findByTaskId(taskId);
    for (const session of sessions) {
      await this.delete(session.id);
    }
  }

  /**
   * Delete sessions older than a specific date
   */
  async deleteOldSessions(beforeDate: number): Promise<void> {
    const allSessions = await this.findAll();
    const toDelete = allSessions.filter(
      (s) => (s.completedAt || s.createdAt) < beforeDate
    );

    for (const session of toDelete) {
      await this.delete(session.id);
    }
  }

  /**
   * Count all sessions
   */
  async count(): Promise<number> {
    return this.db.count(STORE_NAMES.SESSIONS);
  }

  /**
   * Count sessions by type
   */
  async countByType(type: SessionType): Promise<number> {
    return this.db.countByIndex(STORE_NAMES.SESSIONS, 'type', type);
  }

  /**
   * Count completed sessions from today
   */
  async countTodayCompleted(): Promise<number> {
    const todaySessions = await this.findTodaySessions();
    return todaySessions.filter((s) => s.wasCompleted).length;
  }

  /**
   * Get the active session (if any)
   */
  async getActiveSession(): Promise<Session | null> {
    const activeSessions = await this.findByStatus(SessionStatus.ACTIVE);
    return activeSessions[0] || null;
  }

  /**
   * Create a new session
   */
  async create(
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

    await this.save(session);
    return session;
  }

  /**
   * Complete a session
   */
  async complete(sessionId: string, actualDuration: number): Promise<void> {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new StorageError(`Session not found: ${sessionId}`, 'SESSION_NOT_FOUND');
    }

    const updated: Session = {
      ...session,
      actualDuration,
      completedAt: Date.now(),
      wasCompleted: true,
    };

    await this.save(updated);

    // Update task's completed pomodoro count
    if (updated.taskId) {
      const taskRepo = new TaskRepository(this.db);
      const task = await taskRepo.findById(updated.taskId);
      if (task && updated.type === SessionType.WORK) {
        await taskRepo.save({
          ...task,
          completedPomodoros: task.completedPomodoros + 1,
          updatedAt: Date.now(),
        });
      }
    }
  }

  /**
   * Skip a session
   */
  async skip(sessionId: string): Promise<void> {
    const session = await this.findById(sessionId);
    if (!session) {
      throw new StorageError(`Session not found: ${sessionId}`, 'SESSION_NOT_FOUND');
    }

    const updated: Session = {
      ...session,
      completedAt: Date.now(),
      wasSkipped: true,
    };

    await this.save(updated);
  }

  /**
   * Get session statistics for a date range
   */
  async getStatsForRange(startDate: number, endDate: number): Promise<{
    totalSessions: number;
    completedSessions: number;
    skippedSessions: number;
    totalDuration: number;
    workSessions: number;
    breakSessions: number;
  }> {
    const sessions = await this.findSessionsByDateRange(startDate, endDate);

    return {
      totalSessions: sessions.length,
      completedSessions: sessions.filter((s) => s.wasCompleted).length,
      skippedSessions: sessions.filter((s) => s.wasSkipped).length,
      totalDuration: sessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0),
      workSessions: sessions.filter((s) => s.type === SessionType.WORK).length,
      breakSessions: sessions.filter(
        (s) => s.type === SessionType.SHORT_BREAK || s.type === SessionType.LONG_BREAK
      ).length,
    };
  }
}

// ============================================================================
// Settings Repository
// ============================================================================

/**
 * Default settings values
 */
const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  workDuration: 25 * 60, // 25 minutes
  shortBreakDuration: 5 * 60, // 5 minutes
  longBreakDuration: 15 * 60, // 15 minutes
  longBreakInterval: 4,
  autoStartBreak: false,
  autoStartWork: false,
  notificationEnabled: true,
  soundEnabled: true,
  tickSoundEnabled: false,
  volume: 0.7,
};

const DEFAULT_APP_SETTINGS: Omit<AppSettings, 'timer'> = {
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

/**
 * Repository for Settings operations
 */
export class SettingsRepository implements ISettingsRepository {
  private static readonly SETTINGS_KEY = 'app-settings';

  constructor(private db: IndexedDB = indexedDBInstance) {}

  /**
   * Save settings
   */
  async save(settings: AppSettings): Promise<void> {
    const toSave = {
      ...settings,
      id: SettingsRepository.SETTINGS_KEY,
      updatedAt: Date.now(),
    };

    await this.db.put(STORE_NAMES.SETTINGS, toSave, 'settingsUpdated');
  }

  /**
   * Get current settings
   */
  async get(): Promise<AppSettings | null> {
    const settings = await this.db.get<AppSettings>(
      STORE_NAMES.SETTINGS,
      SettingsRepository.SETTINGS_KEY
    );

    if (!settings) {
      return null;
    }

    return settings;
  }

  /**
   * Update timer settings
   */
  async updateTimerSettings(partial: Partial<TimerSettings>): Promise<void> {
    const current = await this.get();
    const settings = current || this.resetToDefaults();

    const updated: AppSettings = {
      ...settings,
      timer: {
        ...settings.timer,
        ...partial,
      },
      updatedAt: Date.now(),
    };

    await this.save(updated);
  }

  /**
   * Update app settings (excluding timer)
   */
  async updateAppSettings(partial: Partial<Omit<AppSettings, 'timer'>>): Promise<void> {
    const current = await this.get();
    const settings = current || this.resetToDefaults();

    const updated: AppSettings = {
      ...settings,
      ...partial,
      updatedAt: Date.now(),
    };

    await this.save(updated);
  }

  /**
   * Reset settings to defaults
   */
  resetToDefaults(): AppSettings {
    return {
      ...DEFAULT_APP_SETTINGS,
      timer: { ...DEFAULT_TIMER_SETTINGS },
    };
  }

  /**
   * Get or create default settings
   */
  async getOrCreate(): Promise<AppSettings> {
    const settings = await this.get();
    if (settings) {
      return settings;
    }

    const defaults = this.resetToDefaults();
    await this.save(defaults);
    return defaults;
  }
}

// ============================================================================
// Statistics Repository
// ============================================================================

/**
 * Repository for Daily Statistics operations
 */
export class StatisticsRepository {
  constructor(private db: IndexedDB = indexedDBInstance) {}

  /**
   * Get daily stats for a specific date
   */
  async getDailyStats(date: string): Promise<DailyStats | null> {
    return this.db.get<DailyStats>(STORE_NAMES.STATISTICS, date);
  }

  /**
   * Save daily stats
   */
  async saveDailyStats(stats: DailyStats): Promise<void> {
    await this.db.put(STORE_NAMES.STATISTICS, stats);
  }

  /**
   * Get stats for a week range
   */
  async getWeekStats(startDate: string, endDate: string): Promise<DailyStats[]> {
    const allStats = await this.getAllStats();
    return allStats.filter((s) => s.date >= startDate && s.date <= endDate);
  }

  /**
   * Get stats for a specific month
   */
  async getMonthStats(year: number, month: number): Promise<DailyStats[]> {
    const allStats = await this.getAllStats();
    return allStats.filter((s) => {
      const date = new Date(s.date);
      return date.getFullYear() === year && date.getMonth() === month;
    });
  }

  /**
   * Get all stats
   */
  async getAllStats(): Promise<DailyStats[]> {
    return this.db.getAll<DailyStats>(STORE_NAMES.STATISTICS);
  }

  /**
   * Calculate today's statistics from sessions and tasks
   */
  async calculateTodayStats(): Promise<DailyStats> {
    const today = getTodayDateString();
    const existing = await this.getDailyStats(today);

    const sessionRepo = new SessionRepository(this.db);
    const taskRepo = new TaskRepository(this.db);

    const todaySessions = await sessionRepo.findTodaySessions();
    const allTasks = await taskRepo.findAll();

    const workSessions = todaySessions.filter((s) => s.type === SessionType.WORK);
    const breakSessions = todaySessions.filter(
      (s) => s.type === SessionType.SHORT_BREAK || s.type === SessionType.LONG_BREAK
    );

    const completedTasks = allTasks.filter(
      (t) => t.completedAt && isToday(t.completedAt)
    );

    // Calculate longest streak (consecutive work sessions)
    let longestStreak = 0;
    let currentStreak = 0;
    for (const session of todaySessions) {
      if (session.type === SessionType.WORK && session.wasCompleted) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else if (session.type === SessionType.SHORT_BREAK || session.type === SessionType.LONG_BREAK) {
        // Break doesn't reset streak
      } else {
        currentStreak = 0;
      }
    }

    const stats: DailyStats = {
      date: today,
      workSessions: workSessions.length,
      totalWorkTime: workSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0),
      totalBreakTime: breakSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0),
      completedTasks: completedTasks.length,
      tasksCreated: allTasks.filter((t) => isToday(t.createdAt)).length,
      longestStreak: longestStreak || existing?.longestStreak || 0,
    };

    await this.saveDailyStats(stats);
    return stats;
  }

  /**
   * Calculate week statistics
   */
  async calculateWeekStats(): Promise<DailyStats[]> {
    const sessionRepo = new SessionRepository(this.db);
    const weekSessions = await sessionRepo.findWeekSessions();

    // Group sessions by date
    const sessionsByDate = new Map<string, typeof weekSessions>();
    for (const session of weekSessions) {
      const date = toDateString(session.startedAt || session.createdAt);
      if (!sessionsByDate.has(date)) {
        sessionsByDate.set(date, []);
      }
      sessionsByDate.get(date)!.push(session);
    }

    // Calculate stats for each day
    const stats: DailyStats[] = [];
    for (const [date, sessions] of sessionsByDate.entries()) {
      const workSessions = sessions.filter((s) => s.type === SessionType.WORK);
      const breakSessions = sessions.filter(
        (s) => s.type === SessionType.SHORT_BREAK || s.type === SessionType.LONG_BREAK
      );

      stats.push({
        date,
        workSessions: workSessions.length,
        totalWorkTime: workSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0),
        totalBreakTime: breakSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0),
        completedTasks: 0, // Would need to calculate from tasks
        tasksCreated: 0,
        longestStreak: 0,
      });
    }

    return stats.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calculate month statistics
   */
  async calculateMonthStats(): Promise<DailyStats[]> {
    const sessionRepo = new SessionRepository(this.db);
    const monthSessions = await sessionRepo.findMonthSessions();

    // Group sessions by date
    const sessionsByDate = new Map<string, typeof monthSessions>();
    for (const session of monthSessions) {
      const date = toDateString(session.startedAt || session.createdAt);
      if (!sessionsByDate.has(date)) {
        sessionsByDate.set(date, []);
      }
      sessionsByDate.get(date)!.push(session);
    }

    // Calculate stats for each day
    const stats: DailyStats[] = [];
    for (const [date, sessions] of sessionsByDate.entries()) {
      const workSessions = sessions.filter((s) => s.type === SessionType.WORK);
      const breakSessions = sessions.filter(
        (s) => s.type === SessionType.SHORT_BREAK || s.type === SessionType.LONG_BREAK
      );

      stats.push({
        date,
        workSessions: workSessions.length,
        totalWorkTime: workSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0),
        totalBreakTime: breakSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0),
        completedTasks: 0,
        tasksCreated: 0,
        longestStreak: 0,
      });
    }

    return stats.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Update stats for a specific date (increment counters)
   */
  async incrementWorkSessions(date: string, duration: number): Promise<void> {
    const stats = await this.getDailyStats(date);
    if (stats) {
      await this.saveDailyStats({
        ...stats,
        workSessions: stats.workSessions + 1,
        totalWorkTime: stats.totalWorkTime + duration,
      });
    } else {
      await this.saveDailyStats({
        date,
        workSessions: 1,
        totalWorkTime: duration,
        totalBreakTime: 0,
        completedTasks: 0,
        tasksCreated: 0,
        longestStreak: 1,
      });
    }
  }

  /**
   * Increment completed tasks count for a date
   */
  async incrementCompletedTasks(date: string): Promise<void> {
    const stats = await this.getDailyStats(date);
    if (stats) {
      await this.saveDailyStats({
        ...stats,
        completedTasks: stats.completedTasks + 1,
      });
    }
  }
}

// ============================================================================
// Project Repository
// ============================================================================

/**
 * Repository for Project entity operations
 */
export class ProjectRepository implements IProjectRepository {
  constructor(private db: IndexedDB = indexedDBInstance) {}

  /**
   * Save a project
   */
  async save(project: Project): Promise<void> {
    const toSave = {
      ...project,
      createdAt: project.createdAt || Date.now(),
    };

    await this.db.put(STORE_NAMES.PROJECTS, toSave);
  }

  /**
   * Save multiple projects
   */
  async saveMany(projects: Project[]): Promise<void> {
    const toSave = projects.map((p) => ({
      ...p,
      createdAt: p.createdAt || Date.now(),
    }));

    await this.db.putMany(STORE_NAMES.PROJECTS, toSave);
  }

  /**
   * Find all projects
   */
  async findAll(): Promise<Project[]> {
    return this.db.getAll<Project>(STORE_NAMES.PROJECTS);
  }

  /**
   * Find a project by ID
   */
  async findById(id: string): Promise<Project | null> {
    return this.db.get<Project>(STORE_NAMES.PROJECTS, id);
  }

  /**
   * Delete a project
   */
  async delete(id: string): Promise<void> {
    await this.db.delete(STORE_NAMES.PROJECTS, id);
  }

  /**
   * Delete all projects
   */
  async deleteAll(): Promise<void> {
    await this.db.clear(STORE_NAMES.PROJECTS);
  }

  /**
   * Check if a project exists
   */
  async exists(id: string): Promise<boolean> {
    return (await this.findById(id)) !== null;
  }

  /**
   * Count all projects
   */
  async count(): Promise<number> {
    return this.db.count(STORE_NAMES.PROJECTS);
  }

  /**
   * Find a project by name
   */
  async findByName(name: string): Promise<Project | null> {
    const allProjects = await this.findAll();
    return allProjects.find((p) => p.name === name) || null;
  }

  /**
   * Add a task ID to a project
   */
  async addTaskToProject(projectId: string, taskId: string): Promise<void> {
    const project = await this.findById(projectId);
    if (!project) {
      throw new StorageError(`Project not found: ${projectId}`, 'PROJECT_NOT_FOUND');
    }

    if (!project.taskIds.includes(taskId)) {
      await this.save({
        ...project,
        taskIds: [...project.taskIds, taskId],
      });
    }
  }

  /**
   * Remove a task ID from a project
   */
  async removeTaskFromProject(projectId: string, taskId: string): Promise<void> {
    const project = await this.findById(projectId);
    if (!project) {
      throw new StorageError(`Project not found: ${projectId}`, 'PROJECT_NOT_FOUND');
    }

    await this.save({
      ...project,
      taskIds: project.taskIds.filter((id) => id !== taskId),
    });
  }
}

// ============================================================================
// Export all repositories
// ============================================================================

export {
  TaskRepository,
  SessionRepository,
  SettingsRepository,
  StatisticsRepository,
  ProjectRepository,
};

// Re-export utility functions
export { generateId, getTodayDateString, toDateString, isToday, isThisWeek, isThisMonth };
