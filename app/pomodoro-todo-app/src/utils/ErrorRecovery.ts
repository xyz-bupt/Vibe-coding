/**
 * Error Recovery Utilities
 *
 * Provides recovery mechanisms for common error scenarios.
 * Includes retry logic, fallback strategies, and data restoration.
 */

import { ErrorCategory, ErrorLog, RecoveryAction, getErrorHandler } from '../services/errorHandler';

// ============================================================================
// RETRY CONFIGURATION
// ============================================================================

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: [
    'network',
    'timeout',
    'econnrefused',
    'etimedout'
  ]
};

// ============================================================================
// RETRY FUNCTION
// ============================================================================

/**
 * Retry function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      const isRetryable = finalConfig.retryableErrors.some(pattern =>
        lastError!.message.toLowerCase().includes(pattern)
      );

      if (!isRetryable || attempt === finalConfig.maxAttempts) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffMultiplier, attempt - 1),
        finalConfig.maxDelay
      );

      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ============================================================================
// STORAGE RECOVERY
// ============================================================================

/**
 * Storage recovery strategies
 */
export class StorageRecovery {
  /**
   * Clear corrupted data
   */
  static async clearCorruptedData(): Promise<void> {
    try {
      // Clear IndexedDB
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase('pomodoro-db');
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Clear localStorage
      localStorage.removeItem('pomodoro_tasks_backup');
      localStorage.removeItem('pomodoro_settings_backup');
      localStorage.removeItem('pomodoro_error_logs');

    } catch (error) {
      throw new Error(`Failed to clear corrupted data: ${error}`);
    }
  }

  /**
   * Restore from localStorage backup
   */
  static async restoreFromBackup(): Promise<any> {
    try {
      const tasksBackup = localStorage.getItem('pomodoro_tasks_backup');
      const settingsBackup = localStorage.getItem('pomodoro_settings_backup');

      if (!tasksBackup && !settingsBackup) {
        throw new Error('No backup found');
      }

      return {
        tasks: tasksBackup ? JSON.parse(tasksBackup) : [],
        settings: settingsBackup ? JSON.parse(settingsBackup) : null
      };
    } catch (error) {
      throw new Error(`Failed to restore from backup: ${error}`);
    }
  }

  /**
   * Verify storage integrity
   */
  static async verifyStorage(): Promise<boolean> {
    try {
      // Test IndexedDB
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open('pomodoro-db', 1);
        request.onsuccess = () => {
          request.result.close();
          resolve();
        };
        request.onerror = () => reject(request.error);
      });

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get storage recovery actions
   */
  static getRecoveryActions(): RecoveryAction[] {
    return [
      {
        label: 'Retry Operation',
        action: () => {
          window.location.reload();
        },
        primary: true
      },
      {
        label: 'Restore from Backup',
        action: async () => {
          try {
            await StorageRecovery.restoreFromBackup();
            window.location.reload();
          } catch (error) {
            getErrorHandler().handleError(error, {
              component: 'StorageRecovery',
              action: 'restoreFromBackup'
            });
          }
        }
      },
      {
        label: 'Clear All Data',
        action: async () => {
          if (confirm('This will delete all your data. Are you sure?')) {
            await StorageRecovery.clearCorruptedData();
            window.location.reload();
          }
        }
      }
    ];
  }
}

// ============================================================================
// TIMER RECOVERY
// ============================================================================

/**
 * Timer recovery strategies
 */
export class TimerRecovery {
  /**
   * Get timer state from localStorage
   */
  static getTimerState(): { state: string; remainingTime: number } | null {
    try {
      const state = localStorage.getItem('pomodoro_timer_state');
      if (state) {
        return JSON.parse(state);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Save timer state to localStorage
   */
  static saveTimerState(state: string, remainingTime: number): void {
    try {
      localStorage.setItem('pomodoro_timer_state', JSON.stringify({
        state,
        remainingTime,
        timestamp: Date.now()
      }));
    } catch (error) {
      // Silently fail - non-critical
    }
  }

  /**
   * Clear timer state
   */
  static clearTimerState(): void {
    try {
      localStorage.removeItem('pomodoro_timer_state');
    } catch {
      // Silently fail
    }
  }

  /**
   * Calculate elapsed time and adjust remaining time
   */
  static calculateAdjustedTime(savedRemainingTime: number, savedTimestamp: number): number {
    const elapsed = Date.now() - savedTimestamp;
    return Math.max(0, savedRemainingTime - Math.floor(elapsed / 1000));
  }

  /**
   * Get timer recovery actions
   */
  static getRecoveryActions(): RecoveryAction[] {
    return [
      {
        label: 'Reset Timer',
        action: () => {
          TimerRecovery.clearTimerState();
          window.dispatchEvent(new CustomEvent('timer:reset'));
        },
        primary: true
      },
      {
        label: 'Skip Session',
        action: () => {
          TimerRecovery.clearTimerState();
          window.dispatchEvent(new CustomEvent('timer:skip'));
        }
      },
      {
        label: 'Resume Timer',
        action: () => {
          const savedState = TimerRecovery.getTimerState();
          if (savedState) {
            const adjustedTime = TimerRecovery.calculateAdjustedTime(
              savedState.remainingTime,
              savedState.timestamp
            );
            window.dispatchEvent(new CustomEvent('timer:resume', {
              detail: { remainingTime: adjustedTime }
            }));
          }
        }
      }
    ];
  }
}

// ============================================================================
// NETWORK RECOVERY
// ============================================================================

/**
 * Network recovery strategies
 */
export class NetworkRecovery {
  /**
   * Check if online
   */
  static isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Wait for network connection
   */
  static async waitForConnection(timeout: number = 30000): Promise<boolean> {
    if (this.isOnline()) {
      return true;
    }

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        window.removeEventListener('online', onOnline);
        resolve(false);
      }, timeout);

      const onOnline = () => {
        clearTimeout(timeoutId);
        window.removeEventListener('online', onOnline);
        resolve(true);
      };

      window.addEventListener('online', onOnline);
    });
  }

  /**
   * Enable offline mode
   */
  static enableOfflineMode(): void {
    window.dispatchEvent(new CustomEvent('app:offline'));
  }

  /**
   * Get network recovery actions
   */
  static getRecoveryActions(): RecoveryAction[] {
    return [
      {
        label: 'Retry',
        action: async () => {
          const online = await NetworkRecovery.waitForConnection();
          if (online) {
            window.location.reload();
          } else {
            throw new Error('Still offline. Please check your internet connection.');
          }
        },
        primary: true
      },
      {
        label: 'Work Offline',
        action: () => {
          NetworkRecovery.enableOfflineMode();
        }
      }
    ];
  }
}

