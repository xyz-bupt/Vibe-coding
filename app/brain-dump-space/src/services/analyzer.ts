/**
 * Thought Analyzer Service
 *
 * Analyzes text content to extract relevant tags using either
 * mock keyword matching or real AI API calls.
 */

import type { AnalysisResult, AppSettings } from '../types';

/**
 * Keyword mapping for mock tag extraction
 * Maps keywords to category tags
 * Supports both English and Chinese keywords
 *
 * Priority: Multi-character keywords are checked before single characters
 * to reduce false positives.
 */
const KEYWORD_MAPPINGS: Record<string, string[]> = {
  'Life': [
    // Chinese - Multi-character activities (priority)
    // Note: Exercise/sport activities moved to Health to reduce overlap
    '想去', '好玩', '旅行', '美食', '电影', '音乐', '阅读', '游戏',
    '吃饭', '睡觉', '休息', '购物', '买菜', '做饭', '打扫', '洗衣服', '散步', '逛街',
    '朋友', '家人', '约会', '聚会', '聊天', '打电话', '上网', '看电视',
    // Chinese - Time expressions
    '今天', '明天', '后天', '昨天', '前天', '这周', '下周', '上周', '现在', '晚上', '早上', '下午',
    // Chinese - Emotions/feelings (multi-char)
    '开心', '难过', '生气', '焦虑', '担心', '兴奋', '高兴', '快乐',
    // Consumer electronics (headphones, earphones, audio, gadgets)
    '耳机', '耳麦', '音响', '音箱', '充电宝', '数据线', '手机壳', '平板', '手表', '手环',
    // English
    'travel', 'food', 'sport', 'exercise', 'movie', 'music', 'reading', 'game', 'fun',
    'shopping', 'cooking', 'cleaning', 'walking', 'happy', 'sad', 'excited', 'tired',
    // Consumer electronics English
    'headphones', 'earphones', 'earbuds', 'audio', 'speaker', 'gadget', 'phone case', 'tablet'
  ],
  'Dev': [
    // Chinese - Multi-character tech terms (priority)
    'bug', '代码', '开发', '编程', '部署', 'api', '数据库', '前端', '后端', '算法',
    '电脑', '手机', '应用', '软件', '系统', '网络', 'wifi', '充电', '关机', '重启',
    '程序', '网站', '服务器', '测试', '调试', '功能', '需求', '技术', '电池',
    // Programming languages
    'python', 'java', 'javascript', 'typescript', 'c', 'cpp', 'go', 'rust', 'ruby', 'php',
    'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css', 'shell', 'bash',
    'react', 'vue', 'angular', 'node', 'django', 'flask', 'spring', 'express',
    // Common tech terms
    '框架', '库', '算法', '数据结构', '函数', '变量', '类', '对象', '接口', '模块',
    // Additional common phrases
    '写代码', '修bug', '上线', '发布', '版本', '接口', '框架', '库', '学编程', '学代码',
    // English
    'code', 'coding', 'dev', 'develop', 'programming', 'deploy', 'database', 'frontend',
    'backend', 'algorithm', 'fix', 'debug', 'refactor', 'feature', 'commit', 'push',
    'pull', 'merge', 'branch', 'git', 'github', 'computer', 'software', 'server',
    'system', 'network', 'wifi', 'website', 'language', 'syntax', 'function', 'variable',
    'class', 'object', 'module', 'import'
  ],
  'Idea': [
    // Chinese
    '想法', '创意', '灵感', '构思', '设计', '方案', '建议', '改进', '优化',
    // English
    'idea', 'creative', 'inspiration', 'design', 'plan', 'suggest', 'improve', 'optimize',
    'brainstorm', 'concept', 'proposal'
  ],
  'Task': [
    // Chinese - Multi-character (priority)
    '任务', '待办', '记得', '提醒', '完成', '处理', '联系', '发送', '准备',
    '上班', '下班', '通勤', '加班', '计划', '安排', '必须', '需要',
    // Additional phrases - kept specific to task actions
    '发消息', '写邮件', '做计划', '定闹钟', '做任务', '待完成',
    // English
    'task', 'todo', 'remember', 'reminder', 'finish', 'complete', 'handle', 'contact',
    'send', 'prepare', 'deadline', 'schedule', 'plan', 'work', 'commute', 'overtime'
  ],
  'Learning': [
    // Chinese - Multi-character (priority)
    '学习', '教程', '课程', '研究', '了解', '掌握', '练习', '复习',
    '上课', '下课', '考试', '作业', '论文', '毕业', '培训',
    // Additional phrases
    '看书', '听课', '做作业', '复习功课',
    // English
    'learning', 'tutorial', 'course', 'study', 'research', 'learn', 'master', 'practice',
    'review', 'reading', 'watch', 'educate', 'class', 'exam', 'homework', 'thesis', 'test'
  ],
  'Work': [
    // Chinese - Multi-character (priority)
    '会议', '项目', '报告', '文档', '客户', '合作', '团队', '目标',
    '工作', '公司', '同事', '老板', '办公室', '出差', '开会', '上班',
    // Additional phrases
    '写报告', '做文档', '见客户', '谈合作', '开会讨论', '团队会议', '明天上班', '今天上班',
    // English
    'meeting', 'project', 'report', 'document', 'client', 'customer', 'collaborate',
    'team', 'goal', 'deadline', 'presentation', 'work', 'office', 'colleague', 'boss'
  ],
  'Health': [
    // Chinese - Multi-character (priority)
    '健康', '睡眠', '饮食', '运动', '锻炼', '医院', '药', '看病',
    '游泳', '跑步', '爬山', '骑行', '瑜伽', '健身房', '身体',
    // Additional phrases
    '去健身', '做运动', '看医生', '吃中药', '早睡早起',
    // English
    'health', 'sleep', 'diet', 'exercise', 'workout', 'hospital', 'medicine', 'rest',
    'doctor', 'fitness', 'wellness', 'swimming', 'running', 'hiking', 'gym'
  ],
  'Finance': [
    // Chinese
    '投资', '理财', '预算', '花费', '账单', '工资', '收入',
    // Additional phrases
    '买东西', '花销', '赚钱', '存钱', '付钱',
    // English
    'money', 'investment', 'invest', 'budget', 'spend', 'expense', 'bill', 'salary',
    'income', 'finance', 'financial', 'save', 'cost', 'price'
  ],
};

