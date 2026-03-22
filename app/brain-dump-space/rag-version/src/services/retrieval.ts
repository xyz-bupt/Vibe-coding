/**
 * RAG Retrieval Service
 *
 * 提供语义检索功能，基于向量相似度查找相关的闪念。
 * 这是 RAG (Retrieval-Augmented Generation) 系统的核心组件。
 *
 * @module retrieval
 */

import type { Thought } from '../types/index.js';
import * as storage from '../db/storage.js';
import { computeEmbedding } from './embedding.js';
import { cosineSimilarity } from '../utils/embedding.js';

/**
 * 带有嵌入向量的闪念类型
 */
export type ThoughtWithEmbedding = Thought & { embedding: number[] };

/**
 * 相似度搜索结果
 */
export interface SearchResult {
  /** 匹配的闪念 */
  thought: Thought;
  /** 相似度分数 (0-1, 1为完全相同) */
  similarity: number;
}

/**
 * 检索选项
 */
export interface RetrievalOptions {
  /** 返回最相关的 K 条结果 (默认: 5, 范围: 1-100) */
  topK?: number;
  /** 最小相似度阈值 (0-1), 低于此值的结果将被过滤 (默认: 0) */
  minSimilarity?: number;
  /** 按标签过滤 */
  tags?: string[];
  /** 查询进度回调 */
  onProgress?: (step: string, progress: number) => void;
}

/**
 * 检索统计信息
 */
export interface RetrievalStats {
  /** 总闪念数量 */
  totalThoughts: number;
  /** 有向量的闪念数量 */
  thoughtsWithEmbeddings: number;
  /** 计算相似度的数量 */
  comparedCount: number;
  /** 检索耗时 (毫秒) */
  duration: number;
}

/**
 * 检索结果（包含统计信息）
 */
export interface RetrievalResult {
  /** 搜索结果列表 */
  results: SearchResult[];
  /** 检索统计信息 */
  stats: RetrievalStats;
}

/**
 * 预计算选项
 */
export interface PrecomputeOptions {
  /** 进度回调 */
  onProgress?: (step: string, progress: number, current: number, total: number) => void;
  /** 并发数（同时处理的闪念数量） */
  concurrency?: number;
}

/**
 * 预计算结果
 */
export interface PrecomputeResult {
  /** 成功处理的数量 */
  processed: number;
  /** 跳过的数量（已有向量） */
  skipped: number;
  /** 失败的数量 */
  failed: number;
}

/**
 * 检索错误类
 */
export class RetrievalError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'RetrievalError';
  }
}

/**
 * 常量定义
 */
const DEFAULT_TOP_K = 5;
const MAX_TOP_K = 100;
const MIN_SIMILARITY = 0;
const MAX_SIMILARITY = 1;
const PREVIEW_LENGTH = 30;

/**
 * 类型守卫：检查闪念是否有嵌入向量
 */
function hasEmbedding(t: Thought): t is ThoughtWithEmbedding {
  return t.embedding !== undefined && t.embedding.length > 0;
}

/**
 * 归一化检索选项参数
 */
function normalizeOptions(options: RetrievalOptions): Required<
  Omit<RetrievalOptions, 'tags' | 'onProgress'>
> & Pick<RetrievalOptions, 'tags' | 'onProgress'> {
  const topK = Math.max(1, Math.min(MAX_TOP_K, options.topK ?? DEFAULT_TOP_K));
  const minSimilarity = Math.max(
    MIN_SIMILARITY,
    Math.min(MAX_SIMILARITY, options.minSimilarity ?? MIN_SIMILARITY)
  );

  return {
    topK,
    minSimilarity,
    tags: options.tags,
    onProgress: options.onProgress
  };
}

/**
 * 语义搜索：根据文本查询查找最相似的闪念
 *
 * 这是 RAG 检索的核心函数。执行步骤：
 * 1. 将查询文本转换为向量嵌入
 * 2. 从 IndexedDB 读取所有带向量的闪念
 * 3. 计算查询向量与每个闪念向量的余弦相似度
 * 4. 按相似度降序排列，返回 Top K 条结果
 *
 * @param query - 用户的查询文本
 * @param options - 检索选项
 * @returns Promise 解析为相似闪念列表（带相似度分数）
 *
 * @example
 * ```typescript
 * const { results, stats } = await searchSimilarThoughts('如何学习编程？', {
 *   topK: 5,
 *   minSimilarity: 0.6
 * });
 *
 * results.forEach(({ thought, similarity }) => {
 *   console.log(`${similarity.toFixed(3)}: ${thought.content}`);
 * });
 * ```
 */
