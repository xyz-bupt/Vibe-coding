/**
 * Embedding service for computing text embeddings using local models
 *
 * This service manages a Web Worker that runs the embedding model,
 * providing a clean API for computing embeddings in the main thread.
 * The worker runs the model asynchronously without blocking the UI.
 *
 * @module embedding
 */

/**
 * Worker message types
 */
type WorkerMessage =
  | { type: 'init'; model?: string }
  | { type: 'embed'; text: string; id?: string }
  | { type: 'embedBatch'; texts: string[]; id?: string }
  | { type: 'getStatus' };

/**
 * Worker response types
 */
type WorkerResponse =
  | { type: 'progress'; progress: number; status: string }
  | { type: 'ready'; model: string; dimensions: number }
  | { type: 'embedding'; embedding: Float32Array; id?: string; text?: string }
  | { type: 'embeddings'; embeddings: Float32Array[]; id?: string }
  | { type: 'error'; error: string; message: string }
  | { type: 'status'; ready: boolean; model?: string; dimensions?: number };

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
 * Embedding service configuration
 */
export interface EmbeddingConfig {
  /** Custom model name (optional) */
  model?: string;
  /** Callback for progress updates during model loading */
  onProgress?: (progress: EmbeddingProgress) => void;
  /** Callback when model is ready */
  onReady?: (model: string, dimensions: number) => void;
  /** Callback for errors */
  onError?: (error: string, message: string) => void;
}

/**
 * Result of embedding computation
 */
export interface EmbeddingResult {
  /** The embedding vector */
  embedding: Float32Array;
  /** The input text */
  text: string;
}

/**
 * Embedding service state
 */
type ServiceState = 'uninitialized' | 'loading' | 'ready' | 'error';

/**
 * Pending request tracking
 */
interface PendingRequest {
  resolve: (value: Float32Array) => void;
  reject: (error: Error) => void;
  text: string;
}

/**
 * Pending batch request tracking
 */
interface PendingBatchRequest {
  resolve: (value: Float32Array[]) => void;
  reject: (error: Error) => void;
  count: number;
  embeddings: Float32Array[];
}

/**
 * Embedding service class
 *
 * Manages the embedding worker and provides a clean API for computing embeddings.
 *
 * @example
 * ```typescript
 * const service = new EmbeddingService();
 * await service.init();
 *
 * const embedding = await service.embed('Hello world');
 * console.log('Embedding dimensions:', embedding.length);
 *
 * service.dispose();
 * ```
 */
export class EmbeddingService {
  private worker: Worker | null = null;
  private state: ServiceState = 'uninitialized';
  private model: string = 'Xenova/all-MiniLM-L6-v2';
  private dimensions: number = 384;
  private pendingRequests = new Map<string, PendingRequest>();
  private pendingBatches = new Map<string, PendingBatchRequest>();
  private config: EmbeddingConfig = {};
  private requestIdCounter = 0;

  /**
   * Creates a new EmbeddingService instance
   *
   * @param config - Optional configuration
   */
  constructor(config: EmbeddingConfig = {}) {
    this.config = config;
  }

  /**
   * Initialize the embedding service
   *
   * Loads the embedding model in the worker. The service will be
   * ready to compute embeddings after this completes.
   *
   * @param model - Optional model name override
   * @returns Promise that resolves when the model is loaded
   *
   * @example
   * ```typescript
   * const service = new EmbeddingService();
   * await service.init();
   * console.log('Embedding service ready!');
   * ```
   */
  async init(model?: string): Promise<void> {
    if (this.state === 'loading') {
      throw new Error('Service is already loading');
    }

    if (this.state === 'ready') {
      return; // Already initialized
    }

    this.state = 'loading';

    try {
      // Create the worker
      this.worker = new Worker(
        new URL('../workers/embedding.worker.ts', import.meta.url),
        { type: 'module' }
      );

      // Set up message handler
      this.worker.addEventListener('message', this.handleMessage);

      // Initialize the model
      this.postMessage({
        type: 'init',
        model: model || this.config.model
      });

      // Wait for ready message
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          // Clean up listener on timeout
          this.worker?.removeEventListener('message', onReady);
          reject(new Error('Model initialization timeout'));
        }, 120000); // 2 minute timeout

        const onReady = (event: MessageEvent) => {
          if (event.data.type === 'ready') {
            clearTimeout(timeout);
            this.worker?.removeEventListener('message', onReady);
            resolve();
          } else if (event.data.type === 'error') {
            clearTimeout(timeout);
            this.worker?.removeEventListener('message', onReady);
            reject(new Error(event.data.message));
          }
        };

