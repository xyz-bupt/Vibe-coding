/**
 * Repository Interfaces
 * 定义数据访问层的抽象接口，遵循仓储模式（Repository Pattern）
 */

import { Task, Session, Settings, Statistics, Tag, TaskStatus, TaskFilter, DailyStats } from '../types/index';

/**
 * 任务仓储接口
 * 负责任务的持久化和查询操作
 */
export interface ITaskRepository {
  /**
   * 保存任务（创建或更新）
   * @param task 要保存的任务对象
   */
  save(task: Task): Promise<void>;

  /**
   * 根据ID查找任务
   * @param id 任务ID
   * @returns 任务对象或null
   */
  findById(id: string): Promise<Task | null>;

  /**
   * 查找所有任务
   * @returns 任务数组
   */
  findAll(): Promise<Task[]>;

  /**
   * 根据筛选条件查找任务
   * @param filter 筛选条件
   * @returns 符合条件的任务数组
   */
  findByFilter(filter: TaskFilter): Promise<Task[]>;

  /**
   * 更新任务状态
   * @param id 任务ID
   * @param status 新状态
   */
  updateStatus(id: string, status: TaskStatus): Promise<void>;

  /**
   * 增加任务的番茄钟计数
   * @param id 任务ID
   */
  incrementPomodoroCount(id: string): Promise<void>;

  /**
   * 删除任务
   * @param id 任务ID
   */
  delete(id: string): Promise<void>;

  /**
   * 查找指定状态的任务
   * @param status 任务状态
   * @returns 任务数组
   */
  findByStatus(status: TaskStatus): Promise<Task[]>;

  /**
   * 查找今日创建的任务
   * @returns 今日创建的任务数组
   */
  findTodayTasks(): Promise<Task[]>;

  /**
   * 搜索任务
   * @param query 搜索关键词
   * @returns 匹配的任务数组
   */
  search(query: string): Promise<Task[]>;
}

/**
 * 会话仓储接口
 * 负责番茄钟会话的持久化和查询操作
 */
export interface ISessionRepository {
  /**
   * 保存会话（创建或更新）
   * @param session 会话对象
   */
  save(session: Session): Promise<void>;

  /**
   * 根据ID查找会话
   * @param id 会话ID
   * @returns 会话对象或null
   */
  findById(id: string): Promise<Session | null>;

  /**
   * 根据任务ID查找所有关联会话
   * @param taskId 任务ID
   * @returns 会话数组
   */
  findByTaskId(taskId: string): Promise<Session[]>;

  /**
   * 查找今日的所有会话
   * @returns 今日会话数组
   */
  findTodaySessions(): Promise<Session[]>;

  /**
   * 根据日期范围查找会话
   * @param startDate 开始时间戳
   * @param endDate 结束时间戳
   * @returns 会话数组
   */
  findByDateRange(startDate: number, endDate: number): Promise<Session[]>;

  /**
   * 查找最近N个会话
   * @param limit 数量限制
   * @returns 会话数组
   */
  findRecent(limit: number): Promise<Session[]>;

  /**
   * 删除会话
   * @param id 会话ID
   */
  delete(id: string): Promise<void>;

  /**
   * 统计指定时间范围内的完成番茄数
   * @param startDate 开始时间戳
   * @param endDate 结束时间戳
   * @returns 完成的番茄数
   */
  countCompleted(startDate: number, endDate: number): Promise<number>;

  /**
   * 计算总专注时间
   * @param startDate 开始时间戳
   * @param endDate 结束时间戳
   * @returns 专注时长（分钟）
   */
  getTotalFocusTime(startDate: number, endDate: number): Promise<number>;
}

/**
 * 设置仓储接口
 * 负责应用设置的持久化和读取
 */
export interface ISettingsRepository {
  /**
   * 获取设置
   * @returns 设置对象
   */
  get(): Promise<Settings>;

  /**
   * 更新设置
   * @param settings 部分或全部设置对象
   */
  update(settings: Partial<Settings>): Promise<void>;

  /**
   * 重置为默认设置
   */
  resetToDefault(): Promise<void>;

  /**
   * 导出设置
   * @returns 设置的JSON字符串
   */
  export(): Promise<string>;

  /**
   * 导入设置
   * @param jsonData 设置的JSON字符串
   */
  import(jsonData: string): Promise<void>;
}

/**
 * 统计仓储接口
 * 负责统计数据的持久化和查询
 */
export interface IStatisticsRepository {
  /**
   * 获取统计数据
   * @returns 统计对象
   */
  get(): Promise<Statistics>;

  /**
   * 更新统计数据
   * @param statistics 统计对象
   */
  update(statistics: Statistics): Promise<void>;

  /**
   * 获取每日统计
   * @param date 日期字符串（YYYY-MM-DD）
   * @returns 每日统计对象
   */
  getDailyStats(date: string): Promise<DailyStats | null>;

  /**
   * 保存或更新每日统计
   * @param dailyStats 每日统计对象
   */
  saveDailyStats(dailyStats: DailyStats): Promise<void>;

  /**
   * 获取最近N天的统计数据
   * @param days 天数
   * @returns 每日统计数组
   */
  getRecentDailyStats(days: number): Promise<DailyStats[]>;

  /**
   * 计算并更新今日统计
   */
  updateTodayStats(): Promise<void>;

  /**
   * 重置统计数据
   */
  reset(): Promise<void>;
}

/**
 * 标签仓储接口
 * 负责标签的持久化和查询
 */
export interface ITagRepository {
  /**
   * 保存标签（创建或更新）
   * @param tag 标签对象
   */
  save(tag: Tag): Promise<void>;

  /**
   * 根据ID查找标签
   * @param id 标签ID
   * @returns 标签对象或null
   */
  findById(id: string): Promise<Tag | null>;

  /**
   * 查找所有标签
   * @returns 标签数组
   */
  findAll(): Promise<Tag[]>;

  /**
   * 删除标签
   * @param id 标签ID
   */
  delete(id: string): Promise<void>;

  /**
   * 根据名称查找标签
   * @param name 标签名称
   * @returns 标签对象或null
   */
  findByName(name: string): Promise<Tag | null>;
}

/**
 * 仓储工厂接口
 * 用于创建仓储实例
 */
export interface IRepositoryFactory {
  getTaskRepository(): ITaskRepository;
  getSessionRepository(): ISessionRepository;
  getSettingsRepository(): ISettingsRepository;
  getStatisticsRepository(): IStatisticsRepository;
  getTagRepository(): ITagRepository;
}

/**
 * Unit of Work 接口
 * 用于管理事务和批量操作
 */
export interface IUnitOfWork {
  tasks: ITaskRepository;
  sessions: ISessionRepository;
  settings: ISettingsRepository;
  statistics: IStatisticsRepository;
  tags: ITagRepository;

  /**
   * 提交所有更改
   */
  commit(): Promise<void>;

  /**
   * 回滚所有更改
   */
  rollback(): Promise<void>;

  /**
   * 开始事务
   */
  begin(): Promise<void>;

  /**
   * 完成事务
   */
  complete(): Promise<void>;
}
