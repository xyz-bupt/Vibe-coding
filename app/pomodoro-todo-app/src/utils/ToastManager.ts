/**
 * Toast 通知管理器
 */

import { ToastOptions, ToastType } from '../types/index';

export class ToastManager {
  private container: HTMLElement;
  private toasts: Map<HTMLElement, { timeoutId?: number }>;

  constructor() {
    this.container = document.getElementById('toast-container')!;
    this.toasts = new Map();
  }

  /**
   * 显示 Toast 通知
   */
  show(options: ToastOptions): HTMLElement {
    const toast = this.createToast(options);
    this.container.appendChild(toast);

    const timeoutId =
      options.duration !== false
        ? window.setTimeout(() => this.hide(toast), options.duration || 5000)
        : undefined;

    this.toasts.set(toast, { timeoutId });

    return toast;
  }

  /**
   * 隐藏 Toast 通知
   */
  hide(toast: HTMLElement): void {
    const toastData = this.toasts.get(toast);
    if (toastData?.timeoutId) {
      clearTimeout(toastData.timeoutId);
    }

    toast.style.animation = 'toastSlideOut 0.3s ease-out forwards';
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
      this.toasts.delete(toast);
    }, 300);
  }

  /**
   * 创建 Toast 元素
   */
  private createToast(options: ToastOptions): HTMLElement {
    const toast = document.createElement('div');
    toast.className = `toast toast-${options.type}`;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');

    const icon = this.getIcon(options.type);

    let actionsHTML = '';
    if (options.actions) {
      actionsHTML = `
                <div class="toast-actions">
                    ${options.actions
                      .map(
                        (action) => `
                        <button
                            class="btn ${action.primary ? 'btn-primary' : 'btn-secondary'} btn-small"
                            data-action="true">
                            ${action.label}
                        </button>
                    `
                      )
                      .join('')}
                </div>
            `;
    }

    toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${this.escapeHtml(options.title)}</div>
                <div class="toast-message">${this.escapeHtml(options.message)}</div>
                ${actionsHTML}
            </div>
            <button class="toast-close" aria-label="关闭通知">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

    // 添加事件监听器
    const closeBtn = toast.querySelector('.toast-close') as HTMLElement;
    closeBtn.addEventListener('click', () => this.hide(toast));

    if (options.actions) {
      const actionButtons = toast.querySelectorAll('[data-action="true"]');
      actionButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
          options.actions![index].onClick();
          this.hide(toast);
        });
      });
    }

    return toast;
  }

  /**
   * 获取图标
   */
  private getIcon(type: ToastType): string {
    const icons: Record<ToastType, string> = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[type] || icons.info;
  }

  /**
   * 转义 HTML
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 便捷方法：成功通知
   */
  success(title: string, message: string, duration?: number): HTMLElement {
    return this.show({ type: 'success', title, message, duration });
  }

  /**
   * 便捷方法：错误通知
   */
  error(title: string, message: string, duration?: number): HTMLElement {
    return this.show({ type: 'error', title, message, duration });
  }

  /**
   * 便捷方法：警告通知
   */
  warning(title: string, message: string, duration?: number): HTMLElement {
    return this.show({ type: 'warning', title, message, duration });
  }

  /**
   * 便捷方法：信息通知
   */
  info(title: string, message: string, duration?: number): HTMLElement {
    return this.show({ type: 'info', title, message, duration });
  }

  /**
   * 清除所有通知
   */
  clearAll(): void {
    this.toasts.forEach((_, toast) => this.hide(toast));
  }
}

// 创建全局实例
export const toastManager = new ToastManager();
