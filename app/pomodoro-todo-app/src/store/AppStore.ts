/**
 * AppStore - Centralized State Management
 *
 * Implements a unidirectional data flow pattern with:
 * - Single source of truth (AppState)
 * - Read-only state exposure
 * - Explicit state mutation methods
 * - Subscriber notifications on state changes
 * - Immutable state updates
 */

import {
  AppState,
  StateListener,
  UnsubscribeFn,
  Task,
  TaskStatus,
  TaskPriority,
  TimerState,
  SessionType,
  TimerSettings,
  Session,
  DailyStats,
  Project,
  TaskFilter,
  Statistics,
  TimerEventType,
  TimerEvent
} from '../types/index';

/**
 * Default timer settings
 */
const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  workDuration: 25 * 60,           // 25 minutes
  shortBreakDuration: 5 * 60,      // 5 minutes
  longBreakDuration: 15 * 60,      // 15 minutes
  longBreakInterval: 4,            // 4 pomodoros before long break
  autoStartBreak: false,
  autoStartWork: false,
  notificationEnabled: true,
  soundEnabled: true,
  volume: 0.7
};

/**
 * Initial application state
 */
const createInitialState = (): AppState => ({
  tasks: [],
  activeTaskId: null,
  timerState: TimerState.IDLE,
  remainingTime: DEFAULT_TIMER_SETTINGS.workDuration,
  currentSessionType: null,
  completedSessionsSinceLastLongBreak: 0,
  settings: DEFAULT_TIMER_SETTINGS,
  sessions: [],
  dailyStats: new Map(),
  projects: [],
  isLoading: false,
  error: null
});

/**
 * Timer event observer interface
 */
export type TimerObserver = (event: TimerEvent) => void;

/**
 * AppStore - Central state management class
 *
 * Features:
 * - Immutable state updates
 * - Subscription-based notifications
 * - Event-driven timer management
 * - Task CRUD operations
 * - Session tracking
 */
export class AppStore {
  // Private state - only modified through store methods
  private state: AppState;

  // State change listeners
  private listeners: Set<StateListener> = new Set();

  // Timer-specific observers
  private timerObservers: Set<TimerObserver> = new Set();

  // State history for undo/redo (optional feature)
  private history: AppState[] = [];
  private historyIndex: number = -1;
  private maxHistorySize: number = 50;

  // Batch update flag
  private batchUpdateDepth: number = 0;
  private pendingNotification: boolean = false;

  constructor(initialState?: Partial<AppState>) {
    this.state = {
      ...createInitialState(),
      ...initialState,
      dailyStats: initialState?.dailyStats || new Map()
    };
  }

  // ==========================================================================
  // STATE ACCESS - Read-only getters
  // ==========================================================================

  /**
   * Get current state (readonly snapshot)
   */
  getState(): Readonly<AppState> {
    return Object.freeze({ ...this.state });
  }

  /**
   * Get all tasks
   */
  getTasks(): Task[] {
    return [...this.state.tasks];
  }

