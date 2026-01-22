# 智能 To-Do + 番茄钟应用 - 架构设计总结

## 项目概述

这是一个**本地优先的 SPA 应用**，整合任务管理和番茄钟计时器功能。项目采用 **TypeScript + Vanilla JavaScript**（无框架）构建，使用 **IndexedDB** 进行数据持久化。

### 核心特性
- ✅ 任务管理（CRUD、优先级、标签、预估番茄数）
- ⏱️ 番茄钟计时器（工作/休息/自动切换）
- 📊 统计面板（今日/每周/每月统计、连续天数）
- 💾 本地优先（IndexedDB 存储、离线可用）
- 🎨 响应式设计（支持桌面和移动设备）

---

## 已完成的核心架构文件

### 1. 类型定义 ✅

**文件位置**：`src/types/index.ts`

定义了完整的 TypeScript 类型系统：

```typescript
// 核心枚举
enum TaskStatus { TODO, IN_PROGRESS, DONE }
enum Priority { LOW, MEDIUM, HIGH }
enum SessionType { WORK, SHORT_BREAK, LONG_BREAK }
enum TimerState { IDLE, RUNNING, PAUSED, COMPLETED }

// 核心数据模型
interface Task { ... }           // 任务模型
interface Session { ... }        // 番茄钟会话模型
interface Settings { ... }       // 应用设置模型
interface Statistics { ... }     // 统计数据模型
interface AppState { ... }       // 应用全局状态
```

**包含的数据模型**：
- Task：包含 id、title、status、priority、estimatedPomodoros、actualPomodoros、tags、时间戳等
- Session：包含 id、taskId、type、startTime、endTime、duration、completed 状态等
- Settings：包含计时器时长、自动化设置、通知设置、主题设置等
- Statistics：包含今日统计、总计统计、每日历史、连续天数等

### 2. 接口定义 ✅

#### 2.1 Repository 接口（数据访问层）

**文件位置**：`src/interfaces/repositories.ts`

```typescript
interface ITaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  findByFilter(filter: TaskFilter): Promise<Task[]>;
  updateStatus(id: string, status: TaskStatus): Promise<void>;
  incrementPomodoroCount(id: string): Promise<void>;
  delete(id: string): Promise<void>;
  // ... 更多方法
}

interface ISessionRepository { ... }
interface ISettingsRepository { ... }
interface IStatisticsRepository { ... }
interface ITagRepository { ... }
```

#### 2.2 Service 接口（业务逻辑层）

**文件位置**：`src/interfaces/services.ts`

```typescript
interface ITimerService {
  start(taskId?: string): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(complete?: boolean): Promise<void>;
  getRemainingTime(): number;
  subscribe(callback: (event: TimerEvent) => void): () => void;
}

interface ITaskService {
  create(taskData: Partial<Task>): Promise<Task>;
  update(id: string, updates: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: TaskStatus): Promise<void>;
  incrementPomodoro(id: string): Promise<void>;
}

interface ISessionService { ... }
interface IStatisticsService { ... }
interface INotificationService { ... }
interface IAudioService { ... }
```

### 3. 工具函数 ✅

#### 3.1 ID 生成器

**文件位置**：`src/utils/IdGenerator.ts`

```typescript
generateUUID()              // 生成 UUID v4
generateShortId()           // 生成 8 位短 ID
generateTimestampId()       // 生成包含时间戳的 ID
generateTaskId()            // 生成任务 ID
generateSessionId()         // 生成会话 ID
generateTagId()             // 生成标签 ID
```

#### 3.2 日期工具

**文件位置**：`src/utils/DateUtils.ts`

```typescript
formatDate(timestamp)              // 格式化为 YYYY-MM-DD
getTodayDateString()               // 获取今天的日期字符串
getTodayStartTimestamp()           // 获取今天开始时间戳
getWeekStartTimestamp()            // 获取本周开始时间戳
getMonthStartTimestamp()           // 获取本月开始时间戳
formatDuration(minutes)            // 格式化时长（1h 30m）
formatSeconds(seconds)             // 格式化秒数（01:30:00）
getRelativeTime(timestamp)         // 获取相对时间（2小时前）
isSameDay(timestamp1, timestamp2)  // 判断是否同一天
isInRange(timestamp, start, end)   // 判断是否在范围内
```

#### 3.3 验证工具

**文件位置**：`src/utils/ValidationUtils.ts`

```typescript
validateTask(task)           // 验证任务对象
validateSession(session)     // 验证会话对象
validateSettings(settings)   // 验证设置对象
validateTag(tag)             // 验证标签对象
sanitizeInput(input)         // 清理用户输入（防 XSS）
sanitizeTaskTitle(title)     // 清理任务标题
```

