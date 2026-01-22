/**
 * Timer Controller
 * High-level controller that orchestrates timer, storage, notifications, and audio
 */

import { PomodoroTimer } from './timer';
import { IStorageService, Session, SessionType, Task, TimerEvent, TimerEventType, TimerSettings } from '../types';
import { getAudioManager, AudioManager } from './audioManager';
import { NotificationManager } from './notificationManager';
import { v4 as uuidv4 } from 'uuid';

/**
 * Controller configuration options
 */
interface TimerControllerOptions {
  storage: IStorageService;
  audioManager?: AudioManager;
  notificationManager?: NotificationManager;
  settings?: Partial<TimerSettings>;
}

/**
 * Session recording data
 */
interface SessionRecordingData {
  taskId: string | null;
  type: SessionType;
  duration: number;
  actualDuration: number;
  startedAt: number;
  completedAt: number;
  wasCompleted: boolean;
  wasSkipped: boolean;
  notes?: string;
}

/**
 * TimerController class
 * Orchestrates all timer-related operations including session recording,
 * notifications, and automatic state transitions
 */
export class TimerController {
  private timer: PomodoroTimer;
  private storage: IStorageService;
  private audioManager: AudioManager;
  private notificationManager: NotificationManager;
  private currentSessionStartTime: number | null;
  private isDisposed: boolean;
  private unsubscribeFromEvents: (() => void) | null;
  private warningTimeouts: Set<number>;

  // Warning times in seconds before session ends
  private static readonly WARNING_TIMES = [60, 300]; // 1 min, 5 mins

  constructor(options: TimerControllerOptions) {
    this.storage = options.storage;
    this.audioManager = options.audioManager ?? getAudioManager();
    this.notificationManager = options.notificationManager ?? new NotificationManager();
    this.currentSessionStartTime = null;
    this.isDisposed = false;
    this.unsubscribeFromEvents = null;
    this.warningTimeouts = new Set();

    // Initialize timer with settings
    this.timer = new PomodoroTimer(options.settings);

    // Subscribe to timer events
    this.setupEventListeners();

    // Initialize settings from storage
    this.initializeSettings();
  }

