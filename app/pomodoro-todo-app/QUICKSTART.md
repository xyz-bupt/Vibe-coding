# 快速启动指南

## 安装和运行

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

应用将在浏览器中自动打开 http://localhost:3000

3. **构建生产版本**
```bash
npm run build
```

## 项目概览

这是一个完整的"智能 To-Do + 番茄钟"应用，包含以下核心功能：

### 已实现的组件

#### 1. **任务管理** (`src/components/TaskList.ts`)
- 创建、编辑、删除任务
- 任务优先级设置（高/中/低）
- 任务完成状态跟踪
- 任务过滤（全部/进行中/已完成）
- 任务本地持久化存储

#### 2. **番茄钟计时器** (`src/components/PomodoroTimer.ts`)
- 可自定义的专注时长
- 短休息和长休息模式
- 自动模式切换
- 进度环可视化
- 完成提醒（声音 + 视觉闪烁）

#### 3. **计时器显示** (`src/components/TimerDisplay.ts`)
- 大字体时间显示
- 进度环动画
- 状态指示器
- 当前任务显示

#### 4. **统计面板** (`src/components/StatisticsPanel.ts`)
- 今日番茄钟数量
- 专注时长统计
- 完成任务数量
- 每日目标进度
- 本周日历热力图

#### 5. **任务表单** (`src/components/TaskForm.ts`)
- 添加/编辑任务对话框
- 表单验证
- 键盘友好的交互

#### 6. **设置对话框** (`src/components/SettingsModal.ts`)
- 计时器时长配置
- 通知设置
- 主题选择（浅色/深色/自动）
- 每日目标设置

### 工具类

#### 1. **事件发射器** (`src/utils/EventEmitter.ts`)
- 组件间通信
- 发布-订阅模式

#### 2. **Toast 通知管理器** (`src/utils/ToastManager.ts`)
- 成功/错误/警告/信息通知
- 可配置持续时间
- 支持操作按钮

### 核心特性

- ✅ **响应式设计** - 移动端友好
- ✅ **无障碍访问** - ARIA 标签、键盘导航
- ✅ **本地存储** - 数据持久化
- ✅ **主题支持** - 浅色/深色模式
- ✅ **键盘快捷键** - 提高效率
- ✅ **TypeScript** - 类型安全
- ✅ **模块化架构** - 易于维护

### 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Space` | 开始/暂停计时器 |
| `Alt + R` | 重置计时器 |
| `Alt + S` | 打开设置 |
| `Alt + N` | 添加新任务 |
| `Alt + 1/2/3` | 切换计时器模式 |
| `Esc` | 关闭对话框 |
| `?` | 显示帮助 |

### 数据流

```
用户操作 → 组件事件 → EventEmitter → 业务逻辑 → 状态更新 → UI 更新
```

### 本地存储结构

```json
{
  "tasks": [...],           // 任务列表
  "app_settings": {...},    // 应用设置
  "pomodoros_2024-01-22": 5,  // 每日番茄钟统计
  "completed_tasks_2024-01-22": 3  // 每日完成任务
}
```

## 自定义和扩展

### 修改默认设置

编辑 `src/components/SettingsModal.ts` 中的默认设置：

```typescript
private loadSettings(): AppSettings {
    return {
        timer: {
            pomodoroDuration: 25 * 60,
            shortBreakDuration: 5 * 60,
            longBreakDuration: 15 * 60,
            longBreakInterval: 4
        },
        // ... 其他设置
    };
}
```

### 添加新的统计指标

1. 在 `src/types.ts` 中添加类型定义
2. 在 `src/components/StatisticsPanel.ts` 中实现逻辑
3. 在 `index.html` 中添加 UI 元素
4. 在 `styles/main.css` 中添加样式

### 自定义主题颜色

编辑 `styles/main.css` 中的 CSS 变量：

```css
:root {
    --color-primary: #e74c3c;  /* 主色调 */
    --color-secondary: #3498db; /* 次要色 */
    /* ... 其他颜色 */
}
```

## 故障排除

### 问题：TypeScript 编译错误

```bash
npm run type-check
```

### 问题：样式未生效

确保：
1. `styles/main.css` 路径正确
2. 浏览器缓存已清除
3. CSS 变量已定义

### 问题：本地存储数据丢失

- 清除浏览器缓存会删除所有数据
- 建议定期导出重要任务数据

## 下一步

- [ ] 添加数据导出/导入功能
- [ ] 实现云端同步
- [ ] 添加任务标签/分类
- [ ] 实现番茄钟历史记录
- [ ] 添加成就系统
- [ ] 实现团队协作功能

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request