        this.worker?.addEventListener('message', onReady);
      });

      this.state = 'ready';
    } catch (error) {
      this.state = 'error';
      this.dispose();
      throw error;
    }
  }

  /**
   * Compute embedding for a single text
   *
   * @param text - Input text to embed
   * @returns Promise that resolves to the embedding vector
   * @throws {Error} If service is not ready or text is empty
   *
   * @example
   * ```typescript
   * const embedding = await service.embed('Hello world');
   * console.log('Embedding:', embedding);
   * ```
   */
  async embed(text: string): Promise<Float32Array> {
    if (this.state !== 'ready') {
      throw new Error(
        `Service not ready. Current state: ${this.state}. Call init() first.`
      );
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    return new Promise<Float32Array>((resolve, reject) => {
      const id = `req-${this.requestIdCounter++}`;

      // Store the pending request with wrapped resolve to clean up timeout
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Embedding computation timeout'));
        }
      }, 30000);

      const wrappedResolve = (value: Float32Array) => {
        clearTimeout(timeout);
        resolve(value);
      };

      const wrappedReject = (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      };

      // Store the pending request with wrapped callbacks
      this.pendingRequests.set(id, {
        resolve: wrappedResolve,
        reject: wrappedReject,
        text
      });

      // Send to worker
      this.postMessage({
        type: 'embed',
        text,
        id
      });
    });
  }

  /**
   * Compute embeddings for multiple texts
   *
   * @param texts - Array of input texts to embed
   * @returns Promise that resolves to array of embedding vectors
   * @throws {Error} If service is not ready or texts array is empty
   *
   * @example
   * ```typescript
   * const embeddings = await service.embedBatch([
   *   'Hello world',
   *   'Goodbye world'
   * ]);
   * console.log(`Computed ${embeddings.length} embeddings`);
   * ```
   */
  async embedBatch(texts: string[]): Promise<Float32Array[]> {
    if (this.state !== 'ready') {
      throw new Error(
        `Service not ready. Current state: ${this.state}. Call init() first.`
      );
    }

    if (!texts || texts.length === 0) {
      throw new Error('Texts array cannot be empty');
    }

    // Filter out empty texts
    const validTexts = texts.filter(t => t && t.trim().length > 0);
    if (validTexts.length === 0) {
      throw new Error('No valid texts provided');
    }

    return new Promise<Float32Array[]>((resolve, reject) => {
      const id = `batch-${this.requestIdCounter++}`;

      // Set timeout (2 minutes for batch)
      const timeout = setTimeout(() => {
        if (this.pendingBatches.has(id)) {
          this.pendingBatches.delete(id);
          reject(new Error('Batch embedding computation timeout'));
        }
      }, 120000);

      const wrappedResolve = (value: Float32Array[]) => {
        clearTimeout(timeout);
        resolve(value);
      };

      const wrappedReject = (error: Error) => {
        clearTimeout(timeout);
        reject(error);
      };

      // Store the pending batch request with wrapped callbacks
      this.pendingBatches.set(id, {
        resolve: wrappedResolve,
        reject: wrappedReject,
        count: validTexts.length,
        embeddings: []
      });

      // Send to worker
      this.postMessage({
        type: 'embedBatch',
        texts: validTexts,
        id
      });
    });
  }

  /**
   * Get the current status of the service
   *
   * @returns Promise that resolves to the status
   *
   * @example
   * ```typescript
   * const status = await service.getStatus();
   * console.log('Ready:', status.ready);
   * console.log('Model:', status.model);
   * ```
   */
  async getStatus(): Promise<{
    ready: boolean;
    model?: string;
    dimensions?: number;
  }> {
    if (!this.worker) {
      return { ready: false };
    }

    return new Promise((resolve) => {
      const onStatus = (event: MessageEvent) => {
        if (event.data.type === 'status') {
          clearTimeout(timeout);
          this.worker?.removeEventListener('message', onStatus);
          resolve({
            ready: event.data.ready,
            model: event.data.model,
            dimensions: event.data.dimensions
          });
        }
      };

      const timeout = setTimeout(() => {
        this.worker?.removeEventListener('message', onStatus);
        resolve({ ready: false });
      }, 5000);

      this.worker?.addEventListener('message', onStatus);
      this.postMessage({ type: 'getStatus' });
    });
  }

  /**
   * Check if the service is ready
   */
  isReady(): boolean {
    return this.state === 'ready';
  }

  /**
   * Get the embedding dimensions
   */
  getDimensions(): number {
    return this.dimensions;
  }

  /**
   * Get the model name
   */
  getModel(): string {
    return this.model;
  }

  /**
   * Handle messages from the worker
   */
  private handleMessage = (event: MessageEvent<WorkerResponse>): void => {
    const data = event.data;

    switch (data.type) {
      case 'progress':
        // Model loading progress
        if (this.config.onProgress) {
          this.config.onProgress({
            progress: data.progress,
            status: data.status
          });
        }
        break;

      case 'ready':
        // Model is ready
        this.model = data.model;
        this.dimensions = data.dimensions;
        this.state = 'ready';

        if (this.config.onReady) {
          this.config.onReady(this.model, this.dimensions);
        }
        break;

      case 'embedding':
        // Single embedding result
        const pending = this.pendingRequests.get(data.id || '');
        if (pending) {
          this.pendingRequests.delete(data.id || '');
          pending.resolve(data.embedding);
        }
        break;

      case 'embeddings':
        // Batch embedding result
        const batchPending = this.pendingBatches.get(data.id || '');
        if (batchPending) {
          this.pendingBatches.delete(data.id || '');
          batchPending.resolve(data.embeddings);
        }
        break;

      case 'error':
        // Error occurred
        console.error('[EmbeddingService] Worker error:', data.message);

        // Reject any pending requests with this ID
        if (data.id) {
          const req = this.pendingRequests.get(data.id);
          if (req) {
            this.pendingRequests.delete(data.id);
            req.reject(new Error(data.message));
          }

          const batch = this.pendingBatches.get(data.id);
          if (batch) {
            this.pendingBatches.delete(data.id);
            batch.reject(new Error(data.message));
          }
        }

        // Call error callback
        if (this.config.onError) {
          this.config.onError(data.error, data.message);
        }
        break;

      case 'status':
        // Status response (handled in getStatus)
        break;
    }
  };

  /**
   * Send a message to the worker
   */
  private postMessage(message: WorkerMessage): void {
    if (this.worker) {
      this.worker.postMessage(message);
    }
  }

  /**
   * Dispose of the service and clean up resources
   *
   * Call this when you're done using the service to free up memory.
   *
   * @example
   * ```typescript
   * service.dispose();
   * ```
   */
  dispose(): void {
    if (this.worker) {
      this.worker.removeEventListener('message', this.handleMessage);
      this.worker.terminate();
      this.worker = null;
    }

    this.pendingRequests.clear();
    this.pendingBatches.clear();
    this.state = 'uninitialized';
  }

  /**
   * Create a singleton instance
   *
   * @returns The singleton instance
   */
  private static instance: EmbeddingService | null = null;
  private static initPromise: Promise<EmbeddingService> | null = null;

  static async getInstance(config?: EmbeddingConfig): Promise<EmbeddingService> {
    // If instance exists, return it immediately
    if (EmbeddingService.instance) {
      return EmbeddingService.instance;
    }

    // If initialization is in progress, wait for it
    if (EmbeddingService.initPromise) {
      return EmbeddingService.initPromise;
    }

    // Start initialization and cache the promise to prevent race conditions
    EmbeddingService.initPromise = (async () => {
      const instance = new EmbeddingService(config);
      await instance.init();
      EmbeddingService.instance = instance;
      EmbeddingService.initPromise = null; // Clear the promise cache
      return instance;
    })();

    return EmbeddingService.initPromise;
  }

  static resetInstance(): void {
    if (EmbeddingService.instance) {
      EmbeddingService.instance.dispose();
      EmbeddingService.instance = null;
      EmbeddingService.initPromise = null;
    }
  }
}

