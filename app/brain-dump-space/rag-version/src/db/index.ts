/**
 * IndexedDB database layer for the Brain Dump RAG application
 *
 * This module provides a clean, type-safe API for interacting with IndexedDB
 * using the `idb` library. It handles database initialization, CRUD operations,
 * and provides a promise-based interface for all database operations.
 *
 * @module db
 */

import { openDB, deleteDB, DBSchema, IDBPDatabase } from 'idb';
import type { Thought, AppSettings, SchemaVersion } from '../types/index.js';

/**
 * Database schema definition
 * Defines the structure of our IndexedDB database including object stores
 *
 * @interface BrainDumpDBSchema
 */
interface BrainDumpDBSchema extends DBSchema {
  /** Object store for storing thoughts/notes */
  thoughts: {
    key: string;
    value: Thought;
    indexes: {
      'by-createdAt': number;
      'by-tags': string;
    };
  };

  /** Object store for storing application settings */
  settings: {
    key: string;
    value: AppSettings;
  };

  /** Object store for metadata including schema version */
  metadata: {
    key: string;
    value: SchemaVersion;
  };
}

/**
 * Database configuration constants
 */
const DB_CONFIG = {
  /** Name of the IndexedDB database */
  DB_NAME: 'BrainDumpDB' as const,

  /** Current schema version */
  DB_VERSION: 1 as const,

  /** Object store names */
  STORES: {
    THOUGHTS: 'thoughts' as const,
    SETTINGS: 'settings' as const,
    METADATA: 'metadata' as const,
  },

  /** Index names */
  INDEXES: {
    CREATED_AT: 'by-createdAt' as const,
    TAGS: 'by-tags' as const,
  },

  /** Metadata keys */
  META_KEYS: {
    SCHEMA_VERSION: 'schemaVersion' as const,
  } as const,
} as const;

/**
 * Database instance holder
 * Lazily initialized and cached
 */
let dbInstance: IDBPDatabase<BrainDumpDBSchema> | null = null;

/**
 * Promise cache for preventing race conditions during initialization
 */
let initPromise: Promise<IDBPDatabase<BrainDumpDBSchema>> | null = null;

/**
 * Custom error class for database operations
 *
 * @class DatabaseError
 * @extends Error
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'CONSTRAINT_ERROR' | 'QUOTA_EXCEEDED' | 'UNKNOWN',
    public details?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Initializes the IndexedDB database and creates the schema
 *
 * This function opens the database, creates object stores if they don't exist,
 * and creates indexes for efficient querying. It handles schema upgrades automatically.
 *
 * @returns Promise that resolves to the database instance
 * @throws {DatabaseError} If database initialization fails
 *
 * @example
 * ```typescript
 * const db = await initDB();
 * // Database is ready to use
 * ```
 */
export async function initDB(): Promise<IDBPDatabase<BrainDumpDBSchema>> {
  // Return cached instance if already initialized
  if (dbInstance) {
    return dbInstance;
  }

  // Return existing promise if initialization is in progress (prevents race conditions)
  if (initPromise) {
    return initPromise;
  }

  // Start initialization and cache the promise
  initPromise = (async () => {
    try {
      const db = await openDB<BrainDumpDBSchema>(DB_CONFIG.DB_NAME, DB_CONFIG.DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Create thoughts object store
        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.THOUGHTS)) {
          const thoughtsStore = db.createObjectStore(DB_CONFIG.STORES.THOUGHTS, {
            keyPath: 'id',
          });

          // Create index for sorting by creation date
          thoughtsStore.createIndex(DB_CONFIG.INDEXES.CREATED_AT, 'createdAt');

          // Create index for filtering by tags
          thoughtsStore.createIndex(DB_CONFIG.INDEXES.TAGS, 'tags', {
            multiEntry: true,
          });
        }

        // Create settings object store
        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.SETTINGS)) {
          db.createObjectStore(DB_CONFIG.STORES.SETTINGS, {
            keyPath: 'id',
          });
        }

        // Create metadata object store
        if (!db.objectStoreNames.contains(DB_CONFIG.STORES.METADATA)) {
          db.createObjectStore(DB_CONFIG.STORES.METADATA, {
            keyPath: 'id',
          });
        }

        // Store current schema version in metadata
        const metadataStore = transaction.objectStore(DB_CONFIG.STORES.METADATA);
        metadataStore.put({
          id: DB_CONFIG.META_KEYS.SCHEMA_VERSION,
          version: newVersion || DB_CONFIG.DB_VERSION,
          migratedAt: Date.now(),
        });
      },
      blocked() {
        console.warn('[DB] Database initialization blocked - another tab may be open');
      },
      blocking() {
        console.warn('[DB] This database connection is blocking another version');
      },
    });

    dbInstance = db;
    console.log('[DB] Database initialized successfully');
    return dbInstance;
  } catch (error) {
    initPromise = null; // Clear promise on error so retry is possible
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(
      `Failed to initialize database: ${errorMessage}`,
      'UNKNOWN',
      error
    );
  }
})();

  return initPromise;
}

