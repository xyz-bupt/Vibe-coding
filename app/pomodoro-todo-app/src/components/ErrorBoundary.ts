/**
 * Error Boundary Component
 *
 * React-like error boundary for vanilla JavaScript.
 * Catches errors in child components and displays a fallback UI.
 *
 * Features:
 * - Catches runtime errors in component trees
 * - Displays user-friendly error messages
 * - Provides recovery actions
 * - Logs errors for monitoring
 */

import { ErrorLog, RecoveryAction, getErrorHandler } from '../services/errorHandler.js';

// ============================================================================
// ERROR BOUNDARY CONFIGURATION
// ============================================================================

export interface ErrorBoundaryConfig {
  /** Container element selector */
  container: string | HTMLElement;

  /** Fallback component to render on error */
  fallback?: ErrorFallback;

  /** Enable error logging */
  enableLogging?: boolean;

  /** Callback when error is caught */
  onError?: (error: ErrorLog) => void;

  /** Callback when error is recovered */
  onRecover?: () => void;
}

export interface ErrorFallback {
  render: (error: ErrorLog, recovery: RecoveryAction[]) => string;
  styles?: string;
}

// ============================================================================
// ERROR BOUNDARY CLASS
// ============================================================================

export class ErrorBoundary {
  private container: HTMLElement;
  private config: Required<ErrorBoundaryConfig>;
  private originalContent: string = '';
  private hasError: boolean = false;
  private currentError: ErrorLog | null = null;

  constructor(config: ErrorBoundaryConfig) {
    this.config = {
      container: '',
      enableLogging: true,
      onError: () => {},
      onRecover: () => {},
      ...config
    };

    // Get container element
    if (typeof this.config.container === 'string') {
      const element = document.querySelector(this.config.container);
      if (!element) {
        throw new Error(`Container not found: ${this.config.container}`);
      }
      this.container = element as HTMLElement;
    } else {
      this.container = this.config.container;
    }

    // Store original content
    this.originalContent = this.container.innerHTML;

    // Setup error handling
    this.setupErrorHandling();
  }

