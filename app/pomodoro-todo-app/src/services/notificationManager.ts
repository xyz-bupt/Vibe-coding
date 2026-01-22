/**
 * Notification Manager for Pomodoro Timer
 * Handles browser notifications and user permission management
 */

/**
 * Notification action types
 */
export enum NotificationAction {
  RESUME = 'resume',
  SKIP = 'skip',
  PAUSE = 'pause',
  STOP = 'stop',
  VIEW_TASK = 'view_task'
}

/**
 * Notification configuration options
 */
interface NotificationConfig {
  requireInteraction: boolean;
  silent: boolean;
  icon: string;
  badge: string;
  tag?: string;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: unknown;
}

/**
 * Default notification configuration
 */
const DEFAULT_CONFIG: NotificationConfig = {
  requireInteraction: true,
  silent: false,
  icon: '/icons/timer-icon-192.png',
  badge: '/icons/badge-icon-72.png'
};

/**
 * Notification event callback type
 */
type NotificationCallback = (action: NotificationAction | null, notificationId: string) => void;

/**
 * Notification request with callback
 */
interface NotificationRequest {
  id: string;
  timestamp: number;
  callback?: NotificationCallback;
}

/**
 * NotificationManager class for handling all browser notifications
 * Supports permission management, custom actions, and click handling
 */
export class NotificationManager {
  private permission: NotificationPermission;
  private isSupported: boolean;
  private activeNotifications: Map<string, Notification>;
  private pendingRequests: Map<string, NotificationRequest>;
  private config: NotificationConfig;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null;

  constructor(config: Partial<NotificationConfig> = {}) {
    this.permission = 'default';
    this.isSupported = this.checkSupport();
    this.activeNotifications = new Map();
    this.pendingRequests = new Map();
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.serviceWorkerRegistration = null;

    if (this.isSupported) {
      this.permission = Notification.permission;
    }

    this.setupEventListeners();
    this.initServiceWorker();
  }

  /**
   * Check if browser supports notifications
   */
  private checkSupport(): boolean {
    return 'Notification' in window;
  }

