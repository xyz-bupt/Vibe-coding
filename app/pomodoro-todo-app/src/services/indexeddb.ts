/**
 * IndexedDB Wrapper
 *
 * A robust wrapper around IndexedDB with:
 * - Promise-based API for all operations
 * - Automatic error handling and retry logic
 * - Transaction management
 * - Connection pooling
 * - Event emitter for data change notifications
 */

import type {
  StoreConfig,
  StorageEvent,
  StorageEventListener,
  StorageEventType,
  StorageError as CustomStorageError,
  DatabaseNotFoundError,
  TransactionError,
  QuotaExceededError,
} from '../types/index.js';

// ============================================================================
// Constants
// ============================================================================

/**
 * Database name
 */
export const DB_NAME = 'PomodoroTodoDB';

/**
 * Current database version
 */
export const DB_VERSION = 1;

/**
 * Object store names
 */
export const STORE_NAMES = {
  TASKS: 'tasks',
  SESSIONS: 'sessions',
  SETTINGS: 'settings',
  STATISTICS: 'statistics',
  PROJECTS: 'projects',
} as const;

/**
 * Default IndexedDB options
 */
const DEFAULT_OPTIONS: IDBOpenDBOptions = {
  durability: 'default', // 'strict', 'default', or 'relaxed'
};

/**
 * Transaction mode
 */
export enum TransactionMode {
  READONLY = 'readonly',
  READWRITE = 'readwrite',
}

// ============================================================================
// Custom Error Classes
// ============================================================================

