/**
 * Migration module for converting data from localStorage to IndexedDB
 *
 * This module handles the one-time migration of existing thoughts from localStorage
 * to the new IndexedDB-based storage system. It also includes mechanisms to prevent
 * re-migration and handle edge cases during the migration process.
 *
 * @module migration
 */

import type { Thought, MigrationStatus } from '../types/index.js';
import { saveThoughts, saveSettings } from './index.js';

/**
 * localStorage key constants for migration
 */
const STORAGE_KEYS = {
  /** Key where thoughts were stored in localStorage */
  THOUGHTS: 'brain-dump-thoughts',

  /** Key where settings were stored in localStorage */
  SETTINGS: 'brain-dump-settings',

  /** Key where migration status is stored (in IndexedDB metadata) */
  MIGRATION_FLAG: 'migration-from-localstorage',
} as const;

/**
 * Legacy thought format from localStorage
 * Thoughts may have been stored with different field names or formats
 *
 * @interface LegacyThought
 */
interface LegacyThought {
  id: string;
  content: string;
  createdAt: number | string; // May be stored as string in JSON
  tags?: string[];
  [key: string]: unknown; // Allow for additional legacy fields
}

/**
 * Result of a migration operation
 *
 * @interface MigrationResult
 */
interface MigrationResult {
  /** Whether any data was migrated */
  dataMigrated: boolean;

  /** Number of thoughts successfully migrated */
  thoughtsMigrated: number;

  /** Number of settings migrated */
  settingsMigrated: number;

  /** Any errors that occurred during migration */
  errors: string[];

  /** Timestamp when migration completed */
  completedAt: number;
}

/**
 * Migration status store interface
 * Handles storing and retrieving migration status
 */
const MigrationStore = {
  /**
   * Gets the current migration status from IndexedDB metadata
   *
   * @returns Promise that resolves to the migration status
   */
  async getStatus(): Promise<MigrationStatus | undefined> {
    try {
      // We'll store migration status in localStorage initially
      // This prevents the chicken-and-egg problem of needing IndexedDB
      // to check if we need to initialize IndexedDB
      const stored = localStorage.getItem(STORAGE_KEYS.MIGRATION_FLAG);

      if (stored) {
        return JSON.parse(stored) as MigrationStatus;
      }

      return undefined;
    } catch (error) {
      console.warn('[Migration] Failed to get migration status:', error);
      return undefined;
    }
  },

  /**
   * Sets the migration status
   *
   * @param status - The migration status to store
   */
  async setStatus(status: MigrationStatus): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.MIGRATION_FLAG, JSON.stringify(status));
    } catch (error) {
      console.warn('[Migration] Failed to set migration status:', error);
    }
  },

  /**
   * Checks if migration from localStorage has already been completed
   *
   * @returns Promise that resolves to true if migration was completed
   */
  async hasMigrated(): Promise<boolean> {
    const status = await this.getStatus();
    return status?.hasMigratedFromLocalStorage ?? false;
  },
};

/**
 * Validates and converts a legacy thought to the current Thought format
 *
 * @param legacy - The legacy thought object
 * @returns A properly formatted Thought object, or null if invalid
 *
 * @example
 * ```typescript
 * const thought = normalizeLegacyThought({
 *   id: '123',
 *   content: 'Hello',
 *   createdAt: '1234567890'
 * });
 * ```
 */
function normalizeLegacyThought(legacy: LegacyThought): Thought | null {
  try {
    // Validate required fields
    if (!legacy.id || typeof legacy.id !== 'string') {
      console.warn('[Migration] Invalid thought ID:', legacy);
      return null;
    }

    if (!legacy.content || typeof legacy.content !== 'string') {
      console.warn('[Migration] Invalid thought content:', legacy.id);
      return null;
    }

    // Normalize createdAt to number
    let createdAt: number;
    if (typeof legacy.createdAt === 'string') {
      createdAt = parseInt(legacy.createdAt, 10);
      if (isNaN(createdAt)) {
        createdAt = Date.now();
      }
    } else if (typeof legacy.createdAt === 'number') {
      createdAt = legacy.createdAt;
    } else {
      createdAt = Date.now();
    }

    // Validate createdAt is reasonable
    if (createdAt < 0 || createdAt > Date.now() + 86400000) {
      // More than a day in the future is suspicious
      createdAt = Date.now();
    }

    // Normalize tags
    const tags = Array.isArray(legacy.tags)
      ? legacy.tags.filter((tag): tag is string => typeof tag === 'string' && tag.length > 0)
      : [];

    return {
      id: legacy.id,
      content: legacy.content.trim(),
      createdAt,
      tags,
      // Embedding field is undefined - will be populated later by RAG system
      embedding: undefined,
    };
  } catch (error) {
    console.warn('[Migration] Error normalizing thought:', error);
    return null;
  }
}

