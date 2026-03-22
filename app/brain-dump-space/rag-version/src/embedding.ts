/**
 * Embedding System - Main Entry Point
 *
 * This module provides a unified API for the entire embedding system.
 * Import from here for easy access to all embedding functionality.
 *
 * @module embedding
 *
 * @example
 * ```typescript
 * import * as Embedding from './embedding.js';
 *
 * // Initialize
 * await Embedding.init();
 *
 * // Create thought with embedding
 * const thought = await Embedding.createThoughtWithEmbedding(
 *   'My thought content',
 *   ['tag1', 'tag2']
 * );
 *
 * // Semantic search
 * const results = await Embedding.semanticSearch('search query', 10);
 *
 * // Clean up
 * await Embedding.dispose();
 * ```
 */

// Core embedding service
export {
  EmbeddingService,
  embed,
  embedBatch,
  initEmbedding,
  disposeEmbedding,
  type EmbeddingConfig,
  type EmbeddingProgress,
  type EmbeddingResult
} from './services/embedding.js';

// Storage integration
export {
  initEmbeddingService,
  computeEmbedding,
  updateThoughtEmbedding,
  getEmbeddingState,
  isEmbeddingReady,
  onEmbeddingProgress,
  type EmbeddingState
} from './db/storage.js';

// Utility functions
export {
  cosineSimilarity,
  euclideanDistance,
  dotProduct,
  normalizeVector,
  isVectorNormalized,
  findSimilarThoughts,
  findMostSimilarThought,
  similarityMatrix,
  clusterThoughts,
  recommendThoughts,
  averageEmbedding,
  findOutliers,
  float32ToArray,
  arrayToFloat32,
  isValidEmbedding,
  embeddingStats,
  EmbeddingUtils
} from './utils/embedding.js';

// Types
export type {
  Thought,
  RagSearchOptions,
  RagSearchResult,
  EmbeddingOptions
} from './types/index.js';

/**
 * Initialize the embedding system
 *
 * This is a convenience function that initializes both storage
 * and the embedding service.
 *
 * @param options - Optional configuration
 * @returns Promise that resolves when ready
 *
 * @example
 * ```typescript
 * await Embedding.init({
 *   onProgress: (p) => console.log(p.status)
 * });
 * ```
 */
export async function init(options?: {
  onProgress?: (progress: { progress: number; status: string }) => void;
}): Promise<void> {
  const { init } = await import('./db/storage.js');
  await init();

  if (options) {
    await initEmbeddingService(options);
  } else {
    await initEmbeddingService();
  }
}

/**
 * Create a thought with automatic embedding computation
 *
 * @param content - Thought content
 * @param tags - Optional tags
 * @returns Promise that resolves to the created thought
 *
 * @example
 * ```typescript
 * const thought = await Embedding.createThoughtWithEmbedding(
 *   'Important idea',
 *   ['work', 'ideas']
 * );
 * ```
 */
export async function createThoughtWithEmbedding(
  content: string,
  tags: string[] = []
) {
  const { createThought } = await import('./db/storage.js');
  return createThought(content, {
    tags,
    computeEmbedding: true
  });
}

/**
 * Perform semantic search on thoughts
 *
 * @param query - Search query
 * @param limit - Maximum number of results (default: 10)
 * @param threshold - Minimum similarity threshold (default: 0.7)
 * @returns Promise that resolves to sorted results
 *
 * @example
 * ```typescript
 * const results = await Embedding.semanticSearch('javascript tutorial', 5, 0.8);
 * results.forEach(r => {
 *   console.log(`${r.similarity.toFixed(2)}: ${r.thought.content}`);
 * });
 * ```
 */
export async function semanticSearch(
  query: string,
  limit: number = 10,
  threshold: number = 0.7
) {
  const { getThoughts } = await import('./db/storage.js');
  const thoughts = await getThoughts();

  const queryEmbedding = await computeEmbedding(query);
  const results = findSimilarThoughts(queryEmbedding, thoughts, {
    threshold,
    limit
  });

  return results;
}

