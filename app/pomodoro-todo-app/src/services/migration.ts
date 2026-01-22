/**
 * Data Migration System
 *
 * Handles database schema changes and data migration between versions.
 *
 * Features:
 * - Version-controlled migrations
 * - Automatic rollback support (optional)
 * - Migration history tracking
 * - Data validation after migration
 * - Progress reporting
 */

import type {
  Migration,
  MigrationFunction,
  StoreConfig,
} from '../types/index.js';

import { MigrationError } from '../types/index.js';

// ============================================================================
// Constants
// ============================================================================

/**
 * Current database schema version
 */
export const CURRENT_VERSION = 1;

/**
 * Store name for migration history
 */
const MIGRATION_HISTORY_STORE = '_migration_history';

/**
 * Migration state enum
 */
export enum MigrationState {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back',
}

// ============================================================================
// Types
// ============================================================================

/**
 * Migration history record
 */
export interface MigrationRecord {
  version: number;
  name: string;
  executedAt: number;
  duration: number;
  state: MigrationState;
  error?: string;
}

/**
 * Migration context passed to migration functions
 */
export interface MigrationContext {
  db: IDBDatabase;
  transaction: IDBTransaction;
  fromVersion: number;
  toVersion: number;
  logger: MigrationLogger;
}

/**
 * Migration logger for tracking migration progress
 */
export interface MigrationLogger {
  info(message: string): void;
  warn(message: string): void;
  error(message: string, error?: Error): void;
  progress(percent: number, message?: string): void;
}

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  version: number;
  fromVersion: number;
  duration: number;
  error?: Error;
  records: MigrationRecord[];
}

/**
 * Migration options
 */
export interface MigrationOptions {
  onProgress?: (percent: number, message: string) => void;
  onLog?: (level: 'info' | 'warn' | 'error', message: string) => void;
  dryRun?: boolean;
}

// ============================================================================
// Migration Definitions
// ============================================================================

/**
 * All migration definitions
 * Add new migrations here as the schema evolves
 */
const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: async (db, transaction) => {
      // Version 1 creates the initial schema
      // This is handled by the IndexedDB wrapper's createSchema method
      // No additional migration needed
    },
  },
  // Future migrations will be added here
  // {
  //   version: 2,
  //   name: 'add_task_tags',
  //   up: async (db, transaction) => {
  //     // Migration logic for version 2
  //   },
  //   down: async (db, transaction) => {
  //     // Rollback logic for version 2
  //   },
  // },
];

// ============================================================================
// Migration Manager
// ============================================================================

/**
 * Migration Manager class
 */
export class MigrationManager {
  private historyStoreCreated = false;

  /**
   * Run all pending migrations
   */
  async migrate(
    db: IDBDatabase,
    currentVersion: number,
    options: MigrationOptions = {}
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    const records: MigrationRecord[] = [];
    const logger = this.createLogger(options);

    if (currentVersion >= CURRENT_VERSION) {
      logger.info('Database is up to date');
      return {
        success: true,
        version: currentVersion,
        fromVersion: currentVersion,
        duration: 0,
        records,
      };
    }

    logger.info(`Starting migration from v${currentVersion} to v${CURRENT_VERSION}`);

    // Ensure migration history store exists
    await this.ensureHistoryStore(db);

    // Get migration history
    const history = await this.getHistory(db);

    // Run migrations in order
    for (const migration of MIGRATIONS) {
      if (migration.version <= currentVersion) {
        continue; // Already applied
      }

      if (migration.version > CURRENT_VERSION) {
        break; // Future migration
      }

      // Check if this migration was already run
      const wasRun = history.some((r) => r.version === migration.version);
      if (wasRun) {
        logger.info(`Migration v${migration.version} already applied`);
        continue;
      }

      const record: MigrationRecord = {
        version: migration.version,
        name: migration.name,
        executedAt: Date.now(),
        duration: 0,
        state: MigrationState.RUNNING,
      };

      try {
        logger.info(`Applying migration: ${migration.name} (v${migration.version})`);

        const migrationStart = Date.now();

        // Run the migration
        await migration.up(db, transaction);

        record.duration = Date.now() - migrationStart;
        record.state = MigrationState.COMPLETED;

        logger.progress(
          ((migration.version - currentVersion) / (CURRENT_VERSION - currentVersion)) * 100,
          `Completed: ${migration.name}`
        );

        await this.saveHistoryRecord(db, record);
        records.push(record);
      } catch (error) {
        record.state = MigrationState.FAILED;
        record.error = (error as Error).message;
        record.duration = Date.now() - record.executedAt;

        await this.saveHistoryRecord(db, record);
        records.push(record);

        logger.error(`Migration failed: ${migration.name}`, error as Error);

        return {
          success: false,
          version: currentVersion,
          fromVersion: currentVersion,
          duration: Date.now() - startTime,
          error: error as Error,
          records,
        };
      }
    }

    logger.info(`Migration completed successfully in ${Date.now() - startTime}ms`);

    return {
      success: true,
      version: CURRENT_VERSION,
      fromVersion: currentVersion,
      duration: Date.now() - startTime,
      records,
    };
  }

