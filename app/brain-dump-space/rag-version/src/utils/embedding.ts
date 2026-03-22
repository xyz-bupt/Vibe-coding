/**
 * Embedding utility functions
 *
 * Helper functions for working with embeddings, computing similarities,
 * and performing semantic search operations.
 *
 * @module embedding.utils
 */

import type { Thought } from '../types/index.js';

/**
 * Compute cosine similarity between two vectors
 *
 * Cosine similarity measures the cosine of the angle between two vectors,
 * ranging from -1 (opposite) to 1 (identical). For normalized embeddings,
 * the range is typically 0 to 1.
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Similarity score between -1 and 1
 *
 * @example
 * ```typescript
 * const similarity = cosineSimilarity(embedding1, embedding2);
 * console.log(`Similarity: ${similarity.toFixed(3)}`);
 * ```
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Compute Euclidean distance between two vectors
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Distance (0 = identical, higher = more different)
 *
 * @example
 * ```typescript
 * const distance = euclideanDistance(embedding1, embedding2);
 * console.log(`Distance: ${distance.toFixed(3)}`);
 * ```
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  const sumSquared = a.reduce((sum, val, i) => {
    const diff = val - b[i];
    return sum + diff * diff;
  }, 0);

  return Math.sqrt(sumSquared);
}

/**
 * Compute dot product of two vectors
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Dot product
 *
 * @example
 * ```typescript
 * const dot = dotProduct(embedding1, embedding2);
 * ```
 */
export function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}

/**
 * Normalize a vector to unit length
 *
 * @param vector - Vector to normalize
 * @returns Normalized vector
 *
 * @example
 * ```typescript
 * const normalized = normalizeVector(embedding);
 * ```
 */
export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));

  if (magnitude === 0) {
    return vector;
  }

  return vector.map(val => val / magnitude);
}

/**
 * Check if a vector is normalized (magnitude ≈ 1)
 *
 * @param vector - Vector to check
 * @param tolerance - Tolerance for floating point comparison (default: 0.01)
 * @returns True if vector is normalized
 *
 * @example
 * ```typescript
 * const isNormalized = isVectorNormalized(embedding);
 * ```
 */
export function isVectorNormalized(vector: number[], tolerance: number = 0.01): boolean {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return Math.abs(magnitude - 1.0) < tolerance;
}

/**
 * Find most similar thoughts to a query embedding
 *
 * @param queryEmbedding - Query vector
 * @param thoughts - Thoughts to search (with embeddings)
 * @param options - Search options
 * @returns Sorted array of thoughts with similarity scores
 *
 * @example
 * ```typescript
 * const results = findSimilarThoughts(queryEmbedding, thoughts, {
 *   threshold: 0.7,
 *   limit: 10
 * });
 * ```
 */
export function findSimilarThoughts(
  queryEmbedding: number[],
  thoughts: Thought[],
  options: {
    threshold?: number;
    limit?: number;
    tags?: string[];
  } = {}
): Array<{ thought: Thought; similarity: number }> {
  const { threshold = 0, limit, tags } = options;

  // Filter thoughts that have embeddings
  let candidates = thoughts.filter(t => t.embedding && t.embedding.length > 0);

  // Filter by tags if specified
  if (tags && tags.length > 0) {
    candidates = candidates.filter(t =>
      tags.some(tag => t.tags.includes(tag))
    );
  }

  // Compute similarities
  const results = candidates
    .map(thought => ({
      thought,
      similarity: cosineSimilarity(queryEmbedding, thought.embedding!)
    }))
    .filter(result => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);

  // Apply limit if specified
  if (limit && limit > 0) {
    return results.slice(0, limit);
  }

  return results;
}

/**
 * Find most similar thought to a query embedding
 *
 * @param queryEmbedding - Query vector
 * @param thoughts - Thoughts to search
 * @param threshold - Minimum similarity threshold (default: 0)
 * @returns Most similar thought or undefined
 *
 * @example
 * ```typescript
 * const bestMatch = findMostSimilarThought(queryEmbedding, thoughts, 0.7);
 * if (bestMatch) {
 *   console.log(`Best match: ${bestMatch.thought.content}`);
 *   console.log(`Similarity: ${bestMatch.similarity.toFixed(3)}`);
 * }
 * ```
 */