### 4. 项目配置 ✅

- **package.json** - 项目依赖和脚本配置
- **tsconfig.json** - TypeScript 编译配置
- **vite.config.ts** - Vite 构建配置（包含 PWA 支持）
- **.eslintrc.json** - ESLint 代码检查配置
- **.prettierrc** - Prettier 代码格式化配置
- **.gitignore** - Git 忽略文件配置

### 5. 文档 ✅

- **README.md** - 项目介绍和使用说明
- **ARCHITECTURE.md** - 详细的架构设计文档（约 2000 行）
- **ROADMAP.md** - 开发路线图和版本规划
- **PROJECT_STRUCTURE.md** - 文件结构详细说明

---

## 系统架构

### 分层架构

```
┌─────────────────────────────────────┐
│     Presentation Layer              │
│  (UI Components - 待实现)           │
│  - TaskList, Timer, Statistics      │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│     Application Layer               │
│  (Services - 待实现)                │
│  - TaskService, TimerService,       │
│  - SessionService, StatisticsSvc    │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│     Data Layer                      │
│  (Repositories - 待实现)            │
│  - TaskRepository, SessionRepo,     │
│  - SettingsRepository, Statistics   │
└─────────────────────────────────────┘
              ↕
┌─────────────────────────────────────┐
│     IndexedDB                       │
│  Database: PomodoroDB               │
│  Stores: tasks, sessions, settings, │
│          statistics, tags           │
└─────────────────────────────────────┘
```

### 数据模型关系

```
Task (1) ←→ (N) Session
  │
  └── (N) Tag
```

- 一个任务可以有多个会话
- 一个会话只属于一个任务（或为自由番茄钟）
- 一个任务可以有多个标签

---

## IndexedDB 数据库设计

### 数据库名：`PomodoroDB`
### 版本：`1`

#### Object Stores

**1. tasks**
```javascript
{
  keyPath: 'id',
  indexes: ['status', 'priority', 'createdAt', 'updatedAt', 'dueDate']
}
```

**2. sessions**
```javascript
{
  keyPath: 'id',
  indexes: ['taskId', 'type', 'startTime', 'date']
}
```

**3. settings**
```javascript
{
  keyPath: 'id',
  single instance: { id: 'default' }
}
```

**4. statistics**
```javascript
{
  keyPath: 'id',
  single instance: { id: 'default' }
}
```

**5. tags**
```javascript
{
  keyPath: 'id',
  indexes: ['name']
}
```

---

## 核心业务规则

### 任务管理
1. 任务标题不能为空，长度不超过 200 字符
2. 只有进行中的任务可以关联番茄钟会话
3. 完成任务时自动记录完成时间
4. 预估番茄数默认为 1，最大 100

### 番茄钟计时器
1. 工作时长：25 分钟（可配置，1-60 分钟）
2. 短休息时长：5 分钟（可配置，1-30 分钟）
3. 长休息时长：15 分钟（可配置，1-60 分钟）
4. 长休息间隔：4 个工作会话后（可配置，2-10 个）
5. 暂停超过 5 分钟后，重置当前会话
6. 完成的番茄钟自动更新任务的 actualPomodoros

### 统计计算
1. 连续天数：每天至少完成 1 个番茄钟
2. 平均数据：基于最近 30 天计算
3. 专注时长：只计算工作类型的会话
4. 每日统计在每天首次使用时创建

---

## 技术栈

### 核心技术
- **语言**：TypeScript 5.3+
- **运行环境**：现代浏览器（ES2020+）
- **构建工具**：Vite 5.0+
- **数据库**：IndexedDB（通过 idb 库）

### 开发工具
- **代码检查**：ESLint + TypeScript ESLint
- **代码格式化**：Prettier
- **测试框架**：Vitest + Testing Library
- **PWA**：vite-plugin-pwa

### 浏览器支持
- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

---

## 开发路线图

### MVP 版本（v0.1.0）- 2-3 周

**阶段 1：基础设施** ✅
- [x] 项目初始化和配置
- [x] TypeScript 类型定义
- [x] 接口定义
- [x] 工具函数

**阶段 2：数据层** 🚧
- [ ] IndexedDB 数据库初始化
- [ ] Repository 实现

**阶段 3：服务层** 🚧
- [ ] TimerService
- [ ] TaskService
- [ ] SessionService
- [ ] StatisticsService

**阶段 4：UI 组件** 🚧
- [ ] 任务管理组件
- [ ] 计时器组件
- [ ] 统计组件

