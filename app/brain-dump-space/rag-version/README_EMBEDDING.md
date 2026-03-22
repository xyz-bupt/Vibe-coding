# Brain Dump Space - RAG Version

A personal knowledge management system with semantic search powered by local embeddings.

## Features

- **Local Embeddings**: Compute text embeddings entirely in your browser
- **Semantic Search**: Find thoughts by meaning, not just keywords
- **Privacy First**: All processing happens locally, no data sent to servers
- **Fast**: Non-blocking UI with background model execution
- **Type-Safe**: Full TypeScript implementation

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize the System

```typescript
import * as Embedding from './src/embedding.js';

// Initialize with progress tracking
await Embedding.init({
  onProgress: (progress) => {
    console.log(`[${progress.progress.toFixed(0)}%] ${progress.status}`);
  }
});
```

### 3. Create Thoughts with Embeddings

```typescript
// Create a thought - embedding computed automatically
const thought = await Embedding.createThoughtWithEmbedding(
  'React is a JavaScript library for building user interfaces',
  ['programming', 'javascript', 'react']
);

console.log(`Created thought: ${thought.id}`);
```

### 4. Search Semantically

```typescript
// Find similar thoughts by meaning
const results = await Embedding.semanticSearch('frontend frameworks', 5);

results.forEach(result => {
  console.log(
    `[${result.similarity.toFixed(2)}] ${result.thought.content}`
  );
});
```

## Architecture

```
┌─────────────┐
│  Browser UI │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Embedding System   │
│  (src/embedding.ts) │
└──────┬──────────────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Storage   │ │   Worker    │ │   Utils     │
│ (IndexedDB) │ │ (Background) │ │ (Search)    │
└─────────────┘ └─────────────┘ └─────────────┘
       │              │
       └──────────────┴──────┐
                              ▼
                     ┌─────────────────┐
                     │ Local AI Model  │
                     │ (all-MiniLM-    │
                     │  L6-v2, 384d)  │
                     └─────────────────┘
```

## Key Components

### Embedding Service

Runs the embedding model in a Web Worker for non-blocking UI.

```typescript
import { embed } from './src/services/embedding.js';

const embedding = await embed('Your text here');
console.log(embedding.length); // 384 dimensions
```

### Storage Integration

Automatic embedding computation when saving thoughts.

```typescript
import * as storage from './src/db/storage.js';

await storage.init();
await storage.initEmbeddingService();

const thought = await storage.createThought('Content', {
  computeEmbedding: true  // Automatic!
});
```

### Search Utilities

Find similar thoughts using cosine similarity.

```typescript
import { findSimilarThoughts, cosineSimilarity } from './src/utils/embedding.js';

const queryEmbedding = await storage.computeEmbedding('search query');
const thoughts = await storage.getAllThoughts();

const results = findSimilarThoughts(queryEmbedding, thoughts, {
  threshold: 0.7,
  limit: 10
});
```

## Documentation

- **Quick Start**: `EMBEDDING_QUICKSTART.md` - Get started in 5 minutes
- **Full Docs**: `EMBEDDING_SYSTEM.md` - Complete API reference
- **Architecture**: `EMBEDDING_ARCHITECTURE.md` - System design and data flow
- **Summary**: `EMBEDDING_IMPLEMENTATION_SUMMARY.md` - Implementation overview

## Examples

See `src/services/embedding.example.ts` for comprehensive examples:

- Basic embedding computation
- Batch processing
- Storage integration
- Progress monitoring
- Error handling

Run examples:
```typescript
import { runAllExamples } from './src/services/embedding.example.js';
await runAllExamples();
```

## API Reference

### Main Entry Point

```typescript
import * as Embedding from './src/embedding.js';

// Initialize
await Embedding.init();

// Create thought with embedding
const thought = await Embedding.createThoughtWithEmbedding(
  'Content',
  ['tag1']
);

// Semantic search
const results = await Embedding.semanticSearch('query', 10);

// Find similar thoughts
const similar = await Embedding.findSimilarThoughtsById('thought-id', 5);

// Get statistics
const stats = await Embedding.getStats();
console.log(`Coverage: ${stats.coveragePercentage}%`);

// Clean up
await Embedding.dispose();
```

