# 项目文件结构说明

## 完整目录树

```
pomodoro-todo-app/
├── src/                          # 源代码目录
│   ├── types/                    # TypeScript 类型定义
│   │   └── index.ts              # 核心类型（Task, Session, Settings, etc.）
│   │
│   ├── interfaces/               # 接口定义
│   │   ├── repositories.ts       # 数据访问层接口（ITaskRepository, etc.）
│   │   └── services.ts           # 服务层接口（ITaskService, ITimerService, etc.）
│   │
│   ├── models/                   # 数据模型（待实现）
│   │   ├── Task.ts               # 任务模型
│   │   ├── Session.ts            # 会话模型
│   │   ├── Settings.ts           # 设置模型
│   │   └── Statistics.ts         # 统计模型
│   │
│   ├── services/                 # 业务逻辑服务（待实现）
│   │   ├── TimerService.ts       # 计时器服务
│   │   ├── TaskService.ts        # 任务服务
│   │   ├── SessionService.ts     # 会话服务
│   │   ├── StatisticsService.ts  # 统计服务
│   │   ├── NotificationService.ts # 通知服务
│   │   ├── AudioService.ts       # 音频服务
│   │   └── SettingsService.ts    # 设置服务
│   │
│   ├── repositories/             # 数据访问层实现（待实现）
│   │   ├── IndexedDBClient.ts    # IndexedDB 客户端封装
│   │   ├── TaskRepository.ts     # 任务仓储实现
│   │   ├── SessionRepository.ts  # 会话仓储实现
│   │   ├── SettingsRepository.ts # 设置仓储实现
│   │   ├── StatisticsRepository.ts # 统计仓储实现
│   │   └── TagRepository.ts      # 标签仓储实现
│   │
│   ├── components/               # UI 组件（待实现）
│   │   ├── TaskList/             # 任务列表组件
│   │   │   ├── TaskList.ts       # 主组件
│   │   │   ├── TaskItem.ts       # 任务项组件
│   │   │   ├── TaskFilters.ts    # 筛选器组件
│   │   │   └── TaskForm.ts       # 任务表单
│   │   │
│   │   ├── Timer/                # 计时器组件
│   │   │   ├── TimerDisplay.ts   # 计时器显示
│   │   │   ├── TimerControls.ts  # 控制按钮
│   │   │   ├── ModeSelector.ts   # 模式选择器
│   │   │   └── TaskSelector.ts   # 任务选择器
│   │   │
│   │   ├── Statistics/           # 统计组件
│   │   │   ├── StatCards.ts      # 统计卡片
│   │   │   ├── WeekChart.ts      # 周图表
│   │   │   ├── MonthChart.ts     # 月图表
│   │   │   └── Calendar.ts       # 日历视图
│   │   │
│   │   ├── Settings/             # 设置组件
│   │   │   ├── TimerSettings.ts  # 计时器设置
│   │   │   ├── NotificationSettings.ts # 通知设置
│   │   │   └── DataManagement.ts # 数据管理
│   │   │
│   │   └── Common/               # 通用组件
│   │       ├── Button.ts         # 按钮
│   │       ├── Input.ts          # 输入框
│   │       ├── Select.ts         # 下拉选择
│   │       ├── Modal.ts          # 模态框
│   │       ├── Toast.ts          # 提示消息
│   │       └── Badge.ts          # 徽章
│   │
│   ├── store/                    # 状态管理（待实现）
│   │   ├── Store.ts              # 状态容器
│   │   ├── appState.ts           # 应用状态定义
│   │   └── actions.ts            # 状态操作
│   │
│   ├── utils/                    # 工具函数
│   │   ├── IdGenerator.ts        # ID 生成器 ✅
│   │   ├── DateUtils.ts          # 日期工具 ✅
│   │   ├── ValidationUtils.ts    # 验证工具 ✅
│   │   ├── DOMUtils.ts           # DOM 操作工具（待实现）
│   │   └── StorageUtils.ts       # 存储工具（待实现）
│   │
│   ├── styles/                   # 样式文件（待实现）
│   │   ├── variables.css         # CSS 变量
│   │   ├── base.css              # 基础样式
│   │   ├── components.css        # 组件样式
│   │   └── themes.css            # 主题样式
│   │
│   ├── constants/                # 常量定义（待实现）
│   │   ├── config.ts             # 应用配置
│   │   ├── defaults.ts           # 默认值
│   │   └── keycodes.ts           # 键盘码
│   │
│   ├── migrations/               # 数据库迁移（待实现）
│   │   ├── migration-1.ts        # 初始版本
│   │   └── migrator.ts           # 迁移工具
│   │
│   └── main.ts                   # 应用入口（待实现）
│
├── tests/                        # 测试目录
│   ├── unit/                     # 单元测试
│   │   ├── utils/                # 工具函数测试
│   │   │   ├── IdGenerator.test.ts
│   │   │   ├── DateUtils.test.ts
│   │   │   └── ValidationUtils.test.ts
│   │   ├── services/             # 服务测试
│   │   │   ├── TaskService.test.ts
│   │   │   ├── TimerService.test.ts
│   │   │   └── StatisticsService.test.ts
│   │   └── repositories/         # 仓储测试
│   │       └── TaskRepository.test.ts
│   │
│   ├── integration/              # 集成测试
│   │   ├── task-flow.test.ts     # 任务流程测试
│   │   ├── timer-flow.test.ts    # 计时器流程测试
│   │   └── data-persistence.test.ts # 数据持久化测试
│   │
│   ├── e2e/                      # E2E 测试
│   │   ├── user-journey.spec.ts  # 用户旅程测试
│   │   └── pwa.spec.ts           # PWA 功能测试
│   │
│   ├── setup.ts                  # 测试配置
│   └── mocks/                    # 测试 Mock
│       ├── indexeddb.ts          # IndexedDB Mock
│       └── notifications.ts      # 通知 Mock
│
├── styles/                       # 全局样式
│   ├── main.css                  # 主样式文件（已有）
│   ├── reset.css                 # 重置样式（待实现）
│   └── themes/                   # 主题文件
│       ├── light.css             # 浅色主题
│       └── dark.css              # 深色主题
│
├── public/                       # 静态资源（待创建）
│   ├── favicon.ico               # 网站图标
│   ├── icons/                    # 图标资源
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   ├── sounds/                   # 音效文件
│   │   ├── start.mp3
│   │   ├── complete.mp3
│   │   └── break.mp3
│   └── manifest.json             # PWA Manifest
│
├── index.html                    # HTML 入口（已有）
├── package.json                  # 项目配置（已完成）
├── tsconfig.json                 # TypeScript 配置（已完成）
├── tsconfig.node.json            # Node TypeScript 配置（已完成）
├── vite.config.ts                # Vite 配置（已完成）
├── .eslintrc.json                # ESLint 配置（已完成）
├── .prettierrc                   # Prettier 配置（已完成）
├── .gitignore                    # Git 忽略文件（已完成）
├── README.md                     # 项目说明（已完成）
├── ARCHITECTURE.md               # 架构设计文档（已完成）
├── ROADMAP.md                    # 开发路线图（已完成）
└── PROJECT_STRUCTURE.md          # 文件结构说明（本文件）
```

