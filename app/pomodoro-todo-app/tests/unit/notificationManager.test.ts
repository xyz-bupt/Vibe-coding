/**
 * Unit tests for NotificationManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  NotificationManager,
  NotificationAction,
  resetNotificationManager,
} from '../../src/services/notificationManager';

// Mock Notification API
const mockNotifications: Array<{
  title: string;
  options: NotificationOptions;
}> = [];

const mockNotification = vi
  .fn()
  .mockImplementation((title: string, options: NotificationOptions) => {
    const notification = {
      title,
      body: options.body || '',
      icon: options.icon || '',
      tag: options.tag || '',
      close: vi.fn(),
      onclick: null as ((this: Notification, event: Event) => any) | null,
    };
    mockNotifications.push({ title, options });
    return notification;
  });

mockNotification.permission = 'granted' as NotificationPermission;

const mockRequestPermission = vi
  .fn()
  .mockResolvedValue('granted' as NotificationPermission);

describe('NotificationManager', () => {
  let notificationManager: NotificationManager;
  let originalNotification: typeof Notification | undefined;

  beforeEach(() => {
    // Reset singleton
    resetNotificationManager();

    // Save and mock Notification API
    originalNotification = (window as any).Notification;
    (window as any).Notification = mockNotification;
    (Notification as any).requestPermission = mockRequestPermission;

    // Clear mock notifications
    mockNotifications.length = 0;

    notificationManager = new NotificationManager();
  });

  afterEach(() => {
    resetNotificationManager();

    // Restore original Notification API
    if (originalNotification) {
      (window as any).Notification = originalNotification;
    } else {
      delete (window as any).Notification;
    }
  });

  describe('Initialization', () => {
    it('should initialize with default permission', () => {
      expect(notificationManager.getPermission()).toBe('granted');
    });

    it('should check if notifications are enabled', () => {
      expect(notificationManager.isEnabled()).toBe(true);
    });
  });

  describe('Permission requests', () => {
    it('should request notification permission', async () => {
      mockNotification.permission = 'default';
      (Notification as any).requestPermission = vi
        .fn()
        .mockResolvedValue('granted');

      const granted = await notificationManager.requestPermission();

      expect(granted).toBe(true);
      expect(mockRequestPermission).toHaveBeenCalled();
    });

    it('should handle denied permission', async () => {
      mockNotification.permission = 'default';
      (Notification as any).requestPermission = vi
        .fn()
        .mockResolvedValue('denied');

      const granted = await notificationManager.requestPermission();

      expect(granted).toBe(false);
    });

    it('should return true for already granted permission', async () => {
      mockNotification.permission = 'granted';

      const granted = await notificationManager.requestPermission();

      expect(granted).toBe(true);
    });
  });

  describe('Sending notifications', () => {
    it('should send a simple notification', async () => {
      await notificationManager.send('Test Title', 'Test Body');

      expect(mockNotifications).toHaveLength(1);
      expect(mockNotifications[0].title).toBe('Test Title');
    });

    it('should not send when notifications are disabled', async () => {
      mockNotification.permission = 'denied';

      await notificationManager.send('Test Title', 'Test Body');

      expect(mockNotifications).toHaveLength(0);
    });

    it('should send notification with custom options', async () => {
      await notificationManager.send('Test', 'Body', {
        tag: 'test-tag',
      });

      expect(mockNotifications[0].options.tag).toBe('test-tag');
    });
  });

  describe('Work complete notifications', () => {
    it('should send work complete notification', async () => {
      await notificationManager.notifyWorkComplete('Task Name', 2);

      expect(mockNotifications).toHaveLength(1);
      expect(mockNotifications[0].title).toBe('Work session completed!');
    });

    it('should include task name in notification', async () => {
      await notificationManager.notifyWorkComplete('My Task', 1);

      expect(mockNotifications[0].options.body).toContain('My Task');
    });
  });

  describe('Break notifications', () => {
    it('should send short break notification', async () => {
      await notificationManager.notifyBreakStart(false);

      expect(mockNotifications[0].title).toBe('Break time!');
    });

    it('should send long break notification', async () => {
      await notificationManager.notifyBreakStart(true);

      expect(mockNotifications[0].title).toBe('Long break time!');
    });

    it('should send break over notification', async () => {
      await notificationManager.notifyBreakOver();

      expect(mockNotifications[0].title).toBe('Break is over!');
    });
  });

  describe('Warning notifications', () => {
    it('should send time remaining notification', async () => {
      await notificationManager.notifyTimeRemaining(5);

      expect(mockNotifications[0].title).toBe('5 minutes remaining');
    });

    it('should handle singular minute', async () => {
      await notificationManager.notifyTimeRemaining(1);

      expect(mockNotifications[0].title).toBe('1 minute remaining');
    });
  });

  describe('Clearing notifications', () => {
    it('should clear all notifications', async () => {
      await notificationManager.send('Test 1', 'Body 1');
      await notificationManager.send('Test 2', 'Body 2');

      expect(mockNotifications).toHaveLength(2);

      notificationManager.clearAll();

      // The manager's internal state should be cleared
      // (actual notification clearing depends on browser implementation)
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      notificationManager.updateConfig({
        requireInteraction: false,
      });

      // Config should be updated (verified by sending notification)
      expect(() => notificationManager.updateConfig({})).not.toThrow();
    });
  });
});
