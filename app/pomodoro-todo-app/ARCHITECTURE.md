# 智能 To-Do + 番茄钟应用 - 架构设计文档

## 1. 项目概述

### 1.1 项目目标
构建一个本地优先的 SPA 应用，整合任务管理和番茄钟计时器功能，帮助用户提高专注力和生产力。

### 1.2 核心特性
- **任务管理**：创建、编辑、删除任务，支持优先级、标签、预估番茄数
- **番茄钟计时器**：工作/休息计时，自动切换，可关联任务
- **统计面板**：每日/每周/每月统计，连续天数，专注时长
- **本地优先**：使用 IndexedDB 存储所有数据
- **离线可用**：无需网络连接即可完整使用
- **响应式设计**：支持桌面和移动设备

### 1.3 技术栈
- **语言**：TypeScript + Vanilla JavaScript（无框架）
- **存储**：IndexedDB（通过 IDBWrapper 或原生 API）
- **样式**：CSS3（考虑使用 CSS 变量实现主题切换）
- **构建**：Vite（快速开发和构建）
- **测试**：Vitest + Testing Library
- **代码质量**：ESLint + Prettier

---

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation Layer                    │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌─────────────┐ │
│  │ TaskList  │ │  Timer    │ │ Statistics│ │  Settings   │ │
│  │ Component │ │ Component │ │ Component │ │  Component  │ │
│  └───────────┘ └───────────┘ └───────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │ TaskService │ │ TimerService│ │ NotificationService │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │SessionService│ │StatisticsSvc│ │    AudioService     │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                         Data Layer                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Repository Interfaces                    │   │
│  │  ITaskRepository | ISessionRepository | ISettings... │   │
│  └──────────────────────────────────────────────────────┘   │
│                              ↕                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           IndexedDB Implementation                     │   │
│  │  TaskRepository | SessionRepository | SettingsRepo   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    Browser IndexedDB                         │
│  Database: PomodoroDB                                       │
│  Stores: tasks, sessions, settings, statistics, tags        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 分层架构说明

#### 2.2.1 表现层（Presentation Layer）
- **职责**：UI 渲染和用户交互
- **组成**：组件、视图、路由
- **特点**：无业务逻辑，只负责展示和事件委托

#### 2.2.2 应用层（Application Layer）
- **职责**：业务逻辑和协调
- **组成**：服务类（Service）
- **特点**：实现核心业务规则，协调数据访问

#### 2.2.3 数据层（Data Layer）
- **职责**：数据持久化和查询
- **组成**：仓储接口和实现
- **特点**：封装存储细节，提供统一数据访问接口

---

## 3. 核心模块设计

### 3.1 任务管理模块

#### 3.1.1 数据模型
```typescript
interface Task {
  id: string;                    // 唯一标识
  title: string;                 // 标题
  description?: string;          // 描述
  status: TaskStatus;            // 状态：todo/in_progress/done
  priority: Priority;            // 优先级：low/medium/high
  estimatedPomodoros: number;    // 预估番茄数
  actualPomodoros: number;       // 实际完成番茄数
  tags: string[];                // 标签ID数组
  createdAt: number;             // 创建时间戳
  updatedAt: number;             // 更新时间戳
  completedAt?: number;          // 完成时间戳
  dueDate?: number;              // 截止日期
  sessionIds: string[];          // 关联的会话ID
}
```

#### 3.1.2 核心功能
- **CRUD 操作**：创建、读取、更新、删除任务
- **状态管理**：todo → in_progress → done
- **番茄钟关联**：记录任务相关的番茄钟会话
- **筛选和排序**：按状态、优先级、日期、标签筛选
- **搜索**：全文搜索任务标题和描述

#### 3.1.3 业务规则
1. 任务标题不能为空，长度不超过200字符
2. 只有进行中的任务可以关联番茄钟会话
3. 完成任务时自动记录完成时间
4. 删除任务时级联删除关联的会话（可选保留）
5. 预估番茄数默认为1，最大100

### 3.2 番茄钟模块

#### 3.2.1 数据模型
```typescript
interface Session {
  id: string;                   // 会话ID
  taskId: string | null;        // 关联任务（可为空）
  type: SessionType;            // work/short_break/long_break
  startTime: number;            // 开始时间戳
  endTime?: number;             // 结束时间戳
  plannedDuration: number;      // 计划时长（分钟）
  actualDuration?: number;      // 实际时长（分钟）
  isCompleted: boolean;         // 是否完成
  isSkipped: boolean;           // 是否跳过
  createdAt: number;            // 创建时间戳
  notes?: string;               // 备注
}
```