/**
 * Reads thoughts from localStorage
 *
 * @returns Array of legacy thoughts from localStorage
 */
function readLegacyThoughts(): LegacyThought[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.THOUGHTS);

    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);

    // Handle both array and object formats
    if (Array.isArray(parsed)) {
      return parsed;
    }

    // If it's an object with numeric keys or similar, try to get values
    if (typeof parsed === 'object' && parsed !== null) {
      return Object.values(parsed).filter((item): item is LegacyThought => {
        return (
          item !== null &&
          typeof item === 'object' &&
          'id' in item &&
          'content' in item
        );
      });
    }

    return [];
  } catch (error) {
    console.error('[Migration] Error reading legacy thoughts:', error);
    return [];
  }
}

/**
 * Reads settings from localStorage
 *
 * @returns Settings object from localStorage
 */
function readLegacySettings(): Record<string, unknown> {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    if (!data) {
      return {};
    }

    return JSON.parse(data) as Record<string, unknown>;
  } catch (error) {
    console.error('[Migration] Error reading legacy settings:', error);
    return {};
  }
}

/**
 * Clears all legacy data from localStorage
 * This is called after successful migration
 *
 * @returns true if data was cleared successfully
 */
function clearLegacyData(): boolean {
  try {
    const keysToClear = [
      STORAGE_KEYS.THOUGHTS,
      STORAGE_KEYS.SETTINGS,
      // Keep MIGRATION_FLAG so we don't try to migrate again
    ];

    keysToClear.forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log('[Migration] Legacy data cleared from localStorage');
    return true;
  } catch (error) {
    console.error('[Migration] Error clearing legacy data:', error);
    return false;
  }
}

/**
 * Performs the migration from localStorage to IndexedDB
 *
 * This function:
 * 1. Checks if migration has already been done
 * 2. Reads all thoughts from localStorage
 * 3. Normalizes and validates each thought
 * 4. Saves valid thoughts to IndexedDB
 * 5. Migrates settings
 * 6. Marks migration as complete
 * 7. Optionally clears localStorage
 *
 * @param options - Migration options
 * @returns Promise that resolves to the migration result
 *
 * @example
 * ```typescript
 * const result = await migrateFromLocalStorage();
 * if (result.dataMigrated) {
 *   console.log(`Migrated ${result.thoughtsMigrated} thoughts`);
 * }
 * ```
 */