### Direct Service Usage

```typescript
import { EmbeddingService } from './src/services/embedding.js';

const service = new EmbeddingService({
  onProgress: (p) => console.log(p.status),
  onReady: (model) => console.log(`Ready: ${model}`),
  onError: (err, msg) => console.error(err, msg)
});

await service.init();
const embedding = await service.embed('text');
service.dispose();
```

### Storage API

```typescript
import * as storage from './src/db/storage.js';

await storage.init();
await storage.initEmbeddingService();

// Create with embedding
await storage.createThought('Content', { computeEmbedding: true });

// Compute embedding for search
const embedding = await storage.computeEmbedding('search query');

// Check if ready
if (storage.isEmbeddingReady()) {
  // Safe to compute
}

// Progress tracking
const unregister = storage.onEmbeddingProgress((p) => {
  console.log(`Loading: ${p.progress}%`);
});
```

## Utility Functions

```typescript
import {
  cosineSimilarity,
  findSimilarThoughts,
  clusterThoughts,
  recommendThoughts,
  embeddingStats
} from './src/utils/embedding.js';

// Compare embeddings
const similarity = cosineSimilarity(embedding1, embedding2);

// Find similar thoughts
const results = findSimilarThoughts(queryEmbedding, thoughts, {
  threshold: 0.7,
  limit: 10
});

// Cluster similar thoughts
const clusters = clusterThoughts(thoughts, 0.8);

// Get recommendations
const recommendations = recommendThoughts(
  [likedThought1, likedThought2],
  allThoughts,
  { limit: 5 }
);

// Analyze embedding
const stats = embeddingStats(embedding);
console.log(`Mean: ${stats.mean.toFixed(3)}`);
```

## Model Information

**Model**: Xenova/all-MiniLM-L6-v2
- **Dimensions**: 384
- **Type**: Sentence transformer
- **Size**: ~80MB (one-time download)
- **Performance**: 50-200ms per embedding
- **Location**: Runs entirely in browser

## Browser Support

- Chrome/Edge: Full support ✅
- Firefox: Full support ✅
- Safari: Full support (14+) ✅
- Mobile: Limited (requires Web Worker + WASM)

## Performance

- **First Load**: 5-30 seconds (model download)
- **Subsequent Loads**: 2-5 seconds (from cache)
- **Single Embedding**: 50-200ms
- **Batch (10)**: 400-1500ms
- **Memory Usage**: ~200MB

## Project Structure

```
src/
├── embedding.ts              # Main entry point
├── workers/
│   └── embedding.worker.ts   # Web Worker (model execution)
├── services/
│   ├── embedding.ts          # Service API
│   ├── embedding.example.ts  # Usage examples
│   └── embedding.test.ts     # Test suite
├── utils/
│   └── embedding.ts          # Helper functions
├── db/
│   └── storage.ts            # Storage integration
└── types/
    └── index.ts              # Type definitions
```

## Development

### Running Tests

```bash
npm test
```

### Running Examples

```typescript
import { runAllExamples } from './src/services/embedding.example.js';
await runAllExamples();
```

### Building

```bash
npm run build
```

## Troubleshooting

### Model Not Loading

- Check browser console for errors
- Verify internet connection (first time)
- Check browser compatibility
- Try clearing browser cache

### Slow Performance

- First load is slower (model download)
- Check available memory
- Reduce concurrent computations
- Consider using smaller model

### Embedding Errors

- Verify text is not empty
- Check if service is initialized
- Ensure model is ready
- Handle timeout errors

See `EMBEDDING_QUICKSTART.md` for more troubleshooting tips.

## License

ISC

## Contributing

Contributions welcome! Please read the documentation first and ensure tests pass.

## Support

For issues or questions:
1. Check documentation in `EMBEDDING_SYSTEM.md`
2. Review examples in `src/services/embedding.example.ts`
3. Check browser console for errors
4. Verify Web Worker + WASM support

## Acknowledgments

- Model by [Xenova](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- Built with [@xenova/transformers](https://github.com/xenova/transformers.js)
- Inspired by [Sentence Transformers](https://www.sbert.net/)

---

Made with ❤️ for local-first AI applications