#### 3.2.2 核心功能
- **计时器**：工作/短休息/长休息三种模式
- **自动切换**：工作 → 休息 → 工作（可配置）
- **任务关联**：可选择关联任务或不关联（自由番茄钟）
- **会话记录**：记录每次番茄钟的详细信息
- **通知提醒**：会话开始/结束时的通知

#### 3.2.3 业务规则
1. 工作时长：25分钟（可配置，1-60分钟）
2. 短休息时长：5分钟（可配置，1-30分钟）
3. 长休息时长：15分钟（可配置，1-60分钟）
4. 长休息间隔：4个工作会后（可配置，2-10个）
5. 暂停时间超过5分钟后，重置当前会话
6. 完成的番茄钟自动更新任务的 actualPomodoros

### 3.3 统计模块

#### 3.3.1 数据模型
```typescript
interface Statistics {
  todayPomodoros: number;           // 今日番茄数
  todayFocusTime: number;           // 今日专注时长（分钟）
  totalPomodoros: number;           // 总番茄数
  totalFocusTime: number;           // 总专注时长
  totalTasks: number;               // 总任务数
  completedTasks: number;           // 完成任务数
  dailyStats: DailyStats[];         // 每日统计（最近30天）
  currentStreak: number;            // 当前连续天数
  longestStreak: number;            // 最长连续天数
  avgDailyPomodoros: number;        // 平均每日番茄数
  avgDailyFocusTime: number;        // 平均每日专注时长
  lastUpdated: number;              // 最后更新时间
}

interface DailyStats {
  date: string;                     // YYYY-MM-DD
  totalPomodoros: number;
  totalFocusTime: number;
  completedTasks: number;
  sessions: string[];               // Session IDs
}
```

#### 3.3.2 核心功能
- **今日统计**：实时更新今日数据
- **历史统计**：每日、每周、每月统计
- **连续天数**：计算使用应用的连续天数
- **趋势分析**：展示最近30天的趋势
- **目标达成**：每日目标达成率

#### 3.3.3 计算规则
1. 连续天数：每天至少完成1个番茄钟
2. 平均数据：基于最近30天计算
3. 专注时长：只计算工作类型的会话
4. 每日统计在每天首次使用时创建

### 3.4 设置模块

#### 3.4.1 数据模型
```typescript
interface Settings {
  workDuration: number;             // 工作时长（分钟）
  shortBreakDuration: number;       // 短休息时长（分钟）
  longBreakDuration: number;        // 长休息时长（分钟）
  longBreakInterval: number;        // 长休息间隔
  autoStartBreaks: boolean;         // 自动开始休息
  autoStartPomodoros: boolean;      // 自动开始下一个番茄钟
  autoSwitchTasks: boolean;         // 自动切换任务
  enableNotifications: boolean;     // 启用通知
  soundEnabled: boolean;            // 启用声音
  notificationSound: string;        // 通知音效
  theme: 'light' | 'dark' | 'system';
  showTimerInTitle: boolean;        // 在标题栏显示计时器
  dailyGoal: number;                // 每日目标番茄数
  updatedAt: number;
}
```

#### 3.4.2 核心功能
- **计时器设置**：配置各种时长
- **自动化设置**：自动切换、自动开始
- **通知设置**：通知和声音开关
- **界面设置**：主题、标题栏显示
- **数据管理**：导出/导入数据

---

## 4. 数据库设计

### 4.1 IndexedDB 数据库结构

#### 数据库名：`PomodoroDB`
#### 版本：`1`

#### Object Stores

**1. tasks**
```javascript
{
  keyPath: 'id',
  autoIncrement: false,
  indexes: [
    { name: 'status', keyPath: 'status' },
    { name: 'priority', keyPath: 'priority' },
    { name: 'createdAt', keyPath: 'createdAt' },
    { name: 'updatedAt', keyPath: 'updatedAt' },
    { name: 'dueDate', keyPath: 'dueDate' }
  ]
}
```

**2. sessions**
```javascript
{
  keyPath: 'id',
  autoIncrement: false,
  indexes: [
    { name: 'taskId', keyPath: 'taskId' },
    { name: 'type', keyPath: 'type' },
    { name: 'startTime', keyPath: 'startTime' },
    { name: 'date', keyPath: 'startTime', extractor: (ts) => formatDate(ts) }
  ]
}
```

**3. settings**
```javascript
{
  keyPath: 'id',
  autoIncrement: false
}
// 单例模式，只有一条记录，ID为 'default'
```

