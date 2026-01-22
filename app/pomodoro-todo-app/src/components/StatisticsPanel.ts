/**
 * 统计面板组件
 */

import { DailyStatistics, TotalStatistics, CalendarDay } from '../types';

export class StatisticsPanel {
    private container: HTMLElement;
    private weekCalendar: HTMLElement;

    constructor() {
        this.container = document.getElementById('stats-section')!;
        this.weekCalendar = document.getElementById('week-calendar')!;
    }

    /**
     * 渲染统计面板
     */
    public render(): void {
        this.renderWeekCalendar();
    }

    /**
     * 更新每日统计
     */
    public updateDailyStats(stats: DailyStatistics): void {
        const pomodoroCount = document.getElementById('stat-pomodoros-count')!;
        const focusTime = document.getElementById('stat-focus-time')!;
        const tasksCompleted = document.getElementById('stat-tasks-count')!;
        const goalProgress = document.getElementById('stat-goal-progress')!;
        const goalTarget = document.getElementById('stat-goal-target')!;

        pomodoroCount.textContent = stats.pomodoroCount.toString();
        focusTime.textContent = stats.focusTime.toString();
        tasksCompleted.textContent = stats.completedTasks.toString();
        goalProgress.textContent = stats.pomodoroCount.toString();
        goalTarget.textContent = stats.goal.toString();
    }

    /**
     * 更新总体统计
     */
    public updateTotalStats(stats: TotalStatistics): void {
        // 如果需要显示总体统计，可以在这里实现
        console.log('Total stats:', stats);
    }

    /**
     * 显示周历
     */
    public showCalendar(): void {
        this.renderWeekCalendar();
    }

    /**
     * 渲染周历
     */
    private renderWeekCalendar(): void {
        const weekData = this.getWeekData();
        this.weekCalendar.innerHTML = '';

        weekData.forEach(day => {
            const dayElement = this.renderCalendarDay(day);
            this.weekCalendar.appendChild(dayElement);
        });
    }

    /**
     * 渲染日历日
     */
    private renderCalendarDay(day: CalendarDay): HTMLElement {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        if (day.isToday) {
            dayElement.classList.add('today');
        }

        const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const dayName = dayNames[day.date.getDay()];

        dayElement.innerHTML = `
            <span class="calendar-day-name">${dayName}</span>
            <span class="calendar-day-date">${day.date.getDate()}</span>
            <span class="calendar-day-pomodoros">
                <span class="calendar-day-pomodoros-icon">🍅</span>
                ${day.pomodoroCount}
            </span>
        `;

        return dayElement;
    }

    /**
     * 获取本周数据
     */
    private getWeekData(): CalendarDay[] {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);

        const weekData: CalendarDay[] = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);

            // 这里应该从存储中获取实际的番茄钟数量
            // 暂时使用模拟数据
            const pomodoroCount = this.getStoredPomodoroCount(date);

            weekData.push({
                date,
                pomodoroCount,
                isToday: date.toDateString() === today.toDateString()
            });
        }

        return weekData;
    }

    /**
     * 获取存储的番茄钟数量
     */
    private getStoredPomodoroCount(date: Date): number {
        const dateKey = this.formatDateKey(date);
        const stored = localStorage.getItem(`pomodoros_${dateKey}`);
        return stored ? parseInt(stored, 10) : 0;
    }

    /**
     * 保存番茄钟数量
     */
    public savePomodoroCount(date: Date, count: number): void {
        const dateKey = this.formatDateKey(date);
        localStorage.setItem(`pomodoros_${dateKey}`, count.toString());
        this.renderWeekCalendar();
    }

    /**
     * 格式化日期键
     */
    private formatDateKey(date: Date): string {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    /**
     * 增加今日番茄钟计数
     */
    public incrementTodayPomodoros(): void {
        const today = new Date();
        const currentCount = this.getStoredPomodoroCount(today);
        this.savePomodoroCount(today, currentCount + 1);
    }

    /**
     * 获取今日统计
     */
    public getTodayStats(): DailyStatistics {
        const today = new Date();
        const pomodoroCount = this.getStoredPomodoroCount(today);
        const focusTime = pomodoroCount * 25; // 假设每个番茄钟 25 分钟

        // 从存储中获取完成任务数
        const tasksCompleted = this.getStoredCompletedTasks(today);

        // 从存储中获取每日目标
        const goal = parseInt(localStorage.getItem('dailyGoal') || '8', 10);

        return {
            date: today,
            pomodoroCount,
            focusTime,
            completedTasks: tasksCompleted,
            goal
        };
    }

    /**
     * 获取存储的完成任务数
     */
    private getStoredCompletedTasks(date: Date): number {
        const dateKey = this.formatDateKey(date);
        const stored = localStorage.getItem(`completed_tasks_${dateKey}`);
        return stored ? parseInt(stored, 10) : 0;
    }

    /**
     * 保存完成任务数
     */
    public saveCompletedTasks(date: Date, count: number): void {
        const dateKey = this.formatDateKey(date);
        localStorage.setItem(`completed_tasks_${dateKey}`, count.toString());
    }

    /**
     * 增加今日完成任务数
     */
    public incrementCompletedTasks(): void {
        const today = new Date();
        const currentCount = this.getStoredCompletedTasks(today);
        this.saveCompletedTasks(today, currentCount + 1);
    }
}