**阶段 5：应用集成** 🚧
- [ ] 状态管理
- [ ] 路由管理
- [ ] 错误处理

### v1.0.0 - 完整版本

- 标签系统
- 任务搜索和高级筛选
- 数据导出/导入
- 深色模式
- PWA 支持
- 键盘快捷键

### v1.1.0 - 增强版本

- 任务提醒（截止日期）
- 番茄钟目标设置
- 生产力报告
- 数据可视化增强
- 自定义主题
- 多语言支持

---

## 文件结构

```
pomodoro-todo-app/
├── src/
│   ├── types/              # ✅ 类型定义
│   ├── interfaces/         # ✅ 接口定义
│   ├── models/             # 🚧 数据模型
│   ├── services/           # 🚧 业务逻辑服务
│   ├── repositories/       # 🚧 数据访问层
│   ├── components/         # 🚧 UI 组件
│   ├── store/              # 🚧 状态管理
│   └── utils/              # ✅ 工具函数
├── tests/                  # 🚧 测试文件
├── styles/                 # 样式文件
├── index.html              # ✅ HTML 入口
├── package.json            # ✅ 项目配置
├── tsconfig.json           # ✅ TS 配置
├── vite.config.ts          # ✅ Vite 配置
├── README.md               # ✅ 项目说明
├── ARCHITECTURE.md         # ✅ 架构文档
├── ROADMAP.md              # ✅ 开发路线图
└── PROJECT_STRUCTURE.md    # ✅ 文件结构说明
```

---

## 下一步开发建议

### 立即开始

1. **实现 IndexedDB 客户端**
   - 创建 `src/repositories/IndexedDBClient.ts`
   - 封装数据库连接和基本操作

2. **实现第一个 Repository**
   - 创建 `src/repositories/TaskRepository.ts`
   - 实现任务的 CRUD 操作

3. **实现第一个 Service**
   - 创建 `src/services/TaskService.ts`
   - 实现任务管理的业务逻辑

4. **实现第一个 UI 组件**
   - 创建 `src/components/TaskList.ts`
   - 实现任务列表的渲染和交互

5. **编写测试**
   - 创建 `tests/unit/TaskRepository.test.ts`
   - 创建 `tests/unit/TaskService.test.ts`

### 开发优先级

**P0 - 核心功能（MVP）**
- TaskRepository + TaskService + TaskList
- TimerService + TimerDisplay
- SessionRepository + SessionService

**P1 - 重要功能（v1.0）**
- StatisticsService + StatisticsPanel
- SettingsRepository + SettingsService
- 测试覆盖

**P2 - 增强功能（v1.1）**
- 标签系统
- 高级筛选
- 数据导入导出

---

## 关键设计决策

### 1. 为什么选择 IndexedDB？
- ✅ 本地存储，无需网络
- ✅ 支持大量数据（异步、索引）
- ✅ 所有现代浏览器都支持
- ✅ 比 localStorage 更强大

### 2. 为什么不使用框架？
- ✅ 减少依赖和学习成本
- ✅ 更小的打包体积
- ✅ 更好的性能控制
- ✅ 深入理解底层原理

### 3. 为什么使用 TypeScript？
- ✅ 类型安全，减少运行时错误
- ✅ 更好的 IDE 支持
- ✅ 更易于重构和维护
- ✅ 自文档化代码

### 4. 为什么分层架构？
- ✅ 关注点分离
- ✅ 易于测试
- ✅ 易于维护和扩展
- ✅ 团队协作友好

---

## 测试策略

### 单元测试
- 工具函数（IdGenerator, DateUtils, ValidationUtils）
- Service 层业务逻辑
- Repository 层数据访问

### 集成测试
- 组件交互
- 数据流
- 用户场景

### E2E 测试
- 完整的用户旅程
- 关键业务流程

---

## 性能优化策略

### 数据层
- IndexedDB 索引优化
- 批量读写操作
- 内存缓存

### 渲染层
- 虚拟滚动（长列表）
- 防抖/节流
- 事件委托

### 构建层
- 代码分割
- Tree shaking
- 资源压缩

---

## 总结

本项目提供了：

✅ **完整的架构设计**（类型、接口、数据库设计）
✅ **清晰的开发路线图**（MVP → v1.0 → v1.1 → v2.0）
✅ **详尽的文档**（架构、文件结构、业务规则）
✅ **坚实的代码基础**（工具函数、配置、HTML）

**可以直接开始开发，无需额外设计工作。**

### 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev

# 3. 开始开发
# 按照 ROADMAP.md 的顺序实现功能
```

---

**文档版本**：1.0.0
**最后更新**：2024-01-22
**项目状态**：架构设计完成，准备开始开发
