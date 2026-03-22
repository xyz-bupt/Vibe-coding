# Embedding System Documentation

Complete embedding system for the brain-dump-space RAG project using local models in the browser.

## Overview

This embedding system enables semantic search and RAG (Retrieval Augmented Generation) capabilities by computing vector embeddings for thoughts using the `@xenova/transformers` library. The system runs entirely in the browser with no server-side dependencies.

### Key Features

- **Local Model Execution**: Uses `Xenova/all-MiniLM-L6-v2` model (384-dimensional embeddings)
- **Web Worker Architecture**: Non-blocking UI with background model execution
- **Async-First Design**: "Save first, update embedding later" pattern for instant UI feedback
- **Progress Tracking**: Real-time model loading and computation progress
- **Batch Processing**: Compute embeddings for multiple texts efficiently
- **Type-Safe**: Full TypeScript support with comprehensive types

## Architecture

### Components

```
src/
├── workers/
│   └── embedding.worker.ts     # Web Worker for model execution
├── services/
│   ├── embedding.ts            # Main embedding service API
│   └── embedding.example.ts    # Usage examples
├── db/
│   └── storage.ts              # Integrated with storage API
└── types/
    └── index.ts                # TypeScript types
```

### Data Flow

1. **Initialization**: Service loads model in background (with progress callbacks)
2. **Computation**: Text sent to worker via postMessage
3. **Processing**: Worker runs model pipeline (mean pooling + normalization)
4. **Response**: Float32Array embedding returned to main thread
5. **Storage**: Embedding saved to IndexedDB as number array

## Quick Start

### Basic Usage

```typescript
import { embed, initEmbedding } from './services/embedding.js';

// Initialize with progress tracking
await initEmbedding({
  onProgress: (progress) => {
    console.log(`[${progress.progress}%] ${progress.status}`);
  }
});

// Compute embedding
const embedding = await embed('Your text here');
console.log(embedding.length); // 384
```

### With Storage Integration

```typescript
import * as storage from './db/storage.js';

// Initialize storage and embedding service
await storage.init();
await storage.initEmbeddingService();

// Create thought with automatic embedding
const thought = await storage.createThought('My thought content', {
  tags: ['important'],
  computeEmbedding: true  // Embedding computed in background
});

// Thought saved immediately, embedding updated asynchronously
console.log(thought.embedding); // undefined (not yet computed)

// Later, fetch updated thought
const updated = await storage.getThoughtById(thought.id);
console.log(updated.embedding); // Float32Array (384 dimensions)
```

## API Reference

### EmbeddingService Class

Main service class for managing embedding computations.

#### Constructor

```typescript
constructor(config?: EmbeddingConfig)
```

**Parameters:**
- `config.model`: Custom model name (default: 'Xenova/all-MiniLM-L6-v2')
- `config.onProgress`: Callback for model loading progress
- `config.onReady`: Callback when model is ready
- `config.onError`: Callback for errors

#### Methods

##### `init(model?: string): Promise<void>`

Initialize the embedding service and load the model.

```typescript
const service = new EmbeddingService();
await service.init();
```

##### `embed(text: string): Promise<Float32Array>`

Compute embedding for a single text.

```typescript
const embedding = await service.embed('Hello world');
console.log(embedding.length); // 384
```

##### `embedBatch(texts: string[]): Promise<Float32Array[]>`

Compute embeddings for multiple texts.

```typescript
const embeddings = await service.embedBatch([
  'First text',
  'Second text',
  'Third text'
]);
console.log(embeddings.length); // 3
console.log(embeddings[0].length); // 384
```

##### `getStatus(): Promise<{ready: boolean, model?: string, dimensions?: number}>`

Get current service status.

```typescript
const status = await service.getStatus();
console.log(status.ready); // true/false
```

##### `isReady(): boolean`

Check if service is ready (synchronous).

```typescript
if (service.isReady()) {
  const embedding = await service.embed('text');
}
```

