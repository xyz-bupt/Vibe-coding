/**
 * RAG Generation Service
 *
 * 提供与大模型API交互的功能，实现RAG的生成部分。
 * 支持流式响应（Server-Sent Events）。
 *
 * @module generation
 */

import { searchSimilarThoughts, type SearchResult } from './retrieval.js';

/**
 * 聊天消息角色
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 聊天消息
 */
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

/**
 * 流式响应回调
 */
export interface StreamCallbacks {
  /** 收到文本块时调用 */
  onChunk?: (chunk: string) => void;
  /** 完成时调用 */
  onComplete?: (fullText: string) => void;
  /** 发生错误时调用 */
  onError?: (error: Error) => void;
}

/**
 * LLM API 配置
 */
export interface LLMConfig {
  /** API 端点 URL */
  apiUrl: string;
  /** API 密钥 */
  apiKey: string;
  /** 模型名称 */
  model: string;
}

/**
 * 默认系统提示词模板
 */
const DEFAULT_SYSTEM_PROMPT = `你是一个理解用户过去的闪念记录的 AI 助手。

请根据以下我过去的闪念记录回答我的问题：
- 如果记录中有相关信息，请基于这些信息回答
- 如果记录中没有相关信息，请直接说明，不要编造
- 保持简洁、友好的语气
- 可以在回答中引用具体的闪念内容

【闪念记录】
{records}

请回答用户的问题。`;

/**
 * RAG 生成选项
 */
export interface GenerateOptions {
  /** 检索的相似闪念数量 */
  topK?: number;
  /** 最小相似度阈值 */
  minSimilarity?: number;
  /** 自定义系统提示词 */
  systemPrompt?: string;
  /** 流式响应回调 */
  streamCallbacks?: StreamCallbacks;
  /** 按标签过滤闪念 */
  tags?: string[];
}

/**
 * RAG 生成结果
 */
export interface GenerateResult {
  /** 生成的回答 */
  text: string;
  /** 使用的上下文闪念 */
  context: SearchResult[];
  /** 使用的提示词 */
  prompt: string;
}

/**
 * 构建 RAG 系统提示词
 *
 * @param context - 检索到的相关闪念
 * @param customPrompt - 自定义提示词模板
 * @returns 完整的系统提示词
 */
function buildSystemPrompt(
  context: SearchResult[],
  customPrompt?: string
): string {
  const template = customPrompt || DEFAULT_SYSTEM_PROMPT;

  // 格式化闪念记录
  const records = context
    .map((r, i) => `[${i + 1}] ${r.thought.content}`)
    .join('\n');

  return template.replace('{records}', records);
}

/**
 * 检查配置是否有效
 */
function validateConfig(config: LLMConfig): void {
  if (!config.apiUrl) {
    throw new Error('API URL 未配置');
  }
  if (!config.apiKey) {
    throw new Error('API Key 未配置');
  }
  if (!config.model) {
    throw new Error('模型名称未配置');
  }
}

/**
 * 流式生成：根据用户提问进行 RAG 生成
 *
 * @param query - 用户的问题
 * @param config - LLM API 配置
 * @param options - 生成选项
 * @returns Promise 解析为生成的文本（如果非流式）或 undefined（流式）
 *
 * @example
 * ```typescript
 * // 流式响应
 * await generateRAGStream('我最近在看什么技术？', config, {
 *   topK: 5,
 *   streamCallbacks: {
 *     onChunk: (chunk) => updateUI(chunk),
 *     onComplete: (fullText) => console.log('完成:', fullText),
 *     onError: (error) => console.error(error)
 *   }
 * });
 * ```
 */
export async function generateRAGStream(
  query: string,
  config: LLMConfig,
  options: GenerateOptions = {}
): Promise<void> {
  const {
    topK = 5,
    minSimilarity = 0.5,
    systemPrompt,
    streamCallbacks,
    tags
  } = options;

  // 验证配置
  validateConfig(config);

  const { onChunk, onComplete, onError } = streamCallbacks || {};

  try {
    // 步骤 1: 检索相关闪念
    const { results: context } = await searchSimilarThoughts(query, {
      topK,
      minSimilarity,
      tags
    });

    // 步骤 2: 构建系统提示词
    const systemPromptText = buildSystemPrompt(context, systemPrompt);

    // 步骤 3: 调用 LLM API（流式）
    await streamChatCompletion(config, systemPromptText, query, {
      onChunk: (chunk) => {
        onChunk?.(chunk);
      },
      onComplete: (fullText) => {
        onComplete?.(fullText);
      },
      onError: (error) => {
        onError?.(error);
      }
    });
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    throw err;
  }
}

/**
 * 非流式生成：根据用户提问进行 RAG 生成
 *
 * @param query - 用户的问题
 * @param config - LLM API 配置
 * @param options - 生成选项
 * @returns Promise 解析为生成结果
 */
