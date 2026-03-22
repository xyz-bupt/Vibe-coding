/**
 * RAG Chat Service - 浏览器端RAG对话服务
 *
 * 整合检索和生成功能，直接在浏览器中调用LLM API。
 *
 * @module ragChat
 */

// 从 localStorage 获取闪念数据
interface Thought {
  id: string;
  content: string;
  createdAt: number;
  tags: string[];
}

interface LLMConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
}

interface SearchResult {
  thought: Thought;
  similarity: number;
}

/**
 * 从 localStorage 获取所有闪念
 */
function getThoughtsFromStorage(): Thought[] {
  try {
    const data = localStorage.getItem('brain-dump-thoughts');
    if (!data) return [];
    const thoughts = JSON.parse(data);
    return Array.isArray(thoughts) ? thoughts : Object.values(thoughts);
  } catch {
    return [];
  }
}

/**
 * 搜索相似的闪念（简化版，使用关键词匹配）
 * 在 web-app 版本中使用关键词匹配作为相似度计算
 * 真正的语义搜索在 rag-version 中通过 embedding 实现
 */
async function searchSimilarThoughts(
  query: string,
  options: { topK?: number; minSimilarity?: number } = {}
): Promise<{ results: SearchResult[] }> {
  const { topK = 5, minSimilarity = 0.3 } = options;

  const thoughts = getThoughtsFromStorage();

  // 简化版本：使用关键词匹配作为相似度计算
  // 这不是真正的语义搜索，但在没有embedding的情况下是一个可行的后备方案
  const queryLower = query.toLowerCase();
  const searchTerm = queryLower.split(/\s+/).filter(w => w.length > 1);

  const results: SearchResult[] = thoughts.map(thought => {
    // 计算关键词匹配分数作为相似度
    let score = 0;
    const contentLower = thought.content.toLowerCase();
    const tagsLower = thought.tags.map(t => t.toLowerCase());

    // 完全匹配
    if (contentLower.includes(queryLower)) {
      score = 1;
    } else {
      // 关键词匹配
      const matchCount = searchTerm.filter(term =>
        contentLower.includes(term) || tagsLower.some(tag => tag.includes(term))
      ).length;
      score = searchTerm.length > 0 ? matchCount / searchTerm.length : 0;
    }

    return {
      thought,
      similarity: score
    };
  });

  // 过滤并排序
  const filtered = results
    .filter(r => r.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return { results: filtered };
}

/**
 * 构建系统提示词
 */
function buildSystemPrompt(context: SearchResult[]): string {
  const records = context
    .map((r, i) => `[${i + 1}] ${r.thought.content}`)
    .join('\n');

  return `你是一个理解用户过去的闪念记录的 AI 助手。

请根据以下我过去的闪念记录回答我的问题：
- 如果记录中有相关信息，请基于这些信息回答
- 如果记录中没有相关信息，请直接说明，不要编造
- 保持简洁、友好的语气，像朋友一样对话
- 可以在回答中引用具体的闪念内容

【闪念记录】
${records}

请回答用户的问题。`;
}

/**
 * 流式生成响应
 */
export async function streamRAGResponse(
  query: string,
  config: LLMConfig,
  callbacks: {
    onChunk: (chunk: string) => void;
    onComplete: (fullText: string) => void;
    onError: (error: Error) => void;
  }
): Promise<void> {
  try {
    // 步骤1: 检索相关闪念
    const { results: context } = await searchSimilarThoughts(query, {
      topK: 5,
      minSimilarity: 0.2
    });

    // 步骤2: 构建系统提示词
    const systemPrompt = buildSystemPrompt(context);

    // 步骤3: 调用 LLM API
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
          { role: 'user', content: query }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API请求失败: ${response.status} ${errorText}`);
    }

    if (!response.body) {
      throw new Error('响应体为空');
    }

    // 步骤4: 处理流式响应
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
          // 处理不同的响应格式
          let chunk = '';
          if (parsed.choices?.[0]?.delta?.content) {
            // OpenAI 格式
            chunk = parsed.choices[0].delta.content;
          } else if (parsed.content) {
            // 其他可能的格式
            chunk = parsed.content;
          }

          if (chunk) {
            fullText += chunk;
            callbacks.onChunk(chunk);
          }
        } catch {
          // 跳过无效的JSON行
          continue;
        }
      }
    }

    callbacks.onComplete(fullText);

  } catch (error) {
    callbacks.onError(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * 检查配置是否有效
 */
export function isValidConfig(config: LLMConfig | null): boolean {
  return !!(
    config &&
    config.apiUrl &&
    config.apiKey &&
    config.model
  );
}

export default {
  streamRAGResponse,
  isValidConfig
};