  /**
   * Rollback to a specific version
   */
  async rollback(
    db: IDBDatabase,
    targetVersion: number,
    options: MigrationOptions = {}
  ): Promise<MigrationResult> {
    const startTime = Date.now();
    const records: MigrationRecord[] = [];
    const logger = this.createLogger(options);

    logger.info(`Rolling back to version ${targetVersion}`);

    // Get current version from database
    const history = await this.getHistory(db);
    const currentVersion = Math.max(0, ...history.map((r) => r.version));

    if (currentVersion <= targetVersion) {
      logger.info('Already at target version');
      return {
        success: true,
        version: currentVersion,
        fromVersion: currentVersion,
        duration: 0,
        records,
      };
    }

    // Rollback migrations in reverse order
    const migrationsToRollback = MIGRATIONS.filter(
      (m) => m.version <= currentVersion && m.version > targetVersion && m.down
    ).sort((a, b) => b.version - a.version);

    for (const migration of migrationsToRollback) {
      if (!migration.down) {
        logger.warn(`No rollback function for migration v${migration.version}`);
        continue;
      }

      const record: MigrationRecord = {
        version: migration.version,
        name: `${migration.name}_rollback`,
        executedAt: Date.now(),
        duration: 0,
        state: MigrationState.RUNNING,
      };

      try {
        logger.info(`Rolling back: ${migration.name} (v${migration.version})`);

        const tx = db.transaction(MIGRATION_HISTORY_STORE, 'readwrite');

        await migration.down(db, tx);

        record.duration = Date.now() - record.executedAt;
        record.state = MigrationState.ROLLED_BACK;

        await this.saveHistoryRecord(db, record);
        records.push(record);
      } catch (error) {
        record.state = MigrationState.FAILED;
        record.error = (error as Error).message;
        record.duration = Date.now() - record.executedAt;

        await this.saveHistoryRecord(db, record);
        records.push(record);

        logger.error(`Rollback failed: ${migration.name}`, error as Error);

        return {
          success: false,
          version: currentVersion,
          fromVersion: currentVersion,
          duration: Date.now() - startTime,
          error: error as Error,
          records,
        };
      }
    }

    logger.info(`Rollback completed in ${Date.now() - startTime}ms`);

    return {
      success: true,
      version: targetVersion,
      fromVersion: currentVersion,
      duration: Date.now() - startTime,
      records,
    };
  }

  /**
   * Get migration history
   */
  async getHistory(db: IDBDatabase): Promise<MigrationRecord[]> {
    if (!this.historyStoreCreated) {
      return [];
    }

    return new Promise<MigrationRecord[]>((resolve, reject) => {
      const tx = db.transaction(MIGRATION_HISTORY_STORE, 'readonly');
      const store = tx.objectStore(MIGRATION_HISTORY_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = request.result as MigrationRecord[];
        resolve(records.sort((a, b) => a.version - b.version));
      };

      request.onerror = () => {
        reject(new MigrationError(
          'Failed to read migration history',
          request.error || undefined
        ));
      };
    });
  }

