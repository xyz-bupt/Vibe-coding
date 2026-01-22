# 组件交互关系图

## 核心组件架构

```
┌─────────────────────────────────────────────────────────────┐
│                         App (main.ts)                       │
│                        应用主控制器                          │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ TaskList     │   │ PomodoroTimer│   │ StatisticsPanel│
│ 任务列表组件  │   │ 番茄钟核心   │   │ 统计面板组件  │
└──────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────┴────────┐
                    ▼                ▼
            ┌───────────┐    ┌───────────┐
            │EventEmitter│    │ToastManager│
            │  事件发射器 │    │ 通知管理器 │
            └───────────┘    └───────────┘
```

## 组件通信流程

### 1. 任务管理流程

```
用户点击"添加任务"
    │
    ▼
TaskForm.show()
    │
    ▼
用户填写表单并提交
    │
    ▼
TaskForm.validate()
    │
    ▼
emit('task:add', newTask)
    │
    ▼
TaskList.addTask()
    │
    ├── 更新内部状态
    ├── 保存到 localStorage
    └── 重新渲染
    │
    ▼
ToastManager.success('任务已创建')
```

### 2. 番茄钟流程

```
用户点击"开始"
    │
    ▼
PomodoroTimer.start()
    │
    ▼
setInterval (每秒)
    │
    ▼
tick() ── timeRemaining--
    │
    ▼
emit('timer:update', info)
    │
    ├──────────────────┐
    ▼                  ▼
TimerDisplay         TaskList
更新时间显示         (可选)更新任务番茄数
    │
    ▼
timeRemaining === 0?
    │
    ▼ Yes
complete()
    │
    ├── 完成番茄钟 +1
    ├── 保存统计
    ├── emit('pomodoro:completed')
    └── 切换到休息模式
    │
    ▼
StatisticsPanel.incrementTodayPomodoros()
    │
    ▼
ToastManager.success('番茄钟完成！')
```

### 3. 设置更新流程

```
用户打开设置
    │
    ▼
SettingsModal.show()
    │
    ▼
用户修改设置并保存
    │
    ▼
SettingsModal.save()
    │
    ├── 验证数据
    ├── 更新内部状态
    ├── 保存到 localStorage
    └── 应用主题
    │
    ▼
emit('settings:update', settings)
    │
    ├──────────────────┐
    ▼                  ▼
PomodoroTimer       其他组件
更新计时器配置       响应设置变化
```

## 事件列表

### 计时器事件

| 事件名 | 数据 | 触发者 | 监听者 |
|--------|------|--------|--------|
| `timer:start` | - | PomodoroTimer | TimerDisplay |
| `timer:pause` | - | PomodoroTimer | TimerDisplay |
| `timer:reset` | - | PomodoroTimer | TimerDisplay |
| `timer:complete` | - | PomodoroTimer | TimerDisplay |
| `timer:update` | TimerInfo | PomodoroTimer | TimerDisplay |
| `timer:modeChange` | TimerMode | UI/Timer | PomodoroTimer |

### 任务事件

| 事件名 | 数据 | 触发者 | 监听者 |
|--------|------|--------|--------|
| `task:add` | Task | TaskForm | TaskList |
| `task:update` | Task | TaskForm | TaskList |
| `task:delete` | string | TaskList | TaskList |
| `task:complete` | string | TaskList | TaskList, StatisticsPanel |
| `task:activate` | string | TaskList | PomodoroTimer |
| `task:edit` | Task | UI | TaskForm |
| `task:activated` | Task | PomodoroTimer | UI |

### 统计事件

| 事件名 | 数据 | 触发者 | 监听者 |
|--------|------|--------|--------|
| `pomodoro:completed` | {count, taskId} | PomodoroTimer | StatisticsPanel |
| `task:completed` | Task | TaskList | StatisticsPanel |

### 设置事件

| 事件名 | 数据 | 触发者 | 监听者 |
|--------|------|--------|--------|
| `settings:update` | AppSettings | SettingsModal | PomodoroTimer, App |

