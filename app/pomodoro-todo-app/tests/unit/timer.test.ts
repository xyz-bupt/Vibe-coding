/**
 * Unit tests for PomodoroTimer
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PomodoroTimer } from '../../src/services/timer';
import { TimerState, TimerEventType, SessionType } from '../../src/types';

describe('PomodoroTimer', () => {
  let timer: PomodoroTimer;

  beforeEach(() => {
    // Use fake timers for testing
    vi.useFakeTimers();
    timer = new PomodoroTimer();
  });

  afterEach(() => {
    timer.dispose();
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize in IDLE state', () => {
      expect(timer.getState()).toBe(TimerState.IDLE);
    });

    it('should have zero remaining time when idle', () => {
      expect(timer.getRemainingTime()).toBe(0);
    });

    it('should have zero progress when idle', () => {
      expect(timer.getProgress()).toBe(0);
    });

    it('should accept custom settings', () => {
      const customTimer = new PomodoroTimer({
        workDuration: 1800, // 30 minutes
        shortBreakDuration: 600 // 10 minutes
      });

      expect(customTimer.getSettings().workDuration).toBe(1800);
      expect(customTimer.getSettings().shortBreakDuration).toBe(600);

      customTimer.dispose();
    });
  });

  describe('Starting a work session', () => {
    it('should start a work session successfully', async () => {
      await timer.start('work');

      expect(timer.getState()).toBe(TimerState.WORKING);
      expect(timer.getRemainingTime()).toBeGreaterThan(0);
      expect(timer.getRemainingTime()).toBeLessThanOrEqual(1500); // 25 minutes
    });

    it('should emit STARTED event when starting', async () => {
      const callback = vi.fn();
      timer.subscribe(callback);

      await timer.start('work');

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TimerEventType.STARTED,
          state: TimerState.WORKING
        })
      );
    });

    it('should throw error when starting while already running', async () => {
      await timer.start('work');

      await expect(timer.start('work')).rejects.toThrow('already running');
    });

    it('should associate task with session', async () => {
      const task = {
        id: 'task-1',
        title: 'Test Task',
        priority: 'medium' as const,
        status: 'todo' as const,
        completedPomodoros: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await timer.start('work', task);

      expect(timer.getCurrentTask()).toEqual(task);
    });
  });

  describe('Starting a break session', () => {
    it('should start a short break session', async () => {
      await timer.start('short_break');

      expect(timer.getState()).toBe(TimerState.SHORT_BREAK);
      expect(timer.getSessionType()).toBe(SessionType.SHORT_BREAK);
    });

    it('should start a long break session', async () => {
      await timer.start('long_break');

      expect(timer.getState()).toBe(TimerState.LONG_BREAK);
      expect(timer.getSessionType()).toBe(SessionType.LONG_BREAK);
    });
  });

  describe('Pausing and resuming', () => {
    it('should pause a running timer', async () => {
      await timer.start('work');
      timer.pause();

      expect(timer.getState()).toBe(TimerState.PAUSED);
    });

    it('should emit PAUSED event when pausing', async () => {
      const callback = vi.fn();
      timer.subscribe(callback);

      await timer.start('work');
      timer.pause();

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TimerEventType.PAUSED,
          state: TimerState.PAUSED
        })
      );
    });

    it('should resume a paused timer', async () => {
      await timer.start('work');
      timer.pause();
      timer.resume();

      expect(timer.getState()).toBe(TimerState.WORKING);
    });

    it('should emit RESUMED event when resuming', async () => {
      const callback = vi.fn();
      timer.subscribe(callback);

      await timer.start('work');
      timer.pause();
      timer.resume();

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TimerEventType.RESUMED,
          state: TimerState.WORKING
        })
      );
    });

    it('should throw error when pausing while idle', () => {
      expect(() => timer.pause()).toThrow('not running');
    });

    it('should throw error when resuming while not paused', async () => {
      await timer.start('work');

      expect(() => timer.resume()).toThrow('not paused');
    });
  });

  describe('Timer completion', () => {
    it('should complete after duration elapses', async () => {
      const callback = vi.fn();
      timer.subscribe(callback);

      // Start a short 1-second timer
      await timer.start('work', null, 1);

      // Fast-forward time
      vi.advanceTimersByTime(1100); // 1 second + 100ms buffer

      expect(timer.getState()).toBe(TimerState.IDLE);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TimerEventType.COMPLETED
        })
      );
    });

    it('should increment completed work sessions', async () => {
      await timer.start('work', null, 1);
      vi.advanceTimersByTime(1100);

      expect(timer.getCompletedWorkSessions()).toBe(1);
    });

    it('should increment task completed pomodoros', async () => {
      const task = {
        id: 'task-1',
        title: 'Test Task',
        priority: 'medium' as const,
        status: 'todo' as const,
        completedPomodoros: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await timer.start('work', task, 1);
      vi.advanceTimersByTime(1100);

      expect(task.completedPomodoros).toBe(1);
    });
  });

  describe('Resetting', () => {
    it('should reset to idle state', async () => {
      await timer.start('work');
      timer.reset();

      expect(timer.getState()).toBe(TimerState.IDLE);
      expect(timer.getRemainingTime()).toBe(0);
    });

    it('should emit RESET event', async () => {
      const callback = vi.fn();
      timer.subscribe(callback);

      await timer.start('work');
      timer.reset();

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TimerEventType.RESET,
          state: TimerState.IDLE
        })
      );
    });
  });

  describe('Skipping', () => {
    it('should skip current session', async () => {
      const callback = vi.fn();
      timer.subscribe(callback);

      await timer.start('work');
      timer.skip();

      expect(timer.getState()).toBe(TimerState.IDLE);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TimerEventType.SKIPPED
        })
      );
    });
  });

  describe('Progress calculation', () => {
    it('should calculate progress correctly', async () => {
      await timer.start('work', null, 100); // 100 seconds

      // Advance halfway
      vi.advanceTimersByTime(50000);

      const progress = timer.getProgress();
      expect(progress).toBeGreaterThan(0.4);
      expect(progress).toBeLessThan(0.6);
    });

    it('should return 0 progress when idle', () => {
      expect(timer.getProgress()).toBe(0);
    });

    it('should return progress between 0 and 1', async () => {
      await timer.start('work', null, 100);

      vi.advanceTimersByTime(50000);

      const progress = timer.getProgress();
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(1);
    });
  });

  describe('State queries', () => {
    it('should correctly identify running state', async () => {
      expect(timer.isRunning()).toBe(false);

      await timer.start('work');
      expect(timer.isRunning()).toBe(true);

      timer.pause();
      expect(timer.isRunning()).toBe(false);
    });

    it('should correctly identify paused state', async () => {
      expect(timer.isPaused()).toBe(false);

      await timer.start('work');
      timer.pause();

      expect(timer.isPaused()).toBe(true);
    });

    it('should correctly identify idle state', () => {
      expect(timer.isIdle()).toBe(true);

      timer.start('work').catch(() => {});
      expect(timer.isIdle()).toBe(false);
    });
  });

  describe('Long break calculation', () => {
    it('should return short_break for first session', () => {
      expect(timer.getNextBreakType()).toBe('short_break');
    });

    it('should return long_break after 4 work sessions', async () => {
      // Complete 3 work sessions
      for (let i = 0; i < 3; i++) {
        await timer.start('work', null, 1);
        vi.advanceTimersByTime(1100);
      }

      expect(timer.getNextBreakType()).toBe('long_break');
    });

    it('should cycle back to short_break after long break', async () => {
      // Complete 4 work sessions
      for (let i = 0; i < 4; i++) {
        await timer.start('work', null, 1);
        vi.advanceTimersByTime(1100);
      }

      expect(timer.getNextBreakType()).toBe('short_break');
    });
  });

  describe('Settings update', () => {
    it('should update settings', () => {
      timer.updateSettings({ workDuration: 1800 });

      expect(timer.getSettings().workDuration).toBe(1800);
    });

    it('should preserve other settings when updating partially', () => {
      const originalShortBreak = timer.getSettings().shortBreakDuration;

      timer.updateSettings({ workDuration: 1800 });

      expect(timer.getSettings().shortBreakDuration).toBe(originalShortBreak);
    });
  });

  describe('Observer pattern', () => {
    it('should notify multiple observers', async () => {
      const observer1 = vi.fn();
      const observer2 = vi.fn();

      timer.subscribe(observer1);
      timer.subscribe(observer2);

      await timer.start('work');

      expect(observer1).toHaveBeenCalled();
      expect(observer2).toHaveBeenCalled();
    });

    it('should unsubscribe observer when unsubscribe function is called', async () => {
      const observer = vi.fn();
      const unsubscribe = timer.subscribe(observer);

      unsubscribe();
      await timer.start('work');

      expect(observer).not.toHaveBeenCalled();
    });

    it('should handle observer errors gracefully', async () => {
      const errorObserver = vi.fn(() => {
        throw new Error('Observer error');
      });
      const successObserver = vi.fn();

      timer.subscribe(errorObserver);
      timer.subscribe(successObserver);

      // Should not throw despite error in observer
      await expect(timer.start('work')).resolves.not.toThrow();
      expect(successObserver).toHaveBeenCalled();
    });
  });

  describe('Session data', () => {
    it('should return null session data when idle', () => {
      expect(timer.getSessionData()).toBeNull();
    });

    it('should return correct session data when running', async () => {
      const task = {
        id: 'task-1',
        title: 'Test Task',
        priority: 'medium' as const,
        status: 'todo' as const,
        completedPomodoros: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await timer.start('work', task, 1500);

      const sessionData = timer.getSessionData();
      expect(sessionData).toEqual({
        type: SessionType.WORK,
        duration: 1500,
        startedAt: expect.any(Number),
        completedAt: null,
        taskId: 'task-1'
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle zero duration gracefully', async () => {
      await timer.start('work', null, 0);

      vi.advanceTimersByTime(100);

      expect(timer.getState()).toBe(TimerState.IDLE);
    });

    it('should handle rapid state transitions', async () => {
      await timer.start('work');
      timer.pause();
      timer.resume();
      timer.pause();
      timer.reset();

      expect(timer.getState()).toBe(TimerState.IDLE);
    });

    it('should handle disposal while running', async () => {
      await timer.start('work');

      expect(() => timer.dispose()).not.toThrow();
    });
  });

  describe('Custom duration', () => {
    it('should use custom duration when provided', async () => {
      await timer.start('work', null, 600);

      expect(timer.getTotalDuration()).toBe(600);
    });

    it('should use default duration when custom not provided', async () => {
      await timer.start('work');

      expect(timer.getTotalDuration()).toBe(1500);
    });
  });
});
