/**
 * TimerController - Manages the Pomodoro Timer logic
 *
 * Responsibilities:
 * - Controlling timer start/pause/reset/skip
 * - Managing interval timing
 * - Handling session completion
 * - Coordinating with AppStore for state updates
 * - Managing notification permissions and delivery
 */

import {
  TimerState,
  SessionType,
  TimerEventType,
  TimerEvent,
  TimerObserver,
  TimerSettings,
} from '../types/index';
import { AppStore } from '../store/AppStore';

/**
 * Audio notification types
 */
enum AudioNotification {
  WORK_START = 'work_start',
  WORK_COMPLETE = 'work_complete',
  BREAK_START = 'break_start',
  BREAK_COMPLETE = 'break_complete',
}

/**
 * Timer controller configuration
 */
export interface TimerControllerConfig {
  store: AppStore;
  onTick?: (remainingTime: number) => void;
  onSessionComplete?: (sessionType: SessionType) => void;
  notificationEnabled?: boolean;
  soundEnabled?: boolean;
}

/**
 * TimerController - Main timer management class
 */
export class TimerController {
  private store: AppStore;
  private onTick?: (remainingTime: number) => void;
  private onSessionComplete?: (sessionType: SessionType) => void;

  // Timer interval reference
  private intervalId: number | null = null;
  private tickIntervalMs: number = 1000; // 1 second

  // Notification state
  private notificationPermission: NotificationPermission = 'default';
  private audioContext: AudioContext | null = null;

  // Observer management
  private observers: Set<TimerObserver> = new Set();

  // Background sync for keeping timer accurate
  private lastTickTime: number = 0;
  private driftCorrection: number = 0;

  // Visibility change handling for tab switching
  private wasRunningBeforeHidden: boolean = false;
  private tabHiddenTime: number = 0;

  constructor(config: TimerControllerConfig) {
    this.store = config.store;
    this.onTick = config.onTick;
    this.onSessionComplete = config.onSessionComplete;

    // Request notification permission if enabled
    if (config.notificationEnabled !== false) {
      this.requestNotificationPermission();
    }

    // Setup visibility change handler
    this.setupVisibilityHandler();

    // Subscribe to store changes
    this.store.subscribeToTimer(this.handleStoreTimerEvent.bind(this));
  }

  // ==========================================================================
  // PUBLIC API - Timer Control
  // ==========================================================================

  /**
   * Start the timer
   */
  async start(sessionType?: SessionType): Promise<void> {
    const state = this.store.getTimerState();

    // If already running, don't restart
    if (
      state === TimerState.WORKING ||
      state === TimerState.SHORT_BREAK ||
      state === TimerState.LONG_BREAK
    ) {
      return;
    }

    // Determine session type
    const targetSessionType = sessionType || this.determineNextSessionType();

    // Start timer via store
    await this.store.startTimer(targetSessionType);

    // Start the interval
    this.startInterval();

    // Play sound
    this.playAudio(
      targetSessionType === SessionType.WORK
        ? AudioNotification.WORK_START
        : AudioNotification.BREAK_START
    );

    // Show notification
    this.showNotification(this.getSessionStartMessage(targetSessionType));
  }

  /**
   * Pause the timer
   */
  async pause(): Promise<void> {
    const state = this.store.getTimerState();

    if (state === TimerState.IDLE || state === TimerState.PAUSED) {
      return;
    }

    // Pause via store
    await this.store.pauseTimer();

    // Stop interval
    this.stopInterval();

    // Play pause sound
    this.playAudio(AudioNotification.WORK_COMPLETE);
  }

  /**
   * Resume the timer
   */
  async resume(): Promise<void> {
    const state = this.store.getTimerState();

    if (state !== TimerState.PAUSED) {
      return;
    }

    // Resume via store
    await this.store.resumeTimer();

    // Restart interval
    this.startInterval();
  }

  /**
   * Reset the timer
   */
  async reset(): Promise<void> {
    // Reset via store
    await this.store.resetTimer();

    // Stop interval
    this.stopInterval();
  }

  /**
   * Skip current session
   */
  async skip(): Promise<void> {
    const state = this.store.getTimerState();

    if (state === TimerState.IDLE) {
      return;
    }

    const sessionType = this.store.getCurrentSessionType();

    // Skip via store
    await this.store.skipSession();

    // Stop interval
    this.stopInterval();

    // Notify callback
    if (this.onSessionComplete && sessionType) {
      this.onSessionComplete(sessionType);
    }
  }

  /**
   * Toggle timer (start/pause)
   */
  async toggle(): Promise<void> {
    const state = this.store.getTimerState();

    if (state === TimerState.IDLE || state === TimerState.PAUSED) {
      await this.start();
    } else {
      await this.pause();
    }
  }

  // ==========================================================================
  // TIMER INTERVAL MANAGEMENT
  // ==========================================================================

