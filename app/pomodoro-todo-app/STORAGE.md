# Storage Layer Documentation

This document describes the data storage layer implementation for the Pomodoro To-Do application.

## Overview

The storage layer provides a unified, type-safe API for data persistence with automatic fallback support:

1. **IndexedDB** - Primary storage (modern browsers, non-private mode)
2. **LocalStorage** - Fallback storage (backup + IndexedDB unavailable)
3. **Memory** - Last resort (all storage unavailable)

## Architecture

```
src/services/
|- index.ts           # Public API exports
|- storage.ts         # Main StorageService (orchestrator)
|- repositories.ts    # Repository pattern (data access)
|- indexeddb.ts       # IndexedDB wrapper (low-level)
|- migration.ts       # Schema migration system
|- types.ts           # Type definitions (../types/index.ts)
```

## Database Schema

### Object Stores

| Store Name | Key Path | Description |
|------------|----------|-------------|
| `tasks` | `id` | Task entities with indexes for status, priority, dueDate, tags, projectId |
| `sessions` | `id` | Session records with indexes for taskId, type, createdAt, status |
| `settings` | `id` | App settings (single document store) |
| `statistics` | `date` | Daily statistics (one record per date) |
| `projects` | `id` | Project entities for task grouping |

### Indexes

#### Tasks Store
- `status` - Find tasks by status (todo, in_progress, completed, archived)
- `priority` - Find tasks by priority (low, medium, high, urgent)
- `createdAt` - Sort by creation time
- `updatedAt` - Sort by update time
- `dueDate` - Find tasks due by date
- `projectId` - Find tasks in a project
- `tags` - Find tasks by tag (multiEntry)
- `order` - For drag-and-drop ordering
- `parentId` - Find subtasks

#### Sessions Store
- `taskId` - Find all sessions for a task
- `type` - Filter by session type (work, short_break, long_break)
- `createdAt` - Sort by creation time
- `startedAt` - Find sessions by start time
- `completedAt` - Find completed sessions
- `status` - Find sessions by status
- `taskAndDate` - Compound index for date range queries

## API Usage

### Initialization

```typescript
import { initStorage, storageService } from '@/services';

// Initialize storage (auto-detects best available storage)
await initStorage();

// Check which storage type is being used
const type = storageService.getStorageType();
console.log('Storage type:', type); // 'indexeddb' | 'localstorage' | 'memory'
```

### Task Operations

```typescript
// Get all tasks
const tasks = await storageService.getTasks();

// Get a specific task
const task = await storageService.getTask('task-id');

// Save a task (create or update)
await storageService.saveTask({
  id: 'new-task-id',
  title: 'Complete project',
  priority: 'high',
  status: 'todo',
  // ... other fields
});

// Delete a task
await storageService.deleteTask('task-id');

// Update task status
await storageService.updateTaskStatus('task-id', 'completed');
```

### Session Operations

```typescript
// Get all sessions
const sessions = await storageService.getSessions();

// Get sessions for a task
const taskSessions = await storageService.getSessionsByTask('task-id');

// Get sessions in date range
const weekSessions = await storageService.getSessionsByDateRange(
  weekAgo.getTime(),
  now.getTime()
);

// Start a new session
const session = await storageService.startSession(null, 'work', 1500);

// Complete a session
await storageService.completeSession('session-id', 1500);
```

### Settings Operations

```typescript
// Get settings
const settings = await storageService.getSettings();

// Update settings
await storageService.saveSettings({
  theme: 'dark',
  language: 'en'
});

// Update timer settings only
await storageService.updateTimerSettings({
  workDuration: 30 * 60, // 30 minutes
  soundEnabled: true
});
```

### Statistics Operations

```typescript
// Get comprehensive statistics
const stats = await storageService.getStatistics();
console.log(stats.today.workSessions);
console.log(stats.weekTotals.totalWorkTime);

// Get daily stats for specific date
const dailyStats = await storageService.getDailyStats('2024-01-15');

// Save daily stats
await storageService.saveDailyStats({
  date: '2024-01-15',
  workSessions: 8,
  totalWorkTime: 14400,
  totalBreakTime: 2700,
  completedTasks: 5,
  tasksCreated: 3,
  longestStreak: 4
});
```

### Backup & Export

