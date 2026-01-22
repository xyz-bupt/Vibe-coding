/**
 * Service Interfaces
 * 定义业务逻辑层的抽象接口
 */

import { Task, Session, Settings, Statistics, Tag, TimerEvent, NotificationData, TaskFilter } from '../types/index';

/**
 * 计时器服务接口
 * 负责番茄钟计时器的核心逻辑
 */
export interface ITimerService {
  /**
   * 开始计时器
   * @param taskId 关联的任务ID（可选）
   */
  start(taskId?: string): Promise<void>;

  /**
   * 暂停计时器
   */
  pause(): Promise<void>;

  /**
   * 恢复计时器
   */
  resume(): Promise<void>;

  /**
   * 停止/跳过当前会话
   * @param complete 是否标记为完成
   */
  stop(complete?: boolean): Promise<void>;

  /**
   * 重置计时器
   */
  reset(): Promise<void>;

  /**
   * 切换到下一个会话（工作->休息或休息->工作）
   */
  nextSession(): Promise<void>;

  /**
   * 跳过休息，直接开始工作
   */
  skipBreak(): Promise<void>;

  /**
   * 获取剩余时间（秒）
   */
  getRemainingTime(): number;

  /**
   * 获取当前会话类型
   */
  getCurrentSessionType(): string;

  /**
   * 获取计时器状态
   */
  getState(): string;

  /**
   * 订阅计时器事件
   * @param callback 事件回调函数
   * @returns 取消订阅的函数
   */
  subscribe(callback: (event: TimerEvent) => void): () => void;

  /**
   * 销毁计时器服务
   */
  destroy(): void;
}

/**
 * 任务服务接口
 * 负责任务管理的业务逻辑
 */