  /**
   * Initialize service worker for enhanced notifications
   */
  private async initServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.ready;
      } catch {
        // Service worker not available, fall back to regular notifications
      }
    }
  }

  /**
   * Setup event listeners for notification interactions
   */
  private setupEventListeners(): void {
    if (!this.isSupported) {
      return;
    }

    // Handle notification clicks globally
    if ('serviceWorker' in navigator && this.serviceWorkerRegistration) {
      // Service worker handles notifications
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'NOTIFICATION_CLICK') {
          this.handleNotificationClick(event.data);
        }
      });
    } else {
      // Fallback: window click events for regular notifications
      window.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('notification-action')) {
          const action = target.dataset.action as NotificationAction;
          const notificationId = target.dataset.notificationId || '';
          this.handleNotificationClick({ action, notificationId });
        }
      });
    }
  }

  /**
   * Handle notification click events
   */
  private handleNotificationClick(data: { action: NotificationAction | null; notificationId: string }): void {
    const request = this.pendingRequests.get(data.notificationId);
    if (request?.callback) {
      request.callback(data.action, data.notificationId);
    }

    // Clean up
    this.activeNotifications.delete(data.notificationId);
    this.pendingRequests.delete(data.notificationId);

    // Focus window if action was taken
    if (data.action) {
      window.focus?.();
    }
  }

  /**
   * Request notification permission from user
   * @returns Promise resolving to true if permission granted
   */
  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Notifications not supported in this browser');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('Notification permission denied by user');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Check current permission status
   */
  public getPermission(): NotificationPermission {
    return this.permission;
  }

  /**
   * Check if notifications are enabled
   */
  public isEnabled(): boolean {
    return this.isSupported && this.permission === 'granted';
  }

  /**
   * Send a simple notification
   * @param title - Notification title
   * @param body - Notification body text
   * @param options - Additional notification options
   */
  public async send(
    title: string,
    body: string,
    options: Partial<NotificationConfig> = {}
  ): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const config = { ...this.config, ...options };
    const notificationId = this.generateId();

    try {
      if (this.serviceWorkerRegistration) {
        // Use service worker for notifications
        await this.sendViaServiceWorker(title, body, notificationId, config);
      } else {
        // Use standard Notification API
        this.sendViaAPI(title, body, notificationId, config);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * Send notification using standard Notification API
   */
  private sendViaAPI(
    title: string,
    body: string,
    id: string,
    config: NotificationConfig
  ): void {
    const notification = new Notification(title, {
      body,
      icon: config.icon,
      badge: config.badge,
      tag: config.tag || id,
      requireInteractive: config.requireInteraction,
      silent: config.silent,
      data: config.data
    });

    // Setup click handler
    notification.onclick = () => {
      window.focus?.();
      notification.close();
      this.activeNotifications.delete(id);
    };

    // Auto-close after delay (if not requiring interaction)
    if (!config.requireInteraction) {
      setTimeout(() => {
        notification.close();
        this.activeNotifications.delete(id);
      }, 5000);
    }

    this.activeNotifications.set(id, notification);
  }

  /**
   * Send notification via Service Worker
   */
  private async sendViaServiceWorker(
    title: string,
    body: string,
    id: string,
    config: NotificationConfig
  ): Promise<void> {
    if (!this.serviceWorkerRegistration) {
      return;
    }

    await this.serviceWorkerRegistration.showNotification(title, {
      body,
      icon: config.icon,
      badge: config.badge,
      tag: config.tag || id,
      requireInteraction: config.requireInteraction,
      silent: config.silent,
      data: { ...config.data, notificationId: id },
      actions: config.actions
    });
  }

  /**
   * Send notification with action buttons
   * @param title - Notification title
   * @param body - Notification body text
   * @param action - Action to register
   * @param callback - Callback when action is clicked
   */
  public async sendWithAction(
    title: string,
    body: string,
    action: NotificationAction,
    callback?: NotificationCallback
  ): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const notificationId = this.generateId();
    const actionConfig = this.getActionConfig(action);

    if (callback) {
      this.pendingRequests.set(notificationId, {
        id: notificationId,
        timestamp: Date.now(),
        callback
      });
    }

    await this.send(title, body, {
      actions: [actionConfig],
      tag: notificationId,
      data: { notificationId }
    });
  }

  /**
   * Send notification with multiple action buttons
   */
  public async sendWithActions(
    title: string,
    body: string,
    actions: NotificationAction[],
    callback?: NotificationCallback
  ): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const notificationId = this.generateId();
    const actionConfigs = actions.map((action) => this.getActionConfig(action));

    if (callback) {
      this.pendingRequests.set(notificationId, {
        id: notificationId,
        timestamp: Date.now(),
        callback
      });
    }

    await this.send(title, body, {
      actions: actionConfigs,
      tag: notificationId,
      data: { notificationId }
    });
  }

  /**
   * Get action configuration for a notification action type
   */
  private getActionConfig(action: NotificationAction): { action: string; title: string; icon?: string } {
    const configs: Record<NotificationAction, { action: string; title: string; icon?: string }> = {
      [NotificationAction.RESUME]: {
        action: 'resume',
        title: 'Resume',
        icon: '/icons/resume.png'
      },
      [NotificationAction.SKIP]: {
        action: 'skip',
        title: 'Skip',
        icon: '/icons/skip.png'
      },
      [NotificationAction.PAUSE]: {
        action: 'pause',
        title: 'Pause',
        icon: '/icons/pause.png'
      },
      [NotificationAction.STOP]: {
        action: 'stop',
        title: 'Stop',
        icon: '/icons/stop.png'
      },
      [NotificationAction.VIEW_TASK]: {
        action: 'view_task',
        title: 'View Task',
        icon: '/icons/task.png'
      }
    };

    return configs[action];
  }

  /**
   * Send a work session complete notification
   */
  public async notifyWorkComplete(taskName: string = '', pomodorosCompleted: number = 1): Promise<void> {
    const title = 'Work session completed!';
    const body = taskName
      ? `Great work on "${taskName}"! (${pomodorosCompleted} pomodoro${pomodorosCompleted > 1 ? 's' : ''})`
      : `Work session complete! (${pomodorosCompleted} pomodoro${pomodorosCompleted > 1 ? 's' : ''})`;

    await this.sendWithAction(title, body, NotificationAction.SKIP, (action) => {
      if (action === NotificationAction.SKIP) {
        // Skip to next session
        window.dispatchEvent(new CustomEvent('skip-timer'));
      }
    });
  }

  /**
   * Send a break start notification
   */
  public async notifyBreakStart(isLongBreak: boolean = false): Promise<void> {
    const title = isLongBreak ? 'Long break time!' : 'Break time!';
    const body = isLongBreak
      ? 'Take a longer break. You earned it!'
      : 'Time for a short break.';

    await this.send(title, body);
  }

  /**
   * Send a break over notification
   */
  public async notifyBreakOver(): Promise<void> {
    const title = 'Break is over!';
    const body = 'Ready to get back to work?';

    await this.sendWithAction(title, body, NotificationAction.RESUME, (action) => {
      if (action === NotificationAction.RESUME) {
        window.dispatchEvent(new CustomEvent('resume-timer'));
      }
    });
  }

  /**
   * Send a timer warning notification (e.g., 1 minute remaining)
   */
  public async notifyTimeRemaining(minutes: number): Promise<void> {
    const title = `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
    const body = `Your timer will end in ${minutes} minute${minutes > 1 ? 's' : ''}.`;

    await this.send(title, body, { requireInteraction: false });
  }

  /**
   * Clear all active notifications
   */
  public clearAll(): void {
    if (this.serviceWorkerRegistration) {
      this.serviceWorkerRegistration.getNotifications().then((notifications) => {
        notifications.forEach((notification) => notification.close());
      });
    }

    this.activeNotifications.forEach((notification) => {
      notification.close();
    });

    this.activeNotifications.clear();
    this.pendingRequests.clear();
  }

  /**
   * Clear a specific notification
   */
  public clear(id: string): void {
    const notification = this.activeNotifications.get(id);
    if (notification) {
      notification.close();
      this.activeNotifications.delete(id);
    }
    this.pendingRequests.delete(id);
  }

  /**
   * Update notification configuration
   */
  public updateConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Generate unique notification ID
   */
  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if notifications can be shown based on document visibility
   */
  public async shouldShowNotification(): Promise<boolean> {
    // Only show if document is hidden or permission is explicitly requested
    return document.hidden || this.isEnabled();
  }
}

/**
 * Singleton instance for global use
 */
let notificationManagerInstance: NotificationManager | null = null;

/**
 * Get or create the singleton NotificationManager instance
 */
export function getNotificationManager(): NotificationManager {
  if (!notificationManagerInstance) {
    notificationManagerInstance = new NotificationManager();
  }
  return notificationManagerInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetNotificationManager(): void {
  if (notificationManagerInstance) {
    notificationManagerInstance.clearAll();
  }
  notificationManagerInstance = null;
}

/**
 * Helper function to request notification permission immediately
 */
export async function requestNotificationPermission(): Promise<boolean> {
  const manager = getNotificationManager();
  return await manager.requestPermission();
}

/**
 * Helper function to check notification permission status
 */
export function checkNotificationPermission(): NotificationPermission {
  const manager = getNotificationManager();
  return manager.getPermission();
}
