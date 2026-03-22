/**
 * Simple test suite for the embedding system
 *
 * Run with: npm test
 *
 * @module embedding.test
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { EmbeddingService, embed, embedBatch, disposeEmbedding } from './embedding.js';
import * as storage from '../db/storage.js';

describe('Embedding System', () => {
  let service: EmbeddingService;

  beforeEach(() => {
    service = new EmbeddingService();
  });

  afterEach(async () => {
    service.dispose();
    disposeEmbedding();
  });

  describe('EmbeddingService', () => {
    it('should initialize successfully', async () => {
      await service.init();
      expect(service.isReady()).toBe(true);
    });

    it('should compute embedding for single text', async () => {
      await service.init();
      const embedding = await service.embed('Hello world');
      expect(embedding).toBeInstanceOf(Float32Array);
      expect(embedding.length).toBe(384);
    });

    it('should compute embeddings for multiple texts', async () => {
      await service.init();
      const embeddings = await service.embedBatch([
        'First text',
        'Second text',
        'Third text'
      ]);
      expect(embeddings).toHaveLength(3);
      embeddings.forEach(embedding => {
        expect(embedding).toBeInstanceOf(Float32Array);
        expect(embedding.length).toBe(384);
      });
    });

    it('should return correct dimensions', () => {
      expect(service.getDimensions()).toBe(384);
    });

    it('should throw error for empty text', async () => {
      await service.init();
      await expect(service.embed('')).rejects.toThrow('Text cannot be empty');
    });

    it('should throw error when not ready', async () => {
      await expect(service.embed('text')).rejects.toThrow('Service not ready');
    });

    it('should handle progress callbacks', async () => {
      let progressCalled = false;
      const progressService = new EmbeddingService({
        onProgress: (progress) => {
          progressCalled = true;
          expect(progress.progress).toBeGreaterThanOrEqual(0);
          expect(progress.progress).toBeLessThanOrEqual(100);
          expect(progress.status).toBeTruthy();
        }
      });

      await progressService.init();
      expect(progressCalled).toBe(true);
      progressService.dispose();
    });
  });

  describe('Convenience Functions', () => {
    it('should compute embedding using embed function', async () => {
      const embedding = await embed('Test text');
      expect(embedding).toBeInstanceOf(Float32Array);
      expect(embedding.length).toBe(384);
    });

    it('should compute batch embeddings using embedBatch', async () => {
      const embeddings = await embedBatch(['A', 'B', 'C']);
      expect(embeddings).toHaveLength(3);
      embeddings.forEach(e => {
        expect(e.length).toBe(384);
      });
    });
  });
});

describe('Storage Integration', () => {
  beforeEach(async () => {
    await storage.init();
  });

  afterEach(async () => {
    await storage._resetForTesting();
  });

  it('should initialize embedding service', async () => {
    await storage.initEmbeddingService();
    expect(storage.isEmbeddingReady()).toBe(true);
  });

  it('should create thought without embedding', async () => {
    const thought = await storage.createThought('Test content');
    expect(thought.id).toBeTruthy();
    expect(thought.content).toBe('Test content');
    expect(thought.embedding).toBeUndefined();
  });

  it('should create thought with embedding computation', async () => {
    await storage.initEmbeddingService();
    const thought = await storage.createThought('Test content', {
      computeEmbedding: true
    });

    expect(thought.id).toBeTruthy();
    // Embedding not yet computed (async)
    expect(thought.embedding).toBeUndefined();

    // Wait for async embedding computation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const updated = await storage.getThoughtById(thought.id);
    expect(updated?.embedding).toBeDefined();
    expect(updated?.embedding?.length).toBe(384);
  });

  it('should save thought with embedding computation', async () => {
    await storage.initEmbeddingService();

    const thought = {
      id: 'test-1',
      content: 'Test content',
      createdAt: Date.now(),
      tags: ['test']
    };

    const saved = await storage.saveThought(thought, {
      computeEmbedding: true
    });

    expect(saved.id).toBe('test-1');

    // Wait for async embedding computation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const updated = await storage.getThoughtById('test-1');
    expect(updated?.embedding).toBeDefined();
  });

  it('should compute embedding for arbitrary text', async () => {
    await storage.initEmbeddingService();
    const embedding = await storage.computeEmbedding('Search query');
    expect(embedding).toHaveLength(384);
  });

  it('should update thought embedding', async () => {
    const thought = await storage.createThought('Test');
    const embedding = await storage.computeEmbedding('Test');

    await storage.updateThoughtEmbedding(thought.id, embedding);

    const updated = await storage.getThoughtById(thought.id);
    expect(updated?.embedding).toEqual(embedding);
  });

  it('should handle embedding progress callbacks', async () => {
    let progressCalled = false;
    const unregister = storage.onEmbeddingProgress((progress) => {
      progressCalled = true;
      expect(progress.progress).toBeGreaterThanOrEqual(0);
    });

    await storage.initEmbeddingService();
    expect(progressCalled).toBe(true);

    unregister();
  });

  it('should check embedding ready state', async () => {
    expect(storage.isEmbeddingReady()).toBe(false);

    await storage.initEmbeddingService();
    expect(storage.isEmbeddingReady()).toBe(true);
  });
});

describe('Embedding Properties', () => {
  it('should produce consistent embeddings for same text', async () => {
    const service = new EmbeddingService();
    await service.init();

    const text = 'Consistent text';
    const embedding1 = await service.embed(text);
    const embedding2 = await service.embed(text);

    expect(embedding1).toEqual(embedding2);

    service.dispose();
  });

  it('should produce different embeddings for different texts', async () => {
    const service = new EmbeddingService();
    await service.init();

    const embedding1 = await service.embed('First text');
    const embedding2 = await service.embed('Second text');

    // Embeddings should be different
    let different = false;
    for (let i = 0; i < embedding1.length; i++) {
      if (Math.abs(embedding1[i] - embedding2[i]) > 0.001) {
        different = true;
        break;
      }
    }
    expect(different).toBe(true);

    service.dispose();
  });

  it('should produce normalized embeddings', async () => {
    const service = new EmbeddingService();
    await service.init();

    const embedding = await service.embed('Test text');

    // Check if normalized (magnitude should be close to 1)
    const magnitude = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    expect(magnitude).toBeGreaterThan(0.99);
    expect(magnitude).toBeLessThan(1.01);

    service.dispose();
  });
});

/**
 * Cosine similarity helper function for testing
 */
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

