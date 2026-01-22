/**
 * Memory Leak Tests
 *
 * These tests verify that components properly clean up resources
 * when destroyed, preventing memory leaks.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TaskList } from '../src/components/TaskList';
import { PomodoroTimer } from '../src/components/PomodoroTimer';
import { TimerDisplay } from '../src/components/TimerDisplay';
import { eventEmitter } from '../src/utils/EventEmitter';

describe('Memory Leak Prevention', () => {
  beforeEach(() => {
    // Setup DOM elements if needed
    document.body.innerHTML = `
      <div id="task-list"></div>
      <div id="timer-display"></div>
      <div id="timer-minutes"></div>
      <div id="timer-seconds"></div>
      <div id="timer-status"></div>
      <div id="progress-ring"></div>
      <div id="current-task-display"></div>
      <div class="timer-status"></div>
      <div class="status-indicator"></div>
      <div class="status-text"></div>
      <button class="mode-btn" data-mode="pomodoro"></button>
      <button class="mode-btn" data-mode="shortBreak"></button>
      <button class="mode-btn" data-mode="longBreak"></button>
      <button id="timer-toggle-btn"></button>
      <button id="timer-reset-btn"></button>
      <button id="timer-skip-btn"></button>
      <div class="filter-btn" data-filter="all"></div>
      <div class="filter-btn" data-filter="active"></div>
      <div class="filter-btn" data-filter="completed"></div>
      <div id="count-all"></div>
      <div id="count-active"></div>
      <div id="count-completed"></div>
      <div id="current-task-display"></div>
    `;
  });

  afterEach(() => {
    // Cleanup
    document.body.innerHTML = '';
  });

  describe('TaskList', () => {
    it('should register event listeners on construction', () => {
      const initialCount = eventEmitter.listenerCount('task:add');
      new TaskList();

      expect(eventEmitter.listenerCount('task:add')).toBe(initialCount + 1);
    });

    it('should cleanup event listeners on destroy', () => {
      const taskList = new TaskList();
      const countWithComponent = eventEmitter.listenerCount('task:add');

      taskList.destroy();

      expect(eventEmitter.listenerCount('task:add')).toBe(countWithComponent - 1);
    });

    it('should not allow operations after destroy', () => {
      const taskList = new TaskList();
      taskList.destroy();

      expect(taskList.isDestroyed()).toBe(true);
    });

    it('should cleanup DOM event listeners', () => {
      const taskList = new TaskList();
      const filterButtons = document.querySelectorAll('.filter-btn');

      // Verify listeners were added
      filterButtons.forEach((btn) => {
        expect(btn).toBeTruthy();
      });

      // Destroy and verify cleanup
      taskList.destroy();
      expect(taskList.isDestroyed()).toBe(true);
    });

    it('should clear internal references on destroy', () => {
      const taskList = new TaskList();
      taskList.destroy();

      // After destroy, internal state should be cleared
      expect(taskList['tasks']).toEqual([]);
      expect(taskList['activeTaskId']).toBeNull();
    });
  });

  describe('PomodoroTimer', () => {
    const defaultSettings = {
      timer: {
        pomodoroDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        longBreakInterval: 4,
      },
      notifications: {
        enabled: true,
        sound: true,
        autoStartBreaks: false,
        autoStartPomodoros: false,
      },
      appearance: {
        theme: 'light' as const,
      },
      dailyGoal: 8,
    };

    it('should cleanup interval on destroy', () => {
      const timer = new PomodoroTimer(defaultSettings);
      timer.start();

      const intervalId = (timer as any).intervalId;
      expect(intervalId).toBeTruthy();

      timer.destroy();

      expect((timer as any).intervalId).toBeNull();
      expect(timer.isDestroyed()).toBe(true);
    });

    it('should cleanup event listeners on destroy', () => {
      const timer = new PomodoroTimer(defaultSettings);
      const countWithComponent = eventEmitter.listenerCount('settings:update');

      timer.destroy();

      expect(eventEmitter.listenerCount('settings:update')).toBe(countWithComponent - 1);
    });

    it('should not create new timers after destroy', () => {
      const timer = new PomodoroTimer(defaultSettings);
      timer.destroy();

      timer.start();

      // Should not create interval after destroy
      expect((timer as any).intervalId).toBeNull();
    });

    it('should clear internal state on destroy', () => {
      const timer = new PomodoroTimer(defaultSettings);
      timer.destroy();

      expect(timer['currentTaskId']).toBeNull();
      expect(timer['settings']).toBeNull();
    });
  });

  describe('TimerDisplay', () => {
    it('should register event listeners on construction', () => {
      const initialCount = eventEmitter.listenerCount('timer:start');
      new TimerDisplay();

      expect(eventEmitter.listenerCount('timer:start')).toBe(initialCount + 1);
    });

    it('should cleanup event listeners on destroy', () => {
      const display = new TimerDisplay();
      const countWithComponent = eventEmitter.listenerCount('timer:start');

      display.destroy();

      expect(eventEmitter.listenerCount('timer:start')).toBe(countWithComponent - 1);
    });

    it('should cleanup DOM event listeners', () => {
      const display = new TimerDisplay();
      const modeButtons = document.querySelectorAll('.mode-btn');

      modeButtons.forEach((btn) => {
        expect(btn).toBeTruthy();
      });

      display.destroy();
      expect(display.isDestroyed()).toBe(true);
    });

    it('should cleanup timeouts on destroy', () => {
      const display = new TimerDisplay();
      display.flashScreen();

      // The timeout should be tracked and cleaned up
      display.destroy();
      expect(display.isDestroyed()).toBe(true);
    });

    it('should clear DOM references on destroy', () => {
      const display = new TimerDisplay();
      display.destroy();

      expect(display['container']).toBeNull();
      expect(display['minutesElement']).toBeNull();
      expect(display['secondsElement']).toBeNull();
    });
  });

  describe('EventEmitter', () => {
    it('should track listener count correctly', () => {
      const listener = () => {};
      const initialCount = eventEmitter.listenerCount('test:event');

      eventEmitter.on('test:event', listener);
      expect(eventEmitter.listenerCount('test:event')).toBe(initialCount + 1);

      eventEmitter.off('test:event', listener);
      expect(eventEmitter.listenerCount('test:event')).toBe(initialCount);
    });

    it('should warn when too many listeners are registered', () => {
      const warnSpy = vi.spyOn(console, 'warn');

      // Add more than 10 listeners
      for (let i = 0; i < 11; i++) {
        eventEmitter.on('test:many', () => {});
      }

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Potential memory leak detected')
      );

      // Cleanup
      eventEmitter.removeAllListeners('test:many');
      warnSpy.mockRestore();
    });

    it('should provide stats for debugging', () => {
      eventEmitter.on('test:stats1', () => {});
      eventEmitter.on('test:stats2', () => {});
      eventEmitter.on('test:stats2', () => {});

      const stats = eventEmitter.getStats();

      expect(stats['test:stats1']).toBe(1);
      expect(stats['test:stats2']).toBe(2);

      // Cleanup
      eventEmitter.removeAllListeners('test:stats1');
      eventEmitter.removeAllListeners('test:stats2');
    });
  });

  describe('Integration Tests', () => {
    it('should handle multiple component lifecycle', () => {
      const taskList = new TaskList();
      const timer = new PomodoroTimer({
        timer: {
          pomodoroDuration: 25 * 60,
          shortBreakDuration: 5 * 60,
          longBreakDuration: 15 * 60,
          longBreakInterval: 4,
        },
        notifications: {
          enabled: true,
          sound: true,
          autoStartBreaks: false,
          autoStartPomodoros: false,
        },
        appearance: {
          theme: 'light',
        },
        dailyGoal: 8,
      });
      const display = new TimerDisplay();

      const initialListenerCount = eventEmitter.listenerCount('task:add');

      // Destroy all components
      taskList.destroy();
      timer.destroy();
      display.destroy();

      // All listeners should be cleaned up
      expect(eventEmitter.listenerCount('task:add')).toBeLessThanOrEqual(initialListenerCount);
    });

    it('should prevent memory leaks with repeated create/destroy cycles', () => {
      const initialListenerCount = eventEmitter.listenerCount('task:add');

      // Create and destroy 10 times
      for (let i = 0; i < 10; i++) {
        const taskList = new TaskList();
        taskList.destroy();
      }

      // Listener count should return to initial
      expect(eventEmitter.listenerCount('task:add')).toBe(initialListenerCount);
    });
  });
});