## 文件说明

### 已完成文件 ✅

#### 配置文件
- `package.json` - 项目依赖和脚本配置
- `tsconfig.json` - TypeScript 编译配置
- `tsconfig.node.json` - Node 环境 TypeScript 配置
- `vite.config.ts` - Vite 构建配置
- `.eslintrc.json` - ESLint 代码检查配置
- `.prettierrc` - Prettier 代码格式化配置
- `.gitignore` - Git 忽略文件配置

#### 文档
- `README.md` - 项目介绍和使用说明
- `ARCHITECTURE.md` - 详细的架构设计文档
- `ROADMAP.md` - 开发路线图和版本规划

#### 类型定义
- `src/types/index.ts` - 核心 TypeScript 类型定义

#### 接口定义
- `src/interfaces/repositories.ts` - 数据访问层接口
- `src/interfaces/services.ts` - 业务逻辑层接口

#### 工具函数
- `src/utils/IdGenerator.ts` - 唯一 ID 生成工具
- `src/utils/DateUtils.ts` - 日期处理工具
- `src/utils/ValidationUtils.ts` - 数据验证工具

#### HTML
- `index.html` - 应用的 HTML 入口文件

### 待实现文件 🚧

#### 核心服务
1. `TimerService.ts` - 计时器核心逻辑
2. `TaskService.ts` - 任务管理逻辑
3. `SessionService.ts` - 会话管理逻辑
4. `StatisticsService.ts` - 统计计算逻辑
5. `NotificationService.ts` - 浏览器通知
6. `AudioService.ts` - 音频播放

