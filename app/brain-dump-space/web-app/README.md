# Brain Dump Space (闪念胶囊)

> 极简主义的闪念记录工具，让你的想法化作"思维星空"中旋转的胶囊。

## ✨ 特性

- **极简输入**: 屏幕中央的纯净输入框，Enter 保存，Shift+Enter 换行
- **思维星空**: 力导向图可视化，闪念胶囊围绕标签节点轨道旋转
- **智能标签**: AI 自动提取或关键词匹配
- **AI 助手**: 基于 RAG 的对话助手，基于你的闪念记录回答问题
- **本地存储**: 所有数据存储在浏览器 LocalStorage，隐私安全

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

访问 http://localhost:5173 开始使用。

## 📖 使用指南

### 记录闪念
1. 在屏幕中央的输入框输入想法
2. 按 `Enter` 保存，或 `Shift+Enter` 换行
3. 闪念会自动提取标签并化作"胶囊"飞入思维星空

### AI 标签提取
在设置中配置 LLM API 后，AI 会自动为你的闪念提取标签：
- 支持兼容 OpenAI 格式的 API（DeepSeek、通义千问等）
- 无 API 时使用关键词匹配作为后备方案

### AI 对话助手
1. 点击右下角聊天按钮打开 AI 助手
2. 配置你的 LLM API（端点、密钥、模型名）
3. 向 AI 提问，它会基于你的闪念记录回答

### 查看历史
- 底部显示最近 3 条闪念的简化预览
- 点击"展开"查看所有闪念网格
- 点击闪念卡片可删除

## 🏗️ 项目结构

```
src/
├── components/           # React 组件
│   ├── VoidInput.tsx    # 极简输入框
│   ├── ThoughtGraph.tsx # 力导向图可视化
│   ├── SettingsModal.tsx # 设置模态框
│   └── AIChatPanel.tsx  # AI 聊天面板
├── services/            # 业务逻辑服务
│   ├── storage.ts       # LocalStorage 封装
│   ├── analyzer.ts      # AI 标签提取
│   └── ragChat.ts       # RAG 对话服务
├── utils/               # 工具函数
│   ├── graphTransformer.ts # 图谱数据转换
│   └── validation.ts    # 输入验证
├── constants/           # 常量
│   └── tags.ts          # 标签颜色配置
├── types/               # TypeScript 类型定义
│   └── index.ts
├── App.tsx              # 主应用
└── main.tsx             # 入口
```

## 🎨 设计理念

### Vibe-Coding
界面极度克制、留白，用户只需专注于输入。没有复杂的菜单，没有干扰的元素。

### 思维星空
每个闪念都是一个胶囊，围绕所属标签的节点旋转。多条闪念形成轨道，像行星系统一样。

### 本地优先
所有数据存储在本地，不上传服务器。API Key 也只保存在浏览器中。

## 🔧 技术栈

| 技术 | 用途 |
|------|------|
| React 18 | UI 框架 |
| TypeScript | 类型安全 |
| Vite | 构建工具 |
| Tailwind CSS | 样式 |
| react-force-graph-2d | 力导向图 |
| LocalStorage | 数据持久化 |

## 📝 数据格式

```typescript
// 闪念
interface Thought {
  id: string;        // 唯一标识
  content: string;   // 内容
  createdAt: number; // 创建时间戳
  tags: string[];    // 标签数组
}

// 图谱节点
interface GraphNode {
  id: string;        // 节点ID
  name: string;      // 显示名称
  type: 'thought' | 'tag'; // 节点类型
  val: number;       // 大小
  color?: string;    // 颜色
}
```

## 🤝 贡献

欢迎提 Issue 和 Pull Request。

## 📄 许可

MIT
