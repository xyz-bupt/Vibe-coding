# Embedding System Quick Start Guide

Get started with the embedding system in 5 minutes.

## Installation

The embedding system is already installed with `@xenova/transformers` in your project.

## Basic Setup

### 1. Initialize the Service

```typescript
import * as storage from './db/storage.js';

// Initialize storage
await storage.init();

// Initialize embedding service (one-time setup)
await storage.initEmbeddingService({
  onProgress: (progress) => {
    console.log(`Loading: ${progress.progress.toFixed(0)}% - ${progress.status}`);
  }
});
```

### 2. Create Thoughts with Embeddings

```typescript
// Create a thought - embedding computed automatically
const thought = await storage.createThought('Your thought content here', {
  tags: ['important', 'work'],
  computeEmbedding: true  // <- Enable embedding computation
});

console.log('Thought saved:', thought.id);
// Note: Embedding is computed in background
```

### 3. Search with Embeddings

```typescript
// Compute embedding for search query
const queryEmbedding = await storage.computeEmbedding('search query');

// Get all thoughts with embeddings
const allThoughts = await storage.getAllThoughts();
const thoughtsWithEmbeddings = allThoughts.filter(t => t.embedding);

// Calculate similarities
const results = thoughtsWithEmbeddings.map(thought => {
  const similarity = cosineSimilarity(queryEmbedding, thought.embedding!);
  return { thought, similarity };
})
  .filter(r => r.similarity > 0.7)  // Threshold
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, 10);  // Top 10

console.log('Similar thoughts:', results);
```

## Helper Functions

### Cosine Similarity

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
```

### Find Similar Thoughts

```typescript
async function findSimilarThoughts(
  query: string,
  limit: number = 5
): Promise<Array<{ thought: storage.Thought, similarity: number }>> {

  const queryEmbedding = await storage.computeEmbedding(query);
  const allThoughts = await storage.getAllThoughts();

  return allThoughts
    .filter(t => t.embedding)
    .map(thought => ({
      thought,
      similarity: cosineSimilarity(queryEmbedding, thought.embedding!)
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}
```

## Common Patterns

### Pattern 1: Initialize on App Start

```typescript
// App initialization
async function initApp() {
  await storage.init();

  // Initialize embedding service in background
  storage.initEmbeddingService({
    onProgress: (p) => {
      updateProgressBar(p.progress);
    }
  }).then(() => {
    console.log('Embedding service ready!');
    enableSemanticSearch();
  });
}
```

### Pattern 2: Batch Process Existing Thoughts

```typescript
// Add embeddings to existing thoughts
async function addEmbeddingsToExistingThoughts() {
  const thoughts = await storage.getAllThoughts();
  const withoutEmbeddings = thoughts.filter(t => !t.embedding);

  console.log(`Processing ${withoutEmbeddings.length} thoughts...`);

  for (const thought of withoutEmbeddings) {
    await storage.saveThought(thought, { computeEmbedding: true });
    console.log(`Processed: ${thought.id}`);
  }
}
```

### Pattern 3: Real-time Search

```typescript
// Real-time semantic search
async function semanticSearch(query: string) {
  if (!storage.isEmbeddingReady()) {
    console.log('Embedding service not ready');
    return [];
  }

  const results = await findSimilarThoughts(query, 10);
  return results;
}

// Usage in UI
searchInput.addEventListener('input', debounce(async (e) => {
  const query = e.target.value;
  if (query.length < 3) return;

  const results = await semanticSearch(query);
  displayResults(results);
}, 300));
```

## API Cheatsheet

### Storage Functions

```typescript
// Initialize embedding service
await storage.initEmbeddingService({ onProgress });

// Check if ready
storage.isEmbeddingReady()

// Create with embedding
await storage.createThought(content, { computeEmbedding: true });

// Save with embedding
await storage.saveThought(thought, { computeEmbedding: true });

// Compute embedding
await storage.computeEmbedding(text);

// Update embedding
await storage.updateThoughtEmbedding(thoughtId, embedding);

// Progress callback
const unregister = storage.onEmbeddingProgress(callback);
```

### Direct Service Usage

```typescript
import { EmbeddingService, embed, embedBatch } from './services/embedding.js';

// Singleton
const embedding = await embed('text');

// Batch
const embeddings = await embedBatch(['text1', 'text2']);

// Class instance
const service = new EmbeddingService();
await service.init();
const embedding = await service.embed('text');
service.dispose();
```

## Tips

1. **Initialize Early**: Start embedding service during app load
2. **Show Progress**: Display loading progress to users
3. **Use Threshold**: Filter results by similarity (e.g., > 0.7)
4. **Batch Processing**: Process multiple thoughts together
5. **Handle Errors**: Always wrap in try-catch blocks
6. **Clean Up**: Dispose service when done to free memory

## Troubleshooting

### "Service not ready"

```typescript
// Always check or initialize
if (!storage.isEmbeddingReady()) {
  await storage.initEmbeddingService();
}
```

### Slow First Load

```typescript
// Show progress to user
await storage.initEmbeddingService({
  onProgress: (p) => {
    console.log(`${p.progress.toFixed(0)}%: ${p.status}`);
  }
});
```

### Embedding Not Computed

```typescript
// Check if embedding exists
const thought = await storage.getThoughtById(id);
if (!thought.embedding) {
  await storage.saveThought(thought, { computeEmbedding: true });
}
```

## Full Example

```typescript
import * as storage from './db/storage.js';

// Setup
await storage.init();
await storage.initEmbeddingService();

// Add thoughts
await storage.createThought('React is a UI library', {
  tags: ['programming'],
  computeEmbedding: true
});

await storage.createThought('I love hiking', {
  tags: ['personal'],
  computeEmbedding: true
});

// Wait for embeddings
await new Promise(r => setTimeout(r, 2000));

// Search
const results = await findSimilarThoughts('javascript');
console.log('Similar thoughts:', results);
```

## Next Steps

- Read full documentation: `EMBEDDING_SYSTEM.md`
- See examples: `src/services/embedding.example.ts`
- Run tests: `npm test`
- Check types: `src/types/index.ts`

## Support

- Check browser console for errors
- Verify Web Worker support
- Ensure sufficient memory (~200MB)
- Clear cache if model fails to load
