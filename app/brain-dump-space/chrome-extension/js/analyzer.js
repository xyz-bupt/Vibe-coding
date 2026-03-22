// Tag Analyzer Service

class ThoughtAnalyzer {
  constructor() {
    this.settings = null;
  }

  async setSettings(settings) {
    this.settings = settings;
  }

  async analyze(text) {
    // Extract explicit #tags first
    const explicitTags = this.extractExplicitTags(text);
    
    // If AI is enabled and API key is configured
    if (this.settings?.useRealAI && this.settings?.apiKey) {
      try {
        const aiTags = await this.analyzeViaAI(text);
        const allTags = [...new Set([...explicitTags, ...aiTags])];
        return { tags: allTags };
      } catch (error) {
        console.error('AI analysis failed, falling back to keywords:', error);
      }
    }
    
    // Fallback to keyword matching
    const keywordTags = this.extractByKeywords(text);
    const allTags = [...new Set([...explicitTags, ...keywordTags])];
    return { tags: allTags.length > 0 ? allTags : ['untagged'] };
  }

  extractExplicitTags(text) {
    const tagRegex = /#([a-zA-Z0-9\u4e00-\u9fa5_]+)/g;
    const tags = [];
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
      tags.push(match[1]);
    }
    return tags;
  }

  extractByKeywords(text) {
    const keywordMap = {
      'dev': ['代码', '编程', '开发', 'bug', 'api', 'react', 'vue', 'python', 'java', 'javascript', '算法', '部署'],
      'life': ['生活', '今天', '心情', '休息', '电影', '音乐', '旅行', '美食', '朋友', '家人', '周末'],
      'learning': ['学习', '阅读', '课程', '教程', '笔记', '理解', '掌握', '知识', '书', '文章'],
      'health': ['运动', '健身', '跑步', '游泳', '睡眠', '健康', '身体', '锻炼', '瑜伽'],
      'work': ['工作', '会议', '项目', '任务', '计划', '目标', '完成', '汇报', '同事'],
      'task': ['待办', '提醒', '记得', '需要', '要做', '安排', '计划'],
      'idea': ['想法', '创意', '灵感', '可以', '也许', '试试', '有趣'],
      'finance': ['钱', '花费', '买', '消费', '投资', '理财', '工资', '收入']
    };

    const tags = [];
    const lowerText = text.toLowerCase();

    for (const [tag, keywords] of Object.entries(keywordMap)) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          tags.push(tag);
          break;
        }
      }
    }

    return tags;
  }

  async analyzeViaAI(text) {
    const prompt = `分析以下文本，提取2-4个最相关的标签。
标签类别: dev(开发), life(生活), learning(学习), health(健康), work(工作), task(任务), idea(想法), finance(理财)

只返回标签名称，用逗号分隔，不要其他内容。

文本: ${text}`;

    if (!this.settings.apiUrl || !this.settings.modelName) {
      throw new Error('请在设置中配置 API 端点和模型名称');
    }

    const response = await fetch(`${this.settings.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.settings.apiKey}`
      },
      body: JSON.stringify({
        model: this.settings.modelName,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 50
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';
    
    // Parse tags from response
    const tags = content
      .split(/[,，、\n]/)
      .map(t => t.trim().toLowerCase())
      .filter(t => t && !t.includes('标签') && !t.includes('类别'));
    
    return tags.length > 0 ? tags : ['untagged'];
  }
}

window.analyzer = new ThoughtAnalyzer();
