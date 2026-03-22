/**
 * Main storage service for the Brain Dump RAG application
 *
 * This module provides the primary interface for all storage operations in the application.
 * It handles database initialization, runs automatic migration from localStorage,
 * and exports clean, typed APIs for application code to use.
 *
 * The storage service ensures the database is ready before any operations are performed
 * and provides consistent error handling across all storage operations.
 *
 * @module storage
 */

import {
  type Thought,
  type AppSettings,
  type ThoughtQueryOptions,
} from '../types/index.js';
import * as dbOps from './index.js';
import * as migration from './migration.js';
import { embed, initEmbedding } from '../services/embedding.js';

/**
 * Progress callback for model loading
 */
export interface EmbeddingProgress {
  /** Progress percentage (0-100) */
  progress: number;
  /** Status message */
  status: string;
}

/**
 * Storage service initialization state
 */
type InitializationState = 'uninitialized' | 'initializing' | 'initialized' | 'error';

/**
 * Current initialization state
 */
let initState: InitializationState = 'uninitialized';

/**
 * Initialization promise cache (prevents race conditions)
 */
let initPromise: Promise<void> | null = null;

/**
 * Last initialization error (if any)
 */
let initError: Error | null = null;

/**
 * Current database version
 */
export const DB_VERSION = 1;

/**
 * Current schema version
 */
export const SCHEMA_VERSION = '1.0.0';

/**
 * Embedding service initialization state
 */
export type EmbeddingState = 'disabled' | 'initializing' | 'ready' | 'error';

/**
 * Current embedding service state
 */
let embeddingState: EmbeddingState = 'disabled';

/**
 * Embedding service initialization promise
 */
let embeddingInitPromise: Promise<void> | null = null;

/**
 * Callbacks for embedding progress
 */
const embeddingProgressCallbacks: Array<(progress: EmbeddingProgress) => void> = [];

/**
 * Ensures the database is initialized before performing operations
 *
 * @param operation - The operation name (for error messages)
 * @throws {DatabaseError} If initialization fails
 */
async function ensureInitialized(operation: string): Promise<void> {
  // If already initialized, return immediately
  if (initState === 'initialized') {
    return;
  }

  // If there was an error before, throw it
  if (initError) {
    throw initError;
  }

  // If currently initializing, wait for it
  if (initState === 'initializing') {
    if (initPromise) {
      await initPromise;
      return;
    }
  }

  // Start initialization
  initState = 'initializing';
  initPromise = performInitialization();

  try {
    await initPromise;
    initState = 'initialized';
    initPromise = null;
  } catch (error) {
    initState = 'error';
    initError = error as Error;
    initPromise = null;
    throw error;
  }
}

/**
 * Performs the actual initialization sequence
 */