  /**
   * Start the tick interval
   */
  private startInterval(): void {
    // Clear any existing interval
    this.stopInterval();

    this.lastTickTime = Date.now();

    // Use requestAnimationFrame for smoother UI updates
    // while still tracking actual time
    this.intervalId = window.setInterval(() => {
      this.tick();
    }, this.tickIntervalMs);
  }

  /**
   * Stop the tick interval
   */
  private stopInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Timer tick - called every second
   */
  private tick(): void {
    const now = Date.now();
    const elapsed = now - this.lastTickTime;
    this.lastTickTime = now;

    // Handle drift correction
    this.driftCorrection += elapsed - this.tickIntervalMs;

    // Only tick if we've accumulated enough drift
    if (Math.abs(this.driftCorrection) >= 100) {
      // Correct for accumulated drift
      if (this.driftCorrection > 0) {
        // Running slow, skip a tick
        this.driftCorrection -= this.tickIntervalMs;
      }
    }

    // Update remaining time in store
    this.store.tickTimer();

    // Get updated state
    const remainingTime = this.store.getRemainingTime();

    // Notify tick callback
    if (this.onTick) {
      this.onTick(remainingTime);
    }

    // Check if timer completed
    if (remainingTime <= 0) {
      this.handleTimerComplete();
    }
  }

  /**
   * Handle timer completion
   */
  private async handleTimerComplete(): Promise<void> {
    // Stop interval
    this.stopInterval();

    const sessionType = this.store.getCurrentSessionType();
    const settings = this.store.getSettings();

    // Play completion sound
    this.playAudio(
      sessionType === SessionType.WORK
        ? AudioNotification.WORK_COMPLETE
        : AudioNotification.BREAK_COMPLETE
    );

    // Show notification
    this.showNotification(this.getSessionCompleteMessage(sessionType));

    // Notify callback
    if (this.onSessionComplete && sessionType) {
      this.onSessionComplete(sessionType);
    }

    // Auto-start next session if enabled
    const nextSessionType = this.determineNextSessionType();

    if (sessionType === SessionType.WORK && settings.autoStartBreak) {
      // Auto-start break after work
      setTimeout(() => {
        this.start(nextSessionType);
      }, 1000);
    } else if (sessionType !== SessionType.WORK && settings.autoStartWork) {
      // Auto-start work after break
      setTimeout(() => {
        this.start(SessionType.WORK);
      }, 1000);
    }
  }

  // ==========================================================================
  // SESSION TYPE LOGIC
  // ==========================================================================

  /**
   * Determine the next session type based on settings and history
   */
  private determineNextSessionType(): SessionType {
    const settings = this.store.getSettings();
    const currentState = this.store.getTimerState();
    const currentSession = this.store.getCurrentSessionType();
    const completedSessions =
      this.store.getState().completedSessionsSinceLastLongBreak;

    // If currently idle, start with work
    if (currentState === TimerState.IDLE && !currentSession) {
      return SessionType.WORK;
    }

    // If just completed a work session, determine break type
    if (
      currentState === TimerState.IDLE &&
      currentSession === SessionType.WORK
    ) {
      // Check if we need a long break
      if (completedSessions >= settings.longBreakInterval) {
        return SessionType.LONG_BREAK;
      }
      return SessionType.SHORT_BREAK;
    }

    // If just completed a break, return to work
    if (
      currentState === TimerState.IDLE &&
      (currentSession === SessionType.SHORT_BREAK ||
        currentSession === SessionType.LONG_BREAK)
    ) {
      return SessionType.WORK;
    }

    // Default to work
    return SessionType.WORK;
  }

  /**
   * Get the duration for a session type
   */
  getDuration(sessionType: SessionType): number {
    const settings = this.store.getSettings();

    switch (sessionType) {
      case SessionType.WORK:
        return settings.workDuration;
      case SessionType.SHORT_BREAK:
        return settings.shortBreakDuration;
      case SessionType.LONG_BREAK:
        return settings.longBreakDuration;
    }
  }

  // ==========================================================================
  // NOTIFICATIONS
  // ==========================================================================

  /**
   * Request notification permission
   */
  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  /**
   * Show a notification
   */
  private showNotification(message: string): void {
    const settings = this.store.getSettings();

    if (!settings.notificationEnabled) {
      return;
    }

    if (this.notificationPermission !== 'granted') {
      return;
    }

    // Use browser notification
    if ('Notification' in window) {
      new Notification('Pomodoro Timer', {
        body: message,
        icon: this.getNotificationIcon(),
        badge: this.getNotificationIcon(),
        tag: 'pomodoro-timer',
      });
    }
  }

  /**
   * Get notification icon URL
   */
  private getNotificationIcon(): string {
    // Return a default icon or your app's icon
    return '/icons/icon-192.png';
  }

