/**
 * 类型定义文件
 * 定义应用中使用的所有类型和接口
 */

/**
 * 任务优先级
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * 任务状态
 */
export type TaskStatus = 'active' | 'completed';

/**
 * 任务实体
 */
export interface Task {
    id: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    estimatedPomodoros: number;
    completedPomodoros: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
}

/**
 * 计时器模式
 */
export type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

/**
 * 计时器状态
 */
export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

/**
 * 计时器配置
 */
export interface TimerConfig {
    pomodoroDuration: number;      // 专注时长（秒）
    shortBreakDuration: number;    // 短休息时长（秒）
    longBreakDuration: number;     // 长休息时长（秒）
    longBreakInterval: number;     // 长休息间隔（番茄数）
}

/**
 * 计时器信息
 */
export interface TimerInfo {
    mode: TimerMode;
    state: TimerState;
    timeRemaining: number;         // 剩余时间（秒）
    totalTime: number;             // 总时间（秒）
    completedPomodoros: number;    // 已完成的番茄数
    currentTaskId?: string;        // 当前关联的任务ID
}

/**
 * 每日统计
 */
export interface DailyStatistics {
    date: Date;
    pomodoroCount: number;
    focusTime: number;             // 专注时长（分钟）
    completedTasks: number;
    goal: number;                  // 每日目标（番茄数）
}

/**
 * 总体统计
 */
export interface TotalStatistics {
    totalPomodoros: number;
    totalFocusTime: number;        // 总专注时长（分钟）
    totalTasks: number;
    averageDailyPomodoros: number;
    streak: number;                // 连续天数
}

/**
 * 日历日数据
 */
export interface CalendarDay {
    date: Date;
    pomodoroCount: number;
    isToday: boolean;
}

/**
 * 应用设置
 */
export interface AppSettings {
    timer: TimerConfig;
    notifications: {
        enabled: boolean;
        sound: boolean;
        autoStartBreaks: boolean;
        autoStartPomodoros: boolean;
    };
    appearance: {
        theme: 'light' | 'dark' | 'auto';
    };
    dailyGoal: number;
}

/**
 * Toast 通知类型
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast 通知选项
 */
export interface ToastOptions {
    type: ToastType;
    title: string;
    message: string;
    duration?: number;
    actions?: ToastAction[];
}

/**
 * Toast 操作按钮
 */
export interface ToastAction {
    label: string;
    onClick: () => void;
    primary?: boolean;
}

/**
 * 事件类型
 */
export type EventType =
    | 'timer:start'
    | 'timer:pause'
    | 'timer:reset'
    | 'timer:complete'
    | 'timer:skip'
    | 'timer:modeChange'
    | 'task:add'
    | 'task:update'
    | 'task:delete'
    | 'task:complete'
    | 'task:activate'
    | 'settings:update';

/**
 * 事件监听器
 */
export type EventListener = (data?: any) => void;

/**
 * 过滤器类型
 */
export type TaskFilter = 'all' | 'active' | 'completed';

/**
 * 表单数据
 */
export interface TaskFormData {
    title: string;
    description?: string;
    priority: TaskPriority;
    estimatedPomodoros: number;
}

/**
 * 设置表单数据
 */
export interface SettingsFormData {
    pomodoroDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    longBreakInterval: number;
    dailyGoal: number;
    enableNotifications: boolean;
    enableSound: boolean;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
    theme: 'light' | 'dark' | 'auto';
}
