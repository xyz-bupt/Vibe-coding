/**
 * Embedding System Usage Examples
 *
 * This file demonstrates how to use the embedding system for computing
 * text embeddings and integrating them with thoughts.
 *
 * @module embedding.example
 */

import { embed, embedBatch, initEmbedding, disposeEmbedding, EmbeddingService } from './embedding.js';
import * as storage from '../db/storage.js';

/**
 * Example 1: Basic embedding computation
 */
export async function example1_basicEmbedding() {
  console.log('=== Example 1: Basic Embedding Computation ===');

  // Initialize the embedding service with progress callback
  await initEmbedding({
    onProgress: (progress) => {
      console.log(`[${progress.progress.toFixed(0)}%] ${progress.status}`);
    }
  });

  // Compute embedding for a single text
  const text = 'The quick brown fox jumps over the lazy dog';
  const embedding = await embed(text);

  console.log(`Text: "${text}"`);
  console.log(`Embedding dimensions: ${embedding.length}`);
  console.log(`First 5 values: [${embedding.slice(0, 5).join(', ')}]`);

  // Clean up
  disposeEmbedding();
}

/**
 * Example 2: Batch embedding computation
 */
export async function example2_batchEmbedding() {
  console.log('=== Example 2: Batch Embedding Computation ===');

  await initEmbedding();

  const texts = [
    'Machine learning is a subset of artificial intelligence',
    'Deep learning uses neural networks with multiple layers',
    'Natural language processing deals with text and speech'
  ];

  const embeddings = await embedBatch(texts);

  console.log(`Computed embeddings for ${embeddings.length} texts`);
  embeddings.forEach((embedding, index) => {
    console.log(`  Text ${index + 1}: ${embedding.length} dimensions`);
  });

  disposeEmbedding();
}

/**
 * Example 3: Create thought with embedding
 */
export async function example3_createThoughtWithEmbedding() {
  console.log('=== Example 3: Create Thought with Embedding ===');

  // Initialize storage
  await storage.init();

  // Initialize embedding service
  await storage.initEmbeddingService({
    onProgress: (progress) => {
      console.log(`Loading model: ${progress.progress.toFixed(0)}%`);
    }
  });

  // Create thought with embedding computation
  const thought = await storage.createThought(
    'React is a JavaScript library for building user interfaces',
    {
      tags: ['programming', 'javascript', 'react'],
      computeEmbedding: true
    }
  );

  console.log(`Created thought: ${thought.id}`);
  console.log(`Content: ${thought.content}`);
  console.log(`Tags: ${thought.tags.join(', ')}`);
  console.log(`Has embedding: ${thought.embedding ? 'Yes' : 'Not yet'}`);

  // Wait a moment for embedding to be computed
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Fetch the thought again to see the updated embedding
  const updatedThought = await storage.getThoughtById(thought.id);
  if (updatedThought?.embedding) {
    console.log(`Embedding computed: ${updatedThought.embedding.length} dimensions`);
  }

  // Clean up
  await storage.close();
}

/**
 * Example 4: Save existing thought with embedding
 */
export async function example4_saveThoughtWithEmbedding() {
  console.log('=== Example 4: Save Thought with Embedding ===');

  await storage.init();

  // Create thought without embedding first
  const thought = await storage.createThought(
    'TypeScript provides static typing for JavaScript',
    { tags: ['programming', 'typescript'] }
  );

  console.log(`Created thought without embedding: ${thought.id}`);

  // Later, compute and save embedding
  const updated = await storage.saveThought(thought, {
    computeEmbedding: true
  });

  console.log(`Updated thought with embedding computation`);

  // Wait for embedding to be computed
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Verify embedding was saved
  const final = await storage.getThoughtById(thought.id);
  console.log(`Has embedding: ${final?.embedding ? 'Yes (' + final.embedding.length + ' dims)' : 'No'}`);

  await storage.close();
}

/**
 * Example 5: Compute embedding for search query
 */
