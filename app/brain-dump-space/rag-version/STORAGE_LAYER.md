# IndexedDB Storage Layer

Complete, production-ready IndexedDB storage layer for the Brain Dump RAG application.

## Overview

The storage layer provides a clean, type-safe API for persisting thoughts, embeddings, and application settings using IndexedDB. It includes automatic migration from localStorage, comprehensive error handling, and support for RAG (Retrieval Augmented Generation) workflows.

## Architecture

```
src/
├── types/
│   └── index.ts          # TypeScript type definitions
├── db/
│   ├── index.ts          # Core IndexedDB operations
│   ├── migration.ts      # localStorage to IndexedDB migration
│   ├── storage.ts        # Main storage service (public API)
│   └── storage.example.ts # Usage examples
```

## File Descriptions

### 1. `src/types/index.ts`

Defines all TypeScript types and interfaces for the application:

- **`Thought`**: Core data structure for storing notes with embeddings
- **`AppSettings`**: Application configuration and API keys
- **`SchemaVersion`**: Database version tracking
- **`MigrationStatus`**: Migration state tracking
- **`DatabaseError`**: Error types for database operations
- **`ThoughtQueryOptions`**: Query/filter options for thoughts
- **`SimilarThought`**: Result type for semantic search

### 2. `src/db/index.ts`

Core IndexedDB operations using the `idb` library:

- Database initialization with schema upgrades
- CRUD operations for thoughts and settings
- Index-based queries (by creation date, by tags)
- Bulk operations (save/delete multiple items)
- Data export/import functionality
- Custom `DatabaseError` class for error handling

**Key Functions:**
- `initDB()` - Initialize database connection
- `getThoughts()`, `saveThought()`, `deleteThought()`, `clearThoughts()`
- `getSettings()`, `saveSettings()`, `updateSettings()`
- `searchThoughts()`, `getThoughtsByTag()`
- `exportData()`, `importData()`

### 3. `src/db/migration.ts`

Handles migration from localStorage to IndexedDB:

- Detects legacy data in localStorage
- Normalizes and validates legacy thought data
- Preserves settings during migration
- Stores migration flag to prevent re-migration
- Provides migration status and diagnostics

**Key Functions:**
- `migrateFromLocalStorage()` - Run migration
- `hasLegacyData()` - Check if migration needed
- `getLegacyDataInfo()` - Get legacy data info without migrating
- `resetMigrationFlag()` - Reset for re-migration
- `exportLegacyData()` - Export legacy data

### 4. `src/db/storage.ts`

Main storage service providing the public API:

- Lazy initialization with promise caching
- Automatic migration on first use
- Clean, documented API surface
- Query builders for complex filters
- RAG-specific operations (embedding updates)

**Main Export:**
```typescript
const storage = {
  // Initialization
  init(),
  getStorageInfo(),

  // Thoughts
  getAllThoughts(),
  getThoughtById(),
  createThought(),
  saveThought(),
  saveThoughts(),
  deleteThought(),
  deleteThoughts(),
  clearAllThoughts(),
  getThoughtCount(),
  searchThoughts(),
  getThoughtsByTag(),
  queryThoughts(),
  updateThoughtEmbedding(), // RAG support

  // Settings
  getSettings(),
  saveSettings(),
  updateSettings(),
  clearSettings(),

  // Data Management
  exportData(),
  importData(),
  hardReset(),

  // Migration
  hasLegacyData(),
  getLegacyDataInfo(),
  runMigration(),
  resetMigrationFlag(),
  exportLegacyData(),
};
```

## Usage Examples

### Basic Usage

```typescript
import storage from './db/storage';

// Initialize (runs migration automatically)
await storage.init();

// Create a thought
const thought = await storage.createThought('Remember to call Mom', {
  tags: ['personal', 'family']
});

// Get all thoughts
const allThoughts = await storage.getAllThoughts();

// Search
const results = await storage.searchThoughts('Mom');
```

### Query with Options

```typescript
// Get last 10 thoughts tagged 'work' from last 7 days
const recent = await storage.queryThoughts({
  tags: ['work'],
  limit: 10,
  sortOrder: 'desc',
  dateRange: {
    from: Date.now() - 7 * 24 * 60 * 60 * 1000,
    to: Date.now()
  }
});
```

### RAG Integration

```typescript
// Update embedding for semantic search
const embedding = await generateEmbedding(thought.content);
await storage.updateThoughtEmbedding(thought.id, embedding);
```

### Settings

```typescript
// Save API configuration
await storage.saveSettings({
  openaiApiKey: 'sk-...',
  modelName: 'gpt-4',
  useRealAI: true
});

// Get settings
const settings = await storage.getSettings();
```

### Backup/Restore

```typescript
// Export all data
const backup = await storage.exportData();
const json = JSON.stringify(backup, null, 2);

// Import data
await storage.importData(JSON.parse(json), {
  overwrite: false,
  importSettings: true
});
```

## Database Schema

**Database Name:** `BrainDumpDB`
**Version:** 1

### Object Stores

#### `thoughts`
- **Key:** `id` (string)
- **Indexes:**
  - `by-createdAt`: number (for sorting by date)
  - `by-tags`: string (multiEntry, for tag filtering)

#### `settings`
- **Key:** Fixed key `'app-settings'`
- **Value:** AppSettings object

#### `metadata`
- **Key:** Various metadata keys
- **Value:** SchemaVersion, migration status, etc.

## Type Definitions

```typescript
interface Thought {
  id: string;
  content: string;
  createdAt: number;
  tags: string[];
  embedding?: number[];  // RAG support
}

interface AppSettings {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  apiUrl?: string;
  modelName?: string;
  useRealAI?: boolean;
}
```

## Migration Strategy

1. **Detection:** Checks for `brain-dump-thoughts` key in localStorage
2. **Validation:** Normalizes and validates all legacy data
3. **Migration:** Saves valid data to IndexedDB with new schema
4. **Cleanup:** Optionally removes localStorage data
5. **Flagging:** Stores migration flag to prevent re-migration

## Error Handling

All database operations use a custom `DatabaseError` class:

```typescript
class DatabaseError extends Error {
  code: 'NOT_FOUND' | 'CONSTRAINT_ERROR' | 'QUOTA_EXCEEDED' | 'UNKNOWN';
  details?: unknown;
}
```

## Best Practices

1. **Always initialize:** Call `await storage.init()` before using storage
2. **Handle errors:** Wrap storage calls in try/catch
3. **Use createThought:** For new thoughts, use `createThought()` for auto-generated IDs
4. **Query efficiently:** Use `queryThoughts()` with filters instead of filtering in-memory
5. **Batch operations:** Use `saveThoughts()` for multiple saves

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 10+, macOS 10.12+)
- Mobile: ✅ Full support on modern mobile browsers

## Performance Considerations

- IndexedDB is asynchronous and non-blocking
- Large datasets are handled efficiently with cursors
- Indexes enable fast lookups by date and tags
- Bulk operations use single transactions for atomicity

## Testing

See `src/db/storage.example.ts` for comprehensive usage examples and test scenarios.

## License

ISC
