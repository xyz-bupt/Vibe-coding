/**
 * App - Main Application Class
 *
 * Responsibilities:
 * - Initialize all controllers and services
 * - Coordinate between components
 * - Setup event listeners
 * - Handle application lifecycle
 * - Manage keyboard shortcuts
 * - Initialize auto-save
 */

import { AppStore, initStore } from './store/AppStore';
import { TimerController } from './controllers/TimerController';
import { UIController } from './controllers/UIController';
import { KeyboardShortcutManager, DefaultShortcuts } from './services/keyboard';
import { AutoSaveManager } from './services/autoSave';
import { createStorageService } from './services/storage';
import { IStorageService } from './types/index';

/**
 * Application configuration
 */
export interface AppConfig {
  // Storage
  storageType?: 'local' | 'memory';

  // Auto-save
  autoSave?: boolean;
  autoSaveDebounceMs?: number;

  // Keyboard shortcuts
  enableKeyboardShortcuts?: boolean;

  // Notifications
  enableNotifications?: boolean;

  // Debug mode
  debug?: boolean;

  // Initial state
  initialState?: any;
}

/**
 * App - Main application class
 */
export class App {
  // Core services
  private store: AppStore;
  private storage: IStorageService;

  // Controllers
  private timerController: TimerController | null = null;
  private uiController: UIController | null = null;
  private keyboardManager: KeyboardShortcutManager | null = null;

  // Managers
  private autoSaveManager: AutoSaveManager | null = null;

  // State
  private initialized: boolean = false;
  private destroyed: boolean = false;
  private config: Required<AppConfig>;

  // Cleanup functions
  private cleanupFunctions: Array<() => void> = [];

