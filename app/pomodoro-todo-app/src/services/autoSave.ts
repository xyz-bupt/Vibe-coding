/**
 * AutoSaveManager - Manages automatic state persistence
 *
 * Responsibilities:
 * - Debounced auto-save on state changes
 * - Scheduled periodic saves
 * - Save failure handling and retries
 * - Save status notifications
 * - Integration with storage service
 */

import { AutoSaveConfig, AppState } from '../types/index';
import { AppStore } from '../store/AppStore';

/**
 * Auto-save status
 */
export enum AutoSaveStatus {
  IDLE = 'idle',
  SCHEDULED = 'scheduled',
  SAVING = 'saving',
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Save result
 */
export interface SaveResult {
  success: boolean;
  timestamp: number;
  error?: Error;
}

/**
 * Auto-save event
 */
export interface AutoSaveEvent {
  status: AutoSaveStatus;
  timestamp: number;
  error?: Error;
}

/**
 * Auto-save event listener
 */
export type AutoSaveEventListener = (event: AutoSaveEvent) => void;

/**
 * Auto-save statistics
 */
export interface AutoSaveStats {
  totalSaves: number;
  successfulSaves: number;
  failedSaves: number;
  lastSaveTime: number | null;
  lastSaveError: Error | null;
  averageSaveTime: number;
}

/**
 * AutoSaveManager - Main class
 */
export class AutoSaveManager {
  private store: AppStore;
  private storage: Storage;

  // Configuration
  private config: Required<AutoSaveConfig>;

  // State
  private status: AutoSaveStatus = AutoSaveStatus.IDLE;
  private debounceTimer: number | null = null;
  private periodicSaveTimer: number | null = null;
  private scheduledSaveTimer: number | null = null;

  // Event listeners
  private listeners: Set<AutoSaveEventListener> = new Set();

  // Store unsubscribe function
  private unsubscribeStore?: () => void;

  // Statistics
  private stats: AutoSaveStats = {
    totalSaves: 0,
    successfulSaves: 0,
    failedSaves: 0,
    lastSaveTime: null,
    lastSaveError: null,
    averageSaveTime: 0,
  };

  // Save timing tracking
  private saveTimes: number[] = [];
  private readonly MAX_SAVE_TIME_SAMPLES = 10;

  // Retry state
  private retryCount: number = 0;
  private readonly MAX_RETRIES = 3;
  private retryTimer: number | null = null;

  /**
   * Constructor
   */
  constructor(store: AppStore, config: AutoSaveConfig = {}) {
    this.store = store;
    this.storage = window.localStorage;

    this.config = {
      enabled: config.enabled ?? true,
      debounceMs: config.debounceMs ?? 2000,
      onSave: config.onSave ?? (() => {}),
      onError: config.onError ?? (() => {}),
    };
  }

  // ==========================================================================
  // PUBLIC API - START/STOP
  // ==========================================================================

  /**
   * Start auto-save
   */
  start(): void {
    if (!this.config.enabled) {
      return;
    }

    // Subscribe to store changes
    this.unsubscribeStore = this.store.subscribe(
      this.handleStateChange.bind(this)
    );

    // Setup periodic save
    this.startPeriodicSave();

    // Setup save on page visibility change
    this.setupVisibilityHandlers();

    // Setup save on page unload
    this.setupUnloadHandler();
  }

  /**
   * Stop auto-save
   */
  stop(): void {
    // Cancel all timers
    this.cancelScheduledSave();
    this.cancelPeriodicSave();
    this.cancelRetryTimer();

    // Unsubscribe from store
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
      this.unsubscribeStore = undefined;
    }

    // Remove event listeners
    this.removeVisibilityHandlers();
    this.removeUnloadHandler();

    // Perform final save
    this.saveNow();
  }

  // ==========================================================================
  // PUBLIC API - SAVE OPERATIONS
  // ==========================================================================

  /**
   * Schedule a save (with debouncing)
   */
  scheduleSave(): void {
    if (!this.config.enabled) {
      return;
    }

    // Cancel existing timer
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
    }

    // Schedule new save
    this.status = AutoSaveStatus.SCHEDULED;
    this.notifyListeners({ status: this.status, timestamp: Date.now() });

