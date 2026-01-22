# 🍅 Pomodoro Focus - 智能番茄钟待办应用

> 结合番茄工作法和任务管理的生产力工具，帮助你提高专注力和工作效率。

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## ✨ 功能特性

### 🍅 番茄钟计时器
- ⏱️ 可自定义时长（专注/短休息/长休息）
- 🔄 自动切换工作/休息模式
- 📊 可视化进度环显示
- 🔔 声音和桌面通知
- ⏸️ 暂停/恢复/重置/跳过控制

### ✅ 任务管理
- ➕ 创建、编辑、删除任务
- 🎯 设置优先级（低/中/高/紧急）
- 📝 预估完成所需番茄数
- 🏷️ 标签系统和项目分组
- 🔍 任务过滤和搜索

### 📊 统计与分析
- 📈 今日番茄钟数量
- ⏰ 专注时长统计
- ✅ 完成任务追踪
- 📅 每日目标进度
- 🗓️ 本周日历热力图

### ⚙️ 设置与配置
- 🎨 浅色/深色/自动主题
- 🔕 自定义通知和音效
- ⏱️ 调整计时器时长
- 🎯 设置每日目标
- 🤖 自动开始下一会话

### ♿ 无障碍访问
- ⌨️ 完整的键盘快捷键
- 📢 ARIA 标签和语义化 HTML
- 👁️ 屏幕阅读器友好
- 🎭 高对比度模式

---

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:5173

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

---

## ⌨️ 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Space` | 开始/暂停计时器 |
| `Alt + R` | 重置计时器 |
| `Alt + S` | 打开设置 |
| `Alt + N` | 添加新任务 |
| `Alt + 1` | 切换到专注模式 |
| `Alt + 2` | 切换到短休息 |
| `Alt + 3` | 切换到长休息 |
| `Esc` | 关闭对话框 |
| `?` | 显示快捷键帮助 |

---

## 📁 项目结构

```
pomodoro-todo-app/
├── src/
│   ├── core/              # 核心基础设施
│   │   └── Component.ts   # 生命周期管理基类
│   ├── components/        # UI组件
│   │   ├── PomodoroTimer.ts    # 番茄钟核心
│   │   ├── TaskList.ts         # 任务列表
│   │   ├── TimerDisplay.ts     # 计时器显示
│   │   ├── StatisticsPanel.ts  # 统计面板
│   │   ├── TaskForm.ts         # 任务表单
│   │   ├── SettingsModal.ts    # 设置对话框
│   │   └── ErrorBoundary.ts    # 错误边界
│   ├── controllers/       # 控制器层
│   │   ├── TimerController.ts
│   │   └── UIController.ts
│   ├── services/          # 服务层
│   │   ├── indexeddb.ts         # 数据库封装
│   │   ├── repositories.ts      # 数据仓库
│   │   ├── errorHandler.ts      # 错误处理
│   │   ├── storage.ts           # 存储服务
│   │   └── timer.ts             # 定时器服务
│   ├── store/             # 状态管理
│   │   └── AppStore.ts
│   ├── utils/             # 工具函数
│   │   ├── EventEmitter.ts
│   │   ├── ErrorRecovery.ts
│   │   └── ToastManager.ts
│   ├── types/             # 类型定义
│   │   └── index.ts
│   ├── main.ts            # 应用入口
│   └── App.ts             # 应用根组件
├── styles/                # 样式文件
│   └── main.css
├── tests/                 # 测试文件
│   └── memory-leak.test.ts
├── docs/                  # 文档
│   ├── guides/            # 开发指南
│   ├── reports/           # 技术报告
│   └── USAGE_EXAMPLES.md
├── index.html             # HTML入口
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite配置
└── README.md              # 项目文档
```

---

## 🛠️ 技术栈

- **TypeScript 5.x** - 类型安全的JavaScript
- **Vite 5.x** - 下一代构建工具
- **IndexedDB** - 本地数据持久化
- **CSS3** - 现代样式和动画
- **Web APIs** - Notification, Audio, etc.

---

## 💾 数据存储

数据存储采用三级回退策略：
1. **IndexedDB** (主存储) - 支持大量数据
2. **LocalStorage** (回退) - 兼容性更好
3. **Memory** (最终回退) - 临时存储

所有数据仅在本地保存，不会上传到任何服务器。

---

## 🌐 浏览器支持

| 浏览器 | 版本 |
|--------|------|
| Chrome/Edge | 最新版本 ✅ |
| Firefox | 最新版本 ✅ |
| Safari | 最新版本 ✅ |

---

## 📚 文档

- 📖 [快速开始指南](QUICKSTART.md)
- 🏗️ [架构设计](ARCHITECTURE.md)
- 📂 [项目结构](PROJECT_STRUCTURE.md)
- 🗺️ [开发路线图](ROADMAP.md)
- 📝 [使用示例](docs/USAGE_EXAMPLES.md)
- 🐛 [内存泄漏报告](docs/reports/MEMORY_LEAK_FIX_REPORT.md)
- 🛡️ [泄漏防护指南](docs/guides/LEAK_PREVENTION_GUIDE.md)

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 🌟 Star History

如果这个项目对你有帮助，请给个 ⭐️ Star！

---

**Made with ❤️ using TypeScript + Vite**
