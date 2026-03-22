# Embedding System Architecture

Visual overview of the embedding system components and data flow.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Main Thread                             │
│                                                                  │
│  ┌─────────────────┐      ┌──────────────────┐                 │
│  │   Application   │─────▶│  Storage Service │                 │
│  │      (UI)       │      │  (storage.ts)    │                 │
│  └─────────────────┘      └──────────────────┘                 │
│           │                         │                           │
│           │                         │                           │
│           ▼                         ▼                           │
│  ┌─────────────────┐      ┌──────────────────┐                 │
│  │ Embedding Utils │◀─────│  Embedding       │                 │
│  │ (embedding.ts)  │      │  Service         │                 │
│  └─────────────────┘      │  (embedding.ts)  │                 │
│           │                └──────────────────┘                 │
│           │                         │                           │
│           │                         │ postMessage               │
│           │                         ▼                           │
│  ┌─────────────────┐      ┌──────────────────┐                 │
│  │  IndexedDB      │      │  Web Worker      │                 │
│  │  (idb)          │      │  (embedding      │                 │
│  │                 │      │   .worker.ts)    │                 │
│  └─────────────────┘      └──────────────────┘                 │
│           │                         │                           │
│           │                         │                           │
└───────────┼─────────────────────────┼───────────────────────────┘
            │                         │
            │                         │
            ▼                         ▼
┌───────────────────────┐  ┌───────────────────────┐
│   Browser Cache       │  │   @xenova/transformers│
│   (IndexedDB)         │  │   (Model Files)       │
└───────────────────────┘  └───────────────────────┘
```

## Data Flow

### Initialization Flow

```
App Start
   │
   ▼
storage.init()
   │
   ▼
storage.initEmbeddingService()
   │
   ├─▶ Create Worker
   │       │
   │       ▼
   │   embedding.worker.ts
   │       │
   │       ├─▶ Download Model (first time)
   │       │       │
   │       │       ▼
   │       │   Browser Cache
   │       │
   │       ├─▶ Load Model into Memory
   │       │
   │       └─▶ Send "ready" message
   │
   └─▶ Service Ready
```

### Embedding Computation Flow

```
createThought(content, { computeEmbedding: true })
   │
   ├─▶ Save thought to IndexedDB (IMMEDIATE)
   │       │
   │       └─▶ UI Updated (instant feedback)
   │
   └─▶ Compute Embedding (BACKGROUND)
           │
           ├─▶ Send text to Worker
           │       │
           │       ▼
           │   embedding.worker.ts
           │       │
           │       ├─▶ Run Model Pipeline
           │       │   ├─▶ Tokenization
           │       │   ├─▶ Model Inference
           │       │   ├─▶ Mean Pooling
           │       │   └─▶ Normalization
           │       │
           │       └─▶ Return Float32Array
           │
           └─▶ Update thought in IndexedDB
                   │
                   └─▶ Thought now has embedding
```

### Search Flow

```
User enters search query
   │
   ▼
computeEmbedding(query)
   │
   ├─▶ Send query to Worker
   │       │
   │       ▼
   │   embedding.worker.ts
   │       │
   │       └─▶ Return query embedding
   │
   └─▶ Compare with stored embeddings
           │
           ├─▶ cosineSimilarity(query, each_embedding)
           │
           └─▶ Return sorted results
                   │
                   └─▶ Display to user
```

## Component Details

### 1. Web Worker (embedding.worker.ts)

**Purpose**: Run model in background thread

**Responsibilities**:
- Load and initialize model
- Handle model inference
- Compute embeddings
- Send progress updates

**Message Types**:
- `init`: Initialize model
- `embed`: Compute single embedding
- `embedBatch`: Compute multiple embeddings
- `getStatus`: Get worker status

**Response Types**:
- `progress`: Loading progress (0-100%)
- `ready`: Model is ready
- `embedding`: Single embedding result
- `embeddings`: Batch embedding results
- `error`: Error occurred

### 2. Embedding Service (embedding.ts)

**Purpose**: Manage worker lifecycle and provide clean API

**Responsibilities**:
- Create and manage worker
- Handle message passing
- Queue pending requests
- Provide high-level API
- Handle errors and timeouts

**Key Methods**:
- `init()`: Initialize service
- `embed(text)`: Compute embedding
- `embedBatch(texts)`: Compute batch
- `getStatus()`: Get status
- `dispose()`: Clean up

**Singleton Pattern**:
- `getInstance()`: Get singleton instance
- `embed()`: Convenience function
- `embedBatch()`: Batch convenience function

### 3. Storage Integration (storage.ts)

**Purpose**: Integrate embeddings with thought storage

**Enhanced Functions**:
- `createThought(content, { computeEmbedding })`
- `saveThought(thought, { computeEmbedding })`
- `initEmbeddingService({ onProgress })`
- `computeEmbedding(text)`
- `updateThoughtEmbedding(id, embedding)`

**State Management**:
- Track embedding service state
- Handle initialization
- Manage progress callbacks

### 4. Embedding Utils (embedding.ts)

**Purpose**: Helper functions for working with embeddings

**Categories**:
- **Similarity**: cosineSimilarity, euclideanDistance, dotProduct
- **Search**: findSimilarThoughts, findMostSimilarThought
- **Analysis**: similarityMatrix, clusterThoughts, findOutliers
- **Recommendation**: recommendThoughts, averageEmbedding
- **Utility**: normalizeVector, isValidEmbedding, float32ToArray

## Model Pipeline

```
Input Text
   │
   ▼