export async function example5_searchQueryEmbedding() {
  console.log('=== Example 5: Search Query Embedding ===');

  await storage.init();
  await storage.initEmbeddingService();

  // Create some thoughts with embeddings
  const thoughts = [
    'JavaScript is a dynamic programming language',
    'Python is known for its simplicity and readability',
    'Rust provides memory safety without garbage collection'
  ];

  for (const content of thoughts) {
    await storage.createThought(content, { computeEmbedding: true });
  }

  // Wait for embeddings to be computed
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Compute embedding for search query
  const query = 'programming languages';
  const queryEmbedding = await storage.computeEmbedding(query);

  console.log(`Query: "${query}"`);
  console.log(`Query embedding: ${queryEmbedding.length} dimensions`);

  // In a real application, you would now compare this embedding
  // with the stored embeddings to find similar thoughts

  await storage.close();
}

/**
 * Example 6: Using the EmbeddingService class directly
 */
export async function example6_serviceClass() {
  console.log('=== Example 6: Using EmbeddingService Class ===');

  // Create service instance
  const service = new EmbeddingService({
    onProgress: (progress) => {
      console.log(`Progress: ${progress.progress.toFixed(0)}% - ${progress.status}`);
    },
    onReady: (model, dimensions) => {
      console.log(`Model ready: ${model} (${dimensions} dimensions)`);
    },
    onError: (error, message) => {
      console.error(`Error (${error}): ${message}`);
    }
  });

  // Initialize the service
  await service.init();

  // Compute embeddings
  const embedding1 = await service.embed('First text');
  const embedding2 = await service.embed('Second text');

  console.log(`Computed two embeddings:`);
  console.log(`  - Text 1: ${embedding1.length} dimensions`);
  console.log(`  - Text 2: ${embedding2.length} dimensions`);

  // Check service status
  const status = await service.getStatus();
  console.log(`Service ready: ${status.ready}`);
  console.log(`Service model: ${status.model}`);

  // Clean up
  service.dispose();
}

/**
 * Example 7: Monitoring embedding progress
 */
export async function example7_monitoringProgress() {
  console.log('=== Example 7: Monitoring Embedding Progress ===');

  await storage.init();

  // Register progress callback
  const unregister = storage.onEmbeddingProgress((progress) => {
    console.log(`[${progress.progress.toFixed(0)}%] ${progress.status}`);
  });

  // Initialize embedding service (will trigger progress callbacks)
  await storage.initEmbeddingService();

  // Check if ready
  if (storage.isEmbeddingReady()) {
    console.log('Embedding service is ready!');
  }

  // Create thought with embedding
  await storage.createThought('Monitoring progress example', {
    computeEmbedding: true
  });

  // Wait for computation
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Unregister progress callback
  unregister();

  await storage.close();
}

/**
 * Example 8: Error handling
 */
export async function example8_errorHandling() {
  console.log('=== Example 8: Error Handling ===');

  const service = new EmbeddingService({
    onError: (error, message) => {
      console.error(`Service error (${error}): ${message}`);
    }
  });

  try {
    await service.init();

    // Try to embed empty text (will throw error)
    try {
      await service.embed('');
    } catch (error) {
      console.log('Caught error for empty text:', error);
    }

    // Try to embed when service is disposed
    service.dispose();
    try {
      await service.embed('This will fail');
    } catch (error) {
      console.log('Caught error for disposed service:', error);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('Running Embedding System Examples...\n');

  try {
    await example1_basicEmbedding();
    console.log('\n');

    await example2_batchEmbedding();
    console.log('\n');

    await example3_createThoughtWithEmbedding();
    console.log('\n');

    await example4_saveThoughtWithEmbedding();
    console.log('\n');

    await example5_searchQueryEmbedding();
    console.log('\n');

    await example6_serviceClass();
    console.log('\n');

    await example7_monitoringProgress();
    console.log('\n');

    await example8_errorHandling();
    console.log('\n');

    console.log('All examples completed!');
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Export examples for individual testing
export default {
  example1_basicEmbedding,
  example2_batchEmbedding,
  example3_createThoughtWithEmbedding,
  example4_saveThoughtWithEmbedding,
  example5_searchQueryEmbedding,
  example6_serviceClass,
  example7_monitoringProgress,
  example8_errorHandling,
  runAllExamples
};