export function findMostSimilarThought(
  queryEmbedding: number[],
  thoughts: Thought[],
  threshold: number = 0
): { thought: Thought; similarity: number } | undefined {
  const results = findSimilarThoughts(queryEmbedding, thoughts, {
    threshold,
    limit: 1
  });

  return results[0];
}

/**
 * Compute pairwise similarity matrix for a set of thoughts
 *
 * @param thoughts - Thoughts with embeddings
 * @returns 2D array of similarity scores
 *
 * @example
 * ```typescript
 * const matrix = similarityMatrix(thoughts);
 * console.log(`Thought 1 vs Thought 2: ${matrix[0][1].toFixed(3)}`);
 * ```
 */
export function similarityMatrix(thoughts: Thought[]): number[][] {
  const validThoughts = thoughts.filter(t => t.embedding && t.embedding.length > 0);
  const n = validThoughts.length;
  const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const similarity = cosineSimilarity(
        validThoughts[i].embedding!,
        validThoughts[j].embedding!
      );
      matrix[i][j] = similarity;
      matrix[j][i] = similarity;
    }
  }

  return matrix;
}

/**
 * Find clusters of similar thoughts
 *
 * @param thoughts - Thoughts with embeddings
 * @param threshold - Similarity threshold for clustering (default: 0.8)
 * @returns Array of clusters (each cluster is an array of thoughts)
 *
 * @example
 * ```typescript
 * const clusters = clusterThoughts(thoughts, 0.8);
 * console.log(`Found ${clusters.length} clusters`);
 * clusters.forEach((cluster, i) => {
 *   console.log(`Cluster ${i + 1}: ${cluster.length} thoughts`);
 * });
 * ```
 */