Tokenization
   │
   └─▶ Split into tokens
   │
   ▼
Model Inference
   │
   └─▶ Process through 6-layer MiniLM
   │
   ▼
Raw Output
   │
   └─▶ Tensor: [1, sequence_length, 384]
   │
   ▼
Mean Pooling
   │
   └─▶ Average across sequence
   │
   ▼
Normalized Output
   │
   └─▶ Vector: [384] (magnitude = 1.0)
   │
   ▼
Float32Array
   │
   └─▶ Sent to main thread
```

## Performance Characteristics

### Memory Usage

```
Model Loading:     ~80 MB  (one-time download)
Model in Memory:   ~120 MB
Per Embedding:     ~1.5 KB (384 * 4 bytes)
Worker Overhead:   ~5 MB
Total:             ~200 MB
```

### Timing

```
First Load:
  - Download:       5-20 seconds (one-time)
  - Initialization: 2-5 seconds
  - Total:          7-25 seconds

Subsequent Loads:
  - From Cache:     2-5 seconds

Embedding Computation:
  - Single:         50-200 ms
  - Batch (10):     400-1500 ms
  - Per text:       40-150 ms
```

### Optimization Strategies

1. **Lazy Loading**: Initialize on first use
2. **Caching**: Model cached in browser
3. **Batching**: Process multiple texts together
4. **Background**: Async computation, instant UI
5. **Progress**: Show loading feedback

## Error Handling

```
Error Types:
  ├─▶ Model Load Failure
  │   ├─▶ Network error
  │   ├─▶ Browser incompatibility
  │   └─▶ Insufficient memory
  │
  ├─▶ Embedding Computation Error
  │   ├─▶ Empty input
  │   ├─▶ Timeout
  │   └─▶ Worker crash
  │
  └─▶ Storage Error
      ├─▶ Quota exceeded
      ├─▶ Invalid ID
      └─▶ Concurrent update

Handling:
  ├─▶ Progress callbacks
  ├─▶ Error callbacks
  ├─▶ Try-catch blocks
  └─▶ Graceful degradation
```

## Integration Points

### With UI Components

```
ThoughtForm
   │
   ├─▶ createThought(content, { computeEmbedding: true })
   │       │
   │       ├─▶ Instant save (UI updates)
   │       │
   │       └─▶ Background embedding
   │               │
   │               └─▶ Update indicator when done
   │
   └─▶ onEmbeddingProgress callback
           │
           └─▶ Update progress bar
```

### With Search Components

```
SearchBar
   │
   ├─▶ User types query
   │       │
   │       ▼
   │   Debounce (300ms)
   │       │
   │       ▼
   │   computeEmbedding(query)
   │       │
   │       ▼
   │   findSimilarThoughts()
   │       │
   │       └─▶ Display results
   │
   └─▶ Show loading state
```

## State Diagram

``Embedding Service State``

```
┌─────────┐
│disabled │  Initial state
└────┬────┘
     │ initEmbeddingService()
     ▼
┌─────────┐
│loading  │  Model loading in progress
└────┬────┘
     │ Model ready
     ▼
┌─────────┐
│ ready   │  Ready to compute embeddings
└────┬────┘
     │ Error
     ▼
┌─────────┐
│ error   │  Error occurred, needs reset
└────┬────┘
     │ initEmbeddingService()
     └────▶ (back to loading)
```

## Threading Model

```
Main Thread                    Worker Thread
     │                               │
     │ init()                        │
     ├──────────────────────────────▶│
     │                               │ Load Model
     │                               │ (blocking in worker)
     │ progress (50%)                │
     │◀──────────────────────────────┤
     │                               │
     │ progress (100%)               │
     │◀──────────────────────────────┤
     │                               │
     │ ready                         │
     │◀──────────────────────────────┤
     │                               │
     │ embed("text")                 │
     ├──────────────────────────────▶│
     │                               │ Compute Embedding
     │                               │ (blocking in worker)
     │ embedding Float32Array        │
     │◀──────────────────────────────┤
     │                               │
```

## Browser Compatibility

```
Chrome/Edge:     ✅ Full support
Firefox:         ✅ Full support
Safari:          ✅ Full support (14+)
Mobile Chrome:   ✅ Full support
Mobile Safari:   ⚠️  Limited (15+)

Required Features:
  ├─▶ Web Workers
  ├─▶ WASM Support
  ├─▶ IndexedDB
  └─▶ ES2020+ Features
```

## Security Considerations

```
Model Source:
  └─▶ Downloaded from Hugging Face Hub
     (Xenova/all-MiniLM-L6-v2)
     ✅ Verified, safe model

Data Privacy:
  └─▶ All processing local
     ✅ No data sent to server
     ✅ No API keys needed
     ✅ Works offline (after first load)

Code Security:
  └─▶ Web Worker isolation
     ✅ Cannot access DOM
     ✅ Sandboxed execution
```

## Summary

The embedding system provides:

1. **Local Processing**: No server required
2. **Non-Blocking**: Background computation
3. **User-Friendly**: Progress tracking and instant UI
4. **Type-Safe**: Full TypeScript support
5. **Performant**: Optimized for browser
6. **Reliable**: Error handling and recovery
7. **Flexible**: Multiple usage patterns
8. **Documented**: Comprehensive guides

The architecture ensures a smooth user experience while maintaining code quality and performance.