**4. statistics**
```javascript
{
  keyPath: 'id',
  autoIncrement: false
}
// 单例模式，只有一条记录，ID为 'default'
}

// 子表：dailyStats
{
  keyPath: 'date',
  autoIncrement: false,
  indexes: [
    { name: 'date', keyPath: 'date' }
  ]
}
```

**5. tags**
```javascript
{
  keyPath: 'id',
  autoIncrement: false,
  indexes: [
    { name: 'name', keyPath: 'name', unique: true }
  ]
}
```

### 4.2 数据关系

```
Task (1) ←→ (N) Session
  │
  └── (N) Tag
```

- 一个任务可以有多个会话
- 一个会话只属于一个任务（或为自由番茄钟）
- 一个任务可以有多个标签

---

## 5. API 设计

### 5.1 Repository API（数据访问层）

```typescript
// 任务仓储
interface ITaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  findByFilter(filter: TaskFilter): Promise<Task[]>;
  updateStatus(id: string, status: TaskStatus): Promise<void>;
  incrementPomodoroCount(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}

// 会话仓储
interface ISessionRepository {
  save(session: Session): Promise<void>;
  findById(id: string): Promise<Session | null>;
  findByTaskId(taskId: string): Promise<Session[]>;
  findTodaySessions(): Promise<Session[]>;
  findByDateRange(start: number, end: number): Promise<Session[]>;
  findRecent(limit: number): Promise<Session[]>;
  delete(id: string): Promise<void>;
}
```

### 5.2 Service API（业务逻辑层）

```typescript
// 任务服务
interface ITaskService {
  create(taskData: Partial<Task>): Promise<Task>;
  update(id: string, updates: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Task | null>;
  getAll(): Promise<Task[]>;
  updateStatus(id: string, status: TaskStatus): Promise<void>;
  startTask(id: string): Promise<void>;
  completeTask(id: string): Promise<void>;
  incrementPomodoro(id: string): Promise<void>;
}

// 计时器服务
interface ITimerService {
  start(taskId?: string): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  stop(complete?: boolean): Promise<void>;
  reset(): Promise<void>;
  nextSession(): Promise<void>;
  getRemainingTime(): number;
  getCurrentSessionType(): string;
  subscribe(callback: (event: TimerEvent) => void): () => void;
}
```

---

## 6. 状态管理

### 6.1 状态容器设计

使用观察者模式实现简单的状态管理：

```typescript
class Store<T> {
  private state: T;
  private listeners: Set<(state: T) => void>;

  constructor(initialState: T) {
    this.state = initialState;
    this.listeners = new Set();
  }

  getState(): T {
    return this.state;
  }

  setState(partial: Partial<T>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  subscribe(listener: (state: T) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}
```

### 6.2 全局应用状态

```typescript
interface AppState {
  tasks: Task[];
  sessions: Session[];
  tags: Tag[];
  settings: Settings;
  statistics: Statistics;

  // UI状态
  currentTaskId: string | null;
  currentView: 'tasks' | 'timer' | 'statistics' | 'settings';

  // 计时器状态
  timerState: TimerState;
  currentSessionType: SessionType;
  remainingTime: number;
  currentSessionId: string | null;

  // 加载状态
  isLoading: boolean;
  isInitialized: boolean;
  error?: string;
}
```

---

## 7. 组件设计

### 7.1 组件层次结构

```
App
├── Header
│   ├── Logo
│   └── Navigation
├── Main
│   ├── TaskListView
│   │   ├── TaskFilters
│   │   ├── TaskList
│   │   │   └── TaskItem
│   │   └── TaskForm (Modal)
│   ├── TimerView
│   │   ├── TimerDisplay
│   │   ├── TimerControls
│   │   ├── TaskSelector
│   │   └── SessionHistory
│   ├── StatisticsView
│   │   ├── TodayStats
│   │   ├── WeeklyChart
│   │   ├── MonthlyChart
│   │   └── TaskBreakdown
│   └── SettingsView
│       ├── TimerSettings
│       ├── NotificationSettings
│       ├── ThemeSettings
│       └── DataManagement
└── Footer
```

### 7.2 组件通信

- **父 → 子**：通过 props 传递数据和回调
- **子 → 父**：通过回调函数通知父组件
- **跨组件**：通过全局 Store 订阅状态变化
- **事件总线**：使用自定义事件实现组件间通信

---

## 8. 用户交互流程

### 8.1 创建任务流程

