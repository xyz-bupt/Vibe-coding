/**
 * Pomodoro Timer - Core State Machine
 * High-precision timer with pause/resume support and automatic state transitions
 */

import {
  TimerState,
  TimerEvent,
  TimerEventType,
  TimerObserver,
  SessionType,
  Task,
  TimerSettings,
} from '../types/index';

/**
 * Timer configuration options
 */
interface TimerOptions {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  onTick?: (remaining: number, total: number) => void;
  onStateChange?: (event: TimerEvent) => void;
  onComplete?: () => void;
}

/**
 * Timer session data
 */
interface TimerSession {
  type: SessionType;
  totalDuration: number;
  remainingTime: number;
  startTime: number | null;
  pausedAt: number | null;
  accumulatedPause: number;
}

/**
 * PomodoroTimer class implementing a high-precision timer state machine
 * Uses Date.now() delta for accurate timing regardless of main thread blocking
 */
export class PomodoroTimer {
  private state: TimerState;
  private session: TimerSession | null;
  private settings: TimerSettings;
  private currentTask: Task | null;
  private intervalId: number | null;
  private observers: Set<TimerObserver>;
  private completedWorkSessions: number;
  private lastTickTime: number;
  private tickInterval: number;

  // Default settings
  private static readonly DEFAULT_SETTINGS: TimerSettings = {
    workDuration: 1500, // 25 minutes
    shortBreakDuration: 300, // 5 minutes
    longBreakDuration: 900, // 15 minutes
    longBreakInterval: 4, // Every 4 work sessions
    autoStartBreak: false,
    autoStartWork: false,
    notificationEnabled: true,
    soundEnabled: true,
    volume: 0.7,
  };

  constructor(settings?: Partial<TimerSettings>) {
    this.state = TimerState.IDLE;
    this.session = null;
    this.settings = { ...PomodoroTimer.DEFAULT_SETTINGS, ...settings };
    this.currentTask = null;
    this.intervalId = null;
    this.observers = new Set();
    this.completedWorkSessions = 0;
    this.lastTickTime = 0;
    this.tickInterval = 100; // Update every 100ms
  }

  /**
   * Start a timer session
   * @param type - Session type (work, short_break, long_break)
   * @param task - Optional task to associate with this session
   * @param duration - Optional custom duration in seconds
   */
  public async start(
    type: 'work' | 'short_break' | 'long_break',
    task?: Task | null,
    duration?: number
  ): Promise<void> {
    // Validate state transitions
    if (
      this.state === TimerState.WORKING ||
      this.state === TimerState.SHORT_BREAK ||
      this.state === TimerState.LONG_BREAK
    ) {
      throw new Error('Cannot start timer: already running');
    }

    // Set current task
    this.currentTask = task || null;

    // Determine session type and duration
    const sessionType = this.mapToSessionType(type);
    const totalDuration = duration ?? this.getDurationForType(type);

    // Initialize session
    this.session = {
      type: sessionType,
      totalDuration,
      remainingTime: totalDuration,
      startTime: Date.now(),
      pausedAt: null,
      accumulatedPause: 0,
    };

    // Update state
    this.setState(this.mapToTimerState(type));

    // Emit started event
    this.emitEvent({
      type: TimerEventType.STARTED,
      state: this.state,
      remainingTime: this.session.remainingTime,
      timestamp: Date.now(),
      taskId: this.currentTask?.id,
      sessionType: this.session.type,
    });

    // Start the timer loop
    this.startTimerLoop();
  }

  /**
   * Pause the current timer session
   */
  public pause(): void {
    if (
      this.state !== TimerState.WORKING &&
      this.state !== TimerState.SHORT_BREAK &&
      this.state !== TimerState.LONG_BREAK
    ) {
      throw new Error('Cannot pause: timer is not running');
    }

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Record pause time
    if (this.session) {
      this.session.pausedAt = Date.now();
    }

    // Update state
    this.setState(TimerState.PAUSED);

    // Emit paused event
    this.emitEvent({
      type: TimerEventType.PAUSED,
      state: this.state,
      remainingTime: this.session?.remainingTime ?? 0,
      timestamp: Date.now(),
      taskId: this.currentTask?.id,
      sessionType: this.session?.type,
    });
  }