export async function migrateFromLocalStorage(options: {
  /** Whether to clear localStorage after successful migration (default: true) */
  clearAfterMigration?: boolean;

  /** Whether to force migration even if it has already been done (default: false) */
  force?: boolean;

  /** Custom callback for progress updates */
  onProgress?: (step: string, current: number, total: number) => void;
} = {}): Promise<MigrationResult> {
  const { clearAfterMigration = true, force = false, onProgress } = options;

  // Initialize result
  const result: MigrationResult = {
    dataMigrated: false,
    thoughtsMigrated: 0,
    settingsMigrated: 0,
    errors: [],
    completedAt: Date.now(),
  };

  try {
    // Check if migration has already been done
    if (!force) {
      const hasMigrated = await MigrationStore.hasMigrated();
      if (hasMigrated) {
        console.log('[Migration] Already migrated - skipping');
        return result;
      }
    }

    console.log('[Migration] Starting migration from localStorage to IndexedDB...');

    // Step 1: Read legacy thoughts
    onProgress?.('Reading legacy data', 0, 4);
    const legacyThoughts = readLegacyThoughts();

    if (legacyThoughts.length === 0) {
      console.log('[Migration] No legacy thoughts found to migrate');

      // Still mark as migrated so we don't keep checking
      await MigrationStore.setStatus({
        hasMigratedFromLocalStorage: true,
        migratedAt: Date.now(),
        thoughtsMigrated: 0,
      });

      return result;
    }

    console.log(`[Migration] Found ${legacyThoughts.length} legacy thoughts`);

    // Step 2: Normalize thoughts
    onProgress?.('Normalizing thoughts', 1, 4);
    const validThoughts: Thought[] = [];

    for (const legacy of legacyThoughts) {
      const normalized = normalizeLegacyThought(legacy);
      if (normalized) {
        validThoughts.push(normalized);
      } else {
        result.errors.push(`Failed to normalize thought with ID: ${legacy.id}`);
      }
    }

    if (validThoughts.length === 0) {
      console.warn('[Migration] No valid thoughts after normalization');
      await MigrationStore.setStatus({
        hasMigratedFromLocalStorage: true,
        migratedAt: Date.now(),
        thoughtsMigrated: 0,
      });
      return result;
    }

    // Step 3: Save to IndexedDB
    onProgress?.('Saving to IndexedDB', 2, 4);
    try {
      await saveThoughts(validThoughts);
      result.thoughtsMigrated = validThoughts.length;
      result.dataMigrated = true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Failed to save thoughts: ${errorMessage}`);
      throw error;
    }

    // Step 4: Migrate settings
    onProgress?.('Migrating settings', 3, 4);
    try {
      const legacySettings = readLegacySettings();

      if (Object.keys(legacySettings).length > 0) {
        await saveSettings(legacySettings as Parameters<typeof saveSettings>[0]);
        result.settingsMigrated = 1;
        console.log('[Migration] Settings migrated successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Failed to migrate settings: ${errorMessage}`);
      // Don't throw - settings migration failure is not critical
    }

    // Step 5: Mark migration as complete
    onProgress?.('Completing migration', 4, 4);
    await MigrationStore.setStatus({
      hasMigratedFromLocalStorage: true,
      migratedAt: Date.now(),
      thoughtsMigrated: result.thoughtsMigrated,
    });

    // Step 6: Clear localStorage if requested
    if (clearAfterMigration) {
      clearLegacyData();
    }

    console.log(
      `[Migration] Completed: ${result.thoughtsMigrated} thoughts, ${result.settingsMigrated} settings migrated`
    );

    result.completedAt = Date.now();
    return result;
  } catch (error) {
    console.error('[Migration] Migration failed:', error);

    result.errors.push(
      `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );

    return result;
  }
}

/**
 * Checks if localStorage contains legacy data that should be migrated
 *
 * @returns Promise that resolves to true if legacy data exists
 *
 * @example
 * ```typescript
 * if (await hasLegacyData()) {
 *   console.log('Legacy data found - migration needed');
 * }
 * ```
 */
export async function hasLegacyData(): Promise<boolean> {
  // Check if migration has already been done
  const hasMigrated = await MigrationStore.hasMigrated();
  if (hasMigrated) {
    return false;
  }

  // Check if localStorage has the thoughts key
  return localStorage.getItem(STORAGE_KEYS.THOUGHTS) !== null;
}

/**
 * Gets information about legacy data without migrating
 *
 * @returns Object with information about legacy data
 *
 * @example
 * ```typescript
 * const info = await getLegacyDataInfo();
 * console.log(`Legacy thoughts: ${info.thoughtCount}`);
 * ```
 */
export async function getLegacyDataInfo(): Promise<{
  hasLegacyData: boolean;
  thoughtsCount: number;
  hasSettings: boolean;
  estimatedSize: number;
}> {
  try {
    const thoughtsData = localStorage.getItem(STORAGE_KEYS.THOUGHTS);
    const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    let thoughtsCount = 0;

  if (thoughtsData) {
    try {
      const parsed = JSON.parse(thoughtsData);
      thoughtsCount = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
    } catch {
      // If we can't parse it, we can't count it
    }
  }

  const estimatedSize =
    (thoughtsData?.length || 0) + (settingsData?.length || 0);

  return {
    hasLegacyData: thoughtsData !== null || settingsData !== null,
    thoughtsCount,
    hasSettings: settingsData !== null,
    estimatedSize,
  };
  } catch (error) {
    // localStorage might be disabled (e.g., private browsing mode)
    console.warn('[Migration] Unable to access localStorage:', error);
    return {
      hasLegacyData: false,
      thoughtsCount: 0,
      hasSettings: false,
      estimatedSize: 0,
    };
  }
}

/**
 * Resets the migration flag, allowing migration to run again
 * This is useful for testing or re-running a failed migration
 *
 * @returns Promise that resolves when the flag is reset
 *
 * @example
 * ```typescript
 * await resetMigrationFlag();
 * // Migration can now run again
 * await migrateFromLocalStorage();
 * ```
 */
export async function resetMigrationFlag(): Promise<void> {
  try {
    localStorage.removeItem(STORAGE_KEYS.MIGRATION_FLAG);
    console.log('[Migration] Migration flag reset');
  } catch (error) {
    console.error('[Migration] Error resetting migration flag:', error);
  }
}

/**
 * Exports legacy data without performing migration
 * Useful for backup purposes or manual inspection
 *
 * @returns Object containing all legacy data
 *
 * @example
 * ```typescript
 * const legacy = await exportLegacyData();
 * console.log('Exported:', legacy);
 * ```
 */
export function exportLegacyData(): {
  thoughts: LegacyThought[];
  settings: Record<string, unknown>;
  exportedAt: number;
} {
  return {
    thoughts: readLegacyThoughts(),
    settings: readLegacySettings(),
    exportedAt: Date.now(),
  };
}
