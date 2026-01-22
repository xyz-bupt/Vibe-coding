/**
 * Validation Utilities
 * 数据验证工具函数
 */

import { Task, Session, Settings, Tag } from '../types/index';

/**
 * 验证任务对象
 * @param task 任务对象
 * @returns 验证结果
 */
export function validateTask(task: Partial<Task>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 验证必填字段
  if (!task.title || task.title.trim().length === 0) {
    errors.push('任务标题不能为空');
  }

  if (task.title && task.title.length > 200) {
    errors.push('任务标题不能超过200个字符');
  }

  if (task.description && task.description.length > 1000) {
    errors.push('任务描述不能超过1000个字符');
  }

  // 验证优先级
  if (task.priority && !['low', 'medium', 'high'].includes(task.priority)) {
    errors.push('无效的优先级值');
  }

  // 验证状态
  if (task.status && !['todo', 'in_progress', 'done'].includes(task.status)) {
    errors.push('无效的状态值');
  }

  // 验证番茄数
  if (
    task.estimatedPomodoros !== undefined &&
    (task.estimatedPomodoros < 0 || task.estimatedPomodoros > 100)
  ) {
    errors.push('预估番茄数必须在0-100之间');
  }

  if (
    task.actualPomodoros !== undefined &&
    (task.actualPomodoros < 0 || task.actualPomodoros > 1000)
  ) {
    errors.push('实际番茄数必须在0-1000之间');
  }

  // 验证截止日期
  if (task.dueDate && task.dueDate < Date.now()) {
    errors.push('截止日期不能早于当前时间');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 验证会话对象
 * @param session 会话对象
 * @returns 验证结果
 */
export function validateSession(session: Partial<Session>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 验证会话类型
  if (
    session.type &&
    !['work', 'short_break', 'long_break'].includes(session.type)
  ) {
    errors.push('无效的会话类型');
  }

  // 验证时长
  if (
    session.plannedDuration !== undefined &&
    (session.plannedDuration <= 0 || session.plannedDuration > 120)
  ) {
    errors.push('计划时长必须在1-120分钟之间');
  }

  if (session.actualDuration !== undefined && session.actualDuration < 0) {
    errors.push('实际时长不能为负数');
  }

  // 验证时间
  if (session.startTime && session.startTime > Date.now()) {
    errors.push('开始时间不能晚于当前时间');
  }

  if (
    session.endTime &&
    session.startTime &&
    session.endTime < session.startTime
  ) {
    errors.push('结束时间不能早于开始时间');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 验证设置对象
 * @param settings 设置对象
 * @returns 验证结果
 */
export function validateSettings(settings: Partial<Settings>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 验证番茄钟时长
  if (
    settings.workDuration !== undefined &&
    (settings.workDuration < 1 || settings.workDuration > 60)
  ) {
    errors.push('工作时长必须在1-60分钟之间');
  }

  if (
    settings.shortBreakDuration !== undefined &&
    (settings.shortBreakDuration < 1 || settings.shortBreakDuration > 30)
  ) {
    errors.push('短休息时长必须在1-30分钟之间');
  }

  if (
    settings.longBreakDuration !== undefined &&
    (settings.longBreakDuration < 1 || settings.longBreakDuration > 60)
  ) {
    errors.push('长休息时长必须在1-60分钟之间');
  }

  // 验证长休息间隔
  if (
    settings.longBreakInterval !== undefined &&
    (settings.longBreakInterval < 2 || settings.longBreakInterval > 10)
  ) {
    errors.push('长休息间隔必须在2-10之间');
  }

  // 验证每日目标
  if (
    settings.dailyGoal !== undefined &&
    (settings.dailyGoal < 1 || settings.dailyGoal > 20)
  ) {
    errors.push('每日目标必须在1-20之间');
  }

  // 验证主题
  if (settings.theme && !['light', 'dark', 'system'].includes(settings.theme)) {
    errors.push('无效的主题值');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 验证标签对象
 * @param tag 标签对象
 * @returns 验证结果
 */
export function validateTag(tag: Partial<Tag>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // 验证名称
  if (!tag.name || tag.name.trim().length === 0) {
    errors.push('标签名称不能为空');
  }

  if (tag.name && tag.name.length > 50) {
    errors.push('标签名称不能超过50个字符');
  }

  // 验证颜色格式
  if (tag.color && !/^#[0-9A-F]{6}$/i.test(tag.color)) {
    errors.push('无效的颜色格式，应为十六进制格式（如 #FF0000）');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 验证邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证URL格式
 * @param url URL地址
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证字符串长度
 * @param str 字符串
 * @param min 最小长度
 * @param max 最大长度
 * @returns 是否有效
 */
export function isValidLength(str: string, min: number, max: number): boolean {
  return str.length >= min && str.length <= max;
}

/**
 * 清理用户输入（防止XSS）
 * @param input 用户输入
 * @returns 清理后的字符串
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

/**
 * 验证并清理任务标题
 * @param title 任务标题
 * @returns 清理后的标题
 */
export function sanitizeTaskTitle(title: string): string {
  const sanitized = sanitizeInput(title);
  if (sanitized.length > 200) {
    return sanitized.substring(0, 200);
  }
  return sanitized;
}

/**
 * 验证并清理任务描述
 * @param description 任务描述
 * @returns 清理后的描述
 */
export function sanitizeTaskDescription(description: string): string {
  const sanitized = sanitizeInput(description);
  if (sanitized.length > 1000) {
    return sanitized.substring(0, 1000);
  }
  return sanitized;
}