describe('Semantic Similarity', () => {
  it('should have high similarity for similar texts', async () => {
    const service = new EmbeddingService();
    await service.init();

    const text1 = 'The cat sat on the mat';
    const text2 = 'A cat is sitting on a mat';

    const embedding1 = await service.embed(text1);
    const embedding2 = await service.embed(text2);

    const similarity = cosineSimilarity(
      Array.from(embedding1),
      Array.from(embedding2)
    );

    // Similar texts should have high similarity
    expect(similarity).toBeGreaterThan(0.7);

    service.dispose();
  });

  it('should have low similarity for different texts', async () => {
    const service = new EmbeddingService();
    await service.init();

    const text1 = 'The weather is sunny today';
    const text2 = 'I need to buy groceries';

    const embedding1 = await service.embed(text1);
    const embedding2 = await service.embed(text2);

    const similarity = cosineSimilarity(
      Array.from(embedding1),
      Array.from(embedding2)
    );

    // Different texts should have lower similarity
    expect(similarity).toBeLessThan(0.5);

    service.dispose();
  });
});

/**
 * Performance benchmarks
 */
describe('Performance Benchmarks', () => {
  it('should compute single embedding in reasonable time', async () => {
    const service = new EmbeddingService();
    await service.init();

    const start = performance.now();
    await service.embed('Performance test text');
    const duration = performance.now() - start;

    // Should complete in less than 1 second
    expect(duration).toBeLessThan(1000);

    console.log(`Single embedding time: ${duration.toFixed(2)}ms`);

    service.dispose();
  });

  it('should compute batch embeddings efficiently', async () => {
    const service = new EmbeddingService();
    await service.init();

    const texts = Array.from({ length: 10 }, (_, i) => `Text ${i}`);

    const start = performance.now();
    await service.embedBatch(texts);
    const duration = performance.now() - start;

    // Should complete in less than 3 seconds for 10 texts
    expect(duration).toBeLessThan(3000);

    console.log(`Batch embedding time (10 texts): ${duration.toFixed(2)}ms`);
    console.log(`Average per text: ${(duration / 10).toFixed(2)}ms`);

    service.dispose();
  });
});

/**
 * Error handling tests
 */
describe('Error Handling', () => {
  it('should handle model initialization errors gracefully', async () => {
    const service = new EmbeddingService({
      onError: (error, message) => {
        console.error(`Error caught: ${error} - ${message}`);
      }
    });

    // Test with invalid model name
    try {
      await service.init('invalid-model-name');
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeTruthy();
    }

    service.dispose();
  });

  it('should handle empty text errors', async () => {
    const service = new EmbeddingService();
    await service.init();

    await expect(service.embed('')).rejects.toThrow('Text cannot be empty');
    await expect(service.embed('   ')).rejects.toThrow('Text cannot be empty');

    service.dispose();
  });

  it('should handle batch with empty array', async () => {
    const service = new EmbeddingService();
    await service.init();

    await expect(service.embedBatch([])).rejects.toThrow('cannot be empty');

    service.dispose();
  });

  it('should handle disposed service', async () => {
    const service = new EmbeddingService();
    await service.init();
    service.dispose();

    expect(service.isReady()).toBe(false);

    await expect(service.embed('test')).rejects.toThrow('Service not ready');
  });
});

/**
 * Integration tests
 */
describe('Integration Tests', () => {
  it('should complete full workflow', async () => {
    // 1. Initialize storage
    await storage.init();

    // 2. Initialize embedding service
    await storage.initEmbeddingService();

    // 3. Create thoughts with embeddings
    const thoughts = [
      'Machine learning is fascinating',
      'I love programming in JavaScript',
      'The weather is beautiful today'
    ];

    const createdThoughts = await Promise.all(
      thoughts.map(text =>
        storage.createThought(text, { computeEmbedding: true })
      )
    );

    expect(createdThoughts).toHaveLength(3);

    // 4. Wait for embeddings to compute
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 5. Verify embeddings were saved
    const allThoughts = await storage.getAllThoughts();
    const thoughtsWithEmbeddings = allThoughts.filter(t => t.embedding);

    expect(thoughtsWithEmbeddings.length).toBeGreaterThanOrEqual(1);

    // 6. Compute search query embedding
    const queryEmbedding = await storage.computeEmbedding('programming');

    // 7. Find similar thoughts
    const similarities = thoughtsWithEmbeddings.map(thought => ({
      thought,
      similarity: cosineSimilarity(queryEmbedding, thought.embedding!)
    }))
      .sort((a, b) => b.similarity - a.similarity);

    // Most similar should be about programming
    expect(similarities[0].thought.content).toContain('programming');

    // Cleanup
    await storage._resetForTesting();
  });
});