export interface ITaskService {
  /**
   * 创建新任务
   * @param taskData 任务数据（不包含id和createdAt）
   */
  create(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task>;

  /**
   * 更新任务
   * @param id 任务ID
   * @param updates 要更新的字段
   */
  update(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task>;

  /**
   * 删除任务
   * @param id 任务ID
   */
  delete(id: string): Promise<void>;

  /**
   * 根据ID获取任务
   * @param id 任务ID
   */
  getById(id: string): Promise<Task | null>;

  /**
   * 获取所有任务
   */
  getAll(): Promise<Task[]>;

  /**
   * 根据筛选条件获取任务
   * @param filter 筛选条件
   */
  getByFilter(filter: TaskFilter): Promise<Task[]>;

  /**
   * 更新任务状态
   * @param id 任务ID
   * @param status 新状态
   */
  updateStatus(id: string, status: Task['status']): Promise<void>;

  /**
   * 开始任务（设置为进行中）
   * @param id 任务ID
   */
  startTask(id: string): Promise<void>;

  /**
   * 完成任务
   * @param id 任务ID
   */
  completeTask(id: string): Promise<void>;

  /**
   * 增加任务的番茄钟计数
   * @param id 任务ID
   */
  incrementPomodoro(id: string): Promise<void>;

  /**
   * 搜索任务
   * @param query 搜索关键词
   */
  search(query: string): Promise<Task[]>;

  /**
   * 获取今日任务
   */
  getTodayTasks(): Promise<Task[]>;

  /**
   * 批量删除任务
   * @param ids 任务ID数组
   */
  batchDelete(ids: string[]): Promise<void>;

  /**
   * 批量更新状态
   * @param ids 任务ID数组
   * @param status 新状态
   */
  batchUpdateStatus(ids: string[], status: Task['status']): Promise<void>;
}

/**
 * 会话服务接口
 * 负责番茄钟会话的业务逻辑
 */
export interface ISessionService {
  /**
   * 创建新会话
   * @param sessionData 会话数据
   */
  create(sessionData: Omit<Session, 'id' | 'createdAt'>): Promise<Session>;

  /**
   * 完成会话
   * @param sessionId 会话ID
   * @param actualDuration 实际时长（分钟）
   */
  complete(sessionId: string, actualDuration: number): Promise<void>;

  /**
   * 跳过会话
   * @param sessionId 会话ID
   */
  skip(sessionId: string): Promise<void>;

  /**
   * 根据ID获取会话
   * @param id 会话ID
   */
  getById(id: string): Promise<Session | null>;

  /**
   * 获取任务的所有会话
   * @param taskId 任务ID
   */
  getByTaskId(taskId: string): Promise<Session[]>;

  /**
   * 获取今日会话
   */
  getTodaySessions(): Promise<Session[]>;

  /**
   * 获取指定日期范围的会话
   * @param startDate 开始时间戳
   * @param endDate 结束时间戳
   */
  getByDateRange(startDate: number, endDate: number): Promise<Session[]>;

  /**
   * 获取最近会话
   * @param limit 数量限制
   */
  getRecentSessions(limit?: number): Promise<Session[]>;

  /**
   * 删除会话
   * @param id 会话ID
   */
  delete(id: string): Promise<void>;

  /**
   * 统计指定时间范围的完成番茄数
   * @param startDate 开始时间戳
   * @param endDate 结束时间戳
   */
  countCompleted(startDate: number, endDate: number): Promise<number>;

  /**
   * 计算总专注时间
   * @param startDate 开始时间戳
   * @param endDate 结束时间戳
   */
  getTotalFocusTime(startDate: number, endDate: number): Promise<number>;
}

/**
 * 统计服务接口
 * 负责统计数据的计算和管理
 */
export interface IStatisticsService {
  /**
   * 获取完整统计数据
   */
  getStatistics(): Promise<Statistics>;

  /**
   * 获取今日统计
   */
  getTodayStatistics(): Promise<{ pomodoros: number; focusTime: number; completedTasks: number }>;

  /**
   * 获取每周统计（最近7天）
   */
  getWeeklyStatistics(): Promise<DailyStats[]>;

  /**
   * 获取每月统计（最近30天）
   */
  getMonthlyStatistics(): Promise<DailyStats[]>;

  /**
   * 更新统计数据
   * @param session 刚完成的会话
   */
  update(session: Session): Promise<void>;

  /**
   * 重新计算所有统计数据
   */
  recalculate(): Promise<void>;

  /**
   * 获取连续天数统计
   */
  getStreak(): Promise<{ current: number; longest: number }>;

  /**
   * 获取平均每日数据
   */
  getAverages(): Promise<{ pomodoros: number; focusTime: number }>;

  /**
   * 重置统计数据
   */
  reset(): Promise<void>;

  /**
   * 导出统计数据
   */
  export(): Promise<string>;
}

/**
 * 通知服务接口
 * 负责应用通知功能
 */
export interface INotificationService {
  /**
   * 请求通知权限
   */
  requestPermission(): Promise<boolean>;

  /**
   * 显示通知
   * @param data 通知数据
   */
  show(data: NotificationData): Promise<void>;

  /**
   * 显示番茄钟完成通知
   * @param type 会话类型
   */
  showPomodoroComplete(type: 'work' | 'break'): Promise<void>;

  /**
   * 显示任务完成通知
   * @param taskTitle 任务标题
   */
  showTaskComplete(taskTitle: string): Promise<void>;

  /**
   * 显示每日目标达成通知
   * @param current 当前进度
   * @param goal 目标
   */
  showDailyGoalReached(current: number, goal: number): Promise<void>;

  /**
   * 清除所有通知
   */
  clear(): Promise<void>;

  /**
   * 检查通知权限状态
   */
  checkPermission(): NotificationPermission;
}

/**
 * 音频服务接口
 * 负责声音播放功能
 */
export interface IAudioService {
  /**
   * 播放声音
   * @param type 声音类型
   */
  play(type: 'start' | 'complete' | 'break_start' | 'pause'): Promise<void>;

  /**
   * 停止所有声音
   */
  stop(): void;

  /**
   * 设置音量
   * @param volume 音量值（0-1）
   */
  setVolume(volume: number): void;

  /**
   * 获取音量
   */
  getVolume(): number;

  /**
   * 启用/禁用声音
   * @param enabled 是否启用
   */
  setEnabled(enabled: boolean): void;

  /**
   * 检查是否启用
   */
  isEnabled(): boolean;
}

/**
 * 数据导出/导入服务接口
 */
export interface IDataService {
  /**
   * 导出所有数据
   * @param format 导出格式（'json' | 'csv'）
   */
  exportAll(format?: 'json' | 'csv'): Promise<string>;

  /**
   * 导入数据
   * @param jsonData JSON数据字符串
   */
  import(jsonData: string): Promise<void>;

  /**
   * 备份数据到文件
   * @param filename 文件名
   */
  backup(filename?: string): Promise<void>;

  /**
   * 从文件恢复数据
   * @param file 文件对象
   */
  restore(file: File): Promise<void>;

  /**
   * 清除所有数据
   */
  clearAll(): Promise<void>;
}

/**
 * 设置服务接口
 */
export interface ISettingsService {
  /**
   * 获取设置
   */
  get(): Promise<Settings>;

  /**
   * 更新设置
   * @param settings 部分或全部设置
   */
  update(settings: Partial<Settings>): Promise<void>;

  /**
   * 重置为默认设置
   */
  reset(): Promise<void>;

  /**
   * 获取单个设置项
   * @param key 设置键名
   */
  get<K extends keyof Settings>(key: K): Promise<Settings[K]>;

  /**
   * 更新单个设置项
   * @param key 设置键名
   * @param value 设置值
   */
  set<K extends keyof Settings>(key: K, value: Settings[K]): Promise<void>;
}

/**
 * 标签服务接口
 */
export interface ITagService {
  /**
   * 创建标签
   * @param tagData 标签数据
   */
  create(tagData: Omit<Tag, 'id' | 'createdAt'>): Promise<Tag>;

  /**
   * 更新标签
   * @param id 标签ID
   * @param updates 要更新的字段
   */
  update(id: string, updates: Partial<Tag>): Promise<Tag>;

  /**
   * 删除标签
   * @param id 标签ID
   */
  delete(id: string): Promise<void>;

  /**
   * 根据ID获取标签
   * @param id 标签ID
   */
  getById(id: string): Promise<Tag | null>;

  /**
   * 获取所有标签
   */
  getAll(): Promise<Tag[]>;

  /**
   * 根据名称查找标签
   * @param name 标签名称
   */
  findByName(name: string): Promise<Tag | null>;
}