  /**
   * Get tasks filtered by criteria
   */
  getFilteredTasks(filter: TaskFilter): Task[] {
    let filtered = [...this.state.tasks];

    if (filter.status && filter.status !== 'all') {
      filtered = filtered.filter(t => t.status === filter.status);
    }

    if (filter.priority && filter.priority !== 'all') {
      filtered = filtered.filter(t => t.priority === filter.priority);
    }

    if (filter.projectId && filter.projectId !== 'all') {
      filtered = filtered.filter(t => t.projectId === filter.projectId);
    }

    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }

    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(t =>
        t.tags?.some(tag => filter.tags!.includes(tag))
      );
    }

    if (filter.hideCompleted) {
      filtered = filtered.filter(t => t.status !== TaskStatus.COMPLETED);
    }

    return filtered;
  }

  /**
   * Get active task
   */
  getActiveTask(): Task | null {
    if (!this.state.activeTaskId) return null;
    return this.state.tasks.find(t => t.id === this.state.activeTaskId) || null;
  }

  /**
   * Get task by ID
   */
  getTaskById(id: string): Task | null {
    return this.state.tasks.find(t => t.id === id) || null;
  }

  /**
   * Get timer state
   */
  getTimerState(): TimerState {
    return this.state.timerState;
  }

  /**
   * Get remaining time
   */
  getRemainingTime(): number {
    return this.state.remainingTime;
  }

  /**
   * Get current session type
   */
  getCurrentSessionType(): SessionType | null {
    return this.state.currentSessionType;
  }

  /**
   * Get timer settings
   */
  getSettings(): TimerSettings {
    return { ...this.state.settings };
  }

  /**
   * Get all sessions
   */
  getSessions(): Session[] {
    return [...this.state.sessions];
  }

  /**
   * Get sessions for a specific task
   */
  getSessionsByTask(taskId: string): Session[] {
    return this.state.sessions.filter(s => s.taskId === taskId);
  }

  /**
   * Get statistics summary
   */
  getStatistics(): Statistics {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = this.state.dailyStats.get(today);

    const weekStart = this.getWeekStart();
    const weekStats = this.getWeekStats(weekStart);

    const overallStats = this.getOverallStats();

    return {
      today: {
        workSessions: todayStats?.workSessions || 0,
        totalWorkTime: todayStats?.totalWorkTime || 0,
        completedTasks: this.state.tasks.filter(t =>
          t.status === TaskStatus.COMPLETED &&
          new Date(t.updatedAt).toDateString() === new Date().toDateString()
        ).length,
        focusPercentage: this.calculateFocusPercentage()
      },
      week: {
        workSessions: weekStats.workSessions,
        totalWorkTime: weekStats.totalWorkTime,
        completedTasks: weekStats.completedTasks,
        averageDailySessions: weekStats.averageDailySessions
      },
      overall: {
        totalWorkSessions: overallStats.totalWorkSessions,
        totalWorkTime: overallStats.totalWorkTime,
        totalCompletedTasks: overallStats.totalCompletedTasks,
        longestStreak: overallStats.longestStreak
      }
    };
  }

  /**
   * Get projects
   */
  getProjects(): Project[] {
    return [...this.state.projects];
  }

  /**
   * Check if loading
   */
  isLoading(): boolean {
    return this.state.isLoading;
  }

  /**
   * Get error message
   */
  getError(): string | null {
    return this.state.error;
  }

  // ==========================================================================
  // TASK OPERATIONS
  // ==========================================================================

  /**
   * Add a new task
   */
  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = Date.now();
    const newTask: Task = {
      ...task,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      completedPomodoros: task.completedPomodoros || 0
    };

    this.updateState draft => {
      draft.tasks.push(newTask);
    });

    return newTask.id;
  }

  /**
   * Update an existing task
   */
  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> {
    this.updateState draft => {
      const index = draft.tasks.findIndex(t => t.id === id);
      if (index === -1) {
        throw new Error(`Task with id ${id} not found`);
      }

      draft.tasks[index] = {
        ...draft.tasks[index],
        ...updates,
        updatedAt: Date.now()
      };
    });
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<void> {
    this.updateState draft => {
      const index = draft.tasks.findIndex(t => t.id === id);
      if (index === -1) {
        throw new Error(`Task with id ${id} not found`);
      }

      draft.tasks.splice(index, 1);

      // Clear active task if it was the deleted one
      if (draft.activeTaskId === id) {
        draft.activeTaskId = null;
      }
    });
  }

  /**
   * Set active task
   */
  async setActiveTask(id: string): Promise<void> {
    this.updateState draft => {
      const task = draft.tasks.find(t => t.id === id);
      if (!task) {
        throw new Error(`Task with id ${id} not found`);
      }

      // Update previous active task status
      if (draft.activeTaskId) {
        const prevTask = draft.tasks.find(t => t.id === draft.activeTaskId);
        if (prevTask && prevTask.status === TaskStatus.IN_PROGRESS) {
          prevTask.status = TaskStatus.TODO;
        }
      }

      // Set new active task
      draft.activeTaskId = id;
      task.status = TaskStatus.IN_PROGRESS;
      task.updatedAt = Date.now();
    });
  }

  /**
   * Clear active task
   */
  async clearActiveTask(): Promise<void> {
    this.updateState draft => {
      if (draft.activeTaskId) {
        const task = draft.tasks.find(t => t.id === draft.activeTaskId);
        if (task && task.status === TaskStatus.IN_PROGRESS) {
          task.status = TaskStatus.TODO;
          task.updatedAt = Date.now();
        }
        draft.activeTaskId = null;
      }
    });
  }

  /**
   * Complete a task
   */
  async completeTask(id: string): Promise<void> {
    this.updateState draft => {
      const task = draft.tasks.find(t => t.id === id);
      if (!task) {
        throw new Error(`Task with id ${id} not found`);
      }

      task.status = TaskStatus.COMPLETED;
      task.updatedAt = Date.now();

      // Update daily stats
      const today = new Date().toISOString().split('T')[0];
      const stats = draft.dailyStats.get(today) || this.createEmptyDailyStats(today);
      stats.completedTasks++;
      draft.dailyStats.set(today, stats);
    });
  }

  /**
   * Increment task pomodoro count
   */
  async incrementTaskPomodoros(id: string): Promise<void> {
    this.updateState draft => {
      const task = draft.tasks.find(t => t.id === id);
      if (!task) {
        throw new Error(`Task with id ${id} not found`);
      }

      task.completedPomodoros++;
      task.updatedAt = Date.now();
    });
  }

  // ==========================================================================
  // TIMER OPERATIONS
  // ==========================================================================

  /**
   * Start timer
   */
  async startTimer(sessionType: SessionType = SessionType.WORK): Promise<void> {
    const duration = this.getDurationForSessionType(sessionType);

    this.updateState draft => {
      draft.timerState = sessionType === SessionType.WORK
        ? TimerState.WORKING
        : (sessionType === SessionType.SHORT_BREAK
          ? TimerState.SHORT_BREAK
          : TimerState.LONG_BREAK);
      draft.currentSessionType = sessionType;
      draft.remainingTime = duration;
    });

    this.notifyTimerObservers({
      type: TimerEventType.STARTED,
      state: this.state.timerState,
      remainingTime: this.state.remainingTime,
      timestamp: Date.now(),
      taskId: this.state.activeTaskId,
      sessionType
    });
  }

  /**
   * Pause timer
   */
  async pauseTimer(): Promise<void> {
    if (this.state.timerState === TimerState.IDLE || this.state.timerState === TimerState.PAUSED) {
      return;
    }

    this.updateState draft => {
      draft.timerState = TimerState.PAUSED;
    });

    this.notifyTimerObservers({
      type: TimerEventType.PAUSED,
      state: this.state.timerState,
      remainingTime: this.state.remainingTime,
      timestamp: Date.now(),
      taskId: this.state.activeTaskId,
      sessionType: this.state.currentSessionType!
    });
  }

  /**
   * Resume timer
   */
  async resumeTimer(): Promise<void> {
    if (this.state.timerState !== TimerState.PAUSED) {
      return;
    }

    const previousState = this.state.currentSessionType === SessionType.WORK
      ? TimerState.WORKING
      : (this.state.currentSessionType === SessionType.SHORT_BREAK
        ? TimerState.SHORT_BREAK
        : TimerState.LONG_BREAK);

    this.updateState draft => {
      draft.timerState = previousState;
    });

    this.notifyTimerObservers({
      type: TimerEventType.RESUMED,
      state: this.state.timerState,
      remainingTime: this.state.remainingTime,
      timestamp: Date.now(),
      taskId: this.state.activeTaskId,
      sessionType: this.state.currentSessionType!
    });
  }

  /**
   * Reset timer
   */
  async resetTimer(): Promise<void> {
    const sessionType = this.state.currentSessionType || SessionType.WORK;
    const duration = this.getDurationForSessionType(sessionType);

    this.updateState draft => {
      draft.timerState = TimerState.IDLE;
      draft.remainingTime = duration;
      draft.currentSessionType = null;
    });

    this.notifyTimerObservers({
      type: TimerEventType.RESET,
      state: this.state.timerState,
      remainingTime: this.state.remainingTime,
      timestamp: Date.now()
    });
  }

  /**
   * Update timer remaining time (called by timer interval)
   */
  async tickTimer(): Promise<void> {
    if (this.state.timerState === TimerState.IDLE || this.state.timerState === TimerState.PAUSED) {
      return;
    }

    const newRemainingTime = this.state.remainingTime - 1;

    this.updateState draft => {
      draft.remainingTime = newRemainingTime;
    });

    // Check if timer completed
    if (newRemainingTime <= 0) {
      await this.onTimerCompleted();
    }
  }

  /**
   * Handle timer completion
   */
  private async onTimerCompleted(): Promise<void> {
    const sessionType = this.state.currentSessionType!;
    const wasWorkSession = sessionType === SessionType.WORK;

    // Create session record
    const session: Session = {
      id: this.generateId(),
      taskId: this.state.activeTaskId,
      type: sessionType,
      duration: this.getDurationForSessionType(sessionType),
      actualDuration: this.getDurationForSessionType(sessionType) - this.state.remainingTime,
      startedAt: Date.now() - this.getDurationForSessionType(sessionType) * 1000,
      completedAt: Date.now(),
      wasCompleted: true,
      wasSkipped: false
    };

    this.updateState draft => {
      // Save session
      draft.sessions.push(session);

      // Update daily stats
      const today = new Date().toISOString().split('T')[0];
      const stats = draft.dailyStats.get(today) || this.createEmptyDailyStats(today);

      if (wasWorkSession) {
        stats.workSessions++;
        stats.totalWorkTime += this.state.settings.workDuration;
        draft.completedSessionsSinceLastLongBreak++;

        // Update active task pomodoro count
        if (draft.activeTaskId) {
          const task = draft.tasks.find(t => t.id === draft.activeTaskId);
          if (task) {
            task.completedPomodoros++;
          }
        }
      } else {
        stats.totalBreakTime += sessionType === SessionType.SHORT_BREAK
          ? this.state.settings.shortBreakDuration
          : this.state.settings.longBreakDuration;
      }

      draft.dailyStats.set(today, stats);

      // Update streak
      stats.longestStreak = Math.max(stats.longestStreak, draft.completedSessionsSinceLastLongBreak);

      // Reset timer to idle
      draft.timerState = TimerState.IDLE;
      draft.currentSessionType = null;
      draft.remainingTime = draft.settings.workDuration;
    });

    this.notifyTimerObservers({
      type: TimerEventType.COMPLETED,
      state: this.state.timerState,
      remainingTime: 0,
      timestamp: Date.now(),
      taskId: this.state.activeTaskId,
      sessionType
    });
  }

  /**
   * Skip current session
   */
  async skipSession(): Promise<void> {
    const sessionType = this.state.currentSessionType!;

    this.updateState draft => {
      // Create skipped session record
      const session: Session = {
        id: this.generateId(),
        taskId: draft.activeTaskId,
        type: sessionType,
        duration: this.getDurationForSessionType(sessionType),
        actualDuration: this.getDurationForSessionType(sessionType) - draft.remainingTime,
        startedAt: Date.now() - (this.getDurationForSessionType(sessionType) - draft.remainingTime) * 1000,
        completedAt: Date.now(),
        wasCompleted: false,
        wasSkipped: true
      };

      draft.sessions.push(session);

      // Reset timer
      draft.timerState = TimerState.IDLE;
      draft.currentSessionType = null;
      draft.remainingTime = draft.settings.workDuration;
    });

    this.notifyTimerObservers({
      type: TimerEventType.SKIPPED,
      state: this.state.timerState,
      remainingTime: this.state.remainingTime,
      timestamp: Date.now(),
      taskId: this.state.activeTaskId,
      sessionType
    });
  }

  // ==========================================================================
  // SETTINGS OPERATIONS
  // ==========================================================================

  /**
   * Update timer settings
   */
  async updateSettings(settings: Partial<TimerSettings>): Promise<void> {
    this.updateState draft => {
      draft.settings = {
        ...draft.settings,
        ...settings
      };
    });

    // Update remaining time if timer is idle
    if (this.state.timerState === TimerState.IDLE) {
      const duration = this.state.settings.workDuration;
      this.updateState draft => {
        draft.remainingTime = duration;
      });
    }
  }

  // ==========================================================================
  // PROJECT OPERATIONS
  // ==========================================================================

  /**
   * Add project
   */
  async addProject(project: Omit<Project, 'id' | 'createdAt'>): Promise<string> {
    const newProject: Project = {
      ...project,
      id: this.generateId(),
      createdAt: Date.now()
    };

    this.updateState draft => {
      draft.projects.push(newProject);
    });

    return newProject.id;
  }

  /**
   * Update project
   */
  async updateProject(id: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
    this.updateState draft => {
      const index = draft.projects.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error(`Project with id ${id} not found`);
      }

      draft.projects[index] = {
        ...draft.projects[index],
        ...updates
      };
    });
  }

  /**
   * Delete project
   */
  async deleteProject(id: string): Promise<void> {
    this.updateState draft => {
      const index = draft.projects.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error(`Project with id ${id} not found`);
      }

      draft.projects.splice(index, 1);

      // Remove project reference from tasks
      draft.tasks.forEach(task => {
        if (task.projectId === id) {
          task.projectId = undefined;
        }
      });
    });
  }

  // ==========================================================================
  // LOADING & ERROR STATES
  // ==========================================================================

  /**
   * Set loading state
   */
  setLoading(isLoading: boolean): void {
    this.updateState draft => {
      draft.isLoading = isLoading;
    });
  }

  /**
   * Set error message
   */
  setError(error: string | null): void {
    this.updateState draft => {
      draft.error = error;
    };
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.setError(null);
  }

  // ==========================================================================
  // STATE RESTORATION
  // ==========================================================================

  /**
   * Restore state from storage
   */
  restoreState(savedState: AppState): void {
    this.state = {
      ...savedState,
      dailyStats: new Map(Object.entries(savedState.dailyStats as any))
    };
    this.notifyListeners();
  }

  /**
   * Get serializable state for storage
   */
  getSerializableState(): any {
    return {
      ...this.state,
      dailyStats: Object.fromEntries(this.state.dailyStats)
    };
  }

  // ==========================================================================
  // SUBSCRIPTION MANAGEMENT
  // ==========================================================================

  /**
   * Subscribe to state changes
   * @returns Unsubscribe function
   */
  subscribe(listener: StateListener): UnsubscribeFn {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Subscribe to timer events
   * @returns Unsubscribe function
   */
  subscribeToTimer(observer: TimerObserver): UnsubscribeFn {
    this.timerObservers.add(observer);

    return () => {
      this.timerObservers.delete(observer);
    };
  }

  /**
   * Notify all state listeners
   */
  private notifyListeners(): void {
    const readonlyState = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(readonlyState);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  /**
   * Notify timer observers
   */
  private notifyTimerObservers(event: TimerEvent): void {
    this.timerObservers.forEach(observer => {
      try {
        observer(event);
      } catch (error) {
        console.error('Error in timer observer:', error);
      }
    });
  }

  // ==========================================================================
  // BATCH UPDATES
  // ==========================================================================

  /**
   * Start a batch update (prevents multiple notifications)
   */
  beginBatchUpdate(): void {
    this.batchUpdateDepth++;
  }

  /**
   * End a batch update and notify if needed
   */
  endBatchUpdate(): void {
    this.batchUpdateDepth--;
    if (this.batchUpdateDepth <= 0 && this.pendingNotification) {
      this.batchUpdateDepth = 0;
      this.pendingNotification = false;
      this.notifyListeners();
    }
  }

  /**
   * Execute a function within a batch update
   */
  async batch<T>(fn: () => T): Promise<T> {
    this.beginBatchUpdate();
    try {
      const result = await fn();
      return result;
    } finally {
      this.endBatchUpdate();
    }
  }

  // ==========================================================================
  // STATE HISTORY (Undo/Redo)
  // ==========================================================================

  /**
   * Undo last state change
   */
  undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = { ...this.history[this.historyIndex] };
      this.notifyListeners();
    }
  }

  /**
   * Redo last undone change
   */
  redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = { ...this.history[this.historyIndex] };
      this.notifyListeners();
    }
  }

  /**
   * Clear history
   */
  clearHistory(): void {
    this.history = [];
    this.historyIndex = -1;
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  /**
   * Core state update method with immutable pattern
   */
  private updateState(updater: (draft: AppState) => void): void {
    // Save to history if not in batch mode
    if (this.batchUpdateDepth === 0) {
      this.saveToHistory();
    }

    // Apply updates
    updater(this.state);

    // Notify listeners if not in batch mode
    if (this.batchUpdateDepth === 0) {
      this.notifyListeners();
    } else {
      this.pendingNotification = true;
    }
  }

  /**
   * Save current state to history
   */
  private saveToHistory(): void {
    // Remove any future states if we're not at the end
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Add current state to history
    this.history.push({ ...this.state });

    // Trim history if needed
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }
  }

  /**
   * Get duration for session type
   */
  private getDurationForSessionType(sessionType: SessionType): number {
    switch (sessionType) {
      case SessionType.WORK:
        return this.state.settings.workDuration;
      case SessionType.SHORT_BREAK:
        return this.state.settings.shortBreakDuration;
      case SessionType.LONG_BREAK:
        return this.state.settings.longBreakDuration;
    }
  }

  /**
   * Get week start date (Monday)
   */
  private getWeekStart(): Date {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  }

  /**
   * Get week statistics
   */
  private getWeekStats(weekStart: Date): {
    workSessions: number;
    totalWorkTime: number;
    completedTasks: number;
    averageDailySessions: number;
  } {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    let workSessions = 0;
    let totalWorkTime = 0;
    let completedTasks = 0;

    // Aggregate from daily stats
    for (const [dateStr, stats] of this.state.dailyStats) {
      const date = new Date(dateStr);
      if (date >= weekStart && date < weekEnd) {
        workSessions += stats.workSessions;
        totalWorkTime += stats.totalWorkTime;
      }
    }

    // Count completed tasks in this week
    for (const task of this.state.tasks) {
      if (task.status === TaskStatus.COMPLETED) {
        const completedDate = new Date(task.updatedAt);
        if (completedDate >= weekStart && completedDate < weekEnd) {
          completedTasks++;
        }
      }
    }

    const daysInWeek = 7;
    const averageDailySessions = workSessions / daysInWeek;

    return { workSessions, totalWorkTime, completedTasks, averageDailySessions };
  }

  /**
   * Get overall statistics
   */
  private getOverallStats(): {
    totalWorkSessions: number;
    totalWorkTime: number;
    totalCompletedTasks: number;
    longestStreak: number;
  } {
    let totalWorkSessions = 0;
    let totalWorkTime = 0;
    let longestStreak = 0;

    for (const stats of this.state.dailyStats.values()) {
      totalWorkSessions += stats.workSessions;
      totalWorkTime += stats.totalWorkTime;
      longestStreak = Math.max(longestStreak, stats.longestStreak);
    }

    const totalCompletedTasks = this.state.tasks.filter(
      t => t.status === TaskStatus.COMPLETED
    ).length;

    return { totalWorkSessions, totalWorkTime, totalCompletedTasks, longestStreak };
  }

  /**
   * Calculate focus percentage (completed vs estimated pomodoros)
   */
  private calculateFocusPercentage(): number {
    const today = new Date().toDateString();
    const todaysTasks = this.state.tasks.filter(
      t => new Date(t.updatedAt).toDateString() === today
    );

    let totalEstimated = 0;
    let totalCompleted = 0;

    for (const task of todaysTasks) {
      totalEstimated += task.estimatedPomodoros || 1;
      totalCompleted += task.completedPomodoros;
    }

    return totalEstimated > 0
      ? Math.round((totalCompleted / totalEstimated) * 100)
      : 0;
  }

  /**
   * Create empty daily stats
   */
  private createEmptyDailyStats(date: string): DailyStats {
    return {
      date,
      workSessions: 0,
      totalWorkTime: 0,
      totalBreakTime: 0,
      completedTasks: 0,
      longestStreak: 0
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}

/**
 * Create a singleton store instance
 */
export let store: AppStore;

/**
 * Initialize the store
 */
export function initStore(initialState?: Partial<AppState>): AppStore {
  if (!store) {
    store = new AppStore(initialState);
  }
  return store;
}

/**
 * Get the store instance (throws if not initialized)
 */
export function getStore(): AppStore {
  if (!store) {
    throw new Error('Store not initialized. Call initStore() first.');
  }
  return store;
}