async function performInitialization(): Promise<void> {
  try {
    // Step 1: Initialize the database
    await dbOps.initDB();

    // Step 2: Run migration if needed
    const hasLegacy = await migration.hasLegacyData();
    if (hasLegacy) {
      console.log('[Storage] Migrating data from localStorage to IndexedDB...');
      await migration.migrateFromLocalStorage();
      console.log('[Storage] Migration completed successfully');
    }

    // Step 3: Verify database is accessible
    const count = await dbOps.getThoughtCount();
    console.log(`[Storage] Database initialized successfully. Total thoughts: ${count}`);
  } catch (error) {
    console.error('[Storage] Initialization failed:', error);
    throw new dbOps.DatabaseError(
      'INIT_FAILED',
      `Failed to initialize storage: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Initializes the storage service
 * Call this before using any other storage methods
 *
 * @example
 * ```typescript
 * await storage.init();
 * const thoughts = await storage.getAllThoughts();
 * ```
 */
export async function init(): Promise<void> {
  await ensureInitialized('init');
}

/**
 * Gets all thoughts from storage
 *
 * @returns Promise that resolves to an array of all thoughts
 *
 * @example
 * ```typescript
 * const thoughts = await storage.getAllThoughts();
 * console.log(`Found ${thoughts.length} thoughts`);
 * ```
 */
export async function getAllThoughts(): Promise<Thought[]> {
  await ensureInitialized('get all thoughts');
  return dbOps.getThoughts();
}

/**
 * Gets a thought by its ID
 *
 * @param id - The unique identifier of the thought
 * @returns Promise that resolves to the thought, or undefined if not found
 *
 * @example
 * ```typescript
 * const thought = await storage.getThoughtById('thought-123');
 * if (thought) {
 *   console.log(thought.content);
 * }
 * ```
 */
export async function getThoughtById(id: string): Promise<Thought | undefined> {
  await ensureInitialized('get thought by ID');
  return dbOps.getThoughtById(id);
}

/**
 * Saves a thought to storage
 * If a thought with the same ID exists, it will be updated
 *
 * This function saves the thought immediately to IndexedDB. If computeEmbedding
 * is true (and the thought doesn't already have an embedding), the embedding
 * is computed asynchronously and the thought is updated when ready.
 *
 * @param thought - The thought to save
 * @param options - Optional parameters (compute embedding)
 * @returns Promise that resolves to the saved thought
 * @throws {DatabaseError} If saving fails (e.g., quota exceeded)
 *
 * @example
 * ```typescript
 * const saved = await storage.saveThought({
 *   id: 'thought-123',
 *   content: 'My new thought',
 *   createdAt: Date.now(),
 *   tags: ['personal']
 * });
 *
 * // Save with embedding computation
 * const saved = await storage.saveThought(thought, { computeEmbedding: true });
 * ```
 */
export async function saveThought(
  thought: Thought,
  options: {
    computeEmbedding?: boolean;
  } = {}
): Promise<Thought> {
  await ensureInitialized('save thought');

  // Save the thought immediately
  const savedThought = await dbOps.saveThought(thought);

  // Compute embedding asynchronously if requested and not already present
  if (options.computeEmbedding && !thought.embedding) {
    // Don't wait - compute in background
    computeAndUpdateEmbedding(thought.id, thought.content).catch((error) => {
      console.error(`[Storage] Failed to compute embedding for thought ${thought.id}:`, error);
    });
  }

  return savedThought;
}

/**
 * Saves multiple thoughts in a single transaction
 *
 * @param thoughts - Array of thoughts to save
 * @returns Promise that resolves to the number of successfully saved thoughts
 *
 * @example
 * ```typescript
 * const count = await storage.saveThoughts([thought1, thought2, thought3]);
 * console.log(`Saved ${count} thoughts`);
 * ```
 */
export async function saveThoughts(thoughts: Thought[]): Promise<number> {
  await ensureInitialized('save thoughts');
  return dbOps.saveThoughts(thoughts);
}

/**
 * Creates a new thought with an auto-generated ID
 *
 * This function saves the thought immediately to IndexedDB for instant UI display.
 * If computeEmbedding is true, the embedding is computed asynchronously and
 * the thought is updated with the embedding when it's ready.
 *
 * @param content - The content of the thought
 * @param options - Optional parameters (tags, custom ID, compute embedding)
 * @returns Promise that resolves to the created thought
 *
 * @example
 * ```typescript
 * // Create thought without embedding
 * const thought = await storage.createThought('Remember to buy milk', {
 *   tags: ['shopping', 'personal']
 * });
 *
 * // Create thought with embedding
 * const thought = await storage.createThought('Remember to buy milk', {
 *   tags: ['shopping', 'personal'],
 *   computeEmbedding: true
 * });
 * ```
 */
export async function createThought(
  content: string,
  options: {
    tags?: string[];
    id?: string;
    createdAt?: number;
    computeEmbedding?: boolean;
  } = {}
): Promise<Thought> {
  await ensureInitialized('create thought');

  // Use crypto.randomUUID() if available, fallback to timestamp + random
  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `thought-${crypto.randomUUID()}`;
    }
    // Fallback with more uniqueness
    return `thought-${Date.now()}-${Math.random().toString(36).substring(2, 11)}-${Math.random().toString(36).substring(2, 6)}`;
  };

  const id = options.id || generateId();
  const createdAt = options.createdAt || Date.now();

  const thought: Thought = {
    id,
    content: content.trim(),
    createdAt,
    tags: options.tags || [],
    embedding: undefined,
  };

  // Save the thought immediately (for instant UI display)
  const savedThought = await dbOps.saveThought(thought);

  // Compute embedding asynchronously if requested
  if (options.computeEmbedding) {
    // Don't wait - compute in background
    computeAndUpdateEmbedding(id, content).catch((error) => {
      console.error(`[Storage] Failed to compute embedding for thought ${id}:`, error);
    });
  }

  return savedThought;
}

/**
 * Deletes a thought from storage
 *
 * @param id - The unique identifier of the thought to delete
 * @returns Promise that resolves to true if the thought was deleted, false otherwise
 *
 * @example
 * ```typescript
 * const deleted = await storage.deleteThought('thought-123');
 * if (deleted) {
 *   console.log('Thought deleted successfully');
 * }
 * ```
 */
export async function deleteThought(id: string): Promise<boolean> {
  await ensureInitialized('delete thought');
  return dbOps.deleteThought(id);
}

/**
 * Deletes multiple thoughts by their IDs
 *
 * @param ids - Array of thought IDs to delete
 * @returns Promise that resolves to the number of deleted thoughts
 *
 * @example
 * ```typescript
 * const count = await storage.deleteThoughts(['thought-1', 'thought-2', 'thought-3']);
 * console.log(`Deleted ${count} thoughts`);
 * ```
 */
export async function deleteThoughts(ids: string[]): Promise<number> {
  await ensureInitialized('delete thoughts');
  return dbOps.deleteThoughts(ids);
}

/**
 * Deletes all thoughts from storage
 *
 * @returns Promise that resolves when all thoughts are deleted
 *
 * @example
 * ```typescript
 * await storage.clearThoughts();
 * console.log('All thoughts cleared');
 * ```
 */
export async function clearThoughts(): Promise<void> {
  await ensureInitialized('clear thoughts');
  return dbOps.clearThoughts();
}

/** Alias for clearThoughts */
export const clearAllThoughts = clearThoughts;

/**
 * Gets the total count of thoughts in storage
 *
 * @returns Promise that resolves to the count of thoughts
 *
 * @example
 * ```typescript
 * const count = await storage.getThoughtCount();
 * console.log(`You have ${count} thoughts stored`);
 * ```
 */
export async function getThoughtCount(): Promise<number> {
  await ensureInitialized('get thought count');
  return dbOps.getThoughtCount();
}

/**
 * Searches thoughts by content text
 *
 * @param searchTerm - The text to search for
 * @returns Promise that resolves to matching thoughts
 *
 * @example
 * ```typescript
 * const results = await storage.searchThoughts('react');
 * console.log(`Found ${results.length} matching thoughts`);
 * ```
 */
export async function searchThoughts(searchTerm: string): Promise<Thought[]> {
  await ensureInitialized('search thoughts');
  return dbOps.searchThoughts(searchTerm);
}

/**
 * Gets all thoughts with a specific tag
 *
 * @param tag - The tag to filter by
 * @returns Promise that resolves to thoughts with the specified tag
 *
 * @example
 * ```typescript
 * const workThoughts = await storage.getThoughtsByTag('work');
 * console.log(`Found ${workThoughts.length} work-related thoughts`);
 * ```
 */
export async function getThoughtsByTag(tag: string): Promise<Thought[]> {
  await ensureInitialized('get thoughts by tag');
  return dbOps.getThoughtsByTag(tag);
}

/**
 * Query thoughts with filtering and sorting options
 *
 * @param options - Query options for filtering and sorting
 * @returns Promise that resolves to matching thoughts
 *
 * @example
 * ```typescript
 * // Get recent thoughts tagged 'work', sorted by newest first
 * const recent = await storage.queryThoughts({
 *   tags: ['work'],
 *   sortOrder: 'desc',
 *   limit: 10
 * });
 *
 * // Search thoughts with a query and date range
 * const results = await storage.queryThoughts({
 *   searchQuery: 'project',
 *   dateRange: { from: Date.now() - 86400000 * 7 }, // Last 7 days
 *   limit: 20
 * });
 * ```
 */
export async function queryThoughts(options: ThoughtQueryOptions = {}): Promise<Thought[]> {
  await ensureInitialized('query thoughts');

  let thoughts = await dbOps.getThoughts();

  // Filter by tags
  if (options.tags && options.tags.length > 0) {
    thoughts = thoughts.filter(t =>
      options.tags!.some(tag => t.tags.includes(tag))
    );
  }

  // Filter by search term
  if (options.searchQuery) {
    const term = options.searchQuery.toLowerCase();
    thoughts = thoughts.filter(t =>
      t.content.toLowerCase().includes(term)
    );
  }

  // Filter by date range
  if (options.dateRange?.from !== undefined) {
    thoughts = thoughts.filter(t => t.createdAt >= options.dateRange!.from!);
  }
  if (options.dateRange?.to !== undefined) {
    thoughts = thoughts.filter(t => t.createdAt <= options.dateRange!.to!);
  }

  // Sort by createdAt (only createdAt is supported for sorting)
  const sortOrder = options.sortOrder || 'desc';
  thoughts.sort((a, b) => {
    return sortOrder === 'desc' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt;
  });

  // Apply offset for pagination
  if (options.offset) {
    thoughts = thoughts.slice(options.offset);
  }

  // Limit
  if (options.limit) {
    thoughts = thoughts.slice(0, options.limit);
  }

  return thoughts;
}

/**
 * Gets the application settings
 *
 * @returns Promise that resolves to the current settings
 *
 * @example
 * ```typescript
 * const settings = await storage.getSettings();
 * console.log('AI enabled:', settings.useRealAI);
 * ```
 */
export async function getSettings(): Promise<AppSettings> {
  await ensureInitialized('get settings');
  return dbOps.getSettings();
}

/**
 * Saves the application settings
 *
 * @param settings - The settings to save
 * @returns Promise that resolves when settings are saved
 *
 * @example
 * ```typescript
 * await storage.saveSettings({
 *   useRealAI: true,
 *   apiUrl: 'https://api.openai.com/v1',
 *   modelName: 'gpt-4o-mini'
 * });
 * ```
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  await ensureInitialized('save settings');
  return dbOps.saveSettings(settings);
}

/**
 * Updates specific settings fields
 *
 * @param updates - Partial settings to update
 * @returns Promise that resolves to the merged settings
 *
 * @example
 * ```typescript
 * const updated = await storage.updateSettings({
 *   useRealAI: true
 * });
 * ```
 */
export async function updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  await ensureInitialized('update settings');
  return dbOps.updateSettings(updates);
}

/**
 * Clears all application settings
 *
 * @returns Promise that resolves when settings are cleared
 *
 * @example
 * ```typescript
 * await storage.clearSettings();
 * console.log('Settings cleared to defaults');
 * ```
 */
export async function clearSettings(): Promise<void> {
  await ensureInitialized('clear settings');
  return dbOps.clearSettings();
}

/**
 * Updates the embedding vector for a thought
 * Used by the RAG system to store computed embeddings
 *
 * @param thoughtId - The ID of the thought
 * @param embedding - The embedding vector to store
 * @returns Promise that resolves when the embedding is updated
 *
 * @example
 * ```typescript
 * const embedding = await computeEmbedding(thought.content);
 * await storage.updateThoughtEmbedding(thought.id, embedding);
 * ```
 */
export async function updateThoughtEmbedding(
  thoughtId: string,
  embedding: number[]
): Promise<void> {
  await ensureInitialized('update embedding');

  const thought = await dbOps.getThoughtById(thoughtId);
  if (!thought) {
    throw new dbOps.DatabaseError(
      'NOT_FOUND',
      `Thought with ID ${thoughtId} not found`
    );
  }

  thought.embedding = embedding;
  await dbOps.saveThought(thought);
}

/**
 * Exports all data from storage
 *
 * @returns Promise that resolves to the exported data
 *
 * @example
 * ```typescript
 * const data = await storage.exportData();
 * console.log(`Exported ${data.thoughts.length} thoughts`);
 * ```
 */
export async function exportData(): Promise<{
  thoughts: Thought[];
  settings: AppSettings;
  exportedAt: number;
  version: string;
}> {
  await ensureInitialized('export data');
  return dbOps.exportData();
}

/**
 * Imports data into storage
 *
 * @param data - The data to import
 * @param options - Import options
 * @returns Promise that resolves when import is complete
 *
 * @example
 * ```typescript
 * await storage.importData(exportedData, { overwrite: false });
 * console.log('Data imported successfully');
 * ```
 */
export async function importData(
  data: Awaited<ReturnType<typeof exportData>>,
  options: { overwrite?: boolean } = {}
): Promise<{
  thoughtsAdded: number;
  thoughtsUpdated: number;
}> {
  await ensureInitialized('import data');
  return dbOps.importData(data, options);
}

/**
 * Gets information about the storage
 *
 * @returns Promise that resolves to storage information
 *
 * @example
 * ```typescript
 * const info = await storage.getStorageInfo();
 * console.log(`Storage size: ${info.approximateSize} bytes`);
 * ```
 */
export async function getStorageInfo(): Promise<{
  thoughtCount: number;
  hasEmbeddings: boolean;
  approximateSize: number;
  oldestThought?: number;
  newestThought?: number;
}> {
  await ensureInitialized('get storage info');

  const thoughts = await dbOps.getThoughts();
  const withEmbeddings = thoughts.filter(t => t.embedding && t.embedding.length > 0);

  let approximateSize = 0;
  thoughts.forEach(t => {
    approximateSize += t.content.length * 2; // UTF-16
    approximateSize += t.tags.length * 20; // Approximate tag size
    if (t.embedding) {
      approximateSize += t.embedding.length * 4; // Float32Array
    }
  });

  const createdAt = thoughts.map(t => t.createdAt);
  const oldest = createdAt.length > 0 ? Math.min(...createdAt) : undefined;
  const newest = createdAt.length > 0 ? Math.max(...createdAt) : undefined;

  return {
    thoughtCount: thoughts.length,
    hasEmbeddings: withEmbeddings.length > 0,
    approximateSize,
    oldestThought: oldest,
    newestThought: newest,
  };
}

/**
 * Checks if there is legacy data in localStorage that hasn't been migrated
 *
 * @returns Promise that resolves to true if legacy data exists
 *
 * @example
 * ```typescript
 * const hasLegacy = await storage.hasLegacyData();
 * if (hasLegacy) {
 *   console.log('Legacy data found, migration will run automatically');
 * }
 * ```
 */
export async function hasLegacyData(): Promise<boolean> {
  return migration.hasLegacyData();
}

/**
 * Gets information about legacy data in localStorage
 *
 * @returns Promise that resolves to legacy data info
 *
 * @example
 * ```typescript
 * const info = await storage.getLegacyDataInfo();
 * console.log(`Legacy thoughts: ${info.thoughtCount}`);
 * ```
 */
export async function getLegacyDataInfo(): Promise<{
  exists: boolean;
  thoughtCount: number;
  hasSettings: boolean;
  approximateSize: number;
}> {
  return migration.getLegacyDataInfo();
}

/**
 * Resets the migration flag, allowing re-migration
 * Use with caution - primarily for debugging
 *
 * @example
 * ```typescript
 * await storage.resetMigrationFlag();
 * await storage.init(); // Will run migration again
 * ```
 */
export async function resetMigrationFlag(): Promise<void> {
  migration.resetMigrationFlag();
}

/**
 * Exports legacy data from localStorage
 *
 * @returns Promise that resolves to the legacy data
 *
 * @example
 * ```typescript
 * const legacy = await storage.exportLegacyData();
 * console.log('Exported legacy data for backup');
 * ```
 */
export async function exportLegacyData(): Promise<{
  thoughts: Thought[];
  settings: AppSettings;
}> {
  return migration.exportLegacyData();
}

/**
 * Closes the database connection
 * Use this before page unload to ensure data integrity
 *
 * @example
 * ```typescript
 * window.addEventListener('beforeunload', async () => {
 *   await storage.close();
 * });
 * ```
 */
export async function close(): Promise<void> {
  await dbOps.closeDB();
  initState = 'uninitialized';
  initError = null;
  initPromise = null;
  embeddingState = 'disabled';
  embeddingInitPromise = null;
}

/**
 * Initialize the embedding service
 *
 * This loads the embedding model in the background. The model will be
 * ready for computing embeddings after this completes.
 *
 * @param options - Optional configuration for embedding initialization
 * @returns Promise that resolves when the embedding service is ready
 *
 * @example
 * ```typescript
 * await storage.initEmbedding({ onProgress: (p) => console.log(p.status) });
 * console.log('Embedding service ready!');
 * ```
 */
export async function initEmbeddingService(options: {
  onProgress?: (progress: EmbeddingProgress) => void;
} = {}): Promise<void> {
  // If already initializing or ready, return existing promise
  if (embeddingState === 'initializing' || embeddingState === 'ready') {
    return embeddingInitPromise || Promise.resolve();
  }

  // If there was an error before, reset state
  if (embeddingState === 'error') {
    embeddingState = 'disabled';
  }

  // Store progress callback
  if (options.onProgress) {
    embeddingProgressCallbacks.push(options.onProgress);
  }

  // Start initialization
  embeddingState = 'initializing';
  embeddingInitPromise = performEmbeddingInitialization();

  try {
    await embeddingInitPromise;
    embeddingState = 'ready';
    embeddingInitPromise = null;
  } catch (error) {
    embeddingState = 'error';
    embeddingInitPromise = null;
    throw error;
  }
}

/**
 * Performs the actual embedding service initialization
 */
async function performEmbeddingInitialization(): Promise<void> {
  try {
    await initEmbedding({
      onProgress: (progress) => {
        // Notify all registered callbacks
        embeddingProgressCallbacks.forEach(callback => callback(progress));
      }
    });
    console.log('[Storage] Embedding service initialized successfully');
  } catch (error) {
    console.error('[Storage] Embedding service initialization failed:', error);
    throw new dbOps.DatabaseError(
      'EMBEDDING_INIT_ERROR',
      `Failed to initialize embedding service: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Compute embedding for a thought and update it in storage
 *
 * This is an internal function that handles the "save first, then update embedding" pattern.
 * It computes the embedding asynchronously and updates the thought when ready.
 *
 * @param thoughtId - The ID of the thought
 * @param content - The content to compute embedding for
 * @returns Promise that resolves when the embedding is updated
 *
 * @internal
 */
async function computeAndUpdateEmbedding(
  thoughtId: string,
  content: string
): Promise<void> {
  try {
    // Ensure embedding service is initialized
    if (embeddingState === 'disabled') {
      // Auto-initialize on first use
      await initEmbeddingService();
    } else if (embeddingState === 'error') {
      throw new Error('Embedding service is in error state');
    } else if (embeddingState === 'initializing') {
      // Wait for initialization to complete
      await embeddingInitPromise;
    }

    // Compute the embedding
    const embedding = await embed(content);

    // Convert Float32Array to regular array for storage
    const embeddingArray = Array.from(embedding);

    // Update the thought with the embedding
    await updateThoughtEmbedding(thoughtId, embeddingArray);

    console.log(`[Storage] Updated embedding for thought ${thoughtId}`);
  } catch (error) {
    console.error(`[Storage] Failed to compute/update embedding for thought ${thoughtId}:`, error);
    throw error;
  }
}

/**
 * Compute embedding for text without saving to storage
 *
 * Use this to get embeddings for search queries or other purposes.
 *
 * @param text - The text to compute embedding for
 * @returns Promise that resolves to the embedding vector
 *
 * @example
 * ```typescript
 * const embedding = await storage.computeEmbedding('search query');
 * console.log('Embedding dimensions:', embedding.length);
 * ```
 */
export async function computeEmbedding(text: string): Promise<number[]> {
  // Ensure embedding service is initialized
  if (embeddingState === 'disabled') {
    await initEmbeddingService();
  } else if (embeddingState === 'initializing') {
    await embeddingInitPromise;
  } else if (embeddingState === 'error') {
    throw new Error('Embedding service is in error state');
  }

  // Compute and return embedding
  const embedding = await embed(text);
  return Array.from(embedding);
}

/**
 * Get the current embedding service state
 *
 * @returns The current state
 *
 * @example
 * ```typescript
 * const state = storage.getEmbeddingState();
 * console.log('Embedding service:', state);
 * // Output: 'ready' | 'initializing' | 'disabled' | 'error'
 * ```
 */
export function getEmbeddingState(): EmbeddingState {
  return embeddingState;
}

/**
 * Check if the embedding service is ready
 *
 * @returns True if the embedding service is ready to compute embeddings
 *
 * @example
 * ```typescript
 * if (storage.isEmbeddingReady()) {
 *   const embedding = await storage.computeEmbedding('text');
 * }
 * ```
 */
export function isEmbeddingReady(): boolean {
  return embeddingState === 'ready';
}

/**
 * Register a callback for embedding progress updates
 *
 * @param callback - The callback function
 * @returns Unregister function
 *
 * @example
 * ```typescript
 * const unregister = storage.onEmbeddingProgress((progress) => {
 *   console.log(`Loading: ${progress.progress}% - ${progress.status}`);
 * });
 *
 * // Later...
 * unregister();
 * ```
 */
export function onEmbeddingProgress(
  callback: (progress: EmbeddingProgress) => void
): () => void {
  embeddingProgressCallbacks.push(callback);

  // Return unregister function
  return () => {
    const index = embeddingProgressCallbacks.indexOf(callback);
    if (index > -1) {
      embeddingProgressCallbacks.splice(index, 1);
    }
  };
}

/**
 * Deletes the entire database
 * Use with caution - this cannot be undone
 *
 * @example
 * ```typescript
 * if (confirm('Delete all data? This cannot be undone.')) {
 *   await storage.deleteDatabase();
 * }
 * ```
 */
export async function deleteDatabase(): Promise<void> {
  await dbOps.deleteDatabase();
  initState = 'uninitialized';
  initError = null;
  initPromise = null;
}

/**
 * Resets the storage service for testing purposes
 * This is an internal API, use with caution
 *
 * @internal
 */
export async function _resetForTesting(): Promise<void> {
  await deleteDatabase();
  initError = null;
}

/**
 * Default export for convenient usage
 */
const storage = {
  init,
  getAllThoughts,
  getThoughtById,
  saveThought,
  saveThoughts,
  createThought,
  deleteThought,
  deleteThoughts,
  clearThoughts,
  clearAllThoughts,
  getThoughtCount,
  searchThoughts,
  getThoughtsByTag,
  queryThoughts,
  getSettings,
  saveSettings,
  updateSettings,
  clearSettings,
  updateThoughtEmbedding,
  exportData,
  importData,
  getStorageInfo,
  hasLegacyData,
  getLegacyDataInfo,
  resetMigrationFlag,
  exportLegacyData,
  close,
  deleteDatabase,
  _resetForTesting,
  initEmbeddingService,
  computeEmbedding,
  getEmbeddingState,
  isEmbeddingReady,
  onEmbeddingProgress,
};

export default storage;
