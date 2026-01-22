/**
 * 事件发射器类
 * 用于组件之间的通信
 */

import { EventListener, EventType } from '../types/index';

export class EventEmitter {
  private listeners: Map<EventType, Set<EventListener>>;

  // Track listener metadata for debugging and leak detection
  private listenerMetadata: WeakMap<
    EventListener,
    {
      createdAt: number;
      component?: string;
      removedAt?: number;
    }
  > = new WeakMap();

  constructor() {
    this.listeners = new Map();
  }

  /**
   * 注册事件监听器
   */
  on(event: EventType, listener: EventListener, componentName?: string): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);

    // Track metadata for debugging
    this.listenerMetadata.set(listener, {
      createdAt: Date.now(),
      component: componentName,
    });

    // Warn about potential memory leaks
    this.warnIfTooManyListeners(event);
  }

  /**
   * 注册一次性事件监听器
   */
  once(
    event: EventType,
    listener: EventListener,
    componentName?: string
  ): void {
    const onceListener: EventListener = (data) => {
      listener(data);
      this.off(event, onceListener);
    };
    this.on(event, onceListener, componentName);
  }

  /**
   * 移除事件监听器
   */
  off(event: EventType, listener: EventListener): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }

    // Mark as removed in metadata
    const metadata = this.listenerMetadata.get(listener);
    if (metadata) {
      metadata.removedAt = Date.now();
    }
  }

  /**
   * 触发事件
   */
  emit(event: EventType, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * 移除所有事件监听器
   */
  removeAllListeners(event?: EventType): void {
    if (event) {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.forEach((listener) => {
          const metadata = this.listenerMetadata.get(listener);
          if (metadata) {
            metadata.removedAt = Date.now();
          }
        });
      }
      this.listeners.delete(event);
    } else {
      this.listeners.forEach((listeners) => {
        listeners.forEach((listener) => {
          const metadata = this.listenerMetadata.get(listener);
          if (metadata) {
            metadata.removedAt = Date.now();
          }
        });
      });
      this.listeners.clear();
    }
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: EventType): number {
    return this.listeners.get(event)?.size || 0;
  }

  /**
   * Get all event names with listeners
   */
  getEvents(): EventType[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Get listener metadata for debugging
   */
  getListenerMetadata(listener: EventListener) {
    return this.listenerMetadata.get(listener);
  }

  /**
   * Check for potential memory leaks
   */
  private warnIfTooManyListeners(event: EventType): void {
    const count = this.listenerCount(event);
    const threshold = 10; // Warning threshold

    if (count > threshold) {
      console.warn(
        `[EventEmitter] Potential memory leak detected: Event "${event}" has ${count} listeners. ` +
          `Consider removing unused listeners.`
      );
    }
  }

  /**
   * Get statistics about listeners (for debugging)
   */
  getStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    this.listeners.forEach((_, event) => {
      stats[event as string] = this.listenerCount(event);
    });
    return stats;
  }

  /**
   * Log all active listeners for debugging
   */
  logActiveListeners(): void {
    console.group('[EventEmitter] Active Listeners');
    this.listeners.forEach((listeners, event) => {
      console.log(`${event}: ${listeners.size} listener(s)`);

      // Log metadata for each listener if available
      listeners.forEach((listener) => {
        const metadata = this.listenerMetadata.get(listener);
        if (metadata) {
          const age = Date.now() - metadata.createdAt;
          console.log(
            `  - Created ${age}ms ago by ${metadata.component || 'unknown'}`
          );
        }
      });
    });
    console.groupEnd();
  }
}

// 创建全局事件发射器实例
export const eventEmitter = new EventEmitter();