export async function searchSimilarThoughts(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult> {
  const startTime = performance.now();
  const normalizedOptions = normalizeOptions(options);
  const { topK, minSimilarity, tags, onProgress } = normalizedOptions;

  // 验证查询
  if (typeof query !== 'string' || query.trim().length === 0) {
    throw new RetrievalError(
      '查询文本不能为空',
      'EMPTY_QUERY'
    );
  }

  try {
    // 步骤 1: 初始化存储
    onProgress?.('初始化存储', 0);
    await storage.init();

    // 步骤 2: 将查询文本转换为向量
    onProgress?.('计算查询向量', 20);
    const queryEmbedding = await computeEmbedding(query.trim());

    // 步骤 3: 获取所有闪念
    onProgress?.('读取闪念数据', 40);
    const allThoughts = await storage.getAllThoughts();

    // 步骤 4: 使用类型守卫过滤有向量的闪念
    onProgress?.('筛选有效数据', 50);
    let candidates = allThoughts.filter(hasEmbedding);

    // 按标签过滤（如果指定）
    if (tags && tags.length > 0) {
      candidates = candidates.filter(t =>
        tags.some(tag => t.tags.includes(tag))
      );
    }

    // 步骤 5: 计算相似度（不再需要非空断言）
    onProgress?.('计算相似度', 60);
    const results: SearchResult[] = candidates.map(thought => ({
      thought,
      similarity: cosineSimilarity(queryEmbedding, thought.embedding)
    }));

    // 步骤 6: 过滤低于阈值的
    onProgress?.('过滤结果', 80);
    const filtered = results.filter(r => r.similarity >= minSimilarity);

    // 步骤 7: 按相似度降序排列
    filtered.sort((a, b) => b.similarity - a.similarity);

    // 步骤 8: 取 Top K
    const topResults = filtered.slice(0, topK);

    const endTime = performance.now();
    onProgress?.('完成', 100);

    // 返回标准格式的结果
    return {
      results: topResults,
      stats: {
        totalThoughts: allThoughts.length,
        thoughtsWithEmbeddings: candidates.length,
        comparedCount: candidates.length,
        duration: endTime - startTime
      }
    };
  } catch (error) {
    if (error instanceof RetrievalError) {
      throw error;
    }
    throw new RetrievalError(
      '检索失败',
      'RETRIEVAL_FAILED',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 批量检索：对多个查询分别执行语义搜索
 *
 * @param queries - 查询文本数组
 * @param options - 检索选项
 * @returns Promise 解析为检索结果数组
 *
 * @example
 * ```typescript
 * const results = await batchSearch([
 *   'JavaScript 闭包',
 *   'React Hooks'
 * ], { topK: 3 });
 * ```
 */
export async function batchSearch(
  queries: string[],
  options: RetrievalOptions = {}
): Promise<RetrievalResult[]> {
  if (!Array.isArray(queries) || queries.length === 0) {
    throw new RetrievalError(
      '查询数组不能为空',
      'EMPTY_QUERIES'
    );
  }

  // 使用类型守卫过滤有效查询
  const validQueries = queries.filter((q): q is string =>
    typeof q === 'string' && q.trim().length > 0
  );

  if (validQueries.length === 0) {
    throw new RetrievalError(
      '没有有效的查询',
      'NO_VALID_QUERIES'
    );
  }

  // 并行执行所有查询
  const results = await Promise.all(
    validQueries.map(query => searchSimilarThoughts(query, options))
  );

  return results;
}

/**
 * 混合检索：结合关键词匹配和语义相似度
 *
 * 先进行关键词匹配，再对匹配结果进行语义相似度排序。
 * 适用于需要精确匹配 + 语义排序的场景。
 *
 * @param query - 查询文本
 * @param options - 检索选项
 * @returns Promise 解析为混合检索结果
 *
 * @example
 * ```typescript
 * const { results, stats } = await hybridSearch('闭包', {
 *   topK: 10,
 *   minSimilarity: 0.3  // 降低阈值，让关键词匹配的结果也能进来
 * });
 * ```
 */
export async function hybridSearch(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult> {
  const startTime = performance.now();
  const normalizedOptions = normalizeOptions(options);
  const { topK, minSimilarity, onProgress } = normalizedOptions;

  if (typeof query !== 'string' || query.trim().length === 0) {
    throw new RetrievalError(
      '查询文本不能为空',
      'EMPTY_QUERY'
    );
  }

  try {
    await storage.init();

    // 步骤 1: 关键词匹配（大小写不敏感）
    onProgress?.('关键词匹配', 20);
    const allThoughts = await storage.getAllThoughts();
    const searchTerm = query.toLowerCase().trim();

    const keywordMatches = allThoughts.filter(t =>
      t.content.toLowerCase().includes(searchTerm) ||
      t.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );

    // 如果没有关键词匹配，回退到纯语义搜索
    if (keywordMatches.length === 0) {
      onProgress?.('无关键词匹配，使用语义搜索', 40);
      return await searchSimilarThoughts(query, options);
    }

    // 步骤 2: 计算查询向量
    onProgress?.('计算查询向量', 50);
    const queryEmbedding = await computeEmbedding(query.trim());

    // 步骤 3: 只对关键词匹配的结果计算相似度（使用类型守卫）
    onProgress?.('计算相似度', 60);
    const candidates = keywordMatches.filter(hasEmbedding);

    const results: SearchResult[] = candidates.map(thought => ({
      thought,
      similarity: cosineSimilarity(queryEmbedding, thought.embedding)
    }));

    // 步骤 4: 过滤、排序、取 Top K
    const filtered = results
      .filter(r => r.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    const endTime = performance.now();
    onProgress?.('完成', 100);

    return {
      results: filtered,
      stats: {
        totalThoughts: allThoughts.length,
        thoughtsWithEmbeddings: candidates.length,
        comparedCount: candidates.length,
        duration: endTime - startTime
      }
    };
  } catch (error) {
    if (error instanceof RetrievalError) {
      throw error;
    }
    throw new RetrievalError(
      '混合检索失败',
      'HYBRID_SEARCH_FAILED',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 找到与指定闪念最相似的其他闪念
 *
 * @param thoughtId - 参考闪念的 ID
 * @param options - 检索选项
 * @returns Promise 解析为相似闪念列表
 *
 * @example
 * ```typescript
 * const related = await findRelatedThoughts('thought-123', {
 *   topK: 5,
 *   minSimilarity: 0.7
 * });
 * ```
 */
export async function findRelatedThoughts(
  thoughtId: string,
  options: Omit<RetrievalOptions, 'onProgress'> = {}
): Promise<SearchResult[]> {
  const normalizedOptions = normalizeOptions(options);
  const { topK, minSimilarity, tags } = normalizedOptions;

  try {
    await storage.init();

    // 获取参考闪念
    const refThought = await storage.getThoughtById(thoughtId);
    if (!refThought) {
      throw new RetrievalError(
        `闪念 ${thoughtId} 不存在`,
        'THOUGHT_NOT_FOUND'
      );
    }

    if (!hasEmbedding(refThought)) {
      throw new RetrievalError(
        `闪念 ${thoughtId} 没有向量数据`,
        'NO_EMBEDDING'
      );
    }

    // 获取所有闪念
    const allThoughts = await storage.getAllThoughts();

    // 过滤：排除自己，只保留有向量的（使用类型守卫）
    let candidates = allThoughts.filter(
      t => t.id !== thoughtId && hasEmbedding(t)
    );

    // 按标签过滤
    if (tags && tags.length > 0) {
      candidates = candidates.filter(t =>
        tags.some(tag => t.tags.includes(tag))
      );
    }

    // 计算相似度（不再需要非空断言）
    const results: SearchResult[] = candidates.map(thought => ({
      thought,
      similarity: cosineSimilarity(refThought.embedding, thought.embedding)
    }));

    // 过滤、排序、返回 Top K
    return results
      .filter(r => r.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (error) {
    if (error instanceof RetrievalError) {
      throw error;
    }
    throw new RetrievalError(
      '查找相关闪念失败',
      'FIND_RELATED_FAILED',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 检查系统是否准备好进行语义检索
 *
 * @returns Promise 解析为准备状态信息
 *
 * @example
 * ```typescript
 * const status = await getRetrievalStatus();
 * console.log(`可用闪念: ${status.availableThoughts}`);
 * console.log(`就绪: ${status.isReady}`);
 * ```
 */
export async function getRetrievalStatus(): Promise<{
  isReady: boolean;
  totalThoughts: number;
  thoughtsWithEmbeddings: number;
  embeddingServiceReady: boolean;
}> {
  try {
    // 检查存储是否初始化
    await storage.init();

    // 获取统计信息
    const allThoughts = await storage.getAllThoughts();
    const thoughtsWithEmbeddings = allThoughts.filter(
      t => t.embedding && t.embedding.length > 0
    ).length;

    // 检查嵌入服务状态
    const embeddingReady = storage.isEmbeddingReady();

    return {
      isReady: thoughtsWithEmbeddings > 0 && embeddingReady,
      totalThoughts: allThoughts.length,
      thoughtsWithEmbeddings,
      embeddingServiceReady: embeddingReady
    };
  } catch (error) {
    return {
      isReady: false,
      totalThoughts: 0,
      thoughtsWithEmbeddings: 0,
      embeddingServiceReady: false
    };
  }
}

/**
 * 预计算所有闪念的向量
 *
 * 为还没有向量的闪念批量生成嵌入向量。
 * 适用于初始化或数据迁移场景。
 *
 * @param options - 预计算选项
 * @returns Promise 解析为处理统计
 *
 * @example
 * ```typescript
 * const stats = await precomputeEmbeddings({
 *   onProgress: (step, progress, current, total) =>
 *     console.log(`${step}: ${progress}% (${current}/${total})`)
 * });
 * console.log(`已处理: ${stats.processed}, 跳过: ${stats.skipped}`);
 * ```
 */
export async function precomputeEmbeddings(
  options: PrecomputeOptions = {}
): Promise<PrecomputeResult> {
  const { onProgress, concurrency = 3 } = options;

  try {
    await storage.init();

    // 初始化嵌入服务
    onProgress?.('初始化嵌入服务', 0, 0, 0);
    await storage.initEmbeddingService();

    // 获取所有闪念
    const allThoughts = await storage.getAllThoughts();

    // 筛选没有向量的闪念
    const thoughtsWithoutEmbedding = allThoughts.filter(
      t => !t.embedding || t.embedding.length === 0
    );

    const total = thoughtsWithoutEmbedding.length;
    if (total === 0) {
      onProgress?.('完成', 100, 0, 0);
      return { processed: 0, skipped: allThoughts.length, failed: 0 };
    }

    let processed = 0;
    let failed = 0;

    // 批量并发处理
    const processBatch = async (thoughts: Thought[]): Promise<void> => {
      for (const thought of thoughts) {
        const current = processed + failed + 1;
        const progress = Math.round((current / total) * 100);

        try {
          onProgress?.(
            `处理: ${thought.content.substring(0, PREVIEW_LENGTH)}...`,
            progress,
            current,
            total
          );

          // 创建带向量的闪念（会自动计算向量）
          await storage.createThought(thought.content, {
            id: thought.id,
            tags: thought.tags,
            createdAt: thought.createdAt,
            computeEmbedding: true
          });

          processed++;
        } catch (error) {
          console.error(`预计算失败 [${thought.id}]:`, error);
          failed++;
        }
      }
    };

    // 分批处理
    const batches: Thought[][] = [];
    for (let i = 0; i < total; i += concurrency) {
      batches.push(thoughtsWithoutEmbedding.slice(i, i + concurrency));
    }

    for (const batch of batches) {
      await processBatch(batch);
    }

    onProgress?.('完成', 100, total, total);

    return {
      processed,
      skipped: allThoughts.length - total,
      failed
    };
  } catch (error) {
    if (error instanceof RetrievalError) {
      throw error;
    }
    throw new RetrievalError(
      '预计算失败',
      'PRECOMPUTE_FAILED',
      error instanceof Error ? error : undefined
    );
  }
}

// 导出类型
export type {
  SearchResult,
  RetrievalOptions,
  RetrievalStats,
  RetrievalResult,
  ThoughtWithEmbedding
};

// 预计算相关类型导出
export type { PrecomputeOptions, PrecomputeResult };

// 默认导出
export default {
  searchSimilarThoughts,
  batchSearch,
  hybridSearch,
  findRelatedThoughts,
  getRetrievalStatus,
  precomputeEmbeddings
};