  /**
   * Save a migration history record
   */
  private async saveHistoryRecord(
    db: IDBDatabase,
    record: MigrationRecord
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MIGRATION_HISTORY_STORE, 'readwrite');
      const store = tx.objectStore(MIGRATION_HISTORY_STORE);
      const request = store.put(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(
        new MigrationError(
          'Failed to save migration record',
          request.error || undefined
        )
      );
    });
  }

  /**
   * Ensure the migration history store exists
   */
  private async ensureHistoryStore(db: IDBDatabase): Promise<void> {
    if (db.objectStoreNames.contains(MIGRATION_HISTORY_STORE)) {
      this.historyStoreCreated = true;
      return;
    }

    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction([], 'versionchange');
      const store = db.createObjectStore(MIGRATION_HISTORY_STORE, {
        keyPath: 'version',
      });

      store.createIndex('executedAt', 'executedAt');
      store.createIndex('state', 'state');

      tx.oncomplete = () => {
        this.historyStoreCreated = true;
        resolve();
      };

      tx.onerror = () => reject(
        new MigrationError(
          'Failed to create migration history store',
          tx.error || undefined
        )
      );
    });
  }

  /**
   * Create a logger from options
   */
  private createLogger(options: MigrationOptions): MigrationLogger {
    return {
      info: (message: string) => {
        console.log(`[Migration] ${message}`);
        options.onLog?.('info', message);
      },
      warn: (message: string) => {
        console.warn(`[Migration] ${message}`);
        options.onLog?.('warn', message);
      },
      error: (message: string, error?: Error) => {
        console.error(`[Migration] ${message}`, error);
        options.onLog?.('error', message);
      },
      progress: (percent: number, message?: string) => {
        if (message) {
          console.log(`[Migration] ${Math.round(percent)}% - ${message}`);
        }
        options.onProgress?.(percent, message || '');
      },
    };
  }
}

// ============================================================================
// Migration Helpers
// ============================================================================

/**
 * Helper to create a new object store with indexes
 */
export function createObjectStore(
  db: IDBDatabase,
  config: StoreConfig
): IDBObjectStore {
  const store = db.createObjectStore(config.name, {
    keyPath: config.keyPath,
    autoIncrement: config.autoIncrement,
  });

  if (config.indexes) {
    for (const indexConfig of config.indexes) {
      store.createIndex(
        indexConfig.name,
        indexConfig.keyPath,
        indexConfig.options || {}
      );
    }
  }

  return store;
}

/**
 * Helper to delete an object store
 */
export function deleteObjectStore(db: IDBDatabase, storeName: string): void {
  if (db.objectStoreNames.contains(storeName)) {
    db.deleteObjectStore(storeName);
  }
}

/**
 * Helper to rename an object store (creates new, copies data, deletes old)
 */
