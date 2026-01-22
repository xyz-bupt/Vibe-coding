/**
 * Error Handler Service
 *
 * Centralized error handling system for the application.
 * Provides error logging, user notification, error recovery, and reporting.
 *
 * Features:
 * - Structured error logging with context
 * - User-friendly error messages
 * - Error recovery mechanisms
 * - Error reporting (extensible for monitoring services)
 * - Error categorization and routing
 */

// ============================================================================
// ERROR TYPE DEFINITIONS
// ============================================================================

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low', // Non-critical, can be ignored
  MEDIUM = 'medium', // Affects some functionality
  HIGH = 'high', // Major functionality affected
  CRITICAL = 'critical', // Application unusable
}

/**
 * Error categories
 */
export enum ErrorCategory {
  STORAGE = 'storage', // Storage-related errors
  NETWORK = 'network', // Network/API errors
  TIMER = 'timer', // Timer functionality errors
  VALIDATION = 'validation', // Input validation errors
  UI = 'ui', // UI/rendering errors
  INITIALIZATION = 'initialization', // App initialization errors
  PERMISSION = 'permission', // Permission-related errors
  UNKNOWN = 'unknown', // Uncategorized errors
}

/**
 * Error context information
 */
export interface ErrorContext {
  component?: string; // Component where error occurred
  action?: string; // Action being performed
  timestamp?: number; // When error occurred
  userId?: string; // User ID (if applicable)
  sessionId?: string; // Session ID
  additionalData?: Record<string, any>; // Any additional context
}

/**
 * Error log entry
 */
export interface ErrorLog {
  id: string; // Unique error ID
  message: string; // User-friendly message
  technicalMessage: string; // Technical error message
  category: ErrorCategory; // Error category
  severity: ErrorSeverity; // Error severity
  stack?: string; // Stack trace
  context: ErrorContext; // Error context
  timestamp: number; // Timestamp
  recovered: boolean; // Whether error was recovered
  reported: boolean; // Whether error was reported
}

/**
 * Recovery action definition
 */
export interface RecoveryAction {
  label: string; // Button text
  action: () => void | Promise<void>; // Recovery function
  primary?: boolean; // Is primary action
}

/**
 * Error handler configuration
 */
export interface ErrorHandlerConfig {
  enableLogging: boolean; // Enable error logging
  enableReporting: boolean; // Enable error reporting
  enableNotifications: boolean; // Enable user notifications
  maxLogSize: number; // Maximum error logs to keep
  autoRecovery: boolean; // Enable automatic recovery attempts
  reportUrl?: string; // URL for error reporting endpoint
}

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

/**
 * Base application error
 */
export class AppError extends Error {
  constructor(
    message: string,
    public category: ErrorCategory,
    public severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    public recoverable: boolean = true,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace?.(this, AppError);
  }
}

/**
 * Storage-related errors
 */
export class StorageCriticalError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      message,
      ErrorCategory.STORAGE,
      ErrorSeverity.HIGH,
      false,
      originalError
    );
    this.name = 'StorageCriticalError';
  }
}

export class StorageRecoverableError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      message,
      ErrorCategory.STORAGE,
      ErrorSeverity.LOW,
      true,
      originalError
    );
    this.name = 'StorageRecoverableError';
  }
}

/**
 * Timer-related errors
 */
export class TimerError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      message,
      ErrorCategory.TIMER,
      ErrorSeverity.MEDIUM,
      true,
      originalError
    );
    this.name = 'TimerError';
  }
}

/**
 * Validation errors
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message, ErrorCategory.VALIDATION, ErrorSeverity.LOW, true);
    this.name = 'ValidationError';
  }
}

/**
 * Network errors
 */
export class NetworkError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(
      message,
      ErrorCategory.NETWORK,
      ErrorSeverity.MEDIUM,
      true,
      originalError
    );
    this.name = 'NetworkError';
  }
}

/**
 * Permission errors
 */
export class PermissionError extends AppError {
  constructor(
    message: string,
    public permissionType: string
  ) {
    super(message, ErrorCategory.PERMISSION, ErrorSeverity.MEDIUM, false);
    this.name = 'PermissionError';
  }
}

// ============================================================================
// ERROR HANDLER SERVICE
// ============================================================================

/**
 * Error Handler Service
 *
 * Central service for handling all application errors
 */
