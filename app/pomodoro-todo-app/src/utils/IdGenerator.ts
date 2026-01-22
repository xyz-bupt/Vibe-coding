/**
 * ID Generator Utility
 * 生成唯一标识符的工具类
 */

/**
 * 生成UUID v4
 * @returns UUID字符串
 */
export function generateUUID(): string {
  // 检测环境支持
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // 后备实现
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 生成短ID（用于显示）
 * @returns 短ID字符串（8位）
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * 生成时间戳ID（包含时间信息）
 * @returns 时间戳ID字符串
 */
export function generateTimestampId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * 生成任务ID
 * @returns 任务ID
 */
export function generateTaskId(): string {
  return `task-${generateUUID()}`;
}

/**
 * 生成会话ID
 * @returns 会话ID
 */
export function generateSessionId(): string {
  return `session-${generateUUID()}`;
}

/**
 * 生成标签ID
 * @returns 标签ID
 */
export function generateTagId(): string {
  return `tag-${generateUUID()}`;
}