##### `getDimensions(): number`

Get embedding dimensions (384 for all-MiniLM-L6-v2).

```typescript
const dims = service.getDimensions(); // 384
```

##### `dispose(): void`

Clean up resources and terminate worker.

```typescript
service.dispose();
```

### Storage Integration

#### `initEmbeddingService(options): Promise<void>`

Initialize embedding service for storage operations.

```typescript
await storage.initEmbeddingService({
  onProgress: (progress) => {
    console.log(`${progress.status}: ${progress.progress}%`);
  }
});
```

#### `createThought(content, options): Promise<Thought>`

Create a new thought with optional embedding computation.

```typescript
const thought = await storage.createThought('Content here', {
  tags: ['tag1', 'tag2'],
  computeEmbedding: true  // Compute embedding asynchronously
});
```

**Important**: The thought is saved immediately for instant UI display. The embedding is computed in the background and the thought is updated when ready.

#### `saveThought(thought, options): Promise<Thought>`

Save a thought with optional embedding computation.

```typescript
const thought = { /* ... */ };
await storage.saveThought(thought, { computeEmbedding: true });
```

#### `computeEmbedding(text): Promise<number[]>`

Compute embedding for arbitrary text (without saving).

```typescript
const embedding = await storage.computeEmbedding('search query');
```

#### `updateThoughtEmbedding(thoughtId, embedding): Promise<void>`

Manually update a thought's embedding.

```typescript
const embedding = await storage.computeEmbedding('text');
await storage.updateThoughtEmbedding('thought-id', embedding);
```

#### `isEmbeddingReady(): boolean`

Check if embedding service is ready.

```typescript
if (storage.isEmbeddingReady()) {
  // Safe to compute embeddings
}
```

#### `onEmbeddingProgress(callback): () => void`

Register a progress callback. Returns unregister function.

```typescript
const unregister = storage.onEmbeddingProgress((progress) => {
  console.log(`Loading: ${progress.progress}%`);
});

// Later...
unregister();
```

### Convenience Functions

#### `embed(text): Promise<Float32Array>`

Quick embedding computation using singleton service.

```typescript
import { embed } from './services/embedding.js';
const embedding = await embed('text');
```

#### `embedBatch(texts): Promise<Float32Array[]>`

Batch embedding computation using singleton.

```typescript
import { embedBatch } from './services/embedding.js';
const embeddings = await embedBatch(['text1', 'text2']);
```

#### `initEmbedding(config): Promise<void>`

Initialize singleton service.

```typescript
import { initEmbedding } from './services/embedding.js';
await initEmbedding();
```

#### `disposeEmbedding(): void`

Dispose singleton service.

```typescript
import { disposeEmbedding } from './services/embedding.js';
disposeEmbedding();
```

## Model Information

### all-MiniLM-L6-v2

- **Dimensions**: 384
- **Type**: Sentence transformer
- **Architecture**: MiniLM with 6 layers
- **Pooling**: Mean pooling with normalization
- **Use Case**: Semantic search, similarity comparison
- **Size**: ~80MB (downloaded once, cached in browser)

### Performance

- **Initialization**: 5-30 seconds (first time, cached thereafter)
- **Single Embedding**: 50-200ms
- **Batch Embedding**: 40-150ms per text
- **Memory Usage**: ~200MB for model + embeddings

## Usage Patterns

### Pattern 1: Save First, Embed Later

```typescript
// Create thought (instant UI update)
const thought = await storage.createThought(content, {
  computeEmbedding: true
});

// Display immediately in UI
displayThought(thought);

// Embedding computed in background
// Thought updated when ready
storage.onEmbeddingProgress((progress) => {
  updateProgressIndicator(progress);
});
```

### Pattern 2: Batch Processing

