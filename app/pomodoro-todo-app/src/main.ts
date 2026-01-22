/**
 * Main Entry Point
 *
 * Application bootstrap and initialization
 */

import { createApp, destroyApp, setApp } from './App';
import './styles/main.css';

// ============================================================================
// APPLICATION CONFIGURATION
// ============================================================================

const APP_CONFIG = {
  // Enable debug mode in development
  debug: import.meta.env.DEV ?? true,

  // Storage type (local for localStorage, memory for in-memory)
  storageType: 'local' as const,

  // Auto-save configuration
  autoSave: true,
  autoSaveDebounceMs: 2000,

  // Enable keyboard shortcuts
  enableKeyboardShortcuts: true,

  // Enable notifications
  enableNotifications: true
};

// ============================================================================
// GLOBAL APP INSTANCE
// ============================================================================

let appInstance: Awaited<ReturnType<typeof createApp>> | null = null;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the application
 */
async function initApp(): Promise<void> {
  try {
    console.log('Pomodoro Todo App - Initializing...');

    // Create and initialize app
    appInstance = await createApp(APP_CONFIG);

    // Set as global instance
    setApp(appInstance);

    console.log('Pomodoro Todo App - Ready!');

    // Emit app ready event
    window.dispatchEvent(new CustomEvent('app:ready'));

  } catch (error) {
    console.error('Failed to initialize app:', error);

    // Show error to user
    showInitError(error instanceof Error ? error.message : String(error));
  }
}

/**
 * Show initialization error
 */
function showInitError(message: string): void {
  const root = document.getElementById('app');
  if (!root) return;

  root.innerHTML = `
    <div class="init-error">
      <div class="init-error-content">
        <h2>Initialization Failed</h2>
        <p>${escapeHtml(message)}</p>
        <button onclick="location.reload()">Try Again</button>
      </div>
    </div>
  `;
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// LIFECYCLE HANDLERS
// ============================================================================

/**
 * Handle page visibility changes
 */
function handleVisibilityChange(): void {
  if (document.hidden) {
    console.log('App hidden - pausing non-essential operations');
  } else {
    console.log('App visible - resuming operations');
  }
}

/**
 * Handle beforeunload
 */
function handleBeforeUnload(e: BeforeUnloadEvent): void {
  // Cancel any ongoing operations
  console.log('App unloading...');

  // Note: Modern browsers ignore custom messages
  // but we still return a string for older browsers
  const hasUnsavedWork = appInstance?.getStore().getTimerState() !== 'idle';

  if (hasUnsavedWork) {
    e.preventDefault();
    e.returnValue = '';
  }
}

/**
 * Handle online/offline status
 */
function handleOnlineStatus(): void {
  if (navigator.onLine) {
    console.log('App back online');
    document.body.classList.remove('offline');
  } else {
    console.log('App went offline');
    document.body.classList.add('offline');
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Global error handler
 */
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

/**
 * Global unhandled promise rejection handler
 */
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// ============================================================================
// DOM READY
// ============================================================================

/**
 * Check if DOM is ready
 */
function isDomReady(): boolean {
  return document.readyState === 'complete' || document.readyState === 'interactive';
}

/**
 * Initialize when DOM is ready
 */
function onDomReady(): void {
  // Setup lifecycle handlers
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('online', handleOnlineStatus);
  window.addEventListener('offline', handleOnlineStatus);

  // Check initial online status
  handleOnlineStatus();

  // Initialize app
  initApp();
}

// ============================================================================
// BOOTSTRAP
// ============================================================================

if (isDomReady()) {
  // DOM already ready
  onDomReady();
} else {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onDomReady);
  } else {
    // Fallback: use timeout
    setTimeout(onDomReady, 0);
  }
}

// ============================================================================
// HOT MODULE REPLACEMENT (DEV ONLY)
// ============================================================================

if (import.meta.hot) {
  import.meta.hot.accept(async () => {
    console.log('HMR: Reloading app...');

    // Destroy current app
    if (appInstance) {
      appInstance.destroy();
      appInstance = null;
    }

    // Reinitialize
    await initApp();
  });
}

// ============================================================================
// EXPORTS FOR EXTERNAL USE
// ============================================================================

export { initApp, destroyApp };
export type { AppConfig } from './App';

// Also export as global for debugging
if (APP_CONFIG.debug) {
  (window as any).app = {
    init: initApp,
    destroy: () => {
      if (appInstance) {
        appInstance.destroy();
        appInstance = null;
      }
    },
    getInstance: () => appInstance,
    getStore: () => appInstance?.getStore(),
    getTimer: () => appInstance?.getTimerController(),
    getUI: () => appInstance?.getUIController(),
    getKeyboard: () => appInstance?.getKeyboardManager()
  };
  console.log('Debug mode: app available at window.app');
}
