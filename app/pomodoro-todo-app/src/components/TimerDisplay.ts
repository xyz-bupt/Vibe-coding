/**
 * 计时器显示组件
 */

import { TimerInfo, TimerMode, TimerState } from '../types';
import { eventEmitter } from '../utils/EventEmitter';

export class TimerDisplay {
    private container: HTMLElement;
    private minutesElement: HTMLElement;
    private secondsElement: HTMLElement;
    const statusElement: HTMLElement;
    private progressRing: HTMLElement;
    private timerStatus: HTMLElement;
    private statusIndicator: HTMLElement;
    private statusText: HTMLElement;
    private currentTaskDisplay: HTMLElement;

    // 进度环周长
    private readonly CIRCUMFERENCE = 2 * Math.PI * 90; // r=90

    constructor() {
        this.container = document.getElementById('timer-display')!;
        this.minutesElement = document.getElementById('timer-minutes')!;
        this.secondsElement = document.getElementById('timer-seconds')!;
        this.statusElement = document.getElementById('timer-status')!;
        this.progressRing = document.getElementById('progress-ring')!;
        this.timerStatus = document.querySelector('.timer-status')!;
        this.statusIndicator = document.querySelector('.status-indicator')!;
        this.statusText = document.querySelector('.status-text')!;
        this.currentTaskDisplay = document.getElementById('current-task-display')!;

        this.initializeEventListeners();
    }

    /**
     * 初始化事件监听器
     */
    private initializeEventListeners(): void {
        // 监听模式切换
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode') as TimerMode;
                this.setMode(mode);
                eventEmitter.emit('timer:modeChange', mode);
            });
        });

        // 监听计时器事件
        eventEmitter.on('timer:start', () => this.setState('running'));
        eventEmitter.on('timer:pause', () => this.setState('paused'));
        eventEmitter.on('timer:reset', () => this.setState('idle'));
        eventEmitter.on('timer:complete', () => this.onComplete());
    }

    /**
     * 更新时间显示
     */
    public updateTime(timeRemaining: number, totalTime: number): void {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;

        this.minutesElement.textContent = minutes.toString().padStart(2, '0');
        this.secondsElement.textContent = seconds.toString().padStart(2, '0');

        // 更新进度环
        this.updateProgress(timeRemaining, totalTime);
    }

    /**
     * 更新进度环
     */
    private updateProgress(timeRemaining: number, totalTime: number): void {
        const progress = (totalTime - timeRemaining) / totalTime;
        const offset = this.CIRCUMFERENCE * (1 - progress);
        this.progressRing.style.strokeDashoffset = offset.toString();
    }

    /**
     * 更新状态
     */
    public setState(state: TimerState): void {
        this.statusIndicator.classList.remove('paused', 'break');
        this.statusIndicator.classList.add('running');

        const toggleBtn = document.getElementById('timer-toggle-btn');
        const btnIcon = toggleBtn?.querySelector('.btn-icon');
        const btnText = toggleBtn?.querySelector('.btn-text');

        switch (state) {
            case 'idle':
                this.statusText.textContent = '准备就绪';
                this.statusIndicator.classList.remove('running');
                this.statusIndicator.style.backgroundColor = 'var(--color-success)';
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-label', '开始计时');
                    if (btnIcon) btnIcon.textContent = '▶';
                    if (btnText) btnText.textContent = '开始';
                }
                break;

            case 'running':
                this.statusText.textContent = '专注中...';
                this.statusIndicator.style.backgroundColor = 'var(--color-success)';
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-label', '暂停计时');
                    if (btnIcon) btnIcon.textContent = '⏸';
                    if (btnText) btnText.textContent = '暂停';
                }
                break;

            case 'paused':
                this.statusText.textContent = '已暂停';
                this.statusIndicator.classList.add('paused');
                this.statusIndicator.classList.remove('running');
                this.statusIndicator.style.backgroundColor = 'var(--color-warning)';
                if (toggleBtn) {
                    toggleBtn.setAttribute('aria-label', '继续计时');
                    if (btnIcon) btnIcon.textContent = '▶';
                    if (btnText) btnText.textContent = '继续';
                }
                break;

            case 'completed':
                this.statusText.textContent = '已完成';
                this.statusIndicator.classList.remove('running');
                this.statusIndicator.style.backgroundColor = 'var(--color-success)';
                break;
        }
    }

    /**
     * 设置计时器模式
     */
    public setMode(mode: TimerMode): void {
        // 更新按钮状态
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            const btnMode = btn.getAttribute('data-mode');
            const isActive = btnMode === mode;
            btn.classList.toggle('mode-btn-active', isActive);
            btn.setAttribute('aria-selected', isActive.toString());
        });

        // 更新进度环颜色
        if (mode === 'shortBreak' || mode === 'longBreak') {
            this.progressRing.classList.add('break');
            this.statusIndicator.classList.add('break');
        } else {
            this.progressRing.classList.remove('break');
            this.statusIndicator.classList.remove('break');
        }
    }

    /**
     * 完成时的效果
     */
    private onComplete(): void {
        this.setState('completed');
        this.flashScreen();
        this.playSound();
    }

    /**
     * 屏幕闪烁提醒
     */
    public flashScreen(color?: string): void {
        const flashColor = color || 'var(--color-primary-light)';
        const flashOverlay = document.createElement('div');
        flashOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: ${flashColor};
            opacity: 0.5;
            z-index: 9999;
            pointer-events: none;
            animation: flash 0.5s ease-in-out 3;
        `;

        document.body.appendChild(flashOverlay);

        setTimeout(() => {
            document.body.removeChild(flashOverlay);
        }, 1500);
    }

    /**
     * 播放提示音
     */
    private playSound(): void {
        // 使用 Web Audio API 生成提示音
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    /**
     * 显示进度
     */
    public showProgress(percent: number): void {
        // 这个方法可以用于显示更详细的进度信息
        const offset = this.CIRCUMFERENCE * (1 - percent / 100);
        this.progressRing.style.strokeDashoffset = offset.toString();
    }

    /**
     * 重置进度环
     */
    public resetProgress(): void {
        this.progressRing.style.strokeDashoffset = '0';
    }

    /**
     * 更新当前任务显示
     */
    public updateCurrentTask(taskTitle?: string): void {
        if (taskTitle) {
            this.currentTaskDisplay.innerHTML = `
                <p class="current-task-text active">当前任务：${this.escapeHtml(taskTitle)}</p>
            `;
        } else {
            this.currentTaskDisplay.innerHTML = `
                <p class="current-task-text">选择一个任务开始专注</p>
            `;
        }
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
     * 获取时间元素
     */
    public getTimeElements(): { minutes: HTMLElement; seconds: HTMLElement } {
        return {
            minutes: this.minutesElement,
            seconds: this.secondsElement
        };
    }
}