```typescript
// Create multiple thoughts
const thoughts = await Promise.all(
  texts.map(text => storage.createThought(text))
);

// Compute embeddings in batch
const service = await EmbeddingService.getInstance();
const embeddings = await service.embedBatch(texts);

// Update all thoughts
await Promise.all(
  thoughts.map((thought, i) =>
    storage.updateThoughtEmbedding(thought.id, Array.from(embeddings[i]))
  )
);
```

### Pattern 3: Search Query Embedding

```typescript
// Compute embedding for search query
const queryEmbedding = await storage.computeEmbedding(searchQuery);

// Fetch all thoughts with embeddings
const allThoughts = await storage.getAllThoughts();
const thoughtsWithEmbeddings = allThoughts.filter(t => t.embedding);

// Compute similarities
const results = thoughtsWithEmbeddings.map(thought => ({
  thought,
  similarity: cosineSimilarity(queryEmbedding, thought.embedding!)
}))
  .filter(r => r.similarity > 0.7)
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, 10);
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
  threshold: number = 0.7
): Promise<Array<{ thought: Thought, similarity: number }>> {
  const queryEmbedding = await storage.computeEmbedding(query);
  const allThoughts = await storage.getAllThoughts();

  return allThoughts
    .filter(t => t.embedding)
    .map(thought => ({
      thought,
      similarity: cosineSimilarity(queryEmbedding, thought.embedding!)
    }))
    .filter(result => result.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
}
```

## Error Handling

### Model Loading Errors

```typescript
const service = new EmbeddingService({
  onError: (error, message) => {
    console.error(`Embedding error (${error}): ${message}`);
  }
});

try {
  await service.init();
} catch (error) {
  console.error('Failed to initialize:', error);
}
```

### Computation Errors

```typescript
try {
  const embedding = await storage.computeEmbedding(text);
} catch (error) {
  if (error.message.includes('not ready')) {
    await storage.initEmbeddingService();
    // Retry
  }
}
```

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (requires modern version)
- **Mobile**: Limited support (requires Web Worker + WASM)

## Limitations

1. **Model Size**: ~80MB download (first time)
2. **Memory**: ~200MB RAM usage
3. **Performance**: Slower than server-side APIs
4. **Browser**: Requires modern browser with Web Worker + WASM support
5. **Concurrent**: Single model instance (queue multiple requests)

## Best Practices

1. **Initialize Early**: Load model during app initialization
2. **Show Progress**: Display loading progress to users
3. **Cache Embeddings**: Store computed embeddings in IndexedDB
4. **Batch When Possible**: Use `embedBatch` for multiple texts
5. **Handle Errors**: Implement proper error handling and retries
6. **Clean Up**: Dispose service when done to free memory
7. **Background Computation**: Use `computeEmbedding: true` for non-blocking saves

## Troubleshooting

### Model Not Loading

- Check browser console for errors
- Verify internet connection (first time download)
- Check browser compatibility (Web Worker + WASM)
- Try clearing browser cache

### Slow Performance

- First load is slower (model download)
- Check available memory
- Reduce concurrent computations
- Consider using smaller model

### Embedding Errors

- Verify text is not empty
- Check if service is initialized
- Ensure model is ready before computing
- Handle timeout errors gracefully

## Examples

See `src/services/embedding.example.ts` for comprehensive usage examples including:

- Basic embedding computation
- Batch processing
- Storage integration
- Progress monitoring
- Error handling
- Service lifecycle management

Run examples:

```typescript
import { runAllExamples } from './services/embedding.example.js';
await runAllExamples();
```

## Future Enhancements

Potential improvements:

1. **Multiple Models**: Support for different embedding models
2. **Quantization**: Use quantized models for faster inference
3. **Streaming**: Progressive embedding computation for long texts
4. **Cache Strategy**: Smart caching for frequently used texts
5. **Worker Pool**: Multiple workers for parallel processing
6. **Model Selection**: Automatic model selection based on use case

## Resources

- [@xenova/transformers](https://github.com/xenova/transformers.js)
- [all-MiniLM-L6-v2 Model](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- [Sentence Transformers](https://www.sbert.net/)
- [Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
