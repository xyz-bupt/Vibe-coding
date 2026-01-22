/**
 * Unit tests for Storage Service
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InMemoryStorageService, createTask, createSession, StorageError } from '../../src/services/storage';
import { Task, Session, TaskPriority, TaskStatus, SessionType } from '../../src/types';

describe('InMemoryStorageService', () => {
  let storage: InMemoryStorageService;

  beforeEach(() => {
    storage = new InMemoryStorageService();
  });

  afterEach(() => {
    storage.clear();
  });

  describe('Task operations', () => {
    it('should get empty tasks array initially', async () => {
      const tasks = await storage.getTasks();
      expect(tasks).toEqual([]);
    });

    it('should save and retrieve a task', async () => {
      const task: Task = {
        id: 'task-1',
        title: 'Test Task',
        description: 'Description',
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO,
        estimatedPomodoros: 2,
        completedPomodoros: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await storage.saveTask(task);
      const tasks = await storage.getTasks();

      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toEqual(task);
    });

    it('should update existing task', async () => {
      const task: Task = {
        id: 'task-1',
        title: 'Original Title',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        completedPomodoros: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await storage.saveTask(task);

      // Update task
      const updatedTask = { ...task, title: 'Updated Title' };
      await storage.saveTask(updatedTask);

      const tasks = await storage.getTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].title).toBe('Updated Title');
    });

    it('should delete a task', async () => {
      const task: Task = {
        id: 'task-1',
        title: 'Test Task',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        completedPomodoros: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await storage.saveTask(task);
      await storage.deleteTask('task-1');

      const tasks = await storage.getTasks();
      expect(tasks).toHaveLength(0);
    });

    it('should get task by ID', async () => {
      const task: Task = {
        id: 'task-1',
        title: 'Test Task',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        completedPomodoros: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await storage.saveTask(task);
      const retrieved = await storage.getTask('task-1');

      expect(retrieved).toEqual(task);
    });

    it('should return null for non-existent task', async () => {
      const retrieved = await storage.getTask('non-existent');
      expect(retrieved).toBeNull();
    });
  });

  describe('Session operations', () => {
    it('should get empty sessions array initially', async () => {
      const sessions = await storage.getSessions();
      expect(sessions).toEqual([]);
    });

    it('should save and retrieve sessions', async () => {
      const session: Session = {
        id: 'session-1',
        taskId: 'task-1',
        type: SessionType.WORK,
        duration: 1500,
        actualDuration: 1500,
        startedAt: Date.now(),
        completedAt: Date.now() + 1500000,
        wasCompleted: true,
        wasSkipped: false
      };

      await storage.saveSession(session);
      const sessions = await storage.getSessions();

      expect(sessions).toHaveLength(1);
      expect(sessions[0]).toEqual(session);
    });

    it('should get sessions by task ID', async () => {
      const session1: Session = {
        id: 'session-1',
        taskId: 'task-1',
        type: SessionType.WORK,
        duration: 1500,
        actualDuration: 1500,
        startedAt: Date.now(),
        completedAt: Date.now() + 1500000,
        wasCompleted: true,
        wasSkipped: false
      };

      const session2: Session = {
        id: 'session-2',
        taskId: 'task-2',
        type: SessionType.WORK,
        duration: 1500,
        actualDuration: 1500,
        startedAt: Date.now(),
        completedAt: Date.now() + 1500000,
        wasCompleted: true,
        wasSkipped: false
      };

      await storage.saveSession(session1);
      await storage.saveSession(session2);

      const task1Sessions = await storage.getSessionsByTask('task-1');
      expect(task1Sessions).toHaveLength(1);
      expect(task1Sessions[0].id).toBe('session-1');
    });

    it('should get sessions by date range', async () => {
      const now = Date.now();

      const session1: Session = {
        id: 'session-1',
        taskId: 'task-1',
        type: SessionType.WORK,
        duration: 1500,
        actualDuration: 1500,
        startedAt: now - 2000000,
        completedAt: now - 500000,
        wasCompleted: true,
        wasSkipped: false
      };

      const session2: Session = {
        id: 'session-2',
        taskId: 'task-2',
        type: SessionType.WORK,
        duration: 1500,
        actualDuration: 1500,
        startedAt: now + 500000,
        completedAt: now + 2000000,
        wasCompleted: true,
        wasSkipped: false
      };

      await storage.saveSession(session1);
      await storage.saveSession(session2);

      // Query for recent sessions
      const range = now - 1000000;
      const sessions = await storage.getSessionsByDateRange(range, now + 3000000);

      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('session-2');
    });

    it('should get latest sessions', async () => {
      const now = Date.now();

      for (let i = 0; i < 5; i++) {
        const session: Session = {
          id: `session-${i}`,
          taskId: 'task-1',
          type: SessionType.WORK,
          duration: 1500,
          actualDuration: 1500,
          startedAt: now - (5 - i) * 1000000,
          completedAt: now - (5 - i) * 1000000 + 1500000,
          wasCompleted: true,
          wasSkipped: false
        };
        await storage.saveSession(session);
      }

      const latest = await storage.getLatestSessions(3);

      expect(latest).toHaveLength(3);
      // Should be ordered by startedAt descending
      expect(latest[0].id).toBe('session-4');
      expect(latest[1].id).toBe('session-3');
      expect(latest[2].id).toBe('session-2');
    });
  });

  describe('Settings operations', () => {
    it('should get default settings', async () => {
      const settings = await storage.getSettings();

      expect(settings.workDuration).toBe(1500);
      expect(settings.shortBreakDuration).toBe(300);
      expect(settings.longBreakDuration).toBe(900);
      expect(settings.longBreakInterval).toBe(4);
    });

    it('should update settings partially', async () => {
      await storage.saveSettings({ workDuration: 1800 });

      const settings = await storage.getSettings();
      expect(settings.workDuration).toBe(1800);
      expect(settings.shortBreakDuration).toBe(300); // unchanged
    });

    it('should update multiple settings', async () => {
      await storage.saveSettings({
        workDuration: 1800,
        volume: 0.5,
        autoStartBreak: true
      });

      const settings = await storage.getSettings();
      expect(settings.workDuration).toBe(1800);
      expect(settings.volume).toBe(0.5);
      expect(settings.autoStartBreak).toBe(true);
    });
  });

  describe('Statistics operations', () => {
    it('should save and retrieve daily stats', async () => {
      const stats = {
        date: '2024-01-15',
        workSessions: 8,
        totalWorkTime: 14400,
        totalBreakTime: 3600,
        completedTasks: 3,
        longestStreak: 4
      };

      await storage.saveDailyStats(stats);
      const retrieved = await storage.getDailyStats('2024-01-15');

      expect(retrieved).toEqual(stats);
    });

    it('should return null for non-existent stats', async () => {
      const stats = await storage.getDailyStats('2024-01-15');
      expect(stats).toBeNull();
    });
  });

  describe('Clear operations', () => {
    it('should clear all data', async () => {
      const task: Task = {
        id: 'task-1',
        title: 'Test',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        completedPomodoros: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      await storage.saveTask(task);
      storage.clear();

      const tasks = await storage.getTasks();
      expect(tasks).toHaveLength(0);
    });
  });
});

describe('createTask factory', () => {
  it('should create task with default values', () => {
    const task = createTask();

    expect(task.id).toBeDefined();
    expect(task.title).toBe('New Task');
    expect(task.priority).toBe(TaskPriority.MEDIUM);
    expect(task.status).toBe(TaskStatus.TODO);
    expect(task.completedPomodoros).toBe(0);
  });

  it('should create task with custom values', () => {
    const task = createTask({
      title: 'Custom Task',
      priority: TaskPriority.HIGH,
      estimatedPomodoros: 4
    });

    expect(task.title).toBe('Custom Task');
    expect(task.priority).toBe(TaskPriority.HIGH);
    expect(task.estimatedPomodoros).toBe(4);
  });
});

describe('createSession factory', () => {
  it('should create session with default values', () => {
    const session = createSession();

    expect(session.id).toBeDefined();
    expect(session.type).toBe(SessionType.WORK);
    expect(session.duration).toBe(1500);
    expect(session.wasCompleted).toBe(false);
  });

  it('should create session with custom values', () => {
    const session = createSession({
      type: SessionType.SHORT_BREAK,
      duration: 300,
      taskId: 'task-1'
    });

    expect(session.type).toBe(SessionType.SHORT_BREAK);
    expect(session.duration).toBe(300);
    expect(session.taskId).toBe('task-1');
  });
});