## 状态管理

### 全局状态位置

1. **TaskList** - 任务数组
   ```typescript
   private tasks: Task[];
   ```

2. **PomodoroTimer** - 计时器状态
   ```typescript
   private mode: TimerMode;
   private state: TimerState;
   private timeRemaining: number;
   private completedPomodoros: number;
   ```

3. **SettingsModal** - 应用设置
   ```typescript
   private settings: AppSettings;
   ```

### 本地存储键

| 键名 | 类型 | 说明 |
|------|------|------|
| `tasks` | Task[] | 任务列表 |
| `app_settings` | AppSettings | 应用设置 |
| `pomodoros_YYYY-MM-DD` | number | 每日番茄钟数 |
| `completed_tasks_YYYY-MM-DD` | number | 每日完成任务数 |
| `app_visited` | string | 首次访问标记 |

## UI 组件树

```
body
├── header (应用标题栏)
│   ├── h1 (应用标题)
│   └── nav (导航按钮)
│
├── main
│   ├── section#timer-section (计时器区域)
│   │   ├── div.current-task (当前任务)
│   │   ├── div.timer-display-container (计时器显示)
│   │   │   ├── div#timer-display (时间)
│   │   │   ├── div.timer-status (状态)
│   │   │   └── svg.timer-progress (进度环)
│   │   ├── div.timer-controls (控制按钮)
│   │   └── div.timer-modes (模式切换)
│   │
│   ├── section#tasks-section (任务列表区域)
│   │   ├── div.tasks-header
│   │   ├── div.task-filters
│   │   └── div#task-list
│   │       └── div.task-item* (任务项)
│   │
│   └── section#stats-section (统计面板区域)
│       ├── h2
│       ├── div.stats-grid
│       │   └── article.stat-card*
│       └── div.calendar-view
│           └── div#week-calendar
│
├── aside#settings-modal (设置对话框)
│   └── div.modal-container
│
├── aside#task-modal (任务表单对话框)
│   └── div.modal-container
│
├── dialog#shortcuts-dialog (快捷键帮助)
│
└── div#toast-container (通知容器)
    └── div.toast* (Toast 通知)
```

## 样式架构

### CSS 类命名规范

- BEM 式命名：`.block__element--modifier`
- 组件类：`.component-name`
- 状态类：`.is-active`, `.is-disabled`
- 工具类：`.visually-hidden`, `.skip-link`

### 主要样式模块

1. **变量** (`:root`)
   - 颜色
   - 间距
   - 字体
   - 圆角
   - 阴影
   - 过渡

2. **布局**
   - Flexbox
   - Grid
   - 响应式断点

3. **组件**
   - 按钮 (`.btn`)
   - 表单 (`.form-*`)
   - 对话框 (`.modal`)
   - Toast (`.toast`)
   - 任务项 (`.task-item`)

4. **动画**
   - @keyframes
   - 过渡效果
   - 减少动画媒体查询

## 性能优化

### 1. 事件委托

```typescript
// 不推荐：为每个按钮添加监听器
buttons.forEach(btn => btn.addEventListener('click', handler));

// 推荐：使用事件委托
container.addEventListener('click', (e) => {
    if (e.target.matches('.btn')) {
        handler(e);
    }
});
```

### 2. 防抖和节流

```typescript
// 搜索输入防抖
const debouncedSearch = debounce(searchHandler, 300);
```

### 3. 虚拟滚动

对于大量任务，考虑实现虚拟滚动。

### 4. 懒加载

```typescript
// 动态导入
const SettingsModal = (await import('./SettingsModal')).default;
```

## 测试策略

### 单元测试

- 纯函数（格式化、验证）
- 工具类（EventEmitter、ToastManager）
- 业务逻辑（Timer、Task）

### 集成测试

- 组件交互
- 事件流
- 数据持久化

### E2E 测试

- 用户流程
- 关键路径
- 跨浏览器兼容性