```typescript
// Export all data
const backup = await storageService.exportData();
console.log(backup); // { version, exportedAt, tasks, sessions, settings, projects }

// Import data
await storageService.importData(backup);

// Get storage usage
const { used, total } = await storageService.getStorageUsage();
console.log(`Storage: ${used / 1024}KB used`);

// Compact old data
await storageService.compact(90); // Keep last 90 days
```

## Event System

Listen to data changes:

```typescript
import { storageService } from '@/services';

// Listen for task updates
storageService.addEventListener('taskUpdated', (event) => {
  console.log('Task updated:', event.data);
});

// Listen for task deletions
storageService.addEventListener('taskDeleted', (event) => {
  console.log('Task deleted:', event.data.id);
});

// Listen for settings changes
storageService.addEventListener('settingsUpdated', (event) => {
  console.log('Settings changed:', event.data);
});

// Remove listener
storageService.removeEventListener('taskUpdated', listener);
```

## Migration System

### Adding a New Migration

1. Define the migration in `src/services/migration.ts`:

```typescript
const MIGRATIONS: Migration[] = [
  // ... existing migrations
  {
    version: 2,
    name: 'add_task_reminder',
    up: async (db, transaction) => {
      const store = transaction.objectStore('tasks');

      // Add new index
      if (!store.indexNames.contains('reminderTime')) {
        store.createIndex('reminderTime', 'reminderTime', { unique: false });
      }

      // Migrate existing data
      await migrateData(transaction, 'tasks', (task) => ({
        ...task,
        reminderTime: task.reminderTime || null,
        reminderEnabled: task.reminderEnabled || false,
      }));
    },
    down: async (db, transaction) => {
      // Optional: Rollback logic
      const store = transaction.objectStore('tasks');
      store.deleteIndex('reminderTime');
    },
  },
];
```

2. Update `CURRENT_VERSION` in `migration.ts`:

```typescript
export const CURRENT_VERSION = 2;
```

3. Update `DB_VERSION` in `indexeddb.ts`:

```typescript
export const DB_VERSION = 2;
```

### Running Migrations

Migrations run automatically when opening the database. To manually trigger:

```typescript
import { runMigrations } from '@/services';

const result = await runMigrations();
console.log('Migration result:', result);
```

## Error Handling

The storage layer uses custom error types:

```typescript
import {
  StorageError,
  DatabaseNotFoundError,
  TransactionError,
  QuotaExceededError
} from '@/services';

try {
  await storageService.saveTask(largeTask);
} catch (error) {
  if (error instanceof QuotaExceededError) {
    console.error('Storage quota exceeded!');
    await storageService.compact(30); // Free up space
  }
}
```

## Testing

### Mock Repository

For testing, you can mock repositories:

```typescript
import { TaskRepository } from '@/services';

class MockTaskRepository implements ITaskRepository {
  private tasks: Task[] = [];

  async save(task: Task): Promise<void> {
    this.tasks.push(task);
  }

  async findAll(): Promise<Task[]> {
    return this.tasks;
  }

  // ... implement other methods
}
```

### Using In-Memory Storage

For integration tests without persistence:

```typescript
import { StorageService, StorageType } from '@/services';

const storage = new StorageService();
// Force in-memory mode for testing
storage['storageType'] = StorageType.MEMORY;
```

## Performance Considerations

1. **Bulk Operations**: Use `saveMany` instead of multiple `save` calls
2. **Indexing**: Only create indexes for frequently queried fields
3. **Compaction**: Run `compact()` periodically to remove old sessions
4. **Pagination**: For large datasets, implement cursor-based pagination

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| IndexedDB | 23+ | 10+ | 7.1+ | 12+ |
| LocalStorage | 4+ | 3.5+ | 4+ | 8+ |

## Security Notes

1. **No Sensitive Data**: Don't store passwords or API keys
2. **Same-Origin**: IndexedDB follows same-origin policy
3. **Private Mode**: Detection handles private browsing gracefully
4. **XSS Protection**: Sanitize any user input before storing

## Troubleshooting

### IndexedDB Not Working

1. Check browser console for errors
2. Verify IndexedDB is enabled
3. Check available storage quota
4. Try clearing site data

### Data Loss After Refresh

1. Verify storage type is not 'memory'
2. Check for private browsing mode
3. Ensure LocalStorage quota not exceeded

### Migration Failures

1. Check migration version matches schema
2. Verify rollback functions are correct
3. Test migration on copy of data first