class ErrorHandlerService {
  private config: ErrorHandlerConfig;
  private errorLogs: ErrorLog[] = [];
  private errorCallbacks: Array<(error: ErrorLog) => void> = [];
  private recoveryStrategies: Map<ErrorCategory, RecoveryAction[]> = new Map();

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableReporting: false,
      enableNotifications: true,
      maxLogSize: 100,
      autoRecovery: true,
      ...config,
    };

    this.initializeRecoveryStrategies();
  }

  /**
   * Initialize recovery strategies for different error categories
   */
  private initializeRecoveryStrategies(): void {
    // Storage recovery strategies
    this.recoveryStrategies.set(ErrorCategory.STORAGE, [
      {
        label: 'Retry',
        action: async () => {
          // Default retry logic
          window.location.reload();
        },
        primary: true,
      },
      {
        label: 'Clear Data',
        action: () => {
          if (confirm('This will clear all local data. Continue?')) {
            localStorage.clear();
            indexedDB.deleteDatabase('pomodoro-db');
            window.location.reload();
          }
        },
      },
    ]);

    // Timer recovery strategies
    this.recoveryStrategies.set(ErrorCategory.TIMER, [
      {
        label: 'Reset Timer',
        action: () => {
          window.dispatchEvent(new CustomEvent('timer:reset'));
        },
        primary: true,
      },
      {
        label: 'Skip Session',
        action: () => {
          window.dispatchEvent(new CustomEvent('timer:skip'));
        },
      },
    ]);

    // Permission recovery strategies
    this.recoveryStrategies.set(ErrorCategory.PERMISSION, [
      {
        label: 'Request Permission',
        action: async () => {
          // Trigger permission request
          window.dispatchEvent(new CustomEvent('permission:request'));
        },
        primary: true,
      },
    ]);

    // Network recovery strategies
    this.recoveryStrategies.set(ErrorCategory.NETWORK, [
      {
        label: 'Retry',
        action: async () => {
          window.location.reload();
        },
        primary: true,
      },
      {
        label: 'Work Offline',
        action: () => {
          // Enable offline mode
          window.dispatchEvent(new CustomEvent('app:offline'));
        },
      },
    ]);
  }

  /**
   * Handle an error
   */
  handleError(
    error: Error | AppError | unknown,
    context: ErrorContext = {}
  ): ErrorLog {
    // Normalize error
    const normalizedError = this.normalizeError(error);
    const appError = normalizedError as AppError;

    // Create error log
    const errorLog: ErrorLog = {
      id: this.generateErrorId(),
      message: this.getUserFriendlyMessage(appError),
      technicalMessage: appError.message,
      category: appError.category || ErrorCategory.UNKNOWN,
      severity: appError.severity || ErrorSeverity.MEDIUM,
      stack: appError.stack,
      context: {
        ...context,
        timestamp: context.timestamp || Date.now(),
      },
      timestamp: Date.now(),
      recovered: false,
      reported: false,
    };

    // Log error
    if (this.config.enableLogging) {
      this.logError(errorLog);
    }

    // Show user notification
    if (this.config.enableNotifications) {
      this.showErrorNotification(errorLog);
    }

    // Report error
    if (this.config.enableReporting) {
      this.reportError(errorLog);
    }

    // Store error log
    this.addErrorLog(errorLog);

    // Notify callbacks
    this.notifyCallbacks(errorLog);

    // Attempt recovery
    if (this.config.autoRecovery && appError.recoverable !== false) {
      this.attemptRecovery(errorLog);
    }

    return errorLog;
  }

  /**
   * Handle async error (Promise rejection)
   */
  handleAsyncError(error: unknown, context: ErrorContext = {}): ErrorLog {
    return this.handleError(error, {
      ...context,
      action: context.action || 'async_operation',
    });
  }

  /**
   * Normalize error to AppError
   */
  private normalizeError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      // Categorize standard errors
      const message = error.message.toLowerCase();

      // Storage errors
      if (
        message.includes('storage') ||
        message.includes('quota') ||
        message.includes('indexeddb')
      ) {
        if (message.includes('quota')) {
          return new StorageCriticalError('Storage space full', error);
        }
        return new StorageRecoverableError('Storage operation failed', error);
      }

      // Network errors
      if (message.includes('network') || message.includes('fetch')) {
        return new NetworkError('Network request failed', error);
      }

      // Permission errors
      if (message.includes('permission')) {
        return new PermissionError('Permission denied', 'unknown');
      }

      // Generic error
      return new AppError(
        error.message,
        ErrorCategory.UNKNOWN,
        ErrorSeverity.MEDIUM,
        true,
        error
      );
    }

    // Handle non-error objects
    const message = String(error);
    return new AppError(
      message || 'Unknown error occurred',
      ErrorCategory.UNKNOWN,
      ErrorSeverity.MEDIUM
    );
  }

  /**
   * Get user-friendly error message
   */
  private getUserFriendlyMessage(error: AppError): string {
    const friendlyMessages: Record<ErrorCategory, string> = {
      [ErrorCategory.STORAGE]:
        'Unable to save your data. Your changes may be lost.',
      [ErrorCategory.NETWORK]:
        'Unable to connect. Please check your internet connection.',
      [ErrorCategory.TIMER]: 'Timer encountered an issue. Please try again.',
      [ErrorCategory.VALIDATION]: 'Please check your input and try again.',
      [ErrorCategory.UI]: 'Display error. Please refresh the page.',
      [ErrorCategory.INITIALIZATION]:
        'Failed to start the application. Please refresh.',
      [ErrorCategory.PERMISSION]:
        'You need to grant permission for this feature.',
      [ErrorCategory.UNKNOWN]: 'Something went wrong. Please try again.',
    };

    return friendlyMessages[error.category] || error.message;
  }

  /**
   * Log error to console
   */
  private logError(errorLog: ErrorLog): void {
    const logMethod = this.getLogLevel(errorLog.severity);
    const logMessage = `[${errorLog.category.toUpperCase()}] ${errorLog.technicalMessage}`;

    console[logMethod](logMessage, {
      id: errorLog.id,
      context: errorLog.context,
      stack: errorLog.stack,
    });
  }

  /**
   * Get console log method based on severity
   */
  private getLogLevel(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'log';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'error';
    }
  }

  /**
   * Show error notification to user
   */
  private showErrorNotification(errorLog: ErrorLog): void {
    // Dispatch custom event for UI components to listen
    window.dispatchEvent(
      new CustomEvent('error:occurred', {
        detail: {
          error: errorLog,
          recoveryActions: this.getRecoveryActions(errorLog.category),
        },
      })
    );
  }

  /**
   * Report error to monitoring service
   */
  private reportError(errorLog: ErrorLog): void {
    if (!this.config.reportUrl) return;

    // In a real implementation, send to monitoring service
    // Example: Sentry, LogRocket, custom endpoint
    fetch(this.config.reportUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorLog),
    }).catch(() => {
      // Silently fail - don't create infinite error loop
    });

    errorLog.reported = true;
  }

  /**
   * Add error to logs
   */
  private addErrorLog(errorLog: ErrorLog): void {
    this.errorLogs.push(errorLog);

    // Keep only recent errors
    if (this.errorLogs.length > this.config.maxLogSize) {
      this.errorLogs.shift();
    }

    // Persist to localStorage for debugging
    try {
      const recentLogs = this.errorLogs.slice(-10); // Keep last 10
      localStorage.setItem('pomodoro_error_logs', JSON.stringify(recentLogs));
    } catch {
      // Ignore storage errors
    }
  }

  /**
   * Get recovery actions for error category
   */
  private getRecoveryActions(category: ErrorCategory): RecoveryAction[] {
    return this.recoveryStrategies.get(category) || [];
  }

  /**
   * Attempt automatic error recovery
   */
  private attemptRecovery(errorLog: ErrorLog): void {
    const actions = this.getRecoveryActions(errorLog.category);

    // For auto-recovery, only use primary action
    const primaryAction = actions.find((a) => a.primary);

    if (primaryAction) {
      try {
        primaryAction.action();
        errorLog.recovered = true;
      } catch (error) {
        // Recovery failed - log but don't crash
        console.error('Recovery failed:', error);
      }
    }
  }

  /**
   * Notify all error callbacks
   */
  private notifyCallbacks(errorLog: ErrorLog): void {
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(errorLog);
      } catch {
        // Don't let callback errors propagate
      }
    });
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Register error callback
   */
  onError(callback: (error: ErrorLog) => void): () => void {
    this.errorCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.errorCallbacks.indexOf(callback);
      if (index > -1) {
        this.errorCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get recent error logs
   */
  getErrorLogs(limit?: number): ErrorLog[] {
    if (limit) {
      return this.errorLogs.slice(-limit);
    }
    return [...this.errorLogs];
  }

  /**
   * Clear error logs
   */
  clearErrorLogs(): void {
    this.errorLogs = [];
    try {
      localStorage.removeItem('pomodoro_error_logs');
    } catch {
      // Ignore
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Global error handler instance
 */
let errorHandlerInstance: ErrorHandlerService | null = null;

/**
 * Get or create error handler instance
 */
export function getErrorHandler(
  config?: Partial<ErrorHandlerConfig>
): ErrorHandlerService {
  if (!errorHandlerInstance) {
    errorHandlerInstance = new ErrorHandlerService(config);
  }
  return errorHandlerInstance;
}

/**
 * Reset error handler (useful for testing)
 */
export function resetErrorHandler(): void {
  errorHandlerInstance = null;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Handle error with default handler
 */
export function handleError(
  error: Error | AppError | unknown,
  context?: ErrorContext
): ErrorLog {
  return getErrorHandler().handleError(error, context);
}

/**
 * Handle async error
 */
export function handleAsyncError(
  error: unknown,
  context?: ErrorContext
): ErrorLog {
  return getErrorHandler().handleAsyncError(error, context);
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context?: ErrorContext
): T {
  return ((...args: any[]) => {
    try {
      const result = fn(...args);

      // Handle promises
      if (result instanceof Promise) {
        return result.catch((error) => {
          handleAsyncError(error, context);
          throw error; // Re-throw for caller to handle
        });
      }

      return result;
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  }) as T;
}

/**
 * Create error handler for specific component
 */
export function createComponentErrorHandler(componentName: string) {
  return {
    handle: (error: Error | unknown, action?: string) => {
      return handleError(error, {
        component: componentName,
        action,
      });
    },
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ErrorHandlerService;
export { ErrorHandlerService };