export function clusterThoughts(
  thoughts: Thought[],
  threshold: number = 0.8
): Thought[][] {
  const validThoughts = thoughts.filter(t => t.embedding && t.embedding.length > 0);
  const clusters: Thought[][] = [];
  const assigned = new Set<Thought>();

  for (const thought of validThoughts) {
    if (assigned.has(thought)) continue;

    // Start new cluster
    const cluster: Thought[] = [thought];
    assigned.add(thought);

    // Find similar thoughts
    for (const other of validThoughts) {
      if (assigned.has(other)) continue;

      const similarity = cosineSimilarity(thought.embedding!, other.embedding!);
      if (similarity >= threshold) {
        cluster.push(other);
        assigned.add(other);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

/**
 * Recommend thoughts similar to a set of input thoughts
 *
 * @param inputThoughts - Thoughts to use as input
 * @param allThoughts - All thoughts to search in
 * @param options - Recommendation options
 * @returns Recommended thoughts with scores
 *
 * @example
 * ```typescript
 * const recommendations = recommendThoughts(
 *   [likedThought1, likedThought2],
 *   allThoughts,
 *   { limit: 5 }
 * );
 * ```
 */
export function recommendThoughts(
  inputThoughts: Thought[],
  allThoughts: Thought[],
  options: {
    limit?: number;
    threshold?: number;
    excludeInput?: boolean;
  } = {}
): Array<{ thought: Thought; score: number }> {
  const { limit, threshold = 0, excludeInput = true } = options;

  // Filter valid input thoughts
  const validInputs = inputThoughts.filter(t => t.embedding && t.embedding.length > 0);
  if (validInputs.length === 0) return [];

  // Compute average embedding of inputs
  const avgEmbedding = averageEmbedding(validInputs);

  // Find similar thoughts
  let candidates = allThoughts.filter(t => t.embedding && t.embedding.length > 0);

  // Exclude input thoughts if specified
  if (excludeInput) {
    const inputIds = new Set(inputThoughts.map(t => t.id));
    candidates = candidates.filter(t => !inputIds.has(t.id));
  }

  // Compute similarities
  const results = candidates
    .map(thought => ({
      thought,
      score: cosineSimilarity(avgEmbedding, thought.embedding!)
    }))
    .filter(result => result.score >= threshold)
    .sort((a, b) => b.score - a.score);

  // Apply limit if specified
  if (limit && limit > 0) {
    return results.slice(0, limit);
  }

  return results;
}

/**
 * Compute average embedding of multiple thoughts
 *
 * @param thoughts - Thoughts with embeddings
 * @returns Average embedding vector
 *
 * @example
 * ```typescript
 * const avg = averageEmbedding([thought1, thought2, thought3]);
 * ```
 */
export function averageEmbedding(thoughts: Thought[]): number[] {
  const validThoughts = thoughts.filter(t => t.embedding && t.embedding.length > 0);

  if (validThoughts.length === 0) {
    throw new Error('No valid thoughts with embeddings');
  }

  const embeddingSize = validThoughts[0].embedding!.length;
  const avgEmbedding = new Array(embeddingSize).fill(0);

  for (const thought of validThoughts) {
    for (let i = 0; i < embeddingSize; i++) {
      avgEmbedding[i] += thought.embedding![i];
    }
  }

  // Divide by number of thoughts
  for (let i = 0; i < embeddingSize; i++) {
    avgEmbedding[i] /= validThoughts.length;
  }

  return avgEmbedding;
}

/**
 * Find outliers (thoughts that are dissimilar to others)
 *
 * @param thoughts - Thoughts to analyze
 * @param threshold - Threshold for outlier detection (default: 0.3)
 * @returns Outlier thoughts with their average similarity to others
 *
 * @example
 * ```typescript
 * const outliers = findOutliers(thoughts, 0.3);
 * console.log(`Found ${outliers.length} outliers`);
 * ```
 */
export function findOutliers(
  thoughts: Thought[],
  threshold: number = 0.3
): Array<{ thought: Thought; avgSimilarity: number }> {
  const validThoughts = thoughts.filter(t => t.embedding && t.embedding.length > 0);
  const outliers: Array<{ thought: Thought; avgSimilarity: number }> = [];

  for (const thought of validThoughts) {
    const similarities = validThoughts
      .filter(t => t.id !== thought.id)
      .map(t => cosineSimilarity(thought.embedding!, t.embedding!));

    const avgSimilarity =
      similarities.reduce((sum, sim) => sum + sim, 0) / similarities.length;

    if (avgSimilarity < threshold) {
      outliers.push({ thought, avgSimilarity });
    }
  }

  return outliers.sort((a, b) => a.avgSimilarity - b.avgSimilarity);
}

/**
 * Convert Float32Array to regular number array
 *
 * @param float32Array - Float32Array to convert
 * @returns Regular number array
 *
 * @example
 * ```typescript
 * const regularArray = float32ToArray(embedding);
 * ```
 */
export function float32ToArray(float32Array: Float32Array): number[] {
  return Array.from(float32Array);
}

/**
 * Convert regular number array to Float32Array
 *
 * @param array - Regular number array
 * @returns Float32Array
 *
 * @example
 * ```typescript
 * const float32 = arrayToFloat32(regularArray);
 * ```
 */
export function arrayToFloat32(array: number[]): Float32Array {
  return new Float32Array(array);
}

/**
 * Validate embedding dimensions
 *
 * @param embedding - Embedding to validate
 * @param expectedDimensions - Expected dimensions (default: 384)
 * @returns True if valid
 *
 * @example
 * ```typescript
 * if (isValidEmbedding(embedding, 384)) {
 *   console.log('Valid embedding');
 * }
 * ```
 */
export function isValidEmbedding(
  embedding: number[] | Float32Array | undefined,
  expectedDimensions: number = 384
): boolean {
  if (!embedding) return false;
  if (embedding.length !== expectedDimensions) return false;

  // Check for NaN or Infinity
  for (let i = 0; i < embedding.length; i++) {
    const val = embedding[i];
    if (!isFinite(val) || isNaN(val)) return false;
  }

  return true;
}

/**
 * Compute embedding statistics
 *
 * @param embedding - Embedding to analyze
 * @returns Statistics about the embedding
 *
 * @example
 * ```typescript
 * const stats = embeddingStats(embedding);
 * console.log(`Mean: ${stats.mean.toFixed(3)}`);
 * console.log(`Std Dev: ${stats.stdDev.toFixed(3)}`);
 * ```
 */
export function embeddingStats(embedding: number[] | Float32Array): {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  magnitude: number;
} {
  const n = embedding.length;

  // Compute mean
  const mean = embedding.reduce((sum, val) => sum + val, 0) / n;

  // Compute standard deviation
  const variance = embedding.reduce((sum, val) => sum + (val - mean) ** 2, 0) / n;
  const stdDev = Math.sqrt(variance);

  // Min and max
  const min = Math.min(...embedding);
  const max = Math.max(...embedding);

  // Magnitude
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));

  return { mean, stdDev, min, max, magnitude };
}

// Export all functions as a namespace
export const EmbeddingUtils = {
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
  embeddingStats
};

export default EmbeddingUtils;