    this.debounceTimer = window.setTimeout(() => {
      this.debounceTimer = null;
      this.performSave();
    }, this.config.debounceMs);
  }

  /**
   * Cancel a scheduled save
   */
  cancelScheduledSave(): void {
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.scheduledSaveTimer !== null) {
      clearTimeout(this.scheduledSaveTimer);
      this.scheduledSaveTimer = null;
    }

    this.status = AutoSaveStatus.IDLE;
  }

  /**
   * Perform an immediate save (no debounce)
   */
  async saveNow(): Promise<SaveResult> {
    return this.performSave();
  }

  /**
   * Force save regardless of enabled state
   */
  async forceSave(): Promise<SaveResult> {
    const wasEnabled = this.config.enabled;
    this.config.enabled = true;

    try {
      return await this.performSave();
    } finally {
      this.config.enabled = wasEnabled;
    }
  }

  // ==========================================================================
  // PRIVATE - SAVE IMPLEMENTATION
  // ==========================================================================

  /**
   * Perform the actual save operation
   */
  private async performSave(): Promise<SaveResult> {
    if (this.status === AutoSaveStatus.SAVING) {
      // Already saving, skip
      return { success: false, timestamp: Date.now() };
    }

    const startTime = Date.now();
    this.status = AutoSaveStatus.SAVING;
    this.notifyListeners({ status: this.status, timestamp: startTime });

    try {
      // Get state from store
      const state = this.store.getSerializableState();

      // Serialize state
      const serialized = JSON.stringify(state);

      // Calculate checksum for integrity
      const checksum = this.calculateChecksum(serialized);

      // Create save data
      const saveData = {
        version: this.getVersion(),
        timestamp: startTime,
        checksum,
        state: serialized,
      };

      // Save to storage
      this.storage.setItem('pomodoro-state', JSON.stringify(saveData));

      // Also save backup
      this.storage.setItem('pomodoro-state-backup', JSON.stringify(saveData));

      // Update stats
      const saveTime = Date.now() - startTime;
      this.updateSaveStats(saveTime, null);

      // Reset retry count on success
      this.retryCount = 0;

      // Notify callbacks
      this.config.onSave();

      this.status = AutoSaveStatus.SUCCESS;
      this.notifyListeners({
        status: this.status,
        timestamp: Date.now(),
      });

      // Reset to idle after a delay
      setTimeout(() => {
        if (this.status === AutoSaveStatus.SUCCESS) {
          this.status = AutoSaveStatus.IDLE;
        }
      }, 1000);

      return { success: true, timestamp: Date.now() };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      // Update stats
      this.updateSaveStats(Date.now() - startTime, err);

      // Notify error callback
      this.config.onError(err);

      this.status = AutoSaveStatus.ERROR;
      this.notifyListeners({
        status: this.status,
        timestamp: Date.now(),
        error: err,
      });

      // Schedule retry
      this.scheduleRetry();

      return { success: false, timestamp: Date.now(), error: err };
    }
  }

  /**
   * Schedule a retry save
   */
  private scheduleRetry(): void {
    if (this.retryCount >= this.MAX_RETRIES) {
      return;
    }

    this.cancelRetryTimer();

    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, this.retryCount), 30000);

    this.retryTimer = window.setTimeout(() => {
      this.retryCount++;
      this.performSave();
    }, delay);
  }

  /**
   * Cancel retry timer
   */
  private cancelRetryTimer(): void {
    if (this.retryTimer !== null) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
  }

  // ==========================================================================
  // PRIVATE - STATE CHANGE HANDLING
  // ==========================================================================

  /**
   * Handle state changes from store
   */
  private handleStateChange(state: Readonly<AppState>): void {
    // Skip if loading or has error
    if (state.isLoading || state.error) {
      return;
    }

    // Schedule a save
    this.scheduleSave();
  }

  // ==========================================================================
  // PRIVATE - PERIODIC SAVE
  // ==========================================================================

  /**
   * Start periodic save timer
   */
  private startPeriodicSave(): void {
    this.cancelPeriodicSave();

    // Save every 30 seconds
    this.periodicSaveTimer = window.setInterval(() => {
      this.performSave();
    }, 30000);
  }

  /**
   * Cancel periodic save timer
   */
  private cancelPeriodicSave(): void {
    if (this.periodicSaveTimer !== null) {
      clearInterval(this.periodicSaveTimer);
      this.periodicSaveTimer = null;
    }
  }

  // ==========================================================================
  // PRIVATE - VISIBILITY/UNLOAD HANDLERS
  // ==========================================================================

  /**
   * Setup visibility change handlers
   */
  private setupVisibilityHandlers(): void {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  /**
   * Remove visibility change handlers
   */
  private removeVisibilityHandlers(): void {
    document.removeEventListener(
      'visibilitychange',
      this.handleVisibilityChange
    );
  }

  /**
   * Handle visibility change
   */
  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      // Page is being hidden, save immediately
      this.performSave();
    }
  };

  /**
   * Setup beforeunload handler
   */
  private setupUnloadHandler(): void {
    window.addEventListener('beforeunload', this.handleBeforeUnload);
  }

  /**
   * Remove beforeunload handler
   */
  private removeUnloadHandler(): void {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
  }

  /**
   * Handle beforeunload event
   */
  private handleBeforeUnload = (): void => {
    // Sync save before unload
    try {
      const state = this.store.getSerializableState();
      const serialized = JSON.stringify(state);
      const checksum = this.calculateChecksum(serialized);

      const saveData = {
        version: this.getVersion(),
        timestamp: Date.now(),
        checksum,
        state: serialized,
      };

      // Use synchronous storage for unload
      this.storage.setItem('pomodoro-state', JSON.stringify(saveData));
    } catch (error) {
      console.error('Failed to save on unload:', error);
    }
  };

  // ==========================================================================
  // PUBLIC API - RESTORE
  // ==========================================================================

  /**
   * Restore state from storage
   */
  restore(): AppState | null {
    try {
      const savedData = this.storage.getItem('pomodoro-state');

      if (!savedData) {
        return null;
      }

      const data = JSON.parse(savedData);

      // Verify checksum
      const checksum = this.calculateChecksum(data.state);
      if (checksum !== data.checksum) {
        console.warn(
          'State checksum mismatch, attempting to restore from backup'
        );
        return this.restoreFromBackup();
      }

      // Parse state
      const state = JSON.parse(data.state) as AppState;

      // Convert dailyStats back to Map
      if (state.dailyStats && !(state.dailyStats instanceof Map)) {
        state.dailyStats = new Map(Object.entries(state.dailyStats));
      }

      return state;
    } catch (error) {
      console.error('Failed to restore state:', error);
      return this.restoreFromBackup();
    }
  }

  /**
   * Restore state from backup
   */
  private restoreFromBackup(): AppState | null {
    try {
      const backupData = this.storage.getItem('pomodoro-state-backup');

      if (!backupData) {
        return null;
      }

      const data = JSON.parse(backupData);
      const state = JSON.parse(data.state) as AppState;

      // Convert dailyStats back to Map
      if (state.dailyStats && !(state.dailyStats instanceof Map)) {
        state.dailyStats = new Map(Object.entries(state.dailyStats));
      }

      return state;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      return null;
    }
  }

  /**
   * Clear saved state
   */
  clearSavedState(): void {
    this.storage.removeItem('pomodoro-state');
    this.storage.removeItem('pomodoro-state-backup');
  }

  // ==========================================================================
  // PUBLIC API - STATUS & STATS
  // ==========================================================================

  /**
   * Get current auto-save status
   */
  getStatus(): AutoSaveStatus {
    return this.status;
  }

  /**
   * Get auto-save statistics
   */
  getStats(): AutoSaveStats {
    return { ...this.stats };
  }

  /**
   * Check if there's a pending save
   */
  isPending(): boolean {
    return (
      this.status === AutoSaveStatus.SCHEDULED ||
      this.status === AutoSaveStatus.SAVING
    );
  }

  // ==========================================================================
  // PUBLIC API - EVENT LISTENERS
  // ==========================================================================

  /**
   * Subscribe to auto-save events
   */
  subscribe(listener: AutoSaveEventListener): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(event: AutoSaveEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in auto-save listener:', error);
      }
    });
  }

  // ==========================================================================
  // PUBLIC API - CONFIGURATION
  // ==========================================================================

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AutoSaveConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };

    // Restart if enabled/disabled changed
    if (config.enabled !== undefined) {
      if (config.enabled) {
        this.start();
      } else {
        this.stop();
      }
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<Required<AutoSaveConfig>> {
    return { ...this.config };
  }

  // ==========================================================================
  // PRIVATE - UTILITY METHODS
  // ==========================================================================

  /**
   * Calculate checksum for data integrity
   */
  private calculateChecksum(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  /**
   * Get app version
   */
  private getVersion(): string {
    return '1.0.0';
  }

  /**
   * Update save statistics
   */
  private updateSaveStats(saveTime: number, error: Error | null): void {
    this.stats.totalSaves++;

    if (error) {
      this.stats.failedSaves++;
      this.stats.lastSaveError = error;
    } else {
      this.stats.successfulSaves++;
      this.stats.lastSaveTime = Date.now();
      this.stats.lastSaveError = null;

      // Track save times for average
      this.saveTimes.push(saveTime);
      if (this.saveTimes.length > this.MAX_SAVE_TIME_SAMPLES) {
        this.saveTimes.shift();
      }

      // Calculate average
      const sum = this.saveTimes.reduce((a, b) => a + b, 0);
      this.stats.averageSaveTime = sum / this.saveTimes.length;
    }
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Destroy the manager
   */
  destroy(): void {
    this.stop();
    this.listeners.clear();
    this.saveTimes = [];
  }
}

/**
 * Create an auto-save manager with default config
 */
export function createAutoSaveManager(
  store: AppStore,
  config?: AutoSaveConfig
): AutoSaveManager {
  return new AutoSaveManager(store, config);
}

export default AutoSaveManager;
