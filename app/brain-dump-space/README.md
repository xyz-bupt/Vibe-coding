# Brain Dump Space (闪念胶囊)

<div align="center">
  <p>极简闪念记录 · AI 智能标签 · 思维星空可视化 · RAG 对话助手</p>
</div>

---

## 项目简介

Brain Dump Space 是一个极简主义的闪念记录工具，让你的想法化作"思维星空"中旋转的胶囊。支持多种部署方式，满足不同使用场景。

### 核心特性

- **极简输入**: 屏幕中央的纯净输入框，Enter 保存，Shift+Enter 换行
- **智能标签**: AI 自动提取或关键词匹配，支持多种 LLM API
- **思维星空**: 力导向图可视化，闪念胶囊围绕标签节点轨道旋转
- **AI 助手**: 基于 RAG 的对话助手，基于你的闪念记录回答问题
- **本地存储**: 所有数据本地化，隐私安全

---

## 项目结构

```
brain-dump-space/
├── web-app/            # Web 应用版本（推荐）
│   ├── 极简输入界面
│   ├── 力导向图可视化
│   ├── AI 标签提取
│   └── RAG 对话助手
│
├── rag-version/        # 完整 RAG 版本
│   ├── 向量语义搜索
│   ├── transformers.js 本地模型
│   ├── IndexedDB 存储
│   └── 完整 RAG 实现
│
└── chrome-extension/   # Chrome 浏览器插件版
    ├── 弹窗快速记录
    └── 毛玻璃质感 UI
```

---

## 版本对比

| 特性 | web-app | rag-version | chrome-extension |
|------|---------|-------------|-----------------|
| **检索方式** | 关键词匹配 | 向量语义搜索 | 关键词匹配 |
| **向量化** | ❌ | ✅ transformers.js | ❌ |
| **存储** | LocalStorage | IndexedDB | Chrome Storage |
| **可视化** | ✅ 力导向图 | ❌ CLI 工具 | ❌ |
| **AI 助手** | ✅ RAG 对话 | ✅ 完整 RAG | ❌ |
| **部署** | 需要服务器 | 需要服务器 | 浏览器插件 |

---

## 快速开始

### Web 版本

```bash
cd web-app
npm install
npm run dev
```

访问 http://localhost:5173

### RAG 版本

```bash
cd rag-version
npm install
npm run dev
```

### Chrome 插件版

1. 打开 `chrome://extensions/`
2. 开启「开发者模式」
3. 加载 `chrome-extension` 文件夹

---

## AI 标签提取配置

在设置中配置 LLM API 后，AI 会自动为你的闪念提取标签：

**支持的 API**:
- DeepSeek (推荐)
- 通义千问 (Qwen)
- OpenAI (GPT)
- 其他兼容 OpenAI 格式的 API

**无 API 时**: 使用关键词匹配作为后备方案

---

## 技术栈

### Web 版本
- React 18 + TypeScript
- Vite
- Tailwind CSS
- react-force-graph-2d
- LocalStorage

### RAG 版本
- React 18 + TypeScript
- Vite
- transformers.js (Xenova/all-MiniLM-L6-v2)
- IndexedDB
- Web Workers

---

## 数据格式

```typescript
// 闪念
interface Thought {
  id: string;
  content: string;
  createdAt: number;
  tags: string[];
  embedding?: number[];  // RAG 版本专用，384维向量
}
```

---

## 设计理念

### Vibe-Coding
界面极度克制、留白，用户只需专注于输入。没有复杂的菜单，没有干扰的元素。

### 思维星空
每个闪念都是一个胶囊，围绕所属标签的节点旋转。多条闪念形成轨道，像行星系统一样。

### 本地优先
所有数据存储在本地，不上传服务器。API Key 也只保存在浏览器中。

---

## 使用指南

### 记录闪念
1. 在输入框输入想法
2. 按 `Enter` 保存，或 `Shift+Enter` 换行
3. 闪念会自动提取标签并化作"胶囊"飞入思维星空

### AI 对话
1. 点击右下角聊天按钮
2. 配置 LLM API
3. 向 AI 提问，它会基于你的闪念记录回答

### 查看历史
- 底部显示最近闪念的简化预览
- 点击"展开"查看所有闪念网格
- 点击闪念卡片可删除

---

## 许可证

MIT
