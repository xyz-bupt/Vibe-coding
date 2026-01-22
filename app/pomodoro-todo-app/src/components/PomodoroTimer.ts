/**
 * 番茄钟计时器核心逻辑
 */

import { TimerInfo, TimerMode, TimerState, AppSettings } from '../types';
import { eventEmitter } from '../utils/EventEmitter';
import { toastManager } from '../utils/ToastManager';

export class PomodoroTimer {
    private mode: TimerMode = 'pomodoro';
    private state: TimerState = 'idle';
    private timeRemaining: number = 25 * 60; // 秒
    private totalTime: number = 25 * 60; // 秒
    private completedPomodoros: number = 0;
    private intervalId: number | null = null;
    private currentTaskId: string | null = null;
    private settings: AppSettings;

    constructor(settings: AppSettings) {
        this.settings = settings;
        this.initializeEventListeners();
        this.updateTimerConfig();
    }

    /**
     * 初始化事件监听器
     */
    private initializeEventListeners(): void {
        // 开始/暂停按钮
        const toggleBtn = document.getElementById('timer-toggle-btn');
        toggleBtn?.addEventListener('click', () => this.toggle());

        // 重置按钮
        const resetBtn = document.getElementById('timer-reset-btn');
        resetBtn?.addEventListener('click', () => this.reset());

        // 跳过按钮
        const skipBtn = document.getElementById('timer-skip-btn');
        skipBtn?.addEventListener('click', () => this.skip());

        // 监听设置更新
        eventEmitter.on('settings:update', (settings: AppSettings) => {
            this.settings = settings;
            this.updateTimerConfig();
        });

        // 监听任务激活
        eventEmitter.on('task:activated', (task: any) => {
            this.currentTaskId = task.id;
        });

        // 监听模式切换
        eventEmitter.on('timer:modeChange', (mode: TimerMode) => {
            this.setMode(mode);
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            // 空格键开始/暂停（仅在未聚焦输入框时）
            if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                this.toggle();
            }

            // Alt+R 重置
            if (e.altKey && e.key === 'r') {
                e.preventDefault();
                this.reset();
            }

            // Alt+1/2/3 切换模式
            if (e.altKey && e.key === '1') {
                e.preventDefault();
                eventEmitter.emit('timer:modeChange', 'pomodoro');
            }
            if (e.altKey && e.key === '2') {
                e.preventDefault();
                eventEmitter.emit('timer:modeChange', 'shortBreak');
            }
            if (e.altKey && e.key === '3') {
                e.preventDefault();
                eventEmitter.emit('timer:modeChange', 'longBreak');
            }
        });
    }

    /**
     * 更新计时器配置
     */
    private updateTimerConfig(): void {
        if (this.state === 'idle') {
            this.setMode(this.mode);
        }
    }

    /**
     * 切换开始/暂停
     */
    public toggle(): void {
        if (this.state === 'running') {
            this.pause();
        } else {
            this.start();
        }
    }

    /**
     * 开始计时
     */
    public start(): void {
        if (this.state === 'running') return;

        this.state = 'running';
        eventEmitter.emit('timer:start');

        this.intervalId = window.setInterval(() => {
            this.tick();
        }, 1000);

        toastManager.info(
            this.getModeLabel(),
            `开始 ${this.getModeLabel()} - ${this.formatTime(this.timeRemaining)}`
        );
    }

    /**
     * 暂停计时
     */
    public pause(): void {
        if (this.state !== 'running') return;

        this.state = 'paused';
        eventEmitter.emit('timer:pause');

        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        toastManager.info('计时已暂停', `剩余时间：${this.formatTime(this.timeRemaining)}`);
    }

    /**
     * 重置计时
     */
    public reset(): void {
        if (this.state === 'running') {
            this.pause();
        }

        this.timeRemaining = this.totalTime;
        this.state = 'idle';
        eventEmitter.emit('timer:reset');
        eventEmitter.emit('timer:update', this.getInfo());

        toastManager.info('计时已重置', `计时器已重置为 ${this.formatTime(this.timeRemaining)}`);
    }

    /**
     * 跳过当前时段
     */
    public skip(): void {
        this.complete();
    }

    /**
     * 计时器滴答
     */
    private tick(): void {
        this.timeRemaining--;

        eventEmitter.emit('timer:update', this.getInfo());

        if (this.timeRemaining <= 0) {
            this.complete();
        }
    }

    /**
     * 完成当前时段
     */
    private complete(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.state = 'completed';
        eventEmitter.emit('timer:complete');

        // 如果是番茄钟，增加计数
        if (this.mode === 'pomodoro') {
            this.completedPomodoros++;
            this.saveCompletedPomodoro();

            // 通知统计面板
            eventEmitter.emit('pomodoro:completed', {
                count: this.completedPomodoros,
                taskId: this.currentTaskId
            });

            toastManager.success(
                '番茄钟完成！',
                `已完成 ${this.completedPomodoros} 个番茄钟，休息一下吧！`
            );

            // 切换到休息模式
            if (this.completedPomodoros % this.settings.timer.longBreakInterval === 0) {
                this.setMode('longBreak');
            } else {
                this.setMode('shortBreak');
            }

            // 自动开始休息（如果设置启用）
            if (this.settings.notifications.autoStartBreaks) {
                setTimeout(() => this.start(), 1000);
            }
        } else {
            // 休息完成，切换回番茄钟
            toastManager.success('休息结束！', '准备好开始新的专注了吗？');
            this.setMode('pomodoro');

            // 自动开始番茄钟（如果设置启用）
            if (this.settings.notifications.autoStartPomodoros) {
                setTimeout(() => this.start(), 1000);
            }
        }
    }

    /**
     * 设置模式
     */
    public setMode(mode: TimerMode): void {
        // 如果正在运行，先暂停
        if (this.state === 'running') {
            this.pause();
        }

        this.mode = mode;

        // 设置时长
        switch (mode) {
            case 'pomodoro':
                this.totalTime = this.settings.timer.pomodoroDuration;
                break;
            case 'shortBreak':
                this.totalTime = this.settings.timer.shortBreakDuration;
                break;
            case 'longBreak':
                this.totalTime = this.settings.timer.longBreakDuration;
                break;
        }

        this.timeRemaining = this.totalTime;
        this.state = 'idle';

        eventEmitter.emit('timer:modeChange', mode);
        eventEmitter.emit('timer:update', this.getInfo());
    }

    /**
     * 保存完成的番茄钟
     */
    private saveCompletedPomodoro(): void {
        const today = new Date();
        const dateKey = this.formatDateKey(today);

        const currentCount = parseInt(localStorage.getItem(`pomodoros_${dateKey}`) || '0', 10);
        localStorage.setItem(`pomodoros_${dateKey}`, (currentCount + 1).toString());
    }

    /**
     * 格式化日期键
     */
    private formatDateKey(date: Date): string {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    /**
     * 格式化时间
     */
    private formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * 获取模式标签
     */
    private getModeLabel(): string {
        const labels: Record<TimerMode, string> = {
            pomodoro: '番茄钟',
            shortBreak: '短休息',
            longBreak: '长休息'
        };
        return labels[this.mode];
    }

    /**
     * 获取计时器信息
     */
    public getInfo(): TimerInfo {
        return {
            mode: this.mode,
            state: this.state,
            timeRemaining: this.timeRemaining,
            totalTime: this.totalTime,
            completedPomodoros: this.completedPomodoros,
            currentTaskId: this.currentTaskId || undefined
        };
    }

    /**
     * 获取当前模式
     */
    public getMode(): TimerMode {
        return this.mode;
    }

    /**
     * 获取当前状态
     */
    public getState(): TimerState {
        return this.state;
    }

    /**
     * 销毁计时器
     */
    public destroy(): void {
        if (this.intervalId !== null) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