/**
 * Single-character keywords (checked only after multi-character keywords)
 * These provide fallback matching when no multi-char keyword matches
 */
const SINGLE_CHAR_KEYWORDS: Record<string, string[]> = {
  'Life': ['累', '困', '饿', '渴'], // Only physical states, removed generic verbs
  'Task': ['要'], // Intent/plan marker
  'Dev': [], // No single chars for tech
  'Learning': [],
  'Work': [],
  'Health': [],
  'Idea': [],
  'Finance': ['钱'],
};

/**
 * Available tag categories for AI normalization
 */
const AVAILABLE_TAGS = [
  'Life', 'Dev', 'Health', 'Learning', 'Work', 'Task', 'Idea', 'Finance'
];

/**
 * Escape special regex characters in a string
 */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if a character is a word boundary
 * Supports English word boundaries and Chinese character boundaries
 */
function createWordBoundaryPattern(keyword: string): RegExp {
  // For pure English keywords, use \b word boundary
  if (/^[a-zA-Z-]+$/.test(keyword)) {
    return new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'i');
  }
  // For Chinese or mixed content, just match the keyword
  // Chinese characters naturally form word boundaries
  return new RegExp(escapeRegExp(keyword), 'i');
}

/**
 * Extract hashtags from text
 * @param text - The text to extract hashtags from
 * @returns Array of hashtag texts (without # symbol)
 */
function extractHashtags(text: string): string[] {
  // Matches hashtags with word characters (letters, numbers, underscores),
  // Chinese characters, and hyphens
  const hashtagRegex = /#([\w\u4e00-\u9fa5-]+)/g;
  const matches = text.matchAll(hashtagRegex);
  return Array.from(matches).map(m => m[1]);
}

/**
 * Remove hashtags from text for keyword analysis
 * This prevents hashtags from triggering keyword matches
 * @param text - The text to process
 * @returns Text with hashtags removed
 */
