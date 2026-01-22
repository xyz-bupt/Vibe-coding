/**
 * 任务列表组件
 */

import { Task, TaskFilter } from '../types';
import { eventEmitter } from '../utils/EventEmitter';
import { toastManager } from '../utils/ToastManager';

export class TaskList {
    private container: HTMLElement;
    private tasks: Task[] = [];
    private currentFilter: TaskFilter = 'all';
    private activeTaskId: string | null = null;

    constructor() {
        this.container = document.getElementById('task-list')!;
        this.initializeEventListeners();
    }

    /**
     * 初始化事件监听器
     */
    private initializeEventListeners(): void {
        // 监听过滤器变化
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter') as TaskFilter;
                this.setFilter(filter);
            });
        });

        // 监听任务事件
        eventEmitter.on('task:add', (task: Task) => this.addTask(task));
        eventEmitter.on('task:update', (task: Task) => this.updateTask(task));
        eventEmitter.on('task:delete', (id: string) => this.deleteTask(id));
        eventEmitter.on('task:complete', (id: string) => this.toggleTaskComplete(id));
        eventEmitter.on('task:activate', (id: string) => this.setActiveTask(id));
    }

    /**
     * 设置过滤器
     */
    private setFilter(filter: TaskFilter): void {
        this.currentFilter = filter;

        // 更新按钮状态
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            const btnFilter = btn.getAttribute('data-filter');
            const isActive = btnFilter === filter;
            btn.classList.toggle('filter-btn-active', isActive);
            btn.setAttribute('aria-pressed', isActive.toString());
        });

        this.render();
    }

    /**
     * 渲染任务列表
     */
    public render(): void {
        const filteredTasks = this.getFilteredTasks();
        this.updateCounts();

        if (filteredTasks.length === 0) {
            this.renderEmptyState();
            return;
        }

        this.container.innerHTML = '';
        filteredTasks.forEach(task => {
            const taskElement = this.renderTask(task);
            this.container.appendChild(taskElement);
        });
    }

    /**
     * 获取过滤后的任务
     */
    private getFilteredTasks(): Task[] {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(task => task.status === 'active');
            case 'completed':
                return this.tasks.filter(task => task.status === 'completed');
            default:
                return this.tasks;
        }
    }

    /**
     * 渲染空状态
     */
    private renderEmptyState(): void {
        const messages: Record<TaskFilter, { icon: string; text: string; hint: string }> = {
            all: { icon: '📝', text: '还没有任务', hint: '点击"添加任务"开始使用' },
            active: { icon: '🎯', text: '没有进行中的任务', hint: '添加新任务或从已完成任务中选择' },
            completed: { icon: '✅', text: '还没有完成任何任务', hint: '完成任务后会显示在这里' }
        };

        const message = messages[this.currentFilter];

        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon" aria-hidden="true">${message.icon}</div>
                <p>${message.text}</p>
                <p class="empty-hint">${message.hint}</p>
            </div>
        `;
    }

    /**
     * 渲染单个任务
     */
    private renderTask(task: Task): HTMLElement {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.setAttribute('role', 'listitem');
        taskElement.dataset.taskId = task.id;

        const isActive = this.activeTaskId === task.id;
        const isCompleted = task.status === 'completed';

        taskElement.classList.toggle('active-task', isActive);
        taskElement.classList.toggle('completed', isCompleted);

        const priorityClass = `task-priority-${task.priority}`;
        const progressPercent = (task.completedPomodoros / task.estimatedPomodoros) * 100;

        taskElement.innerHTML = `
            <label class="task-checkbox">
                <input
                    type="checkbox"
                    ${isCompleted ? 'checked' : ''}
                    aria-label="标记任务为完成">
                <span class="task-checkbox-custom"></span>
            </label>

            <div class="task-content">
                <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                ${task.description ? `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}

                <div class="task-meta">
                    <span class="task-priority ${priorityClass}">
                        ${this.getPriorityLabel(task.priority)}
                    </span>
                    <span class="task-pomodoros">
                        <span class="task-pomodoros-icon">🍅</span>
                        <span class="task-pomodoros-count ${task.completedPomodoros > 0 ? 'completed' : ''}">
                            ${task.completedPomodoros}
                        </span>
                        / ${task.estimatedPomodoros}
                    </span>
                </div>
            </div>

            <div class="task-actions">
                <button
                    class="task-action-btn play"
                    aria-label="开始专注此任务"
                    title="开始专注">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                </button>
                <button
                    class="task-action-btn edit"
                    aria-label="编辑任务"
                    title="编辑">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
                <button
                    class="task-action-btn delete"
                    aria-label="删除任务"
                    title="删除">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;

        // 添加事件监听器
        this.attachTaskEventListeners(taskElement, task);

        return taskElement;
    }

    /**
     * 为任务元素添加事件监听器
     */
    private attachTaskEventListeners(element: HTMLElement, task: Task): void {
        const checkbox = element.querySelector('input[type="checkbox"]') as HTMLInputElement;
        const playBtn = element.querySelector('.task-action-btn.play') as HTMLElement;
        const editBtn = element.querySelector('.task-action-btn.edit') as HTMLElement;
        const deleteBtn = element.querySelector('.task-action-btn.delete') as HTMLElement;

        checkbox.addEventListener('change', () => {
            this.toggleTaskComplete(task.id);
        });

        playBtn.addEventListener('click', () => {
            this.setActiveTask(task.id);
        });

        editBtn.addEventListener('click', () => {
            eventEmitter.emit('task:edit', task);
        });

        deleteBtn.addEventListener('click', () => {
            this.confirmDelete(task);
        });
    }

    /**
     * 添加任务
     */
    public addTask(task: Task): void {
        this.tasks.push(task);
        this.render();
        toastManager.success('任务已创建', `"${task.title}" 已添加到列表`);
    }

    /**
     * 更新任务
     */
    public updateTask(task: Task): void {
        const index = this.tasks.findIndex(t => t.id === task.id);
        if (index !== -1) {
            this.tasks[index] = task;
            this.render();
            toastManager.success('任务已更新', `"${task.title}" 更新成功`);
        }
    }

    /**
     * 删除任务
     */
    public deleteTask(id: string): void {
        const task = this.tasks.find(t => t.id === id);
        this.tasks = this.tasks.filter(t => t.id !== id);

        if (this.activeTaskId === id) {
            this.activeTaskId = null;
        }

        this.render();

        if (task) {
            toastManager.info('任务已删除', `"${task.title}" 已从列表中移除`);
        }
    }

    /**
     * 切换任务完成状态
     */
    public toggleTaskComplete(id: string): void {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            const isCompleted = task.status === 'completed';
            task.status = isCompleted ? 'active' : 'completed';
            task.completedAt = isCompleted ? undefined : new Date();

            if (isCompleted) {
                toastManager.info('任务已恢复', `"${task.title}" 已恢复为进行中`);
            } else {
                toastManager.success('任务已完成', `恭喜！完成 "${task.title}"`);
                eventEmitter.emit('task:completed', task);
            }

            this.render();
        }
    }

    /**
     * 设置活动任务
     */
    public setActiveTask(id: string): void {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.activeTaskId = id;
            this.render();

            // 更新当前任务显示
            const currentTaskDisplay = document.getElementById('current-task-display');
            if (currentTaskDisplay) {
                currentTaskDisplay.innerHTML = `
                    <p class="current-task-text active">当前任务：${this.escapeHtml(task.title)}</p>
                `;
            }

            toastManager.success('任务已激活', `开始专注：${task.title}`);
            eventEmitter.emit('task:activated', task);
        }
    }

    /**
     * 确认删除任务
     */
    private confirmDelete(task: Task): void {
        toastManager.warning(
            '确认删除',
            `确定要删除任务 "${task.title}" 吗？`,
            false
        );

        // 添加确认按钮
        const lastToast = this.getLastToast();
        if (lastToast) {
            const actions: Array<{ label: string; onClick: () => void; primary: boolean }> = [
                {
                    label: '取消',
                    onClick: () => {},
                    primary: false
                },
                {
                    label: '删除',
                    onClick: () => this.deleteTask(task.id),
                    primary: true
                }
            ];

            // 更新 toast 的操作按钮
            const toastContainer = document.getElementById('toast-container');
            const toastElement = toastContainer?.lastElementChild as HTMLElement;
            if (toastElement) {
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'toast-actions';
                actionsDiv.style.marginTop = '12px';
                actionsDiv.style.display = 'flex';
                actionsDiv.style.gap = '8px';

                actions.forEach(action => {
                    const btn = document.createElement('button');
                    btn.className = `btn ${action.primary ? 'btn-danger' : 'btn-secondary'} btn-small`;
                    btn.textContent = action.label;
                    btn.onclick = () => {
                        action.onClick();
                        toastManager.hide(toastElement);
                    };
                    actionsDiv.appendChild(btn);
                });

                const content = toastElement.querySelector('.toast-content');
                content?.appendChild(actionsDiv);
            }
        }
    }

    /**
     * 获取最后一个 toast 元素
     */
    private getLastToast(): HTMLElement | null {
        const toastContainer = document.getElementById('toast-container');
        return toastContainer?.lastElementChild as HTMLElement || null;
    }

    /**
     * 更新任务计数
     */
    private updateCounts(): void {
        const allCount = this.tasks.length;
        const activeCount = this.tasks.filter(t => t.status === 'active').length;
        const completedCount = this.tasks.filter(t => t.status === 'completed').length;

        document.getElementById('count-all')!.textContent = allCount.toString();
        document.getElementById('count-active')!.textContent = activeCount.toString();
        document.getElementById('count-completed')!.textContent = completedCount.toString();
    }

    /**
     * 获取优先级标签
     */
    private getPriorityLabel(priority: string): string {
        const labels: Record<string, string> = {
            high: '高',
            medium: '中',
            low: '低'
        };
        return labels[priority] || priority;
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
     * 获取所有任务
     */
    public getTasks(): Task[] {
        return this.tasks;
    }

    /**
     * 获取活动任务
     */
    public getActiveTask(): Task | null {
        return this.activeTaskId
            ? this.tasks.find(t => t.id === this.activeTaskId) || null
            : null;
    }
}
