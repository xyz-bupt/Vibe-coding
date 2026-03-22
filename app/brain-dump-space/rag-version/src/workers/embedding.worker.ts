/**
 * Web Worker for computing text embeddings using local transformers
 *
 * This worker runs the embedding model in a separate thread to prevent
 * blocking the main UI. It uses the Xenova/transformers.js library to
 * run models entirely in the browser.
 *
 * The worker uses the all-MiniLM-L6-v2 model which produces 384-dimensional
 * embeddings and is optimized for semantic search tasks.
 *
 * @module embedding.worker
 */

// Import transformers.js for in-browser model inference
// @ts-ignore - Workers don't have access to regular module imports
import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js to disable local model checks
// and use the remote Hub for downloading models
env.allowLocalModels = false;
env.useBrowserCache = true;

/**
 * Model configuration
 */
const MODEL_NAME = 'Xenova/all-MiniLM-L6-v2';
const EMBEDDING_DIMENSIONS = 384;

/**
 * Message types for worker communication
 */
type WorkerMessage =
  | { type: 'init'; model?: string }
  | { type: 'embed'; text: string; id?: string }
  | { type: 'embedBatch'; texts: string[]; id?: string }
  | { type: 'getStatus' };

/**
 * Response types from worker
 */
type WorkerResponse =
  | { type: 'progress'; progress: number; status: string }
  | { type: 'ready'; model: string; dimensions: number }
  | { type: 'embedding'; embedding: Float32Array; id?: string; text?: string }
  | { type: 'embeddings'; embeddings: Float32Array[]; id?: string }
  | { type: 'error'; error: string; message: string }
  | { type: 'status'; ready: boolean; model?: string; dimensions?: number };

/**
 * Feature extraction pipeline for embeddings
 */
let extractor: Awaited<ReturnType<typeof pipeline>> | null = null;

/**
 * Current model being used
 */
let currentModel: string = MODEL_NAME;

/**
 * Whether the model is ready for inference
 */
let isReady = false;

/**
 * Initialize the embedding model
 *
 * @param modelName - Optional model name override
 * @returns Promise that resolves when the model is loaded
 */
async function initializeModel(modelName?: string): Promise<void> {
  try {
    const model = modelName || MODEL_NAME;
    currentModel = model;
    isReady = false;

    // Send progress update
    self.postMessage({
      type: 'progress',
      progress: 0,
      status: `Loading model: ${model}...`
    } as WorkerResponse);

    // Initialize the feature extraction pipeline
    extractor = await pipeline('feature-extraction', model, {
      progress_callback: (progress) => {
        if (progress.status === 'downloading') {
          const percent = progress.progress ? progress.progress * 100 : 0;
          self.postMessage({
            type: 'progress',
            progress: percent,
            status: `Downloading model: ${Math.round(percent)}%`
          } as WorkerResponse);
        } else if (progress.status === 'loading-model') {
          self.postMessage({
            type: 'progress',
            progress: 90,
            status: 'Loading model into memory...'
          } as WorkerResponse);
        }
      }
    });

    isReady = true;

    // Send ready message
    self.postMessage({
      type: 'ready',
      model: currentModel,
      dimensions: EMBEDDING_DIMENSIONS
    } as WorkerResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({
      type: 'error',
      error: 'MODEL_LOAD_ERROR',
      message: `Failed to load embedding model: ${errorMessage}`
    } as WorkerResponse);
    throw error;
  }
}

/**
 * Compute embedding for a single text
 *
 * @param text - Input text to embed
 * @param id - Optional identifier for the request
 * @returns Promise that resolves to the embedding vector
 */
async function computeEmbedding(text: string, id?: string): Promise<void> {
  try {
    if (!extractor || !isReady) {
      throw new Error('Model not initialized. Call init first.');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    // Run the model
    const output = await extractor(text, {
      pooling: 'mean',
      normalize: true
    });

    // Extract the embedding tensor and convert to Float32Array
    // The output is a tensor with shape [1, sequence_length, hidden_size]
    // After mean pooling, we get [1, hidden_size]
    const embeddingData = output.tolist() as number[][];

    // Extract the first (and only) embedding and convert to Float32Array
    const embedding = new Float32Array(embeddingData[0]);

    // Validate embedding dimensions
    if (embedding.length !== EMBEDDING_DIMENSIONS) {
      console.warn(
        `[EmbeddingWorker] Expected ${EMBEDDING_DIMENSIONS} dimensions, got ${embedding.length}`
      );
    }

    // Send the embedding back to main thread
    self.postMessage({
      type: 'embedding',
      embedding,
      id,
      text
    } as WorkerResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({
      type: 'error',
      error: 'EMBEDDING_ERROR',
      message: `Failed to compute embedding: ${errorMessage}`
    } as WorkerResponse);
  }
}

/**
 * Compute embeddings for multiple texts in batch
 *
 * @param texts - Array of input texts to embed
 * @param id - Optional identifier for the request
 * @returns Promise that resolves to array of embedding vectors
 */
async function computeEmbeddings(texts: string[], id?: string): Promise<void> {
  try {
    if (!extractor || !isReady) {
      throw new Error('Model not initialized. Call init first.');
    }

    if (!texts || texts.length === 0) {
      throw new Error('Texts array cannot be empty');
    }

    // Filter out empty texts
    const validTexts = texts.filter(t => t && t.trim().length > 0);
    if (validTexts.length === 0) {
      throw new Error('No valid texts provided');
    }

    // Process all texts in parallel for better performance
    const embeddings = await Promise.all(
      validTexts.map(async (text) => {
        const output = await extractor(text, {
          pooling: 'mean',
          normalize: true
        });

        const embeddingData = output.tolist() as number[][];
        return new Float32Array(embeddingData[0]);
      })
    );

    // Send embeddings back to main thread
    self.postMessage({
      type: 'embeddings',
      embeddings,
      id
    } as WorkerResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    self.postMessage({
      type: 'error',
      error: 'BATCH_EMBEDDING_ERROR',
      message: `Failed to compute batch embeddings: ${errorMessage}`
    } as WorkerResponse);
  }
}

/**
 * Get current worker status
 */
function getStatus(): void {
  self.postMessage({
    type: 'status',
    ready: isReady,
    model: isReady ? currentModel : undefined,
    dimensions: isReady ? EMBEDDING_DIMENSIONS : undefined
  } as WorkerResponse);
}

/**
 * Handle incoming messages from main thread
 */
self.addEventListener('message', async (event: MessageEvent<WorkerMessage>) => {
  const message = event.data;

  switch (message.type) {
    case 'init':
      // Initialize the model
      await initializeModel(message.model);
      break;

    case 'embed':
      // Compute embedding for single text
      await computeEmbedding(message.text, message.id);
      break;

    case 'embedBatch':
      // Compute embeddings for multiple texts
      await computeEmbeddings(message.texts, message.id);
      break;

    case 'getStatus':
      // Return current status
      getStatus();
      break;

    default:
      // Unknown message type
      self.postMessage({
        type: 'error',
        error: 'UNKNOWN_MESSAGE',
        message: `Unknown message type: ${(message as WorkerMessage).type}`
      } as WorkerResponse);
  }
});

// Auto-initialize with default model when worker starts
// This provides a better user experience as the model loads immediately
initializeModel().catch((error) => {
  console.error('[EmbeddingWorker] Failed to auto-initialize:', error);
});