  /**
   * Get session start message
   */
  private getSessionStartMessage(sessionType: SessionType): string {
    switch (sessionType) {
      case SessionType.WORK:
        return "Time to focus! Let's get to work.";
      case SessionType.SHORT_BREAK:
        return 'Great work! Take a short break.';
      case SessionType.LONG_BREAK:
        return 'Excellent progress! Time for a longer break.';
    }
  }

  /**
   * Get session complete message
   */
  private getSessionCompleteMessage(sessionType: SessionType | null): string {
    switch (sessionType) {
      case SessionType.WORK:
        return 'Work session complete! Take a break.';
      case SessionType.SHORT_BREAK:
      case SessionType.LONG_BREAK:
        return 'Break over! Ready to focus again?';
      default:
        return 'Timer complete!';
    }
  }

  // ==========================================================================
  // AUDIO NOTIFICATIONS
  // ==========================================================================

  /**
   * Play audio notification
   */
  private playAudio(type: AudioNotification): void {
    const settings = this.store.getSettings();

    if (!settings.soundEnabled) {
      return;
    }

    // Initialize audio context if needed
    if (!this.audioContext) {
      this.audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }

    // Play sound based on type
    switch (type) {
      case AudioNotification.WORK_START:
        this.playTone(880, 0.1, 'sine'); // A5
        break;
      case AudioNotification.WORK_COMPLETE:
        this.playTone(523, 0.15, 'sine'); // C5
        setTimeout(() => this.playTone(659, 0.15, 'sine'), 150); // E5
        setTimeout(() => this.playTone(784, 0.2, 'sine'), 300); // G5
        break;
      case AudioNotification.BREAK_START:
        this.playTone(659, 0.1, 'sine'); // E5
        break;
      case AudioNotification.BREAK_COMPLETE:
        this.playTone(784, 0.15, 'sine'); // G5
        setTimeout(() => this.playTone(659, 0.15, 'sine'), 150); // E5
        break;
    }
  }

  /**
   * Play a tone with specified frequency and duration
   */
  private playTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine'
  ): void {
    if (!this.audioContext) return;

    const settings = this.store.getSettings();
    const volume = settings.volume;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      // Envelope to avoid clicking
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (error) {
      console.error('Error playing tone:', error);
    }
  }

  // ==========================================================================
  // TAB VISIBILITY HANDLING
  // ==========================================================================

  /**
   * Setup visibility change handler for tab switching
   */
  private setupVisibilityHandler(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handleTabHidden();
      } else {
        this.handleTabVisible();
      }
    });
  }

  /**
   * Handle tab hidden
   */
  private handleTabHidden(): void {
    const state = this.store.getTimerState();

    // Save state if timer was running
    if (
      state === TimerState.WORKING ||
      state === TimerState.SHORT_BREAK ||
      state === TimerState.LONG_BREAK
    ) {
      this.wasRunningBeforeHidden = true;
      this.tabHiddenTime = Date.now();
    } else {
      this.wasRunningBeforeHidden = false;
    }
  }

  /**
   * Handle tab visible
   */
  private handleTabVisible(): void {
    if (!this.wasRunningBeforeHidden) {
      return;
    }

    // Calculate time elapsed while hidden
    const elapsed = Date.now() - this.tabHiddenTime;
    const remainingTime = this.store.getRemainingTime();

    // If enough time passed, the session should be complete
    if (elapsed >= remainingTime * 1000) {
      // Session completed while hidden
      this.handleTimerComplete();
    }
  }

  // ==========================================================================
  // OBSERVER MANAGEMENT
  // ==========================================================================

  /**
   * Subscribe to timer events
   */
  subscribe(observer: TimerObserver): () => void {
    this.observers.add(observer);

    // Return unsubscribe function
    return () => {
      this.observers.delete(observer);
    };
  }

  /**
   * Handle timer events from store
   */
  private handleStoreTimerEvent(event: TimerEvent): void {
    // Notify all observers
    this.observers.forEach((observer) => {
      try {
        observer(event);
      } catch (error) {
        console.error('Error in timer observer:', error);
      }
    });
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Cleanup and destroy the controller
   */
  destroy(): void {
    this.stopInterval();

    // Clear observers
    this.observers.clear();

    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Format time as MM:SS
   */
  static formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Format time as HH:MM:SS
   */
  static formatTimeLong(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Get percentage completed
   */
  getPercentageCompleted(): number {
    const remainingTime = this.store.getRemainingTime();
    const sessionType = this.store.getCurrentSessionType();
    const totalTime = sessionType
      ? this.getDuration(sessionType)
      : remainingTime;

    if (totalTime === 0) return 0;

    return Math.round(((totalTime - remainingTime) / totalTime) * 100);
  }

  /**
   * Get estimated completion time
   */
  getEstimatedCompletionTime(): Date | null {
    const state = this.store.getTimerState();

    if (state === TimerState.IDLE || state === TimerState.PAUSED) {
      return null;
    }

    const remainingTime = this.store.getRemainingTime();
    return new Date(Date.now() + remainingTime * 1000);
  }
}