/**
 * Closes the database connection and clears the cached instance
 *
 * @returns Promise that resolves when the database is closed
 */
export async function closeDB(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    initPromise = null;
    console.log('[DB] Database connection closed');
  }
}

/**
 * Deletes the entire database
 * WARNING: This will permanently delete all stored data
 *
 * @returns Promise that resolves when the database is deleted
 *
 * @example
 * ```typescript
 * await deleteDatabase();
 * // All data has been deleted
 * ```
 */
export async function deleteDatabase(): Promise<void> {
  try {
    await closeDB();
    await deleteDB(DB_CONFIG.DB_NAME);
    console.log('[DB] Database deleted successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(
      `Failed to delete database: ${errorMessage}`,
      'UNKNOWN',
      error
    );
  }
}

// ============================================================
// THOUGHTS API
// ============================================================

/**
 * Retrieves all thoughts from the database
 *
 * @returns Promise that resolves to an array of all thoughts
 *
 * @example
 * ```typescript
 * const thoughts = await getThoughts();
 * console.log(`Found ${thoughts.length} thoughts`);
 * ```
 */
export async function getThoughts(): Promise<Thought[]> {
  try {
    const db = await initDB();
    const thoughts = await db.getAll(DB_CONFIG.STORES.THOUGHTS);
    return thoughts.sort((a, b) => b.createdAt - a.createdAt); // Newest first
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(`Failed to get thoughts: ${errorMessage}`, 'UNKNOWN', error);
  }
}

/**
 * Retrieves a single thought by its ID
 *
 * @param id - The unique identifier of the thought
 * @returns Promise that resolves to the thought, or undefined if not found
 *
 * @example
 * ```typescript
 * const thought = await getThoughtById('thought-123');
 * if (thought) {
 *   console.log(thought.content);
 * }
 * ```
 */
export async function getThoughtById(id: string): Promise<Thought | undefined> {
  try {
    const db = await initDB();
    return await db.get(DB_CONFIG.STORES.THOUGHTS, id);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(`Failed to get thought by ID: ${errorMessage}`, 'UNKNOWN', error);
  }
}

/**
 * Saves a thought to the database
 * If a thought with the same ID exists, it will be updated
 *
 * @param thought - The thought to save
 * @returns Promise that resolves to the saved thought
 *
 * @example
 * ```typescript
 * const newThought = await saveThought({
 *   id: 'thought-123',
 *   content: 'My new thought',
 *   createdAt: Date.now(),
 *   tags: ['personal', 'idea']
 * });
 * ```
 */
export async function saveThought(thought: Thought): Promise<Thought> {
  try {
    const db = await initDB();
    await db.put(DB_CONFIG.STORES.THOUGHTS, thought);
    console.log('[DB] Thought saved:', thought.id);
    return thought;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check for quota exceeded error
    if (errorMessage.includes('QuotaExceededError')) {
      throw new DatabaseError(
        'Storage quota exceeded. Please delete some thoughts.',
        'QUOTA_EXCEEDED',
        error
      );
    }

    throw new DatabaseError(`Failed to save thought: ${errorMessage}`, 'UNKNOWN', error);
  }
}

/**
 * Saves multiple thoughts in a single transaction
 *
 * @param thoughts - Array of thoughts to save
 * @returns Promise that resolves to the number of successfully saved thoughts
 *
 * @example
 * ```typescript
 * const count = await saveThoughts([thought1, thought2, thought3]);
 * console.log(`Saved ${count} thoughts`);
 * ```
 */
export async function saveThoughts(thoughts: Thought[]): Promise<number> {
  if (thoughts.length === 0) {
    return 0;
  }

  try {
    const db = await initDB();
    const tx = db.transaction(DB_CONFIG.STORES.THOUGHTS, 'readwrite');
    const store = tx.objectStore(DB_CONFIG.STORES.THOUGHTS);

    await Promise.all(thoughts.map((thought) => store.put(thought)));
    await tx.done;

    console.log(`[DB] Saved ${thoughts.length} thoughts`);
    return thoughts.length;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(`Failed to save thoughts: ${errorMessage}`, 'UNKNOWN', error);
  }
}

