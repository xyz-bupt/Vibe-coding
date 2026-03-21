# Brain Dump Space (闪念胶囊)

<div align="center">
  <p>一个极简主义的本地闪念记录与可视化工具</p>
  <p>A minimalist thought capture and visualization tool</p>
</div>

## 简介

Brain Dump Space 是一款专注于"快速记录"的单页应用。你只需专注于输入，文字会自动转化为胶囊状的节点，飞入"思维星空"中缓缓旋转。

## 特性

- **极简输入**: 屏幕中央的纯净输入框，无干扰设计
- **智能标签**: 支持 AI 自动提取标签（GLM/通义/DeepSeek/OpenAI），或使用关键词匹配
- **思维星空**: 力导向图可视化，闪念胶囊围绕标签节点缓慢旋转
- **本地存储**: 数据完全存储在浏览器 LocalStorage 中，无需服务器
- **深色主题**: 护眼的深色界面，宁静的视觉体验

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- react-force-graph-2d
- LocalStorage

## 使用方法

1. 克隆仓库并安装依赖：
```bash
cd app/brain-dump-space
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 构建生产版本：
```bash
npm run build
```

## AI 标签配置

在设置中配置自定义 API：
- **API 端点**: 自定义 API 地址
- **模型名称**: 如 `glm-4-flash`, `qwen-plus`, `deepseek-chat`
- **API Key**: 对应服务的密钥

## 快捷键

- `Enter` - 提交闪念
- `Shift + Enter` - 换行

## 项目结构

```
src/
├── components/        # React 组件
├── services/          # 存储和分析服务
├── utils/             # 工具函数
├── constants/         # 常量定义
└── types/             # TypeScript 类型
```

## License

MIT
