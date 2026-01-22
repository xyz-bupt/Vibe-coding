/**
 * 设置对话框组件
 */

import { AppSettings, SettingsFormData } from '../types/index';
import { eventEmitter } from '../utils/EventEmitter';
import { toastManager } from '../utils/ToastManager';

export class SettingsModal {
  private modal: HTMLElement;
  private form: HTMLElement;
  private settings: AppSettings;

  constructor() {
    this.modal = document.getElementById('settings-modal')!;
    this.form = this.modal.querySelector('.modal-body')!;
    this.settings = this.loadSettings();

    this.initializeEventListeners();
    this.populateForm();
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    // 打开设置按钮
    const settingsBtn = document.getElementById('settings-btn');
    settingsBtn?.addEventListener('click', () => this.show());

    // 关闭按钮
    const closeButtons = this.modal.querySelectorAll(
      '[data-modal-close], [data-modal-cancel]'
    );
    closeButtons.forEach((btn) => {
      btn.addEventListener('click', () => this.hide());
    });

    // 保存按钮
    const saveBtn = this.modal.querySelector(
      '[data-modal-confirm]'
    ) as HTMLElement;
    saveBtn?.addEventListener('click', () => this.save());

    // 点击遮罩层关闭
    const overlay = this.modal.querySelector('[data-modal-overlay]');
    overlay?.addEventListener('click', () => this.hide());

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isShown()) {
        this.hide();
      }
    });
  }

  /**
   * 显示设置对话框
   */
  public show(): void {
    this.populateForm();
    this.modal.setAttribute('aria-hidden', 'false');
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  /**
   * 隐藏设置对话框
   */
  public hide(): void {
    this.modal.setAttribute('aria-hidden', 'true');
    this.modal.style.display = 'none';
    document.body.style.overflow = '';
  }

  /**
   * 检查是否显示
   */
  public isShown(): boolean {
    return this.modal.getAttribute('aria-hidden') === 'false';
  }

  /**
   * 填充表单
   */
  private populateForm(): void {
    const elements = {
      pomodoroDuration: document.getElementById(
        'pomodoro-duration'
      ) as HTMLInputElement,
      shortBreakDuration: document.getElementById(
        'short-break-duration'
      ) as HTMLInputElement,
      longBreakDuration: document.getElementById(
        'long-break-duration'
      ) as HTMLInputElement,
      longBreakInterval: document.getElementById(
        'long-break-interval'
      ) as HTMLInputElement,
      dailyGoal: document.getElementById('daily-goal') as HTMLInputElement,
      enableNotifications: document.getElementById(
        'enable-notifications'
      ) as HTMLInputElement,
      enableSound: document.getElementById('enable-sound') as HTMLInputElement,
      autoStartBreaks: document.getElementById(
        'auto-start-breaks'
      ) as HTMLInputElement,
      autoStartPomodoros: document.getElementById(
        'auto-start-pomodoros'
      ) as HTMLInputElement,
      themeSelect: document.getElementById('theme-select') as HTMLSelectElement,
    };

    elements.pomodoroDuration.value = (
      this.settings.timer.pomodoroDuration / 60
    ).toString();
    elements.shortBreakDuration.value = (
      this.settings.timer.shortBreakDuration / 60
    ).toString();
    elements.longBreakDuration.value = (
      this.settings.timer.longBreakDuration / 60
    ).toString();
    elements.longBreakInterval.value =
      this.settings.timer.longBreakInterval.toString();
    elements.dailyGoal.value = this.settings.dailyGoal.toString();
    elements.enableNotifications.checked = this.settings.notifications.enabled;
    elements.enableSound.checked = this.settings.notifications.sound;
    elements.autoStartBreaks.checked =
      this.settings.notifications.autoStartBreaks;
    elements.autoStartPomodoros.checked =
      this.settings.notifications.autoStartPomodoros;
    elements.themeSelect.value = this.settings.appearance.theme;
  }

  /**
   * 保存设置
   */
  public save(): void {
    const elements = {
      pomodoroDuration: document.getElementById(
        'pomodoro-duration'
      ) as HTMLInputElement,
      shortBreakDuration: document.getElementById(
        'short-break-duration'
      ) as HTMLInputElement,
      longBreakDuration: document.getElementById(
        'long-break-duration'
      ) as HTMLInputElement,
      longBreakInterval: document.getElementById(
        'long-break-interval'
      ) as HTMLInputElement,
      dailyGoal: document.getElementById('daily-goal') as HTMLInputElement,
      enableNotifications: document.getElementById(
        'enable-notifications'
      ) as HTMLInputElement,
      enableSound: document.getElementById('enable-sound') as HTMLInputElement,
      autoStartBreaks: document.getElementById(
        'auto-start-breaks'
      ) as HTMLInputElement,
      autoStartPomodoros: document.getElementById(
        'auto-start-pomodoros'
      ) as HTMLInputElement,
      themeSelect: document.getElementById('theme-select') as HTMLSelectElement,
    };

    const formData: SettingsFormData = {
      pomodoroDuration: parseInt(elements.pomodoroDuration.value, 10) * 60,
      shortBreakDuration: parseInt(elements.shortBreakDuration.value, 10) * 60,
      longBreakDuration: parseInt(elements.longBreakDuration.value, 10) * 60,
      longBreakInterval: parseInt(elements.longBreakInterval.value, 10),
      dailyGoal: parseInt(elements.dailyGoal.value, 10),
      enableNotifications: elements.enableNotifications.checked,
      enableSound: elements.enableSound.checked,
      autoStartBreaks: elements.autoStartBreaks.checked,
      autoStartPomodoros: elements.autoStartPomodoros.checked,
      theme: elements.themeSelect.value as 'light' | 'dark' | 'auto',
    };

    if (!this.validate(formData)) {
      return;
    }

    // 更新设置
    this.settings = {
      timer: {
        pomodoroDuration: formData.pomodoroDuration,
        shortBreakDuration: formData.shortBreakDuration,
        longBreakDuration: formData.longBreakDuration,
        longBreakInterval: formData.longBreakInterval,
      },
      notifications: {
        enabled: formData.enableNotifications,
        sound: formData.enableSound,
        autoStartBreaks: formData.autoStartBreaks,
        autoStartPomodoros: formData.autoStartPomodoros,
      },
      appearance: {
        theme: formData.theme,
      },
      dailyGoal: formData.dailyGoal,
    };

    // 保存到本地存储
    this.saveToStorage();

    // 应用主题
    this.applyTheme();

    // 触发设置更新事件
    eventEmitter.emit('settings:update', this.settings);

    toastManager.success('设置已保存', '您的设置已成功保存');

    this.hide();
  }

  /**
   * 验证设置
   */
  private validate(data: SettingsFormData): boolean {
    // 验证时长范围
    if (data.pomodoroDuration < 60 || data.pomodoroDuration > 3600) {
      toastManager.error('验证失败', '专注时长必须在 1-60 分钟之间');
      return false;
    }

    if (data.shortBreakDuration < 60 || data.shortBreakDuration > 1800) {
      toastManager.error('验证失败', '短休息时长必须在 1-30 分钟之间');
      return false;
    }

    if (data.longBreakDuration < 60 || data.longBreakDuration > 3600) {
      toastManager.error('验证失败', '长休息时长必须在 1-60 分钟之间');
      return false;
    }

    if (data.longBreakInterval < 2 || data.longBreakInterval > 10) {
      toastManager.error('验证失败', '长休息间隔必须在 2-10 之间');
      return false;
    }

    if (data.dailyGoal < 1 || data.dailyGoal > 20) {
      toastManager.error('验证失败', '每日目标必须在 1-20 之间');
      return false;
    }

    return true;
  }

  /**
   * 加载设置
   */
  private loadSettings(): AppSettings {
    const stored = localStorage.getItem('app_settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }

    // 返回默认设置
    return {
      timer: {
        pomodoroDuration: 25 * 60,
        shortBreakDuration: 5 * 60,
        longBreakDuration: 15 * 60,
        longBreakInterval: 4,
      },
      notifications: {
        enabled: true,
        sound: true,
        autoStartBreaks: false,
        autoStartPomodoros: false,
      },
      appearance: {
        theme: 'light',
      },
      dailyGoal: 8,
    };
  }

  /**
   * 保存到本地存储
   */
  private saveToStorage(): void {
    localStorage.setItem('app_settings', JSON.stringify(this.settings));
  }

  /**
   * 应用主题
   */
  private applyTheme(): void {
    const theme = this.settings.appearance.theme;

    if (theme === 'auto') {
      // 检测系统主题
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      document.documentElement.setAttribute(
        'data-theme',
        prefersDark ? 'dark' : 'light'
      );

      // 监听系统主题变化
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => {
          if (this.settings.appearance.theme === 'auto') {
            document.documentElement.setAttribute(
              'data-theme',
              e.matches ? 'dark' : 'light'
            );
          }
        });
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }

  /**
   * 获取当前设置
   */
  public getSettings(): AppSettings {
    return this.settings;
  }

  /**
   * 更新设置
   */
  public updateSettings(settings: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveToStorage();
    this.applyTheme();
  }
}