function removeHashtags(text: string): string {
  return text.replace(/#([\w\u4e00-\u9fa5-]+)/g, '').trim();
}

/**
 * Extract tags based on keyword mappings
 * Multi-character keywords are checked first to reduce false positives
 * @param text - The text to analyze
 * @returns Array of matching tag names
 */
function extractKeywords(text: string): string[] {
  // Remove hashtags from text before keyword analysis to prevent false matches
  const cleanText = removeHashtags(text);

  const tags: string[] = [];
  const matched = new Set<string>();

  // Time expressions in Chinese that should only add Life when it's the primary category
  const TIME_EXPRESSIONS = ['今天', '明天', '后天', '昨天', '前天', '这周', '下周', '上周', '现在', '晚上', '早上', '下午'];

  // First pass: Check multi-character keywords (2+ characters)
  for (const [tag, keywords] of Object.entries(KEYWORD_MAPPINGS)) {
    if (matched.has(tag)) continue;

    for (const keyword of keywords) {
      if (keyword.length >= 2) {
        const pattern = createWordBoundaryPattern(keyword);
        if (pattern.test(cleanText)) {
          tags.push(tag);
          matched.add(tag);
          break;
        }
      }
    }
  }

  // Second pass: Check single-character keywords
  for (const [tag, keywords] of Object.entries(SINGLE_CHAR_KEYWORDS)) {
    if (matched.has(tag)) continue;

    // Special handling for '要' (Task intent marker):
    // Skip if there are multiple categories matched (indicates descriptive content, not intent)
    // But allow if only 0-1 categories matched (could be a task intent)
    if (tag === 'Task' && keywords.includes('要')) {
      const categoryCount = tags.length;
      if (categoryCount >= 2) {
        // Multiple categories already matched, likely descriptive - skip '要'
        continue;
      }
      // If 0 or 1 categories matched, allow '要' to add Task
    }

    for (const keyword of keywords) {
      const pattern = new RegExp(escapeRegExp(keyword), 'i');
      if (pattern.test(cleanText)) {
        tags.push(tag);
        matched.add(tag);
        break;
      }
    }
  }

  // Post-process: If Life was added only because of time expressions AND there are other specific categories,
  // consider removing Life to avoid over-tagging. Time expressions are context, not primary content.
  // However, keep Life for non-work/non-task categories as time expressions are meaningful for life activities.
  const lifeIndex = tags.indexOf('Life');
  if (lifeIndex !== -1 && tags.length > 1) {
    // Check if Life was matched only by time expressions
    const lifeKeywords = KEYWORD_MAPPINGS['Life'];
    let onlyTimeMatched = true;

    for (const keyword of lifeKeywords) {
      if (!TIME_EXPRESSIONS.includes(keyword) && keyword.length >= 2) {
        const pattern = createWordBoundaryPattern(keyword);
        if (pattern.test(cleanText)) {
          onlyTimeMatched = false;
          break;
        }
      }
    }

    // If only time expressions matched for Life AND there are work/task categories, remove Life
    // (Work/Task are more specific than time-based Life tagging)
    // But keep Life for Health, Dev, Learning, etc. as time + activity = life event
    if (onlyTimeMatched) {
      const hasWorkOrTask = tags.includes('Work') || tags.includes('Task');
      if (hasWorkOrTask) {
        tags.splice(lifeIndex, 1);
      }
    }
  }

  return tags;
}

/**
 * Normalize AI-generated tags to match our available categories
 * @param aiTags - Tags generated by AI
 * @returns Normalized tags that exist in AVAILABLE_TAGS
 */
function normalizeAITags(aiTags: string[]): string[] {
  const tagMap: Record<string, string> = {
    // English variations
    'development': 'Dev',
    'programming': 'Dev',
    'technology': 'Dev',
    'tech': 'Dev',
    'coding': 'Dev',
    'sports': 'Health',
    'exercise': 'Health',
    'wellness': 'Health',
    'study': 'Learning',
    'education': 'Learning',
    'job': 'Work',
    'business': 'Work',
    'office': 'Work',
    'finance': 'Finance',
    'money': 'Finance',
    'shopping': 'Life',
    'entertainment': 'Life',
    'leisure': 'Life',
    'plans': 'Task',
    'goals': 'Task',
    'objectives': 'Task',
  };

  return aiTags
    .map(tag => {
      const normalized = tag.trim();
      // Direct match
      if (AVAILABLE_TAGS.includes(normalized)) {
        return normalized;
      }
      // Map using tagMap
      if (tagMap[normalized.toLowerCase()]) {
        return tagMap[normalized.toLowerCase()];
      }
      // Case-insensitive match
      const matched = AVAILABLE_TAGS.find(
        available => available.toLowerCase() === normalized.toLowerCase()
      );
      return matched || null;
    })
    .filter((tag): tag is string => tag !== null);
}

/**
 * Call OpenAI API for tag extraction
 * @param text - Text to analyze
 * @param apiKey - OpenAI API key
 * @param apiUrl - Custom API endpoint URL (optional)
 * @param modelName - Custom model name (optional, defaults to gpt-4o-mini)
 * @returns Promise<AnalysisResult>
 */
async function analyzeWithOpenAI(text: string, apiKey: string, apiUrl?: string, modelName?: string): Promise<AnalysisResult> {
  const url = apiUrl
    ? `${apiUrl.replace(/\/$/, '')}/chat/completions`
    : 'https://api.openai.com/v1/chat/completions';

  // Use custom model name or default
  const model = modelName || 'gpt-4o-mini';

  console.log('[OpenAI] API Call - Model:', model);

  // Adjust prompt for GLM reasoning models
  const isGlmModel = model.startsWith('glm');
  const systemPrompt = isGlmModel
    ? `You are a tag classifier. Extract 1-3 relevant tags from the text.

Available categories: ${AVAILABLE_TAGS.join(', ')}

IMPORTANT: Your final answer MUST be ONLY a JSON array like ["Dev", "Learning"]. Do not include any other text in your final response.

Tag mappings:
- Python/programming/coding/debugging → Dev
- Programming competitions (蓝桥杯/ACM/LeetCode) → Dev or Learning
- Testing headphones/earphones/gadgets (测试耳机/防水) → Life (NOT Dev)
- Consumer electronics (phones, audio, smart devices) → Life
- Learning/studying/course → Learning
- Swimming/exercise/health → Health
- Work/meeting/project → Work
- Task/todo/reminder → Task

Text: "${text}"

Output ONLY: ["Tag1", "Tag2"]`
    : `You are a tag classifier for a thought capture app. Extract relevant tags from the given text.

Available categories: ${AVAILABLE_TAGS.join(', ')}

Rules:
- Return ONLY a JSON array of tag names
- Select 1-3 most relevant tags

Tag Guidelines:
- "Dev": ONLY for actual programming/coding work, software development, writing code, debugging, APIs, algorithms, programming competitions (蓝桥杯/ACM/LeetCode). NOT for testing consumer electronics.
- "Learning": For studying, courses, research, education, tutorials, learning programming languages
- "Health": Exercise, sports, wellness, medical, fitness
- "Work": Meetings, projects, office, business, professional tasks
- "Task": Todos, reminders, plans, deadlines
- "Life": Daily activities, entertainment, social, AND consumer electronics testing/reviews (headphones/耳机, earphones, audio equipment, gadgets, phones, smartwatches, product testing)
- "Idea": Creative thoughts, suggestions, improvements
- "Finance": Money, spending, investments

Examples:
- "测试新的防水耳机" → ["Life"]
- "Write Python code" → ["Dev"]
- "学蓝桥杯" (Blue Bridge Cup programming) → ["Dev", "Learning"]
- "去健身房" → ["Health"]

Response format: ["Tag1", "Tag2"]`;

  try {
    const requestBody = {
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: isGlmModel ? 'Output the JSON array now.' : `Extract tags from: "${text}"`
        }
      ],
      temperature: 0.3,
      max_tokens: isGlmModel ? 300 : 100,
    };

    console.log('[OpenAI] Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[OpenAI] Response status:', response.status);
    console.log('[OpenAI] Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OpenAI] ✗ API ERROR');
      console.error('[OpenAI] Status:', response.status);
      console.error('[OpenAI] Status text:', response.statusText);
      console.error('[OpenAI] Error response:', errorText);

      // Parse error for better debugging
      let errorDetails = `HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorDetails = errorJson.error.message || errorJson.error.type || errorText;
        }
      } catch {
        errorDetails = errorText || response.statusText;
      }

      throw new Error(`OpenAI API error: ${errorDetails}`);
    }

    const data = await response.json();
    console.log('[OpenAI] ✓ Response received:', JSON.stringify(data, null, 2));

    // Get content - handle GLM reasoning models that use reasoning_content
    let content = data.choices?.[0]?.message?.content || '';

    // GLM reasoning models: check reasoning_content if content is empty
    if (!content || content.trim() === '') {
      const reasoningContent = data.choices?.[0]?.message?.reasoning_content || '';
      if (reasoningContent) {
        console.log('[OpenAI] Using reasoning_content (GLM reasoning model)');
        // Try to extract JSON array from reasoning content
        const arrayMatch = reasoningContent.match(/\[([^\]]+)\]/);
        if (arrayMatch) {
          content = arrayMatch[0];
        } else {
          content = reasoningContent;
        }
      }
    }

    // If still empty, return empty array
    if (!content || content.trim() === '') {
      content = '[]';
    }

    console.log('[OpenAI] Extracted content:', content);

    // Parse JSON response
    let tags: string[];
    try {
      tags = JSON.parse(content);
      console.log('[OpenAI] Parsed tags:', tags);
    } catch (parseError) {
      console.error('[OpenAI] JSON parse error:', parseError);
      console.error('[OpenAI] Content that failed to parse:', content);
      // Fallback: extract array-like content
      const match = content.match(/\[([^\]]+)\]/);
      tags = match ? match[1].split(',').map((t: string) => t.trim().replace(/['"]/g, '')) : [];
      console.log('[OpenAI] Fallback extracted tags:', tags);
    }

    // Normalize tags
    const normalizedTags = normalizeAITags(Array.isArray(tags) ? tags : []);
    console.log('[OpenAI] Normalized tags:', normalizedTags);

    console.log('[OpenAI] ===== API CALL SUCCESS =====');

    return {
      tags: normalizedTags,
      confidence: normalizedTags.reduce((acc, tag) => {
        acc[tag] = 0.85;
        return acc;
      }, {} as Record<string, number>),
    };
  } catch (error) {
    console.error('[OpenAI] ✗ API CALL FAILED');
    console.error('[OpenAI] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[OpenAI] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[OpenAI] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Check for common error types
    if (error instanceof TypeError) {
      console.error('[OpenAI] Network error detected - possible CORS or connectivity issue');
    }

    console.log('[OpenAI] ===== API CALL END (FAILED) =====');
    throw error;
  }
}

/**
 * Call Anthropic API for tag extraction
 * @param text - Text to analyze
 * @param apiKey - Anthropic API key
 * @param apiUrl - Custom API endpoint URL (optional)
 * @returns Promise<AnalysisResult>
 */
async function analyzeWithAnthropic(text: string, apiKey: string, apiUrl?: string): Promise<AnalysisResult> {
  const url = apiUrl
    ? `${apiUrl.replace(/\/$/, '')}/v1/messages`
    : 'https://api.anthropic.com/v1/messages';

  console.log('[Anthropic] API Call - Model: claude-3-haiku');

  try {
    const requestBody = {
      model: 'claude-3-haiku-20240307',
      max_tokens: 100,
      temperature: 0.3,
      system: `You are a tag classifier for a thought capture app. Extract relevant tags from the given text.

Available categories: ${AVAILABLE_TAGS.join(', ')}

Rules:
- Return ONLY a JSON array of tag names
- Select 1-3 most relevant tags

Tag Guidelines:
- "Dev": ONLY for actual programming/coding work, software development, writing code, debugging, APIs, algorithms, programming competitions (蓝桥杯/ACM/LeetCode). NOT for testing consumer electronics.
- "Learning": For studying, courses, research, education, tutorials, learning programming languages
- "Health": Exercise, sports, wellness, medical, fitness
- "Work": Meetings, projects, office, business, professional tasks
- "Task": Todos, reminders, plans, deadlines
- "Life": Daily activities, entertainment, social, AND consumer electronics testing/reviews (headphones/耳机, earphones, audio equipment, gadgets, phones, smartwatches, product testing)
- "Idea": Creative thoughts, suggestions, improvements
- "Finance": Money, spending, investments

Examples:
- "测试新的防水耳机" → ["Life"]
- "Write Python code" → ["Dev"]
- "学蓝桥杯" (Blue Bridge Cup programming) → ["Dev", "Learning"]
- "去健身房" → ["Health"]

Response format: ["Tag1", "Tag2"]`,
      messages: [
        {
          role: 'user',
          content: `Extract tags from: "${text}"`
        }
      ],
    };

    console.log('[Anthropic] Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('[Anthropic] Response status:', response.status);
    console.log('[Anthropic] Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Anthropic] ✗ API ERROR');
      console.error('[Anthropic] Status:', response.status);
      console.error('[Anthropic] Status text:', response.statusText);
      console.error('[Anthropic] Error response:', errorText);

      // Parse error for better debugging
      let errorDetails = `HTTP ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorDetails = errorJson.error.message || errorJson.error.type || errorText;
        }
      } catch {
        errorDetails = errorText || response.statusText;
      }

      throw new Error(`Anthropic API error: ${errorDetails}`);
    }

    const data = await response.json();
    console.log('[Anthropic] ✓ Response received:', JSON.stringify(data, null, 2));

    const content = data.content?.[0]?.text || '[]';
    console.log('[Anthropic] Extracted content:', content);

    // Parse JSON response
    let tags: string[];
    try {
      tags = JSON.parse(content);
      console.log('[Anthropic] Parsed tags:', tags);
    } catch (parseError) {
      console.error('[Anthropic] JSON parse error:', parseError);
      console.error('[Anthropic] Content that failed to parse:', content);
      // Fallback: extract array-like content
      const match = content.match(/\[([^\]]+)\]/);
      tags = match ? match[1].split(',').map((t: string) => t.trim().replace(/['"]/g, '')) : [];
      console.log('[Anthropic] Fallback extracted tags:', tags);
    }

    // Normalize tags
    const normalizedTags = normalizeAITags(Array.isArray(tags) ? tags : []);
    console.log('[Anthropic] Normalized tags:', normalizedTags);

    console.log('[Anthropic] ===== API CALL SUCCESS =====');

    return {
      tags: normalizedTags,
      confidence: normalizedTags.reduce((acc, tag) => {
        acc[tag] = 0.85;
        return acc;
      }, {} as Record<string, number>),
    };
  } catch (error) {
    console.error('[Anthropic] ✗ API CALL FAILED');
    console.error('[Anthropic] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[Anthropic] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[Anthropic] Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Check for common error types
    if (error instanceof TypeError) {
      console.error('[Anthropic] Network error detected - possible CORS or connectivity issue');
    }

    console.log('[Anthropic] ===== API CALL END (FAILED) =====');
    throw error;
  }
}

/**
 * Test if a URL is reachable (useful for CORS/network debugging)
 * @param url - The URL to test
 * @returns Promise resolving to true if reachable, false otherwise
 */
async function testUrlReachable(url: string): Promise<boolean> {
  try {
    console.log('[Network Test] Testing URL reachability:', url);
    const response = await fetch(url, {
      method: 'HEAD', // Use HEAD to avoid downloading full response
      mode: 'cors', // Explicitly set CORS mode
    });
    console.log('[Network Test] Response status:', response.status);
    console.log('[Network Test] CORS headers:', response.headers.get('access-control-allow-origin'));
    return response.ok || response.status === 405; // 405 Method Not Allowed is OK (means server responded)
  } catch (error) {
    console.error('[Network Test] Failed to reach URL:', error);
    return false;
  }
}

/**
 * Thought Analyzer using keyword matching or real AI API calls
 */
export class ThoughtAnalyzer {
  private settings: AppSettings = {};

  /**
   * Update analyzer settings
   */
  setSettings(settings: AppSettings) {
    this.settings = settings;
    console.log('[Analyzer] Settings updated:', {
      useRealAI: settings.useRealAI,
      hasOpenAIKey: !!settings.openaiApiKey,
      hasAnthropicKey: !!settings.anthropicApiKey,
      apiUrl: settings.apiUrl,
      modelName: settings.modelName || 'gpt-4o-mini (default)'
    });
  }

  /**
   * Run diagnostics to check AI API configuration
   * Useful for debugging setup issues
   * @returns Promise resolving to diagnostic results
   */
  async runDiagnostics(): Promise<{
    success: boolean;
    checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message: string;
    }>;
  }> {
    const checks: Array<{
      name: string;
      status: 'pass' | 'fail' | 'warn';
      message: string;
    }> = [];
    const apiKey = this.settings.anthropicApiKey || this.settings.openaiApiKey;
    const provider = this.settings.anthropicApiKey ? 'anthropic' : 'openai';

    console.log('[Diagnostics] ===== STARTING DIAGNOSTICS =====');

    // Check 1: AI mode enabled
    if (this.settings.useRealAI) {
      checks.push({
        name: 'AI模式',
        status: 'pass' as const,
        message: 'AI模式已启用'
      });
    } else {
      checks.push({
        name: 'AI模式',
        status: 'warn' as const,
        message: 'AI模式未启用 (将使用关键词匹配)'
      });
    }

    // Check 2: API key exists
    if (!apiKey) {
      checks.push({
        name: 'API密钥',
        status: 'fail' as const,
        message: '未配置API密钥'
      });
      console.log('[Diagnostics] ===== DIAGNOSTICS END (FAILED) =====');
      return { success: false, checks };
    }

    // Check 3: API key format
    const validationError = this.validateApiKey(apiKey, provider);
    if (validationError) {
      checks.push({
        name: 'API密钥格式',
        status: 'fail' as const,
        message: validationError
      });
      console.log('[Diagnostics] ===== DIAGNOSTICS END (FAILED) =====');
      return { success: false, checks };
    }
    checks.push({
      name: 'API密钥格式',
      status: 'pass' as const,
      message: `API密钥格式有效 (${provider === 'openai' && !apiKey.startsWith('sk-') ? '兼容API如GLM/通义/DeepSeek' : provider === 'openai' ? 'OpenAI' : 'Anthropic'})`
    });

    // Check 4: API URL
    const apiUrl = this.settings.apiUrl
      ? (this.settings.anthropicApiKey
          ? `${this.settings.apiUrl.replace(/\/$/, '')}/v1/messages`
          : `${this.settings.apiUrl.replace(/\/$/, '')}/chat/completions`)
      : (this.settings.anthropicApiKey
          ? 'https://api.anthropic.com/v1/messages'
          : 'https://api.openai.com/v1/chat/completions');

    console.log('[Diagnostics] API URL:', apiUrl);

    // Check 5: Network reachability
    try {
      console.log('[Diagnostics] Testing network connectivity...');
      const reachable = await testUrlReachable(apiUrl);
      if (reachable) {
        checks.push({
          name: '网络连接',
          status: 'pass' as const,
          message: 'API端点可达'
        });
      } else {
        checks.push({
          name: '网络连接',
          status: 'warn' as const,
          message: '无法连接到API端点 (可能是CORS或网络问题)'
        });
      }
    } catch (error) {
      checks.push({
        name: '网络连接',
        status: 'fail' as const,
        message: `网络测试失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // Check 6: Test API call with minimal request
    try {
      console.log('[Diagnostics] Testing API call...');
      const testResult = provider === 'anthropic'
        ? await analyzeWithAnthropic('test', apiKey, this.settings.apiUrl)
        : await analyzeWithOpenAI('test', apiKey, this.settings.apiUrl, this.settings.modelName);

      if (testResult.tags && testResult.tags.length > 0) {
        checks.push({
          name: 'API调用',
          status: 'pass' as const,
          message: `成功获取标签: ${testResult.tags.join(', ')}`
        });
      } else {
        checks.push({
          name: 'API调用',
          status: 'warn' as const,
          message: 'API调用成功但未返回标签'
        });
      }
    } catch (error) {
      checks.push({
        name: 'API调用',
        status: 'fail' as const,
        message: `API调用失败: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    const success = checks.every(c => c.status !== 'fail');
    console.log('[Diagnostics] ===== DIAGNOSTICS END =====');
    console.log('[Diagnostics] Results:', checks);

    return { success, checks };
  }

  /**
   * Validate API key format before making API calls
   * Uses real AI if enabled and API key is configured, otherwise falls back to keyword matching
   * @param text - The text content to analyze
   * @returns Promise resolving to analysis result with extracted tags
   */
  async analyze(text: string): Promise<AnalysisResult> {
    // Input validation
    if (!text || typeof text !== 'string') {
      return { tags: [], confidence: {} };
    }

    // Check if real AI is enabled and API key is available
    const useRealAI = this.settings.useRealAI === true;
    const apiKey = this.settings.anthropicApiKey || this.settings.openaiApiKey;
    const provider = this.settings.anthropicApiKey ? 'anthropic' : 'openai';

    // Sanitized logging - don't expose API keys
    console.log('[Analyzer] Analyzing:', text.substring(0, 30) + (text.length > 30 ? '...' : ''));
    console.log('[Analyzer] Mode:', useRealAI ? 'AI' : 'Keyword');
    console.log('[Analyzer] Provider:', provider);

    if (useRealAI && apiKey) {

      // Validate API key format before making the request
      const validationError = this.validateApiKey(apiKey, provider);
      if (validationError) {
        console.error('[Analyzer] ✗ API key validation failed:', validationError);
        return {
          tags: [`AI错误: ${validationError}`],
          confidence: { 'AI错误': 0 }
        };
      }

      try {
        if (provider === 'anthropic') {
          console.log('[Analyzer] Calling Anthropic API...');
          const result = await analyzeWithAnthropic(text, apiKey, this.settings.apiUrl);
          console.log('[Analyzer] ✓ Anthropic analysis successful:', result);
          return result;
        } else {
          console.log('[Analyzer] Calling OpenAI API...');
          const result = await analyzeWithOpenAI(text, apiKey, this.settings.apiUrl, this.settings.modelName);
          console.log('[Analyzer] ✓ OpenAI analysis successful:', result);
          return result;
        }
      } catch (error) {
        console.error('[Analyzer] ✗ AI analysis failed:', error);

        // Extract meaningful error message for the user
        let errorMessage = 'AI分析失败';
        if (error instanceof Error) {
          const errorMsg = error.message.toLowerCase();

          // Provide specific error messages based on the error
          if (errorMsg.includes('401') || errorMsg.includes('unauthorized') || errorMsg.includes('invalid api key')) {
            errorMessage = 'AI错误: API密钥无效';
          } else if (errorMsg.includes('429') || errorMsg.includes('rate limit')) {
            errorMessage = 'AI错误: 请求过于频繁';
          } else if (errorMsg.includes('cors') || errorMsg.includes('network')) {
            errorMessage = 'AI错误: 网络/CORS错误';
          } else if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
            errorMessage = 'AI错误: 请求超时';
          } else if (errorMsg.includes('500') || errorMsg.includes('502') || errorMsg.includes('503')) {
            errorMessage = 'AI错误: 服务暂时不可用';
          } else if (errorMsg.includes('fetch')) {
            errorMessage = 'AI错误: 网络连接失败';
          } else {
            // Include first 100 chars of actual error for debugging
            errorMessage = `AI错误: ${error.message.substring(0, 100)}`;
          }
        }

        console.error('[Analyzer] Returning error tag:', errorMessage);

        // When AI mode is enabled, do NOT fall back to keyword matching
        // Return error tag to indicate failure
        return {
          tags: [errorMessage],
          confidence: { [errorMessage]: 0 }
        };
      }
    }

    console.log('[Analyzer] ✗ CONDITION FAILED - Using keyword matching');
    console.log('[Analyzer] Reason:', !useRealAI ? 'useRealAI is false/undefined' : 'No API key configured');
    console.log('[Analyzer] ===== ANALYSIS END =====');
    // Default: use keyword matching
    return this.analyzeWithKeywords(text);
  }

  /**
   * Validate API key format before making API calls
   * @param apiKey - The API key to validate
   * @param provider - The AI provider ('openai' or 'anthropic')
   * @returns Error message if invalid, null if valid
   */
  private validateApiKey(apiKey: string, provider: string): string | null {
    if (!apiKey || apiKey.trim().length === 0) {
      return 'API密钥为空';
    }

    // 只检查长度，不限制前缀（支持 GLM、通义千问、DeepSeek 等 OpenAI 兼容 API）
    if (apiKey.length < 10) {
      return 'API密钥长度不足';
    }

    // Anthropic 仍需要特殊格式验证
    if (provider === 'anthropic') {
      if (!apiKey.startsWith('sk-ant-')) {
        return 'Anthropic密钥格式错误 (应以sk-ant-开头)';
      }
    }

    return null;
  }

  /**
   * Analyze text using keyword matching (fallback method)
   * @param text - The text content to analyze
   * @returns Promise resolving to analysis result with extracted tags
   */
  private async analyzeWithKeywords(text: string): Promise<AnalysisResult> {
    // Simulate async processing for consistent API
    await new Promise(resolve => setTimeout(resolve, 50));

    const hashtagTags = extractHashtags(text);
    const keywordTags = extractKeywords(text);

    // Combine both, removing duplicates
    const allTags = Array.from(new Set([...hashtagTags, ...keywordTags]));

    // If no tags found, add a generic 'untagged' tag
    if (allTags.length === 0 && text.trim().length > 0) {
      allTags.push('untagged');
    }

    return {
      tags: allTags,
      confidence: allTags.reduce((acc, tag) => {
        acc[tag] = hashtagTags.includes(tag) ? 0.9 : 0.7;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

/**
 * Singleton instance of the analyzer
 */
export const thoughtAnalyzer = new ThoughtAnalyzer();

/**
 * Expose diagnostics to global scope for easy debugging
 * Call this from browser console: await window.brainDumpDiagnostics()
 */
if (typeof window !== 'undefined') {
  (window as any).brainDumpDiagnostics = async () => {
    console.log('%c[Brain Dump] Running diagnostics...', 'color: #a855f7; font-weight: bold;');
    const results = await thoughtAnalyzer.runDiagnostics();
    console.log('%c[Diagnostics Results]', 'color: #a855f7; font-weight: bold;');
    console.table(results.checks.map(c => ({
      检查项: c.name,
      状态: c.status === 'pass' ? '✓ 通过' : c.status === 'fail' ? '✗ 失败' : '⚠ 警告',
      详情: c.message
    })));
    return results;
  };

  console.log('%c[Brain Dump] Debug mode enabled', 'color: #a855f7; font-weight: bold;');
  console.log('%cRun diagnostics: await window.brainDumpDiagnostics()', 'color: #a855f7;');
}