  /**
   * Initialize settings from storage
   */
  private async initializeSettings(): Promise<void> {
    try {
      const settings = await this.storage.getSettings();
      this.timer.updateSettings(settings);
      this.audioManager.setVolume(settings.volume);
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  }

  /**
   * Setup event listeners for timer events
   */
  private setupEventListeners(): void {
    this.unsubscribeFromEvents = this.timer.subscribe((event: TimerEvent) => {
      this.handleTimerEvent(event);
    });
  }

  /**
   * Handle timer events
   */
  private handleTimerEvent(event: TimerEvent): void {
    if (this.isDisposed) {
      return;
    }

    switch (event.type) {
      case TimerEventType.STARTED:
        this.handleTimerStarted(event);
        break;
      case TimerEventType.PAUSED:
        this.handleTimerPaused(event);
        break;
      case TimerEventType.RESUMED:
        this.handleTimerResumed(event);
        break;
      case TimerEventType.COMPLETED:
        this.handleTimerCompleted(event);
        break;
      case TimerEventType.SKIPPED:
        this.handleTimerSkipped(event);
        break;
      case TimerEventType.RESET:
        this.handleTimerReset(event);
        break;
    }
  }

  /**
   * Handle timer started event
   */
  private handleTimerStarted(event: TimerEvent): void {
    this.currentSessionStartTime = event.timestamp;

    // Play start sound
    if (this.timer.getSettings().soundEnabled) {
      switch (event.sessionType) {
        case SessionType.WORK:
          this.audioManager.playStartSound();
          break;
        case SessionType.SHORT_BREAK:
        case SessionType.LONG_BREAK:
          this.audioManager.playBreakStartSound();
          break;
      }
    }

    // Send notification if document is hidden
    this.sendNotificationIfNeeded(
      this.getSessionStartTitle(event.sessionType),
      this.getSessionStartMessage(event.sessionType)
    );

    // Schedule warning notifications
    this.scheduleWarningNotifications(event.remainingTime);
  }

  /**
   * Handle timer paused event
   */
  private handleTimerPaused(event: TimerEvent): void {
    // Play pause sound
    if (this.timer.getSettings().soundEnabled) {
      this.audioManager.playPauseSound();
    }

    // Clear warning timeouts
    this.clearWarningTimeouts();
  }

  /**
   * Handle timer resumed event
   */
  private handleTimerResumed(event: TimerEvent): void {
    // Reschedule warning notifications
    this.scheduleWarningNotifications(event.remainingTime);
  }

  /**
   * Handle timer completed event
   */
  private async handleTimerCompleted(event: TimerEvent): Promise<void> {
    // Clear warning timeouts
    this.clearWarningTimeouts();

    // Play completion sound
    if (this.timer.getSettings().soundEnabled) {
      this.audioManager.playCompleteSound();
    }

    // Record the session
    const session = await this.recordSession(true, false);
    if (!session) {
      console.error('Failed to record session');
      return;
    }

    // Send completion notification
    await this.sendCompletionNotification(event.sessionType, session);

    // Handle auto-start behavior
    await this.handleAutoStart(event.sessionType);
  }

  /**
   * Handle timer skipped event
   */
  private async handleTimerSkipped(event: TimerEvent): Promise<void> {
    // Clear warning timeouts
    this.clearWarningTimeouts();

    // Record the skipped session
    await this.recordSession(false, true);
  }

  /**
   * Handle timer reset event
   */
  private handleTimerReset(event: TimerEvent): void {
    // Clear warning timeouts
    this.clearWarningTimeouts();
    this.currentSessionStartTime = null;
  }

  /**
   * Schedule warning notifications for remaining time
   */
  private scheduleWarningNotifications(remainingTime: number): void {
    this.clearWarningTimeouts();

    if (!this.timer.getSettings().notificationEnabled) {
      return;
    }

    TimerController.WARNING_TIMES.forEach((warningTime) => {
      if (remainingTime > warningTime) {
        const delay = (remainingTime - warningTime) * 1000;
        const timeoutId = window.setTimeout(() => {
          const minutes = Math.floor(warningTime / 60);
          if (minutes > 0) {
            this.notificationManager.notifyTimeRemaining(minutes);
          }
        }, delay);
        this.warningTimeouts.add(timeoutId);
      }
    });
  }

  /**
   * Clear all warning notification timeouts
   */
  private clearWarningTimeouts(): void {
    this.warningTimeouts.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.warningTimeouts.clear();
  }

  /**
   * Send notification only if document is hidden
   */
  private async sendNotificationIfNeeded(title: string, message: string): Promise<void> {
    if (!this.timer.getSettings().notificationEnabled) {
      return;
    }

    if (document.hidden) {
      await this.notificationManager.send(title, message);
    }
  }

  /**
   * Get session start notification title
   */
  private getSessionStartTitle(sessionType?: SessionType): string {
    switch (sessionType) {
      case SessionType.WORK:
        return 'Work session started';
      case SessionType.SHORT_BREAK:
        return 'Short break started';
      case SessionType.LONG_BREAK:
        return 'Long break started';
      default:
        return 'Timer started';
    }
  }

  /**
   * Get session start notification message
   */
  private getSessionStartMessage(sessionType?: SessionType): string {
    const currentTask = this.timer.getCurrentTask();

    switch (sessionType) {
      case SessionType.WORK:
        return currentTask
          ? `Working on: ${currentTask.title}`
          : 'Focus on your work!';
      case SessionType.SHORT_BREAK:
        return 'Take a short break.';
      case SessionType.LONG_BREAK:
        return 'Take a longer break.';
      default:
        return '';
    }
  }

  /**
   * Send completion notification based on session type
   */
  private async sendCompletionNotification(sessionType: SessionType | undefined, session: Session): Promise<void> {
    if (!this.timer.getSettings().notificationEnabled) {
      return;
    }

    const currentTask = this.timer.getCurrentTask();

    switch (sessionType) {
      case SessionType.WORK:
        await this.notificationManager.notifyWorkComplete(
          currentTask?.title ?? '',
          this.timer.getCompletedWorkSessions()
        );
        break;
      case SessionType.SHORT_BREAK:
      case SessionType.LONG_BREAK:
        await this.notificationManager.notifyBreakOver();
        break;
    }
  }

  /**
   * Handle auto-start behavior after session completion
   */
  private async handleAutoStart(completedSessionType: SessionType | undefined): Promise<void> {
    const settings = this.timer.getSettings();

    if (completedSessionType === SessionType.WORK && settings.autoStartBreak) {
      // Auto-start break
      await this.autoStartBreak();
    } else if (
      (completedSessionType === SessionType.SHORT_BREAK || completedSessionType === SessionType.LONG_BREAK) &&
      settings.autoStartWork
    ) {
      // Auto-start next work session
      const currentTask = this.timer.getCurrentTask();
      if (currentTask) {
        await this.startWorkSession(currentTask);
      }
    }
  }

  /**
   * Start a work session
   * @param task - Task to associate with this work session
   * @param customDuration - Optional custom duration in seconds
   */
  public async startWorkSession(task: Task, customDuration?: number): Promise<void> {
    this.timer.setCurrentTask(task);
    await this.timer.start('work', task, customDuration);
  }

  /**
   * Start a short break session
   * @param customDuration - Optional custom duration in seconds
   */
  public async startShortBreak(customDuration?: number): Promise<void> {
    await this.timer.start('short_break', null, customDuration);
  }

  /**
   * Start a long break session
   * @param customDuration - Optional custom duration in seconds
   */
  public async startLongBreak(customDuration?: number): Promise<void> {
    await this.timer.start('long_break', null, customDuration);
  }

  /**
   * Auto-start appropriate break based on completed work sessions
   */
  public async autoStartBreak(): Promise<void> {
    const isLongBreak = this.timer.getNextBreakType() === 'long_break';

    if (isLongBreak) {
      await this.startLongBreak();
    } else {
      await this.startShortBreak();
    }
  }

  /**
   * Pause the current timer
   */
  public pause(): void {
    this.timer.pause();
  }

  /**
   * Resume the paused timer
   */
  public resume(): void {
    this.timer.resume();
  }

  /**
   * Reset the timer to idle state
   */
  public reset(): void {
    this.timer.reset();
  }

  /**
   * Skip the current session
   */
  public skip(): void {
    this.timer.skip();
  }

  /**
   * Complete current pomodoro and record session
   */
  public async completePomodoro(): Promise<void> {
    if (this.timer.getState() !== 'working' && this.timer.getState() !== 'paused') {
      throw new Error('No active work session to complete');
    }

    // Record session before resetting
    await this.recordSession(true, false);

    // Reset timer
    this.reset();
  }

  /**
   * Record the current session to storage
   */
  private async recordSession(wasCompleted: boolean, wasSkipped: boolean): Promise<Session | null> {
    const sessionData = this.timer.getSessionData();

    if (!sessionData) {
      return null;
    }

    const currentTask = this.timer.getCurrentTask();
    const completedAt = Date.now();
    const actualDuration = wasCompleted
      ? sessionData.duration
      : Math.floor((completedAt - sessionData.startedAt) / 1000);

    const session: Session = {
      id: uuidv4(),
      taskId: sessionData.taskId,
      type: sessionData.type,
      duration: sessionData.duration,
      actualDuration,
      startedAt: sessionData.startedAt,
      completedAt,
      wasCompleted,
      wasSkipped
    };

    try {
      await this.storage.saveSession(session);

      // Update task's completed pomodoros if work session was completed
      if (sessionData.type === SessionType.WORK && wasCompleted && currentTask) {
        currentTask.completedPomodoros++;
        await this.storage.saveTask(currentTask);
      }

      return session;
    } catch (error) {
      console.error('Error recording session:', error);
      return null;
    }
  }

  /**
   * Get recent sessions
   */
  public async getRecentSessions(limit: number = 10): Promise<Session[]> {
    try {
      return await this.storage.getLatestSessions(limit);
    } catch (error) {
      console.error('Error getting recent sessions:', error);
      return [];
    }
  }

  /**
   * Get sessions for a specific task
   */
  public async getSessionsForTask(taskId: string): Promise<Session[]> {
    try {
      return await this.storage.getSessionsByTask(taskId);
    } catch (error) {
      console.error('Error getting sessions for task:', error);
      return [];
    }
  }

  /**
   * Update timer settings
   */
  public async updateSettings(settings: Partial<TimerSettings>): Promise<void> {
    // Update timer settings
    this.timer.updateSettings(settings);

    // Update audio manager
    if (settings.volume !== undefined) {
      this.audioManager.setVolume(settings.volume);
    }

    // Save to storage
    try {
      await this.storage.saveSettings(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  /**
   * Request notification permission
   */
  public async requestNotificationPermission(): Promise<boolean> {
    return await this.notificationManager.requestPermission();
  }

  /**
   * Check if notifications are enabled
   */
  public areNotificationsEnabled(): boolean {
    return this.notificationManager.isEnabled();
  }

  /**
   * Toggle sound on/off
   */
  public toggleSound(): void {
    const settings = this.timer.getSettings();
    const newState = !settings.soundEnabled;

    this.timer.updateSettings({ soundEnabled: newState });

    if (!newState) {
      this.audioManager.mute();
    } else {
      this.audioManager.unmute();
    }
  }

  /**
   * Toggle notifications on/off
   */
  public toggleNotifications(): void {
    const settings = this.timer.getSettings();
    const newState = !settings.notificationEnabled;

    this.timer.updateSettings({ notificationEnabled: newState });
  }

  /**
   * Set volume level
   */
  public setVolume(volume: number): void {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.audioManager.setVolume(clampedVolume);
    this.timer.updateSettings({ volume: clampedVolume });
  }

  /**
   * Get the underlying timer instance
   */
  public getTimer(): PomodoroTimer {
    return this.timer;
  }

  /**
   * Get audio manager instance
   */
  public getAudioManager(): AudioManager {
    return this.audioManager;
  }

  /**
   * Get notification manager instance
   */
  public getNotificationManager(): NotificationManager {
    return this.notificationManager;
  }

  /**
   * Get current timer state
   */
  public getState(): string {
    return this.timer.getState();
  }

  /**
   * Get remaining time in seconds
   */
  public getRemainingTime(): number {
    return this.timer.getRemainingTime();
  }

  /**
   * Get progress as a value between 0 and 1
   */
  public getProgress(): number {
    return this.timer.getProgress();
  }

  /**
   * Get current task
   */
  public getCurrentTask(): Task | null {
    return this.timer.getCurrentTask();
  }

  /**
   * Subscribe to timer events
   */
  public subscribe(callback: (event: TimerEvent) => void): () => void {
    return this.timer.subscribe(callback);
  }

  /**
   * Dispose of controller and release resources
   */
  public dispose(): void {
    this.isDisposed = true;

    // Clear warning timeouts
    this.clearWarningTimeouts();

    // Unsubscribe from timer events
    if (this.unsubscribeFromEvents) {
      this.unsubscribeFromEvents();
      this.unsubscribeFromEvents = null;
    }

    // Dispose timer
    this.timer.dispose();

    // Clear references
    this.currentSessionStartTime = null;
  }
}

/**
 * Factory function to create a TimerController instance
 */
export async function createTimerController(
  storage: IStorageService,
  options?: Partial<TimerControllerOptions>
): Promise<TimerController> {
  const controller = new TimerController({
    storage,
    ...options
  });

  return controller;
}