  /**
   * Constructor
   */
  constructor(config: AppConfig = {}) {
    // Merge config with defaults
    this.config = {
      storageType: config.storageType ?? 'local',
      autoSave: config.autoSave ?? true,
      autoSaveDebounceMs: config.autoSaveDebounceMs ?? 2000,
      enableKeyboardShortcuts: config.enableKeyboardShortcuts ?? true,
      enableNotifications: config.enableNotifications ?? true,
      debug: config.debug ?? false,
      initialState: config.initialState,
    };

    // Initialize storage
    this.storage = createStorageService(this.config.storageType);

    // Initialize store
    this.store = initStore(this.config.initialState);

    this.log('App created');
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  /**
   * Initialize the application
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.log('App already initialized');
      return;
    }

    if (this.destroyed) {
      throw new Error('Cannot initialize destroyed app');
    }

    this.log('Initializing app...');

    try {
      // Set loading state
      this.store.setLoading(true);

      // Step 1: Load saved data
      await this.loadSavedData();

      // Step 2: Initialize controllers
      this.initializeControllers();

      // Step 3: Setup keyboard shortcuts
      if (this.config.enableKeyboardShortcuts) {
        this.setupKeyboardShortcuts();
      }

      // Step 4: Setup event listeners
      this.setupEventListeners();

      // Step 5: Initialize auto-save
      if (this.config.autoSave) {
        this.initializeAutoSave();
      }

      // Step 6: Setup theme
      this.initializeTheme();

      // Clear loading state
      this.store.setLoading(false);

      this.initialized = true;
      this.log('App initialized successfully');
    } catch (error) {
      this.store.setLoading(false);
      this.store.setError(`Initialization failed: ${error}`);
      console.error('Failed to initialize app:', error);
      throw error;
    }
  }

  /**
   * Load saved data from storage
   */
  private async loadSavedData(): Promise<void> {
    this.log('Loading saved data...');

    try {
      // Load tasks
      const tasks = await this.storage.getTasks();
      this.log(`Loaded ${tasks.length} tasks`);

      // Load sessions
      const sessions = await this.storage.getSessions();
      this.log(`Loaded ${sessions.length} sessions`);

      // Load settings
      const settings = await this.storage.getSettings();
      this.log('Loaded settings');

      // Load stats
      const today = new Date().toISOString().split('T')[0];
      const todayStats = await this.storage.getDailyStats(today);
      if (todayStats) {
        this.log("Loaded today's statistics");
      }

      // Update store with loaded data
      // Note: In a real app, you would merge this with initial state
      // and handle migrations if needed
    } catch (error) {
      this.log('Failed to load saved data', error);
      // Don't throw - allow app to start with empty state
    }
  }

  /**
   * Initialize controllers
   */
  private initializeControllers(): void {
    this.log('Initializing controllers...');

    // Initialize TimerController
    this.timerController = new TimerController({
      store: this.store,
      onTick: (remainingTime) => {
        // UI will update via store subscription
        this.debugLog(`Timer tick: ${remainingTime}s remaining`);
      },
      onSessionComplete: (sessionType) => {
        this.log(`Session completed: ${sessionType}`);
        // UI will show notification via timer events
      },
      notificationEnabled: this.config.enableNotifications,
      soundEnabled: true,
    });

    // Initialize UIController
    this.uiController = new UIController({
      store: this.store,
      autoBind: true,
      enableAnimations: true,
    });

    this.log('Controllers initialized');
  }

  /**
   * Setup keyboard shortcuts
   */
  private setupKeyboardShortcuts(): void {
    this.log('Setting up keyboard shortcuts...');

    this.keyboardManager = new KeyboardShortcutManager();

    // Register default shortcuts
    DefaultShortcuts.register(this.keyboardManager, {
      startPauseTimer: () => this.handleStartPauseTimer(),
      newTask: () => this.handleNewTask(),
      completeTask: () => this.handleCompleteTask(),
      nextTask: () => this.handleNextTask(),
      previousTask: () => this.handlePreviousTask(),
      openSettings: () => this.handleOpenSettings(),
      resetTimer: () => this.handleResetTimer(),
      skipSession: () => this.handleSkipSession(),
      toggleTimer: () => this.handleToggleTimer(),
      deleteTask: () => this.handleDeleteTask(),
      editTask: () => this.handleEditTask(),
      focusSearch: () => this.handleFocusSearch(),
      toggleSidebar: () => this.handleToggleSidebar(),
    });

    this.log('Keyboard shortcuts registered');
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.log('Setting up event listeners...');

    // Timer events
    window.addEventListener('timer:start', () => {
      this.timerController?.start();
    });

    window.addEventListener('timer:pause', () => {
      this.timerController?.pause();
    });

    window.addEventListener('timer:reset', () => {
      this.timerController?.reset();
    });

    window.addEventListener('timer:skip', () => {
      this.timerController?.skip();
    });

    // Task events
    window.addEventListener('task:activate', (e: any) => {
      const taskId = e.detail?.taskId;
      if (taskId) {
        this.store.setActiveTask(taskId);
      }
    });

    window.addEventListener('task:complete', (e: any) => {
      const taskId = e.detail?.taskId;
      if (taskId) {
        this.store.completeTask(taskId);
      }
    });

    window.addEventListener('task:delete', (e: any) => {
      const taskId = e.detail?.taskId;
      if (taskId) {
        this.store.deleteTask(taskId);
      }
    });

    // Window visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.log('App hidden');
      } else {
        this.log('App visible');
      }
    });

    // Window before unload
    window.addEventListener('beforeunload', () => {
      this.log('App before unload');
      this.cleanup();
    });

    this.log('Event listeners setup complete');
  }

  /**
   * Initialize auto-save
   */
  private initializeAutoSave(): void {
    this.log('Initializing auto-save...');

    this.autoSaveManager = new AutoSaveManager(this.store, {
      enabled: true,
      debounceMs: this.config.autoSaveDebounceMs,
      onSave: () => {
        this.debugLog('Auto-save completed');
      },
      onError: (error) => {
        console.error('Auto-save failed:', error);
      },
    });

    this.autoSaveManager.start();

    this.log('Auto-save initialized');
  }

  /**
   * Initialize theme
   */
  private initializeTheme(): void {
    this.log('Initializing theme...');

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;

    if (savedTheme) {
      this.uiController?.setTheme(savedTheme);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      this.uiController?.setTheme(prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        this.uiController?.setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);

    this.cleanupFunctions.push(() => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    });
  }

  // ==========================================================================
  // KEYBOARD SHORTCUT HANDLERS
  // ==========================================================================

  private async handleStartPauseTimer(): Promise<void> {
    const state = this.store.getTimerState();
    if (state === 'idle' || state === 'paused') {
      await this.timerController?.start();
    } else {
      await this.timerController?.pause();
    }
  }

  private handleToggleTimer(): void {
    this.timerController?.toggle();
  }

  private handleResetTimer(): void {
    this.timerController?.reset();
  }

  private handleSkipSession(): void {
    this.timerController?.skip();
  }

  private handleNewTask(): void {
    this.uiController?.showAddTaskModal();
  }

  private async handleCompleteTask(): Promise<void> {
    const activeTask = this.store.getActiveTask();
    if (activeTask) {
      await this.store.completeTask(activeTask.id);
      this.uiController?.showToast('Task completed!', 'success');
    } else {
      this.uiController?.showToast('No active task', 'info');
    }
  }

  private async handleNextTask(): Promise<void> {
    const tasks = this.store.getTasks();
    const activeTask = this.store.getActiveTask();

    if (tasks.length === 0) return;

    const currentIndex = activeTask
      ? tasks.findIndex((t) => t.id === activeTask.id)
      : -1;

    const nextIndex = (currentIndex + 1) % tasks.length;
    await this.store.setActiveTask(tasks[nextIndex].id);
    this.uiController?.showToast(
      `Activated: ${tasks[nextIndex].title}`,
      'info'
    );
  }

  private async handlePreviousTask(): Promise<void> {
    const tasks = this.store.getTasks();
    const activeTask = this.store.getActiveTask();

    if (tasks.length === 0) return;

    const currentIndex = activeTask
      ? tasks.findIndex((t) => t.id === activeTask.id)
      : 0;

    const prevIndex = currentIndex <= 0 ? tasks.length - 1 : currentIndex - 1;
    await this.store.setActiveTask(tasks[prevIndex].id);
    this.uiController?.showToast(
      `Activated: ${tasks[prevIndex].title}`,
      'info'
    );
  }

  private handleDeleteTask(): void {
    const activeTask = this.store.getActiveTask();
    if (activeTask) {
      this.store.deleteTask(activeTask.id);
      this.uiController?.showToast('Task deleted', 'info');
    }
  }

  private handleEditTask(): void {
    const activeTask = this.store.getActiveTask();
    if (activeTask) {
      this.uiController?.showEditTaskModal(activeTask);
    }
  }

  private handleOpenSettings(): void {
    this.uiController?.showModal(document.getElementById('settings-modal')!);
  }

  private handleFocusSearch(): void {
    const searchInput = document.getElementById(
      'search-input'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
    }
  }

  private handleToggleSidebar(): void {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed');
    }
  }

  // ==========================================================================
  // PUBLIC API
  // ==========================================================================

  /**
   * Get the store instance
   */
  getStore(): AppStore {
    return this.store;
  }

  /**
   * Get the timer controller
   */
  getTimerController(): TimerController | null {
    return this.timerController;
  }

  /**
   * Get the UI controller
   */
  getUIController(): UIController | null {
    return this.uiController;
  }

  /**
   * Get the keyboard manager
   */
  getKeyboardManager(): KeyboardShortcutManager | null {
    return this.keyboardManager;
  }

  /**
   * Check if app is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get app configuration
   */
  getConfig(): Readonly<Required<AppConfig>> {
    return this.config;
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.log('Cleaning up...');

    // Stop auto-save
    if (this.autoSaveManager) {
      this.autoSaveManager.stop();
      this.autoSaveManager.destroy();
      this.autoSaveManager = null;
    }

    // Destroy timer controller
    if (this.timerController) {
      this.timerController.destroy();
      this.timerController = null;
    }

    // Destroy UI controller
    if (this.uiController) {
      this.uiController.destroy();
      this.uiController = null;
    }

    // Destroy keyboard manager
    if (this.keyboardManager) {
      this.keyboardManager.destroy();
      this.keyboardManager = null;
    }

    // Run cleanup functions
    this.cleanupFunctions.forEach((fn) => {
      try {
        fn();
      } catch (error) {
        console.error('Error in cleanup function:', error);
      }
    });
    this.cleanupFunctions = [];

    this.log('Cleanup complete');
  }

  /**
   * Destroy the app
   */
  destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.log('Destroying app...');
    this.cleanup();
    this.destroyed = true;
    this.log('App destroyed');
  }

  // ==========================================================================
  // LOGGING
  // ==========================================================================

  private log(message: string, error?: any): void {
    if (this.config.debug) {
      console.log(`[App] ${message}`, error ?? '');
    }
  }

  private debugLog(message: string): void {
    if (this.config.debug) {
      console.debug(`[App] ${message}`);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default App;

/**
 * Create and initialize an app instance
 */
export async function createApp(config?: AppConfig): Promise<App> {
  const app = new App(config);
  await app.initialize();
  return app;
}

/**
 * Get the singleton app instance
 */
let appInstance: App | null = null;

export function getApp(): App {
  if (!appInstance) {
    throw new Error('App not initialized. Call createApp() first.');
  }
  return appInstance;
}

export function setApp(app: App): void {
  appInstance = app;
}

export function destroyApp(): void {
  if (appInstance) {
    appInstance.destroy();
    appInstance = null;
  }
}
