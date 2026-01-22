# 番茄钟 To-Do 应用

一个智能的番茄钟待办事项应用，结合番茄工作法和任务管理，帮助你提高专注力和生产力。

## 功能特性

### 🍅 番茄钟计时器
- 可自定义的专注时长（默认 25 分钟）
- 短休息（默认 5 分钟）和长休息（默认 15 分钟）
- 自动切换工作/休息模式
- 可视化进度环显示
- 声音和视觉提醒

### ✅ 任务管理
- 创建、编辑、删除任务
- 设置任务优先级（高、中、低）
- 预估完成所需番茄数
- 任务完成状态跟踪
- 任务过滤（全部、进行中、已完成）

### 📊 统计面板
- 今日番茄钟数量统计
- 专注时长统计
- 完成任务数量
- 每日目标进度
- 本周日历热力图

### ⚙️ 可定制设置
- 自定义计时器时长
- 调整长休息间隔
- 设置每日目标
- 通知和声音选项
- 浅色/深色主题
- 自动开始休息/专注选项

### ♿ 无障碍访问
- 完整的键盘快捷键支持
- ARIA 标签和语义化 HTML
- 屏幕阅读器友好
- 高对比度模式支持
- 减少动画选项

## 快速开始

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 开发模式

\`\`\`bash
npm run dev
\`\`\`

应用将在 http://localhost:3000 启动

### 构建生产版本

\`\`\`bash
npm run build
\`\`\`

构建产物将输出到 `dist` 目录

## 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Space` | 开始/暂停计时器 |
| `Alt + R` | 重置计时器 |
| `Alt + S` | 打开设置 |
| `Alt + N` | 添加新任务 |
| `Alt + 1` | 切换到专注模式 |
| `Alt + 2` | 切换到短休息模式 |
| `Alt + 3` | 切换到长休息模式 |
| `Esc` | 关闭对话框 |
| `?` | 显示快捷键帮助 |

## 技术栈

- **HTML5** - 语义化结构
- **CSS3** - 现代样式和动画
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 快速的开发构建工具

## 项目结构

\`\`\`
pomodoro-todo-app/
├── index.html              # 主 HTML 文件
├── package.json            # 项目配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
├── styles/
│   └── main.css           # 主样式文件
├── src/
│   ├── main.ts            # 应用入口
│   ├── types.ts           # 类型定义
│   ├── components/
│   │   ├── TaskList.ts           # 任务列表组件
│   │   ├── TimerDisplay.ts       # 计时器显示组件
│   │   ├── StatisticsPanel.ts    # 统计面板组件
│   │   ├── TaskForm.ts           # 任务表单组件
│   │   ├── SettingsModal.ts      # 设置对话框组件
│   │   └── PomodoroTimer.ts      # 番茄钟核心逻辑
│   └── utils/
│       ├── EventEmitter.ts       # 事件发射器
│       └── ToastManager.ts       # Toast 通知管理器
└── README.md              # 项目文档
\`\`\`

## 浏览器支持

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)

## 数据存储

所有数据（任务、设置、统计）都存储在浏览器的 `localStorage` 中，数据仅在本地保存，不会上传到任何服务器。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