/**
 * Find thoughts similar to a given thought
 *
 * @param thoughtId - ID of the thought to find similarities for
 * @param limit - Maximum number of results (default: 5)
 * @returns Promise that resolves to similar thoughts
 *
 * @example
 * ```typescript
 * const similar = await Embedding.findSimilarThoughts('thought-123', 5);
 * console.log(`Found ${similar.length} similar thoughts`);
 * ```
 */
export async function findSimilarThoughtsById(
  thoughtId: string,
  limit: number = 5
) {
  const { getThoughtById, getThoughts } = await import('./db/storage.js');

  const targetThought = await getThoughtById(thoughtId);
  if (!targetThought?.embedding) {
    throw new Error('Thought not found or has no embedding');
  }

  const allThoughts = await getThoughts();
  const otherThoughts = allThoughts.filter(t => t.id !== thoughtId);

  return findSimilarThoughts(targetThought.embedding, otherThoughts, {
    limit,
    threshold: 0
  });
}

/**
 * Compute and store embeddings for all thoughts that don't have them
 *
 * @param onProgress - Optional callback for progress updates
 * @returns Promise that resolves when complete
 *
 * @example
 * ```typescript
 * await Embedding.embedAllThoughts((current, total) => {
 *   console.log(`Processing ${current}/${total}`);
 * });
 * ```
 */
export async function embedAllThoughts(
  onProgress?: (current: number, total: number) => void
) {
  const { getThoughts, saveThought } = await import('./db/storage.js');

  const thoughts = await getThoughts();
  const withoutEmbeddings = thoughts.filter(t => !t.embedding);

  for (let i = 0; i < withoutEmbeddings.length; i++) {
    const thought = withoutEmbeddings[i];
    await saveThought(thought, { computeEmbedding: true });

    if (onProgress) {
      onProgress(i + 1, withoutEmbeddings.length);
    }
  }
}

/**
 * Get embedding system statistics
 *
 * @returns Promise that resolves to statistics
 *
 * @example
 * ```typescript
 * const stats = await Embedding.getStats();
 * console.log(`Total thoughts: ${stats.totalThoughts}`);
 * console.log(`With embeddings: ${stats.thoughtsWithEmbeddings}`);
 * console.log(`Embedding coverage: ${stats.coveragePercentage}%`);
 * ```
 */
export async function getStats() {
  const { getThoughts } = await import('./db/storage.js');

  const thoughts = await getThoughts();
  const withEmbeddings = thoughts.filter(t => t.embedding);

  return {
    totalThoughts: thoughts.length,
    thoughtsWithEmbeddings: withEmbeddings.length,
    thoughtsWithoutEmbeddings: thoughts.length - withEmbeddings.length,
    coveragePercentage: thoughts.length > 0
      ? (withEmbeddings.length / thoughts.length) * 100
      : 0
  };
}

/**
 * Dispose of the embedding system and clean up resources
 *
 * @example
 * ```typescript
 * await Embedding.dispose();
 * ```
 */
export async function dispose() {
  disposeEmbedding();
  const { close } = await import('./db/storage.js');
  await close();
}

// Export a default namespace for convenience
const Embedding = {
  // Core
  init,
  dispose,
  embed,
  embedBatch,
  initEmbedding,
  disposeEmbedding,

  // High-level operations
  createThoughtWithEmbedding,
  semanticSearch,
  findSimilarThoughtsById,
  embedAllThoughts,
  getStats,

  // Storage integration
  initEmbeddingService,
  computeEmbedding,
  updateThoughtEmbedding,
  getEmbeddingState,
  isEmbeddingReady,
  onEmbeddingProgress,

  // Utilities
  cosineSimilarity,
  findSimilarThoughts,
  findMostSimilarThought,
  clusterThoughts,
  recommendThoughts,

  // Service class
  EmbeddingService,

  // Utilities namespace
  Utils: {
    cosineSimilarity,
    euclideanDistance,
    dotProduct,
    normalizeVector,
    findSimilarThoughts,
    similarityMatrix,
    clusterThoughts,
    recommendThoughts,
    embeddingStats
  }
};

export default Embedding;