export async function renameObjectStore(
  db: IDBDatabase,
  oldName: string,
  newName: string,
  transaction: IDBTransaction
): Promise<void> {
  // Create new store with same structure
  const oldStore = transaction.objectStore(oldName);
  const newStore = db.createObjectStore(newName, {
    keyPath: oldStore.keyPath,
    autoIncrement: oldStore.autoIncrement,
  });

  // Copy indexes
  for (const indexName of oldStore.indexNames) {
    const index = oldStore.index(indexName);
    newStore.createIndex(indexName, index.keyPath, {
      unique: index.unique,
      multiEntry: index.multiEntry,
    });
  }

  // Copy data
  return new Promise<void>((resolve, reject) => {
    const request = oldStore.openCursor();
    const records: any[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        records.push(cursor.value);
        cursor.continue();
      } else {
        // All records collected, now insert into new store
        const newStoreTx = transaction.objectStore(newName);
        const putPromises = records.map((record) =>
          new Promise<void>((putResolve, putReject) => {
            const putReq = newStoreTx.put(record);
            putReq.onsuccess = () => putResolve();
            putReq.onerror = () => putReject(putReq.error);
          })
        );

        Promise.all(putPromises)
          .then(() => {
            db.deleteObjectStore(oldName);
            resolve();
          })
          .catch(reject);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Helper to add a new index to an existing store
 */
export function addIndex(
  db: IDBDatabase,
  storeName: string,
  indexName: string,
  keyPath: string | string[],
  options?: IDBIndexParameters
): void {
  if (!db.objectStoreNames.contains(storeName)) {
    throw new MigrationError(`Store ${storeName} does not exist`);
  }

  const transaction = db.transaction([storeName], 'versionchange');
  const store = transaction.objectStore(storeName);

  if (store.indexNames.contains(indexName)) {
    console.warn(`Index ${indexName} already exists on ${storeName}`);
    return;
  }

  store.createIndex(indexName, keyPath, options || {});
}

/**
 * Helper to migrate data from one schema to another
 */
export async function migrateData<T, R = T>(
  transaction: IDBTransaction,
  storeName: string,
  transform: (data: T) => R
): Promise<number> {
  const store = transaction.objectStore(storeName);
  let count = 0;

  return new Promise<number>((resolve, reject) => {
    const request = store.openCursor();
    const updates: Array<{ key: IDBValidKey; value: R }> = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const transformed = transform(cursor.value as T);
        updates.push({ key: cursor.primaryKey, value: transformed });
        cursor.continue();
      } else {
        // Apply all updates
        const putPromises = updates.map(({ key, value }) =>
          new Promise<void>((putResolve, putReject) => {
            const putReq = store.put(value);
            putReq.onsuccess = () => putResolve();
            putReq.onerror = () => putReject(putReq.error);
          })
        );

        Promise.all(putPromises)
          .then(() => resolve(count))
          .catch(reject);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Helper to validate data after migration
 */
export async function validateData<T>(
  transaction: IDBTransaction,
  storeName: string,
  validator: (data: T) => boolean
): Promise<{ valid: number; invalid: number; errors: string[] }> {
  const store = transaction.objectStore(storeName);
  let valid = 0;
  let invalid = 0;
  const errors: string[] = [];

  return new Promise((resolve, reject) => {
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const data = cursor.value as T;
        try {
          if (validator(data)) {
            valid++;
          } else {
            invalid++;
            errors.push(`Invalid record at key ${cursor.primaryKey}`);
          }
        } catch (error) {
          invalid++;
          errors.push(`Validation error at key ${cursor.primaryKey}: ${(error as Error).message}`);
        }
        cursor.continue();
      } else {
        resolve({ valid, invalid, errors });
      }
    };

    request.onerror = () => reject(request.error);
  });
}

// ============================================================================
// Example Migration Implementations
// ============================================================================

/**
 * Example: Migration to add tags to tasks
 *
 * This shows how to add a new field to existing records
 */
export async function migrateAddTagsToTasks(
  db: IDBDatabase,
  transaction: IDBTransaction
): Promise<void> {
  const storeName = 'tasks';

  // Add the tags index
  const store = transaction.objectStore(storeName);
  if (!store.indexNames.contains('tags')) {
    store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
  }

  // Add empty tags array to existing tasks
  await migrateData(transaction, storeName, (task: any) => ({
    ...task,
    tags: task.tags || [],
  }));
}

/**
 * Example: Migration to split task priority into levels
 *
 * This shows how to transform enum values
 */
export async function migrateTaskPriority(
  db: IDBDatabase,
  transaction: IDBTransaction
): Promise<void> {
  type OldPriority = 'low' | 'high' | 'urgent';
  type NewPriority = 'low' | 'medium' | 'high' | 'urgent';

  const priorityMap: Record<OldPriority, NewPriority> = {
    low: 'low',
    high: 'high',
    urgent: 'urgent',
  };

  await migrateData(transaction, 'tasks', (task: any) => {
    const oldPriority = task.priority as OldPriority;
    return {
      ...task,
      priority: priorityMap[oldPriority] || 'medium',
    };
  });
}

/**
 * Example: Migration to add session status
 *
 * This shows how to derive a new field from existing data
 */
export async function migrateAddSessionStatus(
  db: IDBDatabase,
  transaction: IDBTransaction
): Promise<void> {
  const storeName = 'sessions';

  // Add status index
  const store = transaction.objectStore(storeName);
  if (!store.indexNames.contains('status')) {
    store.createIndex('status', 'status', { unique: false });
  }

  // Derive status from existing fields
  await migrateData(transaction, storeName, (session: any) => {
    let status: 'pending' | 'active' | 'completed' | 'cancelled' = 'pending';

    if (session.completedAt) {
      status = session.wasCompleted ? 'completed' : 'cancelled';
    } else if (session.startedAt) {
      status = 'active';
    }

    return {
      ...session,
      status,
    };
  });
}

// ============================================================================
// Singleton Migration Manager
// ============================================================================

export const migrationManager = new MigrationManager();

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a migration is needed
 */
export function needsMigration(currentVersion: number): boolean {
  return currentVersion < CURRENT_VERSION;
}

/**
 * Get the current schema version from IndexedDB
 */
export async function getCurrentVersion(dbName: string): Promise<number> {
  return new Promise<number>((resolve) => {
    const request = indexedDB.open(dbName);

    request.onsuccess = () => {
      const version = request.result.version;
      request.result.close();
      resolve(version);
    };

    request.onerror = () => resolve(0);
  });
}

/**
 * Export for standalone migration execution
 */
export async function runMigrations(
  dbName: string = 'PomodoroTodoDB'
): Promise<MigrationResult> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, CURRENT_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const oldVersion = event.oldVersion;

      migrationManager
        .migrate(db, oldVersion)
        .then(resolve)
        .catch(reject);
    };

    request.onsuccess = () => {
      request.result.close();
      resolve({
        success: true,
        version: CURRENT_VERSION,
        fromVersion: CURRENT_VERSION,
        duration: 0,
        records: [],
      });
    };

    request.onerror = () => {
      reject(new MigrationError(
        'Failed to open database for migration',
        request.error || undefined
      ));
    };
  });
}