/**
 * Deletes a thought from the database
 *
 * @param id - The unique identifier of the thought to delete
 * @returns Promise that resolves to true if the thought was deleted
 * @throws {DatabaseError} If the thought is not found or deletion fails
 *
 * @example
 * ```typescript
 * await deleteThought('thought-123');
 * console.log('Thought deleted');
 * ```
 */
export async function deleteThought(id: string): Promise<boolean> {
  try {
    const db = await initDB();
    await db.delete(DB_CONFIG.STORES.THOUGHTS, id);
    console.log('[DB] Thought deleted:', id);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(`Failed to delete thought: ${errorMessage}`, 'UNKNOWN', error);
  }
}

/**
 * Deletes multiple thoughts by their IDs
 *
 * @param ids - Array of thought IDs to delete
 * @returns Promise that resolves to the number of deleted thoughts
 *
 * @example
 * ```typescript
 * const count = await deleteThoughts(['id1', 'id2', 'id3']);
 * console.log(`Deleted ${count} thoughts`);
 * ```
 */
export async function deleteThoughts(ids: string[]): Promise<number> {
  if (ids.length === 0) {
    return 0;
  }

  try {
    const db = await initDB();
    const tx = db.transaction(DB_CONFIG.STORES.THOUGHTS, 'readwrite');
    const store = tx.objectStore(DB_CONFIG.STORES.THOUGHTS);

    await Promise.all(ids.map((id) => store.delete(id)));
    await tx.done;

    console.log(`[DB] Deleted ${ids.length} thoughts`);
    return ids.length;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(`Failed to delete thoughts: ${errorMessage}`, 'UNKNOWN', error);
  }
}

/**
 * Clears all thoughts from the database
 *
 * @returns Promise that resolves when all thoughts are cleared
 *
 * @example
 * ```typescript
 * await clearThoughts();
 * console.log('All thoughts cleared');
 * ```
 */
export async function clearThoughts(): Promise<void> {
  try {
    const db = await initDB();
    await db.clear(DB_CONFIG.STORES.THOUGHTS);
    console.log('[DB] All thoughts cleared');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(`Failed to clear thoughts: ${errorMessage}`, 'UNKNOWN', error);
  }
}

/**
 * Returns the count of thoughts in the database
 *
 * @returns Promise that resolves to the number of thoughts
 *
 * @example
 * ```typescript
 * const count = await getThoughtCount();
 * console.log(`You have ${count} thoughts`);
 * ```
 */
export async function getThoughtCount(): Promise<number> {
  try {
    const db = await initDB();
    return await db.count(DB_CONFIG.STORES.THOUGHTS);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(`Failed to get thought count: ${errorMessage}`, 'UNKNOWN', error);
  }
}

/**
 * Searches thoughts by content text (case-insensitive)
 *
 * @param query - The search query string
 * @returns Promise that resolves to matching thoughts
 *
 * @example
 * ```typescript
 * const results = await searchThoughts('project');
 * // Returns all thoughts containing 'project'
 * ```
 */
export async function searchThoughts(query: string): Promise<Thought[]> {
  try {
    const allThoughts = await getThoughts();
    const lowerQuery = query.toLowerCase();

    return allThoughts.filter(
      (thought) =>
        thought.content.toLowerCase().includes(lowerQuery) ||
        thought.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(`Failed to search thoughts: ${errorMessage}`, 'UNKNOWN', error);
  }
}

/**
 * Retrieves thoughts filtered by tag
 *
 * @param tag - The tag to filter by
 * @returns Promise that resolves to thoughts with the specified tag
 *
 * @example
 * ```typescript
 * const taggedThoughts = await getThoughtsByTag('important');
 * ```
 */
export async function getThoughtsByTag(tag: string): Promise<Thought[]> {
  try {
    const db = await initDB();
    const index = db.transaction(DB_CONFIG.STORES.THOUGHTS).store.index(DB_CONFIG.INDEXES.TAGS);

    // Get all thoughts that have the specified tag
    const thoughts = await index.getAll(tag);

    return thoughts.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(
      `Failed to get thoughts by tag: ${errorMessage}`,
      'UNKNOWN',
      error
    );
  }
}

// ============================================================
// SETTINGS API
// ============================================================

/**
 * Retrieves application settings from the database
 *
 * @returns Promise that resolves to the application settings
 *
 * @example
 * ```typescript
 * const settings = await getSettings();
 * console.log('API URL:', settings.apiUrl);
 * ```
 */
export async function getSettings(): Promise<AppSettings> {
  try {
    const db = await initDB();
    // Settings are stored with a fixed key
    const settings = await db.get<AppSettings>(DB_CONFIG.STORES.SETTINGS, 'app-settings');
    return settings || {};
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(`Failed to get settings: ${errorMessage}`, 'UNKNOWN', error);
  }
}

/**
 * Saves application settings to the database
 *
 * @param settings - The settings to save
 * @returns Promise that resolves to the saved settings
 *
 * @example
 * ```typescript
 * await saveSettings({
 *   openaiApiKey: 'sk-...',
 *   modelName: 'gpt-4'
 * });
 * ```
 */
export async function saveSettings(settings: AppSettings): Promise<AppSettings> {
  try {
    const db = await initDB();
    // Merge with existing settings
    const existing = await getSettings();
    const mergedSettings = { ...existing, ...settings };

    // Store with a fixed key
    await db.put(DB_CONFIG.STORES.SETTINGS, {
      id: 'app-settings',
      ...mergedSettings,
    });

    console.log('[DB] Settings saved');
    return mergedSettings;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(`Failed to save settings: ${errorMessage}`, 'UNKNOWN', error);
  }
}

/**
 * Updates specific settings fields without affecting other fields
 *
 * @param updates - Partial settings object with fields to update
 * @returns Promise that resolves to the updated settings
 *
 * @example
 * ```typescript
 * const settings = await updateSettings({ modelName: 'gpt-4-turbo' });
 * ```
 */
export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  return saveSettings(updates);
}