// ============================================================================
// GRACEFUL DEGRADATION
// ============================================================================

/**
 * Graceful degradation utilities
 */
export class GracefulDegradation {
  private static degradedFeatures: Set<string> = new Set();

  /**
   * Disable feature gracefully
   */
  static disableFeature(featureName: string, reason?: string): void {
    this.degradedFeatures.add(featureName);

    // Notify user
    if (reason) {
      const message = `${featureName} is temporarily unavailable: ${reason}`;
      getErrorHandler().handleError(new Error(message), {
        component: 'GracefulDegradation',
        action: 'disableFeature'
      });
    }

    // Dispatch event for UI to handle
    window.dispatchEvent(new CustomEvent('feature:disabled', {
      detail: { feature: featureName, reason }
    }));
  }

  /**
   * Check if feature is disabled
   */
  static isFeatureDisabled(featureName: string): boolean {
    return this.degradedFeatures.has(featureName);
  }

  /**
   * Re-enable feature
   */
  static enableFeature(featureName: string): void {
    this.degradedFeatures.delete(featureName);

    // Dispatch event for UI to handle
    window.dispatchEvent(new CustomEvent('feature:enabled', {
      detail: { feature: featureName }
    }));
  }

  /**
   * Run function with fallback
   */
  static async withFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackFn: () => Promise<T>,
    featureName: string
  ): Promise<T> {
    try {
      const result = await primaryFn();

      // If we previously degraded this feature, re-enable it
      if (this.isFeatureDisabled(featureName)) {
        this.enableFeature(featureName);
      }

      return result;
    } catch (error) {
      console.warn(`Primary function for ${featureName} failed, using fallback`);

      // Degrade feature
      this.disableFeature(featureName, (error as Error).message);

      // Use fallback
      return fallbackFn();
    }
  }
}

// ============================================================================
// ERROR RECOVERY MANAGER
// ============================================================================

/**
 * Central recovery manager
 */
export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private recoveryStrategies: Map<ErrorCategory, () => RecoveryAction[]> = new Map();

  private constructor() {
    this.registerDefaultStrategies();
  }

  static getInstance(): ErrorRecoveryManager {
    if (!this.instance) {
      this.instance = new ErrorRecoveryManager();
    }
    return this.instance;
  }

  /**
   * Register default recovery strategies
   */
  private registerDefaultStrategies(): void {
    this.recoveryStrategies.set(ErrorCategory.STORAGE, () => StorageRecovery.getRecoveryActions());
    this.recoveryStrategies.set(ErrorCategory.TIMER, () => TimerRecovery.getRecoveryActions());
    this.recoveryStrategies.set(ErrorCategory.NETWORK, () => NetworkRecovery.getRecoveryActions());
  }

  /**
   * Get recovery actions for error category
   */
  getRecoveryActions(category: ErrorCategory): RecoveryAction[] {
    const getActions = this.recoveryStrategies.get(category);

    if (getActions) {
      return getActions();
    }

    // Default recovery action
    return [
      {
        label: 'Retry',
        action: () => {
          window.location.reload();
        },
        primary: true
      },
      {
        label: 'Reload Page',
        action: () => {
          window.location.reload();
        }
      }
    ];
  }

  /**
   * Register custom recovery strategy
   */
  registerStrategy(category: ErrorCategory, getActions: () => RecoveryAction[]): void {
    this.recoveryStrategies.set(category, getActions);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  StorageRecovery,
  TimerRecovery,
  NetworkRecovery,
  GracefulDegradation,
  ErrorRecoveryManager
};

export default {
  withRetry,
  StorageRecovery,
  TimerRecovery,
  NetworkRecovery,
  GracefulDegradation,
  ErrorRecoveryManager
};