  /**
   * Setup error listeners
   */
  private setupErrorHandling(): void {
    // Listen for global error events
    window.addEventListener('error', (event) => {
      // Only handle errors from this container
      if (this.container.contains(event.target as Node)) {
        this.catchError(event.error);
      }
    });

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.catchError(event.reason);
    });

    // Listen for custom error events
    window.addEventListener('error:occurred', ((e: CustomEvent) => {
      this.showError(e.detail.error, e.detail.recoveryActions);
    }) as EventListener);
  }

  /**
   * Catch and handle error
   */
  private catchError(error: unknown): void {
    if (this.hasError) return; // Already in error state

    const errorHandler = getErrorHandler();
    const errorLog = errorHandler.handleError(error, {
      component: this.container.className || this.container.id || 'UnknownComponent'
    });

    this.hasError = true;
    this.currentError = errorLog;

    // Notify callback
    this.config.onError(errorLog);

    // Show error UI
    const recoveryActions = errorHandler['getRecoveryActions'](errorLog.category);
    this.showError(errorLog, recoveryActions);
  }

  /**
   * Show error UI
   */
  private showError(error: ErrorLog, recoveryActions: RecoveryAction[]): void {
    // Use custom fallback if provided
    if (this.config.fallback) {
      this.container.innerHTML = this.config.fallback.render(error, recoveryActions);
      return;
    }

    // Use default error UI
    this.container.innerHTML = this.renderDefaultErrorUI(error, recoveryActions);
    this.attachDefaultErrorHandlers(error, recoveryActions);
  }

  /**
   * Render default error UI
   */
  private renderDefaultErrorUI(error: ErrorLog, recoveryActions: RecoveryAction[]): string {
    const severityClass = this.getSeverityClass(error.severity);
    const icon = this.getErrorIcon(error.category);

    return `
      <div class="error-boundary ${severityClass}">
        <div class="error-boundary-content">
          <div class="error-icon">${icon}</div>
          <h2 class="error-title">Something went wrong</h2>
          <p class="error-message">${this.escapeHtml(error.message)}</p>

          ${error.severity === ErrorSeverity.CRITICAL ? `
            <div class="error-details">
              <details>
                <summary>Technical Details</summary>
                <pre><code>${this.escapeHtml(error.technicalMessage)}</code></pre>
                ${error.stack ? `<pre><code>${this.escapeHtml(error.stack)}</code></pre>` : ''}
              </details>
            </div>
          ` : ''}

          ${recoveryActions.length > 0 ? `
            <div class="error-actions">
              ${recoveryActions.map(action => `
                <button
                  class="error-action-btn ${action.primary ? 'primary' : ''}"
                  data-action="recover"
                >
                  ${this.escapeHtml(action.label)}
                </button>
              `).join('')}
              <button class="error-action-btn" data-action="reload">
                Reload Page
              </button>
            </div>
          ` : `
            <div class="error-actions">
              <button class="error-action-btn primary" data-action="reload">
                Reload Page
              </button>
              <button class="error-action-btn" data-action="dismiss">
                Dismiss
              </button>
            </div>
          `}

          <button class="error-close" data-action="dismiss" aria-label="Close">
            ×
          </button>
        </div>
      </div>

      <style>
        .error-boundary {
          position: relative;
          padding: 2rem;
          border-radius: 8px;
          margin: 1rem 0;
          background: var(--error-bg, #fee);
          border: 1px solid var(--error-border, #fcc);
        }

        .error-boundary.low {
          background: var(--warning-bg, #ffc);
          border-color: var(--warning-border, #fc9);
        }

        .error-boundary.medium {
          background: var(--error-bg, #fee);
          border-color: var(--error-border, #fcc);
        }

        .error-boundary.high,
        .error-boundary.critical {
          background: var(--critical-bg, #fdd);
          border-color: var(--critical-border, #f99);
        }

        .error-boundary-content {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          color: var(--error-title, #c33);
        }

        .error-message {
          font-size: 1rem;
          color: var(--error-text, #666);
          margin: 0 0 1.5rem 0;
          line-height: 1.5;
        }

        .error-details {
          margin: 1.5rem 0;
          text-align: left;
        }

        .error-details details {
          background: rgba(0, 0, 0, 0.05);
          padding: 1rem;
          border-radius: 4px;
        }

        .error-details summary {
          cursor: pointer;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .error-details pre {
          margin: 0.5rem 0 0 0;
          padding: 0.5rem;
          background: rgba(0, 0, 0, 0.03);
          border-radius: 4px;
          overflow-x: auto;
          font-size: 0.85rem;
        }

        .error-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .error-action-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          background: #fff;
          color: #333;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .error-action-btn:hover {
          background: #f5f5f5;
        }

        .error-action-btn.primary {
          background: #2196F3;
          color: #fff;
        }

        .error-action-btn.primary:hover {
          background: #1976D2;
        }

        .error-close {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 2rem;
          height: 2rem;
          border: none;
          background: none;
          font-size: 1.5rem;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.2s;
        }

        .error-close:hover {
          opacity: 1;
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .error-boundary {
            --error-bg: #3a1d1d;
            --error-border: #5c2b2b;
            --warning-bg: #3a3a1d;
            --warning-border: #5c5c2b;
            --critical-bg: #3a1d1d;
            --critical-border: #5c2b2b;
            --error-title: #ff6b6b;
            --error-text: #ccc;
          }

          .error-action-btn {
            background: #444;
            color: #fff;
          }

          .error-action-btn:hover {
            background: #555;
          }
        }
      </style>
    `;
  }

  /**
   * Attach event handlers for default error UI
   */
  private attachDefaultErrorHandlers(error: ErrorLog, recoveryActions: RecoveryAction[]): void {
    const container = this.container;

    container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const action = target.dataset.action;

      if (!action) return;

      switch (action) {
        case 'recover':
          e.preventDefault();
          const buttonIndex = Array.from(container.querySelectorAll('[data-action="recover"]')).indexOf(target);
          const recoveryAction = recoveryActions[buttonIndex];
          if (recoveryAction) {
            this.executeRecovery(recoveryAction);
          }
          break;

        case 'reload':
          e.preventDefault();
          window.location.reload();
          break;

        case 'dismiss':
          e.preventDefault();
          this.dismiss();
          break;
      }
    });
  }

  /**
   * Execute recovery action
   */
  private async executeRecovery(action: RecoveryAction): Promise<void> {
    try {
      await action.action();
      this.recover();
    } catch (error) {
      console.error('Recovery action failed:', error);
    }
  }

  /**
   * Recover from error
   */
  private recover(): void {
    this.hasError = false;
    this.currentError = null;
    this.container.innerHTML = this.originalContent;
    this.config.onRecover();
  }

  /**
   * Dismiss error UI without recovery
   */
  private dismiss(): void {
    this.hasError = false;
    this.currentError = null;
    this.container.innerHTML = this.originalContent;
  }

  /**
   * Get severity CSS class
   */
  private getSeverityClass(severity: string): string {
    switch (severity) {
      case 'low':
        return 'low';
      case 'medium':
        return 'medium';
      case 'high':
        return 'high';
      case 'critical':
        return 'critical';
      default:
        return 'medium';
    }
  }

  /**
   * Get error icon
   */
  private getErrorIcon(category: string): string {
    const icons: Record<string, string> = {
      storage: '💾',
      network: '🌐',
      timer: '⏰',
      validation: '⚠️',
      ui: '🖼️',
      initialization: '🚀',
      permission: '🔒',
      unknown: '❌'
    };

    return icons[category] || icons.unknown;
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Reset error boundary
   */
  reset(): void {
    this.hasError = false;
    this.currentError = null;
    this.originalContent = this.container.innerHTML;
  }

  /**
   * Destroy error boundary
   */
  destroy(): void {
    this.reset();
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

/**
 * Create error boundary for element
 */
export function createErrorBoundary(config: ErrorBoundaryConfig): ErrorBoundary {
  return new ErrorBoundary(config);
}

/**
 * Setup global error boundary
 */
export function setupGlobalErrorBoundary(): ErrorBoundary {
  return new ErrorBoundary({
    container: '#app',
    enableLogging: true,
    onError: (error) => {
      console.error('[ErrorBoundary] Error caught:', error);
    },
    onRecover: () => {
      console.log('[ErrorBoundary] Error recovered');
    }
  });
}

// ============================================================================
// TOAST NOTIFICATION SYSTEM
// ============================================================================

export class ErrorToast {
  private container: HTMLElement;
  private toasts: Map<string, HTMLElement> = new Map();

  constructor(container: string | HTMLElement = 'body') {
    if (typeof container === 'string') {
      this.container = document.querySelector(container) as HTMLElement;
      if (!this.container) {
        this.container = document.body;
      }
    } else {
      this.container = container;
    }

    this.setupContainer();
  }

  private setupContainer(): void {
    let toastContainer = document.getElementById('error-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'error-toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      this.container.appendChild(toastContainer);
    }
  }

  showError(error: ErrorLog, duration: number = 5000): void {
    const toast = this.createToast(error);
    const container = document.getElementById('error-toast-container')!;

    container.appendChild(toast);
    this.toasts.set(error.id, toast);

    // Auto-dismiss
    setTimeout(() => {
      this.dismiss(error.id);
    }, duration);
  }

  private createToast(error: ErrorLog): HTMLElement {
    const toast = document.createElement('div');
    toast.className = `error-toast error-toast-${error.severity}`;
    toast.innerHTML = `
      <div class="toast-icon">${this.getToastIcon(error.severity)}</div>
      <div class="toast-content">
        <div class="toast-message">${this.escapeHtml(error.message)}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    toast.style.cssText = `
      pointer-events: auto;
      min-width: 300px;
      max-width: 500px;
      padding: 1rem;
      border-radius: 8px;
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      display: flex;
      gap: 0.75rem;
      align-items: start;
      animation: slideIn 0.3s ease-out;
    `;

    return toast;
  }

  private getToastIcon(severity: string): string {
    switch (severity) {
      case 'low': return 'ℹ️';
      case 'medium': return '⚠️';
      case 'high': return '❌';
      case 'critical': return '🔥';
      default: return '⚠️';
    }
  }

  dismiss(errorId: string): void {
    const toast = this.toasts.get(errorId);
    if (toast) {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        toast.remove();
        this.toasts.delete(errorId);
      }, 300);
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .error-toast .toast-close {
    background: none;
    border: none;
    font-size: 1.25rem;
    cursor: pointer;
    opacity: 0.5;
    line-height: 1;
  }

  .error-toast .toast-close:hover {
    opacity: 1;
  }
`;

if (document.head) {
  document.head.appendChild(style);
}

export default ErrorBoundary;