/**
 * Clears all application settings
 *
 * @returns Promise that resolves when settings are cleared
 */
export async function clearSettings(): Promise<void> {
  try {
    const db = await initDB();
    await db.delete(DB_CONFIG.STORES.SETTINGS, 'app-settings');
    console.log('[DB] Settings cleared');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(`Failed to clear settings: ${errorMessage}`, 'UNKNOWN', error);
  }
}

// ============================================================
// METADATA API
// ============================================================

/**
 * Retrieves the current schema version
 *
 * @returns Promise that resolves to the schema version info
 */
export async function getSchemaVersion(): Promise<SchemaVersion | undefined> {
  try {
    const db = await initDB();
    return await db.get(DB_CONFIG.STORES.METADATA, DB_CONFIG.META_KEYS.SCHEMA_VERSION);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(
      `Failed to get schema version: ${errorMessage}`,
      'UNKNOWN',
      error
    );
  }
}

/**
 * Exports all data from the database as a JSON object
 * Useful for backup functionality
 *
 * @returns Promise that resolves to a JSON-serializable object containing all data
 */
export async function exportData(): Promise<{
  thoughts: Thought[];
  settings: AppSettings;
  exportedAt: number;
  version: number;
}> {
  try {
    const [thoughts, settings] = await Promise.all([getThoughts(), getSettings()]);

    return {
      thoughts,
      settings,
      exportedAt: Date.now(),
      version: DB_CONFIG.DB_VERSION,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(`Failed to export data: ${errorMessage}`, 'UNKNOWN', error);
  }
}

/**
 * Imports data from a JSON export
 * Merges with existing data (does not overwrite existing thoughts by ID)
 *
 * @param data - The data to import
 * @param options - Import options
 * @returns Promise that resolves to the number of thoughts imported
 */
export async function importData(
  data: ReturnType<typeof exportData> extends Promise<infer T> ? T : never,
  options: {
    overwrite?: boolean;
    importSettings?: boolean;
  } = {}
): Promise<{ thoughtCount: number; settingsImported: boolean }> {
  const { overwrite = false, importSettings = true } = options;

  try {
    const db = await initDB();
    let importedCount = 0;
    let settingsImported = false;

    // Import thoughts
    if (data.thoughts && data.thoughts.length > 0) {
      const tx = db.transaction(DB_CONFIG.STORES.THOUGHTS, 'readwrite');
      const store = tx.objectStore(DB_CONFIG.STORES.THOUGHTS);

      for (const thought of data.thoughts) {
        if (overwrite) {
          await store.put(thought);
          importedCount++;
        } else {
          // Only add if doesn't exist
          const existing = await store.get(thought.id);
          if (!existing) {
            await store.put(thought);
            importedCount++;
          }
        }
      }

      await tx.done;
    }

    // Import settings if requested
    if (importSettings && data.settings) {
      await saveSettings(data.settings);
      settingsImported = true;
    }

    console.log(`[DB] Imported ${importedCount} thoughts`);
    return { thoughtCount: importedCount, settingsImported };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(`Failed to import data: ${errorMessage}`, 'UNKNOWN', error);
  }
}
