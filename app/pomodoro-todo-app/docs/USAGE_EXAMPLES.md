# Pomodoro Timer - Usage Examples

This document provides comprehensive examples for using the Pomodoro Timer core modules.

## Table of Contents

1. [Basic Timer Usage](#basic-timer-usage)
2. [Timer Controller Integration](#timer-controller-integration)
3. [Audio Manager](#audio-manager)
4. [Notification Manager](#notification-manager)
5. [Storage Service](#storage-service)
6. [Complete Workflow Example](#complete-workflow-example)

---

## Basic Timer Usage

### Creating a Timer Instance

```typescript
import { PomodoroTimer, createPomodoroTimer } from './src/services/timer';

// Method 1: Direct instantiation
const timer = new PomodoroTimer({
  workDuration: 1500,        // 25 minutes
  shortBreakDuration: 300,   // 5 minutes
  longBreakDuration: 900,    // 15 minutes
  longBreakInterval: 4       // Long break after 4 work sessions
});

// Method 2: Factory function
const timer = createPomodoroTimer({
  workDuration: 1800  // Custom 30-minute work sessions
});
```

### Starting a Work Session

```typescript
// Start a work session without a task
await timer.start('work');

// Start a work session with a task
const task = {
  id: 'task-123',
  title: 'Complete project documentation',
  priority: 'high' as const,
  status: 'todo' as const,
  completedPomodoros: 0,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

await timer.start('work', task);

// Start with custom duration (10 minutes)
await timer.start('work', task, 600);
```

### Pausing and Resuming

```typescript
// Pause the timer
timer.pause();

// Resume the timer
timer.resume();

// Check if paused
if (timer.isPaused()) {
  console.log('Timer is paused');
}
```

### Getting Timer State

```typescript
// Get current state
const state = timer.getState();
// Returns: 'idle' | 'working' | 'short_break' | 'long_break' | 'paused'

// Get remaining time in seconds
const remaining = timer.getRemainingTime();
console.log(`${Math.floor(remaining / 60)} minutes remaining`);

// Get progress (0-1)
const progress = timer.getProgress();
console.log(`${Math.round(progress * 100)}% complete`);

// Get current task
const currentTask = timer.getCurrentTask();
console.log(`Working on: ${currentTask?.title}`);
```

### Subscribing to Timer Events

```typescript
// Subscribe to all timer events
const unsubscribe = timer.subscribe((event) => {
  console.log('Event:', event.type, 'State:', event.state);

  switch (event.type) {
    case 'started':
      console.log('Timer started!');
      break;
    case 'completed':
      console.log('Timer completed!');
      break;
    case 'paused':
      console.log('Timer paused');
      break;
  }
});

// Unsubscribe when done
unsubscribe();
```

### Reset and Skip

```typescript
// Reset timer to idle state
timer.reset();

// Skip current session
timer.skip();
```

---

## Timer Controller Integration

The `TimerController` provides high-level orchestration of timer, storage, notifications, and audio.

### Setting Up the Controller

```typescript
import { TimerController, createTimerController } from './src/services/timerController';
import { LocalStorageService } from './src/services/storage';

// Create storage service
const storage = new LocalStorageService();

// Create controller
const controller = new TimerController({
  storage,
  settings: {
    workDuration: 1500,
    notificationEnabled: true,
    soundEnabled: true
  }
});

// Or use the factory function
const controller = await createTimerController(storage);
```

### Starting Work Sessions

```typescript
const task = {
  id: 'task-1',
  title: 'Feature implementation',
  priority: 'high' as const,
  status: 'todo' as const,
  completedPomodoros: 0,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

// Start a work session
await controller.startWorkSession(task);

// Start with custom duration
await controller.startWorkSession(task, 1800); // 30 minutes
```

### Break Sessions

```typescript
// Start a short break
await controller.startShortBreak();

// Start a long break
await controller.startLongBreak();

// Auto-start appropriate break
await controller.autoStartBreak();
```

### Managing Settings

```typescript
// Update volume
controller.setVolume(0.5);

// Toggle sound
controller.toggleSound();

// Toggle notifications
controller.toggleNotifications();

// Update multiple settings
await controller.updateSettings({
  workDuration: 1800,
  autoStartBreak: true,
  longBreakInterval: 3
});
```

### Getting Session History

```typescript
// Get recent sessions
const recentSessions = await controller.getRecentSessions(10);

// Get sessions for a specific task
const taskSessions = await controller.getSessionsForTask('task-1');

// Display session info
recentSessions.forEach(session => {
  console.log(`${session.type}: ${session.duration}s - ${new Date(session.startedAt).toLocaleString()}`);
});
```

### Subscribing to Events

```typescript
const unsubscribe = controller.subscribe((event) => {
  if (event.type === 'completed') {
    if (event.sessionType === 'work') {
      console.log('Work session completed!');

      // Get completion stats
      const completedCount = controller.getTimer().getCompletedWorkSessions();
      console.log(`Total work sessions: ${completedCount}`);
    }
  }
});
```

### Cleanup

```typescript
// Always dispose when done
controller.dispose();
```

---

## Audio Manager

### Basic Usage

```typescript
import { AudioManager, getAudioManager } from './src/services/audioManager';

// Get singleton instance
const audio = getAudioManager();

// Or create new instance
const audio = new AudioManager();
```

### Playing Sounds

```typescript
// Play start sound
audio.playStartSound();

// Play completion sound
audio.playCompleteSound();

// Play break start sound
audio.playBreakStartSound();

// Play pause sound
audio.playPauseSound();
```

### Volume Control

```typescript
// Set volume (0-1)
audio.setVolume(0.5); // 50% volume

// Get current volume
const volume = audio.getVolume();

// Mute
audio.mute();

// Unmute
audio.unmute();

// Toggle mute
audio.toggleMute();

// Check if muted
if (audio.isMutedState()) {
  console.log('Audio is muted');
}
```

### Custom Sounds

```typescript
import { SoundType } from './src/services/audioManager';

// Set custom sound for a type
audio.setCustomSound(SoundType.COMPLETE, '/sounds/ding.mp3');

// Load a custom sound
audio.loadSound(SoundType.START, '/sounds/custom-start.mp3');
```

### Beep Sounds (Web Audio API Fallback)

```typescript
// Play a beep tone
audio.playBeep(800, 0.1); // 800Hz for 0.1 seconds

// Play a sequence of beeps
audio.playBeepSequence([
  [800, 0.1],
  [600, 0.1],
  [400, 0.2]
]);
```

---

## Notification Manager

### Basic Usage

```typescript
import { NotificationManager, getNotificationManager } from './src/services/notificationManager';

// Get singleton instance
const notifications = getNotificationManager();
```

### Requesting Permission

```typescript
// Request permission
const granted = await notifications.requestPermission();

if (granted) {
  console.log('Notifications enabled!');
} else {
  console.log('Notifications denied');
}

// Check permission status
const permission = notifications.getPermission();
// Returns: 'default' | 'granted' | 'denied'
```

### Sending Notifications

```typescript
// Simple notification
await notifications.send(
  'Timer Started',
  'Work session has begun'
);

// With options
await notifications.send(
  'Break Time!',
  'Take a 5-minute break',
  {
    requireInteraction: true,
    tag: 'break-notification'
  }
);

// With action buttons
await notifications.sendWithAction(
  'Session Complete',
  'Great work! Ready for a break?',
  'skip',
  (action) => {
    if (action === 'skip') {
      console.log('User clicked skip');
    }
  }
);

// Multiple actions
await notifications.sendWithActions(
  'Break Over',
  'Time to get back to work!',
  ['resume', 'stop'],
  (action) => {
    console.log('User action:', action);
  }
);
```

### Predefined Notifications

```typescript
// Work complete notification
await notifications.notifyWorkComplete('Task name', 3);

// Break start notification
await notifications.notifyBreakStart(false); // false = short break
await notifications.notifyBreakStart(true);  // true = long break

// Break over notification
await notifications.notifyBreakOver();

// Time remaining warning
await notifications.notifyTimeRemaining(5); // 5 minutes
```

### Clearing Notifications

```typescript
// Clear all notifications
notifications.clearAll();

// Clear specific notification by ID
notifications.clear('notification-id-123');
```

---

## Storage Service

### Basic Usage

```typescript
import {
  LocalStorageService,
  InMemoryStorageService,
  createStorageService
} from './src/services/storage';

// LocalStorage implementation
const storage = new LocalStorageService();

// In-memory implementation (for testing)
const memoryStorage = new InMemoryStorageService();

// Factory function
const storage = createStorageService('local'); // or 'memory'
```

### Task Operations

```typescript
// Get all tasks
const tasks = await storage.getTasks();

// Get specific task
const task = await storage.getTask('task-id');

// Create new task
const newTask = {
  id: 'task-123',
  title: 'New Task',
  priority: 'medium' as const,
  status: 'todo' as const,
  completedPomodoros: 0,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

await storage.saveTask(newTask);

// Update task
newTask.status = 'completed';
await storage.saveTask(newTask);

// Delete task
await storage.deleteTask('task-123');
```

### Session Operations

```typescript
// Get all sessions
const sessions = await storage.getSessions();

// Get sessions for a task
const taskSessions = await storage.getSessionsByTask('task-123');

// Get sessions by date range
const start = new Date('2024-01-01').getTime();
const end = new Date('2024-01-31').getTime();
const januarySessions = await storage.getSessionsByDateRange(start, end);

// Get latest sessions
const recentSessions = await storage.getLatestSessions(10);

// Save a session
const session = {
  id: 'session-123',
  taskId: 'task-123',
  type: 'work' as const,
  duration: 1500,
  actualDuration: 1500,
  startedAt: Date.now(),
  completedAt: Date.now() + 1500000,
  wasCompleted: true,
  wasSkipped: false
};

await storage.saveSession(session);
```

### Settings Operations

```typescript
// Get settings
const settings = await storage.getSettings();

// Update settings
await storage.saveSettings({
  workDuration: 1800,
  volume: 0.8
});
```

### Statistics Operations

```typescript
// Get daily stats
const stats = await storage.getDailyStats('2024-01-15');

// Save daily stats
await storage.saveDailyStats({
  date: '2024-01-15',
  workSessions: 8,
  totalWorkTime: 14400,
  totalBreakTime: 3600,
  completedTasks: 3,
  longestStreak: 4
});
```

### Data Export/Import

```typescript
// Export all data
const backup = await storage.exportData();
const jsonString = JSON.stringify(backup);

// Import data
await storage.importData(JSON.parse(jsonString));
```

---

## Complete Workflow Example

Here's a complete example showing a typical Pomodoro workflow:

```typescript
import { createTimerController } from './src/services/timerController';
import { LocalStorageService, createTask } from './src/services/storage';
import { formatTime } from './src/utils/timeFormat';
import { TaskPriority } from './src/types';

async function setupPomodoroApp() {
  // Initialize storage
  const storage = new LocalStorageService();

  // Create a task
  const task = createTask({
    title: 'Build Pomodoro Timer',
    priority: TaskPriority.HIGH,
    estimatedPomodoros: 4
  });

  await storage.saveTask(task);

  // Create controller
  const controller = await createTimerController(storage, {
    settings: {
      workDuration: 1500,      // 25 minutes
      shortBreakDuration: 300, // 5 minutes
      longBreakDuration: 900,  // 15 minutes
      notificationEnabled: true,
      soundEnabled: true
    }
  });

  // Subscribe to timer updates for UI
  const unsubscribe = controller.subscribe((event) => {
    const timer = controller.getTimer();
    const remaining = timer.getRemainingTime();
    const progress = timer.getProgress();

    // Update UI
    updateDisplay(formatTime(remaining), progress);

    // Handle events
    switch (event.type) {
      case 'started':
        console.log('Session started!');
        break;
      case 'completed':
        handleSessionComplete(event);
        break;
      case 'paused':
        showPauseButton();
        break;
    }
  });

  // Request notification permission
  await controller.requestNotificationPermission();

  return { controller, task, unsubscribe };
}

async function startWorkSession(controller: TimerController, task: Task) {
  await controller.startWorkSession(task);
  console.log(`Started working on: ${task.title}`);
}

function updateDisplay(timeString: string, progress: number) {
  // Update your UI
  document.getElementById('timer-display')!.textContent = timeString;
  document.getElementById('progress-bar')!.style.width = `${progress * 100}%`;
}

async function handleSessionComplete(event: TimerEvent) {
  if (event.sessionType === 'work') {
    console.log('Work session complete! Time for a break.');

    // Optionally auto-start break
    const settings = controller.getTimer().getSettings();
    if (settings.autoStartBreak) {
      await controller.autoStartBreak();
    }
  } else {
    console.log('Break complete! Ready to work?');
  }
}

// Usage
async function main() {
  const { controller, task, unsubscribe } = await setupPomodoroApp();

  // Start working
  await startWorkSession(controller, task);

  // Later, cleanup
  // unsubscribe();
  // controller.dispose();
}

main().catch(console.error);
```

---

## Error Handling

```typescript
try {
  await timer.start('work', task);
} catch (error) {
  if (error instanceof Error) {
    switch (error.message) {
      case 'Cannot start timer: already running':
        console.warn('Timer is already running');
        break;
      case 'Cannot pause: timer is not running':
        console.warn('Timer is not running');
        break;
      default:
        console.error('Unexpected error:', error);
    }
  }
}
```

---

## TypeScript Types Reference

Key types for type-safe development:

```typescript
import type {
  TimerState,
  TimerEvent,
  TimerEventType,
  SessionType,
  Task,
  Session,
  TimerSettings,
  TaskPriority,
  TaskStatus
} from './src/types';

// Timer state
const state: TimerState = 'working';

// Timer event handler
function handleEvent(event: TimerEvent): void {
  console.log(event.type, event.state);
}

// Session type
const sessionType: SessionType = 'work';

// Task priority
const priority: TaskPriority = 'high';
```