  /**
   * Resume a paused timer session
   */
  public resume(): void {
    if (this.state !== TimerState.PAUSED) {
      throw new Error('Cannot resume: timer is not paused');
    }

    if (!this.session) {
      throw new Error('No session to resume');
    }

    // Calculate pause duration and add to accumulated pause time
    if (this.session.pausedAt !== null) {
      const pauseDuration = Date.now() - this.session.pausedAt;
      this.session.accumulatedPause += pauseDuration;
      this.session.pausedAt = null;
    }

    // Update state based on session type
    this.setState(this.mapToTimerState(this.session.type));

    // Emit resumed event
    this.emitEvent({
      type: TimerEventType.RESUMED,
      state: this.state,
      remainingTime: this.session.remainingTime,
      timestamp: Date.now(),
      taskId: this.currentTask?.id,
      sessionType: this.session.type,
    });

    // Restart the timer loop
    this.startTimerLoop();
  }

  /**
   * Reset the timer to idle state
   */
  public reset(): void {
    this.stopTimerLoop();

    const previousState = this.state;
    this.session = null;
    this.setState(TimerState.IDLE);

    // Emit reset event
    this.emitEvent({
      type: TimerEventType.RESET,
      state: this.state,
      remainingTime: 0,
      timestamp: Date.now(),
      sessionType: undefined,
    });
  }

  /**
   * Skip the current session
   */
  public skip(): void {
    const sessionType = this.session?.type;
    const wasCompleted = false;

    this.stopTimerLoop();
    this.session = null;
    this.setState(TimerState.IDLE);

    // Emit skipped event
    this.emitEvent({
      type: TimerEventType.SKIPPED,
      state: this.state,
      remainingTime: 0,
      timestamp: Date.now(),
      taskId: this.currentTask?.id,
      sessionType,
    });
  }

  /**
   * Get the current timer state
   */
  public getState(): TimerState {
    return this.state;
  }

  /**
   * Get remaining time in seconds
   */
  public getRemainingTime(): number {
    if (!this.session) {
      return 0;
    }

    if (this.state === TimerState.PAUSED || this.state === TimerState.IDLE) {
      return this.session.remainingTime;
    }

    // Calculate real-time remaining
    const now = Date.now();
    const elapsed =
      now - (this.session.startTime ?? now) - this.session.accumulatedPause;
    const remaining = Math.max(
      0,
      this.session.totalDuration - Math.floor(elapsed / 1000)
    );

    return remaining;
  }

  /**
   * Get total duration of current session in seconds
   */
  public getTotalDuration(): number {
    return this.session?.totalDuration ?? 0;
  }

  /**
   * Get progress as a value between 0 and 1
   */
  public getProgress(): number {
    if (!this.session || this.session.totalDuration <= 0) {
      return 0;
    }

    const remaining = this.getRemainingTime();
    return Math.max(0, Math.min(1, 1 - remaining / this.session.totalDuration));
  }

  /**
   * Get the current task associated with the timer
   */
  public getCurrentTask(): Task | null {
    return this.currentTask;
  }

  /**
   * Get the current session type
   */
  public getSessionType(): SessionType | null {
    return this.session?.type ?? null;
  }

  /**
   * Get the number of completed work sessions
   */
  public getCompletedWorkSessions(): number {
    return this.completedWorkSessions;
  }

  /**
   * Check if timer is currently running
   */
  public isRunning(): boolean {
    return (
      this.state === TimerState.WORKING ||
      this.state === TimerState.SHORT_BREAK ||
      this.state === TimerState.LONG_BREAK
    );
  }

  /**
   * Check if timer is paused
   */
  public isPaused(): boolean {
    return this.state === TimerState.PAUSED;
  }

  /**
   * Check if timer is idle
   */
  public isIdle(): boolean {
    return this.state === TimerState.IDLE;
  }

  /**
   * Update timer settings
   */
  public updateSettings(settings: Partial<TimerSettings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current timer settings
   */
  public getSettings(): TimerSettings {
    return { ...this.settings };
  }

  /**
   * Subscribe to timer events
   */
  public subscribe(observer: TimerObserver): () => void {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  /**
   * Get the next break type based on completed work sessions
   */
  public getNextBreakType(): 'short_break' | 'long_break' {
    return (this.completedWorkSessions + 1) %
      this.settings.longBreakInterval ===
      0
      ? 'long_break'
      : 'short_break';
  }

  /**
   * Get duration for a specific session type
   */
  private getDurationForType(
    type: 'work' | 'short_break' | 'long_break'
  ): number {
    switch (type) {
      case 'work':
        return this.settings.workDuration;
      case 'short_break':
        return this.settings.shortBreakDuration;
      case 'long_break':
        return this.settings.longBreakDuration;
    }
  }

  /**
   * Map session type string to SessionType enum
   */
  private mapToSessionType(
    type: 'work' | 'short_break' | 'long_break'
  ): SessionType {
    switch (type) {
      case 'work':
        return SessionType.WORK;
      case 'short_break':
        return SessionType.SHORT_BREAK;
      case 'long_break':
        return SessionType.LONG_BREAK;
    }
  }

  /**
   * Map session type string to TimerState
   */
  private mapToTimerState(
    type: 'work' | 'short_break' | 'long_break' | SessionType
  ): TimerState {
    if (type === SessionType.WORK || type === 'work') {
      return TimerState.WORKING;
    }
    if (type === SessionType.SHORT_BREAK || type === 'short_break') {
      return TimerState.SHORT_BREAK;
    }
    return TimerState.LONG_BREAK;
  }

  /**
   * Update timer state and notify observers
   */
  private setState(newState: TimerState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;

      this.emitEvent({
        type: TimerEventType.STATE_CHANGED,
        state: this.state,
        remainingTime: this.getRemainingTime(),
        timestamp: Date.now(),
        taskId: this.currentTask?.id,
        sessionType: this.session?.type,
      });
    }
  }

  /**
   * Start the main timer loop
   */
  private startTimerLoop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }

    this.lastTickTime = Date.now();

    this.intervalId = window.setInterval(() => {
      this.tick();
    }, this.tickInterval);
  }

  /**
   * Stop the timer loop
   */
  private stopTimerLoop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Main timer tick function - called every 100ms
   * Uses Date.now() delta for high-precision timing
   */
  private tick(): void {
    if (!this.session || this.state === TimerState.PAUSED) {
      return;
    }

    const now = Date.now();
    const elapsed =
      now - (this.session.startTime ?? now) - this.session.accumulatedPause;
    const elapsedSeconds = Math.floor(elapsed / 1000);

    // Calculate remaining time
    this.session.remainingTime = Math.max(
      0,
      this.session.totalDuration - elapsedSeconds
    );

    // Check if timer completed
    if (this.session.remainingTime <= 0) {
      this.completeSession();
      return;
    }

    // Notify observers of tick
    this.observers.forEach((observer) => {
      try {
        observer({
          type: TimerEventType.STATE_CHANGED,
          state: this.state,
          remainingTime: this.session!.remainingTime,
          timestamp: now,
          taskId: this.currentTask?.id,
          sessionType: this.session!.type,
        });
      } catch (error) {
        console.error('Error in timer observer:', error);
      }
    });
  }

  /**
   * Handle session completion
   */
  private completeSession(): void {
    const sessionType = this.session?.type;
    const wasCompleted = true;

    // If this was a work session, increment counter
    if (sessionType === SessionType.WORK) {
      this.completedWorkSessions++;

      // Update task's completed pomodoros
      if (this.currentTask) {
        this.currentTask.completedPomodoros++;
      }
    }

    this.stopTimerLoop();
    this.setState(TimerState.IDLE);

    // Emit completed event
    this.emitEvent({
      type: TimerEventType.COMPLETED,
      state: this.state,
      remainingTime: 0,
      timestamp: Date.now(),
      taskId: this.currentTask?.id,
      sessionType,
    });

    // Clear session but keep data for controller to read
    const completedSession = this.session;
    this.session = null;

    // Notify observers
    this.observers.forEach((observer) => {
      try {
        observer({
          type: TimerEventType.COMPLETED,
          state: this.state,
          remainingTime: 0,
          timestamp: Date.now(),
          taskId: this.currentTask?.id,
          sessionType: completedSession?.type,
        });
      } catch (error) {
        console.error('Error in timer observer:', error);
      }
    });
  }

  /**
   * Emit a timer event to all observers
   */
  private emitEvent(event: TimerEvent): void {
    this.observers.forEach((observer) => {
      try {
        observer(event);
      } catch (error) {
        console.error('Error in timer observer:', error);
      }
    });
  }

  /**
   * Get session data for recording purposes
   */
  public getSessionData(): {
    type: SessionType;
    duration: number;
    startedAt: number;
    completedAt: number | null;
    taskId: string | null;
  } | null {
    if (!this.session) {
      return null;
    }

    return {
      type: this.session.type,
      duration: this.session.totalDuration,
      startedAt: this.session.startTime ?? Date.now(),
      completedAt: this.state === TimerState.IDLE ? Date.now() : null,
      taskId: this.currentTask?.id ?? null,
    };
  }

  /**
   * Set the current task
   */
  public setCurrentTask(task: Task | null): void {
    this.currentTask = task;
  }

  /**
   * Cleanup and release resources
   */
  public dispose(): void {
    this.stopTimerLoop();
    this.observers.clear();
    this.session = null;
    this.currentTask = null;
    this.setState(TimerState.IDLE);
  }
}

/**
 * Factory function to create a new PomodoroTimer instance
 */
export function createPomodoroTimer(
  settings?: Partial<TimerSettings>
): PomodoroTimer {
  return new PomodoroTimer(settings);
}