#### 数据访问层
1. `IndexedDBClient.ts` - IndexedDB 封装
2. `TaskRepository.ts` - 任务数据访问
3. `SessionRepository.ts` - 会话数据访问
4. `SettingsRepository.ts` - 设置数据访问
5. `StatisticsRepository.ts` - 统计数据访问

#### UI 组件
1. 任务管理组件（列表、表单、筛选）
2. 计时器组件（显示、控制、模式选择）
3. 统计组件（卡片、图表）
4. 通用组件（按钮、输入、模态框等）

#### 状态管理
1. `Store.ts` - 状态容器
2. `appState.ts` - 应用状态定义
3. `actions.ts` - 状态操作

#### 样式文件
1. CSS 变量和主题
2. 组件样式
3. 响应式布局

#### 测试
1. 单元测试
2. 集成测试
3. E2E 测试

## 命名规范

### 文件命名
- **组件文件**：PascalCase（如 `TaskList.ts`）
- **服务文件**：PascalCase + Service 后缀（如 `TaskService.ts`）
- **工具文件**：PascalCase + Utils 后缀（如 `DateUtils.ts`）
- **类型文件**：camelCase（如 `repositories.ts`）
- **常量文件**：camelCase（如 `config.ts`）

### 代码命名
- **类名**：PascalCase
- **接口名**：PascalCase，以 I 开头（如 `ITaskService`）
- **类型名**：PascalCase
- **函数名**：camelCase
- **变量名**：camelCase
- **常量名**：UPPER_SNAKE_CASE
- **私有成员**：以 `_` 开头

## 模块导入规范

### 绝对导入（推荐）
```typescript
import { Task } from '@/types';
import { ITaskService } from '@/interfaces/services';
import { formatDate } from '@/utils/DateUtils';
```

### 相对导入
```typescript
import { TaskItem } from './TaskItem';
import { validateTask } from '../utils/ValidationUtils';
```

## 开发流程建议

### 1. 开发顺序
1. ✅ **基础设施**：类型定义、接口定义、工具函数
2. 🚧 **数据层**：Repository 实现
3. 🚧 **服务层**：Service 实现
4. 🚧 **状态管理**：Store 实现
5. 🚧 **UI 组件**：组件实现
6. 🚧 **集成测试**：集成和测试

### 2. 测试驱动开发（TDD）
1. 先写测试用例
2. 实现功能代码
3. 运行测试验证
4. 重构优化

### 3. 代码审查要点
- 类型安全
- 错误处理
- 性能考虑
- 代码复用
- 文档完整

## 依赖关系图

```
main.ts
  ↓
Store (状态管理)
  ↓
Services (业务逻辑)
  ↓
Repositories (数据访问)
  ↓
IndexedDB (数据存储)
  ↑
Components (UI 组件)
  ↑
Store (状态订阅)
```

## 下一步行动

### 立即开始
1. 实现 `IndexedDBClient.ts` - 数据库基础
2. 实现 `TaskRepository.ts` - 第一个仓储
3. 实现 `TaskService.ts` - 第一个服务
4. 实现 `TaskList.ts` - 第一个组件
5. 编写测试用例

### MVP 目标
- 2-3 周完成基础功能
- 包含任务管理和计时器
- 基本的统计功能
- 核心测试覆盖

---

**文档版本**：1.0.0
**最后更新**：2024-01-22
**维护者**：开发团队
