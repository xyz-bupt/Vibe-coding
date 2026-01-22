/**
 * 事件发射器类
 * 用于组件之间的通信
 */

import { EventListener, EventType } from '../types';

export class EventEmitter {
    private listeners: Map<EventType, Set<EventListener>>;

    constructor() {
        this.listeners = new Map();
    }

    /**
     * 注册事件监听器
     */
    on(event: EventType, listener: EventListener): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(listener);
    }

    /**
     * 注册一次性事件监听器
     */
    once(event: EventType, listener: EventListener): void {
        const onceListener: EventListener = (data) => {
            listener(data);
            this.off(event, onceListener);
        };
        this.on(event, onceListener);
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
    }

    /**
     * 触发事件
     */
    emit(event: EventType, data?: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(listener => {
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
            this.listeners.delete(event);
        } else {
            this.listeners.clear();
        }
    }

    /**
     * 获取事件监听器数量
     */
    listenerCount(event: EventType): number {
        return this.listeners.get(event)?.size || 0;
    }
}

// 创建全局事件发射器实例
export const eventEmitter = new EventEmitter();