/**
 * Default embedding service instance
 *
 * Convenience function to get or create the default instance.
 *
 * @example
 * ```typescript
 * const embedding = await embed('Hello world');
 * console.log('Embedding:', embedding);
 * ```
 */
export async function embed(text: string): Promise<Float32Array> {
  const service = await EmbeddingService.getInstance();
  return service.embed(text);
}

/**
 * Compute embeddings for multiple texts
 *
 * @example
 * ```typescript
 * const embeddings = await embedBatch(['Hello', 'World']);
 * console.log(`Computed ${embeddings.length} embeddings`);
 * ```
 */
export async function embedBatch(texts: string[]): Promise<Float32Array[]> {
  const service = await EmbeddingService.getInstance();
  return service.embedBatch(texts);
}

/**
 * Initialize the default embedding service
 *
 * @example
 * ```typescript
 * await initEmbedding({ onProgress: (p) => console.log(p.status) });
 * ```
 */
export async function initEmbedding(config?: EmbeddingConfig): Promise<void> {
  const service = await EmbeddingService.getInstance(config);
  if (!service.isReady()) {
    await service.init();
  }
}

/**
 * Dispose of the default embedding service
 *
 * @example
 * ```typescript
 * disposeEmbedding();
 * ```
 */
export function disposeEmbedding(): void {
  EmbeddingService.resetInstance();
}

export default EmbeddingService;