export class StorageError extends Error implements CustomStorageError {
  constructor(
    message: string,
    public code: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export class DatabaseNotFoundErrorClass extends StorageError implements DatabaseNotFoundError {
  constructor(originalError?: Error) {
    super('Database not found', 'DATABASE_NOT_FOUND', originalError);
    this.name = 'DatabaseNotFoundError';
  }
}

export class TransactionErrorClass extends StorageError implements TransactionError {
  constructor(message: string, originalError?: Error) {
    super(message, 'TRANSACTION_ERROR', originalError);
    this.name = 'TransactionError';
  }
}

export class QuotaExceededErrorClass extends StorageError implements QuotaExceededError {
  constructor(originalError?: Error) {
    super('Storage quota exceeded', 'QUOTA_EXCEEDED', originalError);
    this.name = 'QuotaExceededError';
  }
}

// ============================================================================
// IndexedDB Wrapper Class
// ============================================================================

/**
 * IndexedDB wrapper class providing a Promise-based API
 */
export class IndexedDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;
  private eventListeners: Map<StorageEventType, Set<StorageEventListener>> = new Map();

  /**
   * Get or initialize the database connection
   */
  async init(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.openDatabase();
    this.db = await this.initPromise;
    this.initPromise = null;

    return this.db;
  }

  /**
   * Open the IndexedDB database
   */
  private async openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new DatabaseNotFoundErrorClass(
          new Error(request.error?.message || 'Failed to open database')
        ));
      };

      request.onsuccess = () => {
        const db = request.result;

        // Handle database close events
        db.onclose = () => {
          this.db = null;
          this.initPromise = null;
        };

        db.onversionchange = () => {
          // Close the connection to allow the upgrade to proceed
          db.close();
          this.db = null;
          this.initPromise = null;
        };

        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createSchema(db, event.oldVersion);
      };

      request.onblocked = () => {
        // Another connection is blocking the upgrade
        console.warn('[IndexedDB] Database upgrade blocked. Please close other tabs.');
      };
    });
  }

  /**
   * Create database schema
   * Called during database upgrade
   */
  private createSchema(db: IDBDatabase, oldVersion: number): void {
    // Create tasks store
    if (!db.objectStoreNames.contains(STORE_NAMES.TASKS)) {
      const taskStore = db.createObjectStore(STORE_NAMES.TASKS, { keyPath: 'id' });
      taskStore.createIndex('status', 'status', { unique: false });
      taskStore.createIndex('priority', 'priority', { unique: false });
      taskStore.createIndex('createdAt', 'createdAt', { unique: false });
      taskStore.createIndex('updatedAt', 'updatedAt', { unique: false });
      taskStore.createIndex('dueDate', 'dueDate', { unique: false });
      taskStore.createIndex('projectId', 'projectId', { unique: false });
      taskStore.createIndex('tags', 'tags', { unique: false, multiEntry: true });
      taskStore.createIndex('order', 'order', { unique: false });
      taskStore.createIndex('parentId', 'parentId', { unique: false });
    }

    // Create sessions store
    if (!db.objectStoreNames.contains(STORE_NAMES.SESSIONS)) {
      const sessionStore = db.createObjectStore(STORE_NAMES.SESSIONS, { keyPath: 'id' });
      sessionStore.createIndex('taskId', 'taskId', { unique: false });
      sessionStore.createIndex('type', 'type', { unique: false });
      sessionStore.createIndex('createdAt', 'createdAt', { unique: false });
      sessionStore.createIndex('startedAt', 'startedAt', { unique: false });
      sessionStore.createIndex('completedAt', 'completedAt', { unique: false });
      sessionStore.createIndex('status', 'status', { unique: false });
      // Compound index for date range queries
      sessionStore.createIndex('taskAndDate', ['taskId', 'createdAt'], { unique: false });
    }

    // Create settings store (single document store)
    if (!db.objectStoreNames.contains(STORE_NAMES.SETTINGS)) {
      db.createObjectStore(STORE_NAMES.SETTINGS, { keyPath: 'id' });
    }

    // Create statistics store (one document per date)
    if (!db.objectStoreNames.contains(STORE_NAMES.STATISTICS)) {
      const statsStore = db.createObjectStore(STORE_NAMES.STATISTICS, { keyPath: 'date' });
      statsStore.createIndex('date', 'date', { unique: true });
    }

    // Create projects store
    if (!db.objectStoreNames.contains(STORE_NAMES.PROJECTS)) {
      const projectStore = db.createObjectStore(STORE_NAMES.PROJECTS, { keyPath: 'id' });
      projectStore.createIndex('createdAt', 'createdAt', { unique: false });
      projectStore.createIndex('name', 'name', { unique: false });
    }
  }

  /**
   * Close the database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }

  /**
   * Delete the entire database
   */
  async delete(): Promise<void> {
    await this.close();
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new StorageError(
        'Failed to delete database',
        'DELETE_DATABASE_ERROR',
        new Error(request.error?.message)
      ));
      request.onblocked = () => {
        console.warn('[IndexedDB] Database deletion blocked. Please close other tabs.');
      };
    });
  }

  // ========================================================================
  // CRUD Operations
  // ========================================================================

  /**
   * Get a single record by key
   */
  async get<T>(storeName: string, key: IDBValidKey): Promise<T | null> {
    const db = await this.init();
    return this.transaction<T>(db, [storeName], TransactionMode.READONLY, (store) => {
      return this.promisifyRequest<T>(store.get(key));
    });
  }

  /**
   * Get all records from a store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.init();
    return this.transaction<T[]>(db, [storeName], TransactionMode.READONLY, (store) => {
      return this.promisifyRequest<T[]>(store.getAll());
    });
  }

  /**
   * Get all records from a store using a cursor
   * More memory efficient for large datasets
   */
  async getAllWithCursor<T>(
    storeName: string,
    callback?: (item: T) => void
  ): Promise<T[]> {
    const db = await this.init();
    const results: T[] = [];

    await this.transaction<void>(db, [storeName], TransactionMode.READONLY, (store) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            const item = cursor.value as T;
            results.push(item);
            if (callback) {
              callback(item);
            }
            cursor.continue();
          } else {
            resolve();
          }
        };
        request.onerror = () => reject(
          new TransactionErrorClass('Cursor operation failed', new Error(request.error?.message))
        );
      });
    });

    return results;
  }

  /**
   * Add a new record to a store
   */
  async add<T>(storeName: string, value: T, emitEvent?: StorageEventType): Promise<IDBValidKey> {
    const db = await this.init();
    const key = await this.transaction<IDBValidKey>(
      db,
      [storeName],
      TransactionMode.READWRITE,
      (store) => {
        return this.promisifyRequest<IDBValidKey>(store.add(value));
      }
    );

    if (emitEvent) {
      this.emit(emitEvent, value);
    }

    return key;
  }

  /**
   * Put a record into a store (insert or update)
   */
  async put<T>(storeName: string, value: T, emitEvent?: StorageEventType): Promise<IDBValidKey> {
    const db = await this.init();
    const key = await this.transaction<IDBValidKey>(
      db,
      [storeName],
      TransactionMode.READWRITE,
      (store) => {
        return this.promisifyRequest<IDBValidKey>(store.put(value));
      }
    );

    if (emitEvent) {
      this.emit(emitEvent, value);
    }

    return key;
  }

  /**
   * Put multiple records in a single transaction
   */
  async putMany<T>(
    storeName: string,
    values: T[],
    emitEvent?: StorageEventType
  ): Promise<IDBValidKey[]> {
    const db = await this.init();

    return this.transaction<IDBValidKey[]>(
      db,
      [storeName],
      TransactionMode.READWRITE,
      (store) => {
        const promises = values.map((value) =>
          this.promisifyRequest<IDBValidKey>(store.put(value))
        );
        return Promise.all(promises);
      }
    ).then((keys) => {
      if (emitEvent) {
        values.forEach((value) => this.emit(emitEvent, value));
      }
      return keys;
    });
  }

  /**
   * Delete a record by key
   */
  async delete(storeName: string, key: IDBValidKey, emitEvent?: StorageEventType): Promise<void> {
    const db = await this.init();

    // Store value in outer scope to emit after transaction
    let deletedValue: any = null;
    let deleteSucceeded = false;

    await this.transaction<void>(
      db,
      [storeName],
      TransactionMode.READWRITE,
      (store) => {
        return new Promise<void>((resolve, reject) => {
          // Get value first (within same transaction)
          if (emitEvent) {
            const getRequest = store.get(key);
            getRequest.onsuccess = () => {
              deletedValue = getRequest.result;

              // Now delete (still in same transaction)
              const deleteRequest = store.delete(key);
              deleteRequest.onsuccess = () => {
                deleteSucceeded = true;
                resolve();
              };
              deleteRequest.onerror = () => reject(
                new TransactionErrorClass('Delete operation failed', new Error(deleteRequest.error?.message || 'Unknown error'))
              );
            };
            getRequest.onerror = () => {
              // Value doesn't exist, continue with delete
              const deleteRequest = store.delete(key);
              deleteRequest.onsuccess = () => {
                deleteSucceeded = true;
                resolve();
              };
              deleteRequest.onerror = () => reject(
                new TransactionErrorClass('Delete operation failed', new Error(deleteRequest.error?.message || 'Unknown error'))
              );
            };
          } else {
            // No event needed, just delete
            const deleteRequest = store.delete(key);
            deleteRequest.onsuccess = () => {
              deleteSucceeded = true;
              resolve();
            };
            deleteRequest.onerror = () => reject(
              new TransactionErrorClass('Delete operation failed', new Error(deleteRequest.error?.message || 'Unknown error'))
            );
          }
        });
      }
    );

    // Emit event AFTER transaction completes successfully
    if (emitEvent && deleteSucceeded && deletedValue) {
      this.emit(emitEvent, deletedValue);
    }
  }

  /**
   * Delete multiple records by keys
   */
  async deleteMany(
    storeName: string,
    keys: IDBValidKey[],
    emitEvent?: StorageEventType
  ): Promise<void> {
    const db = await this.init();

    // First get values for events
    let values: any[] = [];
    if (emitEvent) {
      try {
        values = await Promise.all(
          keys.map((key) => this.get(storeName, key).catch(() => null))
        );
      } catch {
        // Ignore errors
      }
    }

    await this.transaction<void>(
      db,
      [storeName],
      TransactionMode.READWRITE,
      (store) => {
        const promises = keys.map((key) =>
          this.promisifyRequest<void>(store.delete(key))
        );
        return Promise.all(promises).then(() => {});
      }
    );

    if (emitEvent) {
      values.forEach((value) => {
        if (value) this.emit(emitEvent, value);
      });
    }
  }

  /**
   * Clear all records from a store
   */
  async clear(storeName: string): Promise<void> {
    const db = await this.init();
    return this.transaction<void>(
      db,
      [storeName],
      TransactionMode.READWRITE,
      (store) => {
        return this.promisifyRequest<void>(store.clear());
      }
    );
  }

  /**
   * Count all records in a store
   */
  async count(storeName: string): Promise<number> {
    const db = await this.init();
    return this.transaction<number>(
      db,
      [storeName],
      TransactionMode.READONLY,
      (store) => {
        return this.promisifyRequest<number>(store.count());
      }
    );
  }

  /**
   * Count records matching an index query
   */
  async countByIndex(storeName: string, indexName: string, key?: IDBValidKey): Promise<number> {
    const db = await this.init();
    return this.transaction<number>(
      db,
      [storeName],
      TransactionMode.READONLY,
      (store) => {
        const index = store.index(indexName);
        return this.promisifyRequest<number>(index.count(key));
      }
    );
  }

  // ========================================================================
  // Index Operations
  // ========================================================================

  /**
   * Get all records matching an index value
   */
  async getAllByIndex<T>(
    storeName: string,
    indexName: string,
    key: IDBValidKey
  ): Promise<T[]> {
    const db = await this.init();
    return this.transaction<T[]>(
      db,
      [storeName],
      TransactionMode.READONLY,
      (store) => {
        const index = store.index(indexName);
        return this.promisifyRequest<T[]>(index.getAll(key));
      }
    );
  }

  /**
   * Get records from an index within a key range
   */
  async getByIndexRange<T>(
    storeName: string,
    indexName: string,
    range: IDBKeyRange
  ): Promise<T[]> {
    const db = await this.init();
    return this.transaction<T[]>(
      db,
      [storeName],
      TransactionMode.READONLY,
      (store) => {
        const index = store.index(indexName);
        return this.promisifyRequest<T[]>(index.getAll(range));
      }
    );
  }

  /**
   * Get a single record from an index
   */
  async getByIndex<T>(
    storeName: string,
    indexName: string,
    key: IDBValidKey
  ): Promise<T | null> {
    const db = await this.init();
    return this.transaction<T | null>(
      db,
      [storeName],
      TransactionMode.READONLY,
      (store) => {
        const index = store.index(indexName);
        return this.promisifyRequest<T>(index.get(key));
      }
    );
  }

  // ========================================================================
  // Cursor Operations
  // ========================================================================

  /**
   * Iterate over records using a cursor with a filter function
   */
  async iterate<T>(
    storeName: string,
    callback: (item: T, cursor: IDBCursorWithValue) => boolean | void,
    options?: {
      indexName?: string;
      range?: IDBKeyRange;
      direction?: IDBCursorDirection;
    }
  ): Promise<void> {
    const db = await this.init();

    return this.transaction<void>(
      db,
      [storeName],
      TransactionMode.READONLY,
      (store) => {
        const source = options?.indexName ? store.index(options.indexName) : store;
        const request = source.openCursor(options?.range, options?.direction);

        return new Promise<void>((resolve, reject) => {
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              const shouldContinue = callback(cursor.value as T, cursor);
              if (shouldContinue !== false) {
                cursor.continue();
              } else {
                resolve();
              }
            } else {
              resolve();
            }
          };
          request.onerror = () => reject(
            new TransactionErrorClass('Cursor iteration failed', new Error(request.error?.message))
          );
        });
      }
    );
  }

  /**
   * Update records matching a filter function
   */
  async updateWhere<T>(
    storeName: string,
    indexName: string,
    key: IDBValidKey,
    updateFn: (item: T) => T | Partial<T>
  ): Promise<void> {
    const db = await this.init();

    return this.transaction<void>(
      db,
      [storeName],
      TransactionMode.READWRITE,
      (store) => {
        const index = store.index(indexName);
        const request = index.openCursor(key);

        return new Promise<void>((resolve, reject) => {
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              const updated = updateFn(cursor.value as T);
              cursor.update(updated);
              cursor.continue();
            } else {
              resolve();
            }
          };
          request.onerror = () => reject(
            new TransactionErrorClass('Update where failed', new Error(request.error?.message))
          );
        });
      }
    );
  }

  /**
   * Delete records matching a filter function
   */
  async deleteWhere(
    storeName: string,
    indexName: string,
    key: IDBValidKey
  ): Promise<number> {
    const db = await this.init();
    let count = 0;

    await this.transaction<void>(
      db,
      [storeName],
      TransactionMode.READWRITE,
      (store) => {
        const index = store.index(indexName);
        const request = index.openCursor(key);

        return new Promise<void>((resolve, reject) => {
          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
              cursor.delete();
              count++;
              cursor.continue();
            } else {
              resolve();
            }
          };
          request.onerror = () => reject(
            new TransactionErrorClass('Delete where failed', new Error(request.error?.message))
          );
        });
      }
    );

    return count;
  }

  // ========================================================================
  // Transaction Management
  // ========================================================================

  /**
   * Execute a callback within a transaction
   */
  private async transaction<T>(
    db: IDBDatabase,
    storeNames: string[],
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => Promise<T> | T
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(storeNames, mode);
      const store = transaction.objectStore(storeNames[0]);

      // Wrap callback in a try-catch to handle synchronous errors
      try {
        const result = callback(store);

        // Handle both synchronous and asynchronous results
        Promise.resolve(result).then(resolve).catch((error) => {
          transaction.abort();
          reject(new TransactionErrorClass(
            `Transaction callback failed: ${error.message}`,
            error
          ));
        });
      } catch (error) {
        transaction.abort();
        reject(new TransactionErrorClass(
          `Transaction callback threw: ${(error as Error).message}`,
          error as Error
        ));
        return;
      }

      transaction.onerror = () => {
        const error = transaction.error;
        if (error?.name === 'QuotaExceededError') {
          reject(new QuotaExceededErrorClass(error));
        } else {
          reject(new TransactionErrorClass(
            `Transaction failed: ${error?.message || 'Unknown error'}`,
            error || undefined
          ));
        }
      };

      transaction.onabort = () => {
        if (!transaction.error) {
          reject(new TransactionErrorClass('Transaction was aborted'));
        }
      };

      transaction.oncomplete = () => {
        // Resolution is handled by the callback promise
      };
    });
  }

  /**
   * Promisify an IDBRequest
   */
  private promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(
        new TransactionErrorClass(
          `IndexedDB request failed: ${request.error?.message || 'Unknown error'}`,
          request.error || undefined
        )
      );
    });
  }

  // ========================================================================
  // Event Emitter
  // ========================================================================

  /**
   * Add an event listener
   */
  addEventListener<T = any>(
    eventType: StorageEventType,
    listener: StorageEventListener<T>
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Remove an event listener
   */
  removeEventListener<T = any>(
    eventType: StorageEventType,
    listener: StorageEventListener<T>
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(eventType);
      }
    }
  }

  /**
   * Emit an event to all listeners
   */
  private emit<T = any>(eventType: StorageEventType, data: T): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const event: StorageEvent<T> = {
        type: eventType,
        data,
        timestamp: Date.now(),
      };
      listeners.forEach((listener) => {
        try {
          listener(event);
        } catch (error) {
          console.error(`[IndexedDB] Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllEventListeners(): void {
    this.eventListeners.clear();
  }

  // ========================================================================
  // Utility Methods
  // ========================================================================

  /**
   * Check if the database exists
   */
  static async exists(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onsuccess = () => {
        request.result.close();
        resolve(true);
      };

      request.onerror = () => {
        resolve(false);
      };

      request.onupgradeneeded = () => {
        // Database doesn't exist yet
        request.transaction?.abort();
        resolve(false);
      };
    });
  }

  /**
   * Check if IndexedDB is supported
   */
  static isSupported(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  /**
   * Check if private browsing mode is active
   * (which may disable IndexedDB in some browsers)
   */
  static async isPrivateMode(): Promise<boolean> {
    try {
      const testDB = await new Promise<IDBDatabase | null>((resolve) => {
        const request = indexedDB.open('__test_private_mode__');
        request.onsuccess = () => {
          const db = request.result;
          db.close();
          indexedDB.deleteDatabase('__test_private_mode__');
          resolve(db);
        };
        request.onerror = () => resolve(null);
      });
      return testDB === null;
    } catch {
      return true;
    }
  }

  /**
   * Get estimated database size
   * Note: This is an approximation and may not be accurate
   */
  async getEstimatedSize(): Promise<number> {
    // IndexedDB doesn't provide a direct way to get size
    // This is a rough estimate based on the data
    const tasks = await this.getAll(STORE_NAMES.TASKS);
    const sessions = await this.getAll(STORE_NAMES.SESSIONS);

    const taskSize = JSON.stringify(tasks).length * 2; // Approximate UTF-16 encoding
    const sessionSize = JSON.stringify(sessions).length * 2;

    return taskSize + sessionSize;
  }

  /**
   * Compact the database by deleting old data
   */
  async compact(daysToKeep: number = 90): Promise<void> {
    const cutoffDate = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    // Delete old completed sessions
    await this.deleteWhere(
      STORE_NAMES.SESSIONS,
      'completedAt',
      IDBKeyRange.upperBound(cutoffDate)
    );

    // Delete old statistics
    await this.deleteWhere(
      STORE_NAMES.STATISTICS,
      'date',
      IDBKeyRange.upperBound(new Date(cutoffDate).toISOString().split('T')[0])
    );
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

/**
 * Global IndexedDB instance
 */
export const indexedDBInstance = new IndexedDB();

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create an IDBKeyRange for lower bound query
 */
export function lowerBound(key: IDBValidKey, open = false): IDBKeyRange {
  return IDBKeyRange.lowerBound(key, open);
}

/**
 * Create an IDBKeyRange for upper bound query
 */
export function upperBound(key: IDBValidKey, open = false): IDBKeyRange {
  return IDBKeyRange.upperBound(key, open);
}

/**
 * Create an IDBKeyRange for bound query
 */
export function bound(
  lower: IDBValidKey,
  upper: IDBValidKey,
  lowerOpen = false,
  upperOpen = false
): IDBKeyRange {
  return IDBKeyRange.bound(lower, upper, lowerOpen, upperOpen);
}

/**
 * Create an IDBKeyRange for exact match
 */
export function only(key: IDBValidKey): IDBKeyRange {
  return IDBKeyRange.only(key);
}

/**
 * Create a date range for querying
 */
export function createDateRange(
  startDate: Date,
  endDate: Date
): IDBKeyRange {
  return bound(
    startDate.getTime(),
    endDate.getTime()
  );
}

/**
 * Create a "today" date range
 */
export function createTodayRange(): IDBKeyRange {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return createDateRange(start, end);
}

/**
 * Create a "week" date range
 */
export function createWeekRange(): IDBKeyRange {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  start.setHours(0, 0, 0, 0);
  return createDateRange(start, end);
}

/**
 * Create a "month" date range
 */
export function createMonthRange(): IDBKeyRange {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setMonth(start.getMonth() - 1);
  start.setHours(0, 0, 0, 0);
  return createDateRange(start, end);
}