export async function generateRAG(
  query: string,
  config: LLMConfig,
  options: Omit<GenerateOptions, 'streamCallbacks'> = {}
): Promise<GenerateResult> {
  const {
    topK = 5,
    minSimilarity = 0.5,
    systemPrompt,
    tags
  } = options;

  // 验证配置
  validateConfig(config);

  // 步骤 1: 检索相关闪念
  const { results: context } = await searchSimilarThoughts(query, {
    topK,
    minSimilarity,
    tags
  });

  // 步骤 2: 构建系统提示词
  const systemPromptText = buildSystemPrompt(context, systemPrompt);

  // 步骤 3: 调用 LLM API（非流式）
  const text = await chatCompletion(config, systemPromptText, query);

  return {
    text,
    context,
    prompt: systemPromptText
  };
}

/**
 * 流式聊天补全 API 调用
 *
 * @param config - LLM API 配置
 * @param systemPrompt - 系统提示词
 * @param userMessage - 用户消息
 * @param callbacks - 流式回调
 */
async function streamChatCompletion(
  config: LLMConfig,
  systemPrompt: string,
  userMessage: string,
  callbacks: Required<StreamCallbacks>
): Promise<void> {
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      stream: true
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败: ${response.status} ${errorText}`);
  }

  if (!response.body) {
    throw new Error('响应体为空');
  }

  // 处理流式响应
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim() || !line.startsWith('data: ')) continue;

      const data = line.slice(6).trim();

      if (data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;

        if (content) {
          fullText += content;
          callbacks.onChunk(content);
        }
      } catch (e) {
        // 跳过无效的 JSON
        continue;
      }
    }
  }

  callbacks.onComplete(fullText);
}

/**
 * 非流式聊天补全 API 调用
 *
 * @param config - LLM API 配置
 * @param systemPrompt - 系统提示词
 * @param userMessage - 用户消息
 * @returns Promise 解析为生成的文本
 */
async function chatCompletion(
  config: LLMConfig,
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  const response = await fetch(config.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API 请求失败: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * 创建聊天消息 ID
 */
export function createMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 创建用户消息
 */
export function createUserMessage(content: string): ChatMessage {
  return {
    id: createMessageId(),
    role: 'user',
    content,
    timestamp: Date.now()
  };
}

/**
 * 创建助手消息
 */
export function createAssistantMessage(content: string = ''): ChatMessage {
  return {
    id: createMessageId(),
    role: 'assistant',
    content,
    timestamp: Date.now()
  };
}

/**
 * RAG 聊天会话类
 *
 * 管理完整的对话历史和上下文
 */
export class RAGChatSession {
  private messages: ChatMessage[] = [];
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  /**
   * 获取所有消息
   */
  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  /**
   * 添加消息
   */
  addMessage(message: ChatMessage): void {
    this.messages.push(message);
  }

  /**
   * 清空消息
   */
  clearMessages(): void {
    this.messages = [];
  }

  /**
   * 获取最后一条消息
   */
  getLastMessage(): ChatMessage | undefined {
    return this.messages[this.messages.length - 1];
  }

  /**
   * 流式回复用户消息
   */
  async replyStream(
    userMessage: string,
    options: Omit<GenerateOptions, 'streamCallbacks'> & {
      streamCallbacks: StreamCallbacks;
    } = {}
  ): Promise<void> {
    // 添加用户消息
    const userMsg = createUserMessage(userMessage);
    this.addMessage(userMsg);

    // 创建空的助手消息
    const assistantMsg = createAssistantMessage('');
    this.addMessage(assistantMsg);

    let fullResponse = '';

    await generateRAGStream(userMessage, this.config, {
      ...options,
      streamCallbacks: {
        onChunk: (chunk) => {
          fullResponse += chunk;
          assistantMsg.content = fullResponse;
          options.streamCallbacks.onChunk?.(chunk);
        },
        onComplete: (fullText) => {
          assistantMsg.content = fullText;
          options.streamCallbacks.onComplete?.(fullText);
        },
        onError: (error) => {
          // 移除失败的助手消息
          const index = this.messages.indexOf(assistantMsg);
          if (index > -1) {
            this.messages.splice(index, 1);
          }
          options.streamCallbacks.onError?.(error);
        }
      }
    });
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): LLMConfig {
    return { ...this.config };
  }
}

// 导出类型
export type {
  MessageRole,
  ChatMessage,
  StreamCallbacks,
  LLMConfig,
  GenerateOptions,
  GenerateResult
};

// 默认导出
export default {
  generateRAGStream,
  generateRAG,
  streamChatCompletion,
  chatCompletion,
  createMessageId,
  createUserMessage,
  createAssistantMessage,
  RAGChatSession
};