```
1. 用户点击"新建任务"按钮
2. 打开任务表单模态框
3. 用户填写任务信息
   - 标题（必填）
   - 描述（可选）
   - 优先级
   - 预估番茄数
   - 标签
   - 截止日期
4. 表单验证
5. 调用 TaskService.create()
6. 保存到 IndexedDB
7. 更新应用状态
8. 任务列表自动更新
9. 关闭模态框
```

### 8.2 番茄钟工作流程

```
1. 用户选择任务（可选）
2. 点击"开始"按钮
3. 计时器开始倒计时
   - 页面标题显示剩余时间
   - 更新计时器显示
   - 每秒触发 tick 事件
4. 时间到或用户点击"完成"
   - 播放提示音
   - 显示通知
   - 保存会话记录
   - 更新任务的番茄钟计数
   - 更新统计数据
5. 如果启用自动切换，自动开始休息
6. 休息结束后，提示开始下一个番茄钟
```

### 8.3 数据同步流程

```
1. 应用启动时
   - 打开 IndexedDB 连接
   - 加载设置、任务、会话、统计数据
   - 初始化应用状态

2. 数据变更时
   - 更新内存状态
   - 异步保存到 IndexedDB
   - 通知相关组件更新

3. 应用关闭时
   - 保存所有未保存的更改
   - 关闭数据库连接
```

---

## 9. 性能优化策略

### 9.1 数据加载优化
- **懒加载**：只加载当前视图需要的数据
- **分页**：任务列表支持虚拟滚动或分页加载
- **缓存**：使用内存缓存减少 IndexedDB 查询

### 9.2 渲染优化
- **虚拟滚动**：长列表使用虚拟滚动
- **防抖/节流**：搜索输入、计时器更新使用节流
- **批量更新**：多个状态变更合并为一次渲染

### 9.3 存储优化
- **索引优化**：为常用查询字段创建索引
- **批量操作**：使用批量读写减少事务开销
- **数据压缩**：统计数据可以只保留最近30天

---

## 10. 测试策略

### 10.1 单元测试
- **工具**：Vitest
- **覆盖**：工具函数、业务逻辑、数据处理
- **示例**：
  - ID生成器测试
  - 日期工具测试
  - 验证器测试
  - Service 层业务逻辑测试

### 10.2 集成测试
- **工具**：Testing Library + happy-dom
- **覆盖**：组件交互、数据流、用户场景
- **示例**：
  - 创建任务的完整流程
  - 番茄钟计时器工作流程
  - 数据持久化流程

### 10.3 E2E 测试
- **工具**：Playwright
- **覆盖**：关键用户路径
- **示例**：
  - 新用户首次使用流程
  - 完整的工作会话流程
  - 数据导入导出流程

---

## 11. 安全性考虑

### 11.1 输入验证
- 所有用户输入进行验证和清理
- 防止 XSS 攻击（转义 HTML 特殊字符）
- 验证数据类型和范围

### 11.2 数据保护
- 本地数据加密（可选）
- 敏感信息不记录在日志中
- 导出数据时允许用户选择包含内容

### 11.3 通知权限
- 请求通知权限前显示说明
- 尊重用户的拒绝决定
- 提供关闭通知的选项

---

## 12. 部署方案

### 12.1 构建流程
```bash
# 开发环境
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

### 12.2 部署选项
- **静态托管**：Vercel、Netlify、GitHub Pages
- **CDN**：使用 CDN 加速静态资源
- **PWA**：渐进式 Web 应用，支持离线使用

### 12.3 版本管理
- 使用语义化版本号（Semantic Versioning）
- 数据库版本迁移策略
- 向后兼容性考虑

---

## 13. 未来扩展

### 13.1 可能的功能增强
- **云同步**：可选的云端备份和同步
- **团队协作**：多用户共享任务和统计
- **番茄钟分析**：AI 驱动的生产力建议
- **插件系统**：支持第三方扩展
- **主题市场**：用户自定义主题

### 13.2 技术升级路径
- **框架迁移**：如果需要，可以迁移到 React/Vue
- **状态管理**：引入 Redux/Zustand 等状态管理库
- **构建工具**：升级到最新的构建工具链

---

## 14. 总结

本架构设计遵循以下原则：

1. **简单优先**：MVP 只实现核心功能，避免过度设计
2. **本地优先**：数据存储在本地，无需网络即可使用
3. **类型安全**：充分利用 TypeScript 的类型系统
4. **关注分离**：清晰的分层架构，职责明确
5. **可测试性**：依赖注入和接口抽象，便于单元测试
6. **可扩展性**：预留扩展点，便于未来功能增强

这个架构为应用提供了坚实的基础，同时保持了足够的灵活性以适应未来的需求变化。
