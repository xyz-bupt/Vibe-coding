/**
 * 任务表单组件
 */

import { Task, TaskFormData, TaskPriority } from '../types/index';
import { eventEmitter } from '../utils/EventEmitter';

export class TaskForm {
  private modal: HTMLElement;
  private form: HTMLFormElement;
  private titleInput: HTMLInputElement;
  private descriptionInput: HTMLTextAreaElement;
  priorityInput: HTMLSelectElement;
  pomodorosInput: HTMLInputElement;
  private editingTaskId: string | null = null;

  constructor() {
    this.modal = document.getElementById('task-modal')!;
    this.form = document.getElementById('task-form') as HTMLFormElement;
    this.titleInput = document.getElementById('task-title') as HTMLInputElement;
    this.descriptionInput = document.getElementById(
      'task-description'
    ) as HTMLTextAreaElement;
    this.priorityInput = document.getElementById(
      'task-priority'
    ) as HTMLSelectElement;
    this.pomodorosInput = document.getElementById(
      'task-pomodoros'
    ) as HTMLInputElement;

    this.initializeEventListeners();
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    // 表单提交
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // 关闭按钮
    const closeButtons = this.modal.querySelectorAll(
      '[data-modal-close], [data-modal-cancel]'
    );
    closeButtons.forEach((btn) => {
      btn.addEventListener('click', () => this.hide());
    });

    // 点击遮罩层关闭
    const overlay = this.modal.querySelector('[data-modal-overlay]');
    overlay?.addEventListener('click', () => this.hide());

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isShown()) {
        this.hide();
      }
    });

    // 监听编辑事件
    eventEmitter.on('task:edit', (task: Task) => {
      this.showForEdit(task);
    });

    // 监听添加按钮
    const addTaskBtn = document.getElementById('add-task-btn');
    addTaskBtn?.addEventListener('click', () => this.show());
  }

  /**
   * 显示表单（添加新任务）
   */
  public show(): void {
    this.editingTaskId = null;
    this.resetForm();
    this.updateModalTitle('添加任务');
    this.showModal();
    this.titleInput.focus();
  }

  /**
   * 显示表单（编辑任务）
   */
  public showForEdit(task: Task): void {
    this.editingTaskId = task.id;
    this.populateForm(task);
    this.updateModalTitle('编辑任务');
    this.showModal();
    this.titleInput.focus();
  }

  /**
   * 隐藏表单
   */
  public hide(): void {
    this.hideModal();
    this.resetForm();
    this.editingTaskId = null;
  }

  /**
   * 显示对话框
   */
  private showModal(): void {
    this.modal.setAttribute('aria-hidden', 'false');
    this.modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // 聚焦到第一个输入框
    setTimeout(() => {
      this.titleInput.focus();
    }, 100);
  }

  /**
   * 隐藏对话框
   */
  private hideModal(): void {
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
   * 更新对话框标题
   */
  private updateModalTitle(title: string): void {
    const titleElement = document.getElementById('task-modal-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  /**
   * 重置表单
   */
  private resetForm(): void {
    this.form.reset();
    this.titleInput.value = '';
    this.descriptionInput.value = '';
    this.priorityInput.value = 'medium';
    this.pomodorosInput.value = '1';
  }

  /**
   * 填充表单
   */
  private populateForm(task: Task): void {
    this.titleInput.value = task.title;
    this.descriptionInput.value = task.description || '';
    this.priorityInput.value = task.priority;
    this.pomodorosInput.value = task.estimatedPomodoros.toString();
  }

  /**
   * 处理表单提交
   */
  private handleSubmit(): void {
    if (!this.validate()) {
      return;
    }

    const formData = this.getFormData();

    if (this.editingTaskId) {
      // 更新现有任务
      eventEmitter.emit('task:update', {
        id: this.editingTaskId,
        ...formData,
      } as Task);
    } else {
      // 创建新任务
      const newTask: Task = {
        id: this.generateId(),
        ...formData,
        status: 'active',
        completedPomodoros: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      eventEmitter.emit('task:add', newTask);
    }

    this.hide();
  }

  /**
   * 获取表单数据
   */
  public getFormData(): TaskFormData {
    return {
      title: this.titleInput.value.trim(),
      description: this.descriptionInput.value.trim() || undefined,
      priority: this.priorityInput.value as TaskPriority,
      estimatedPomodoros: parseInt(this.pomodorosInput.value, 10),
    };
  }

  /**
   * 验证表单
   */
  public validate(): boolean {
    const formData = this.getFormData();

    // 验证标题
    if (!formData.title) {
      this.showFieldError(this.titleInput, '请输入任务标题');
      return false;
    }

    if (formData.title.length > 100) {
      this.showFieldError(this.titleInput, '任务标题不能超过 100 个字符');
      return false;
    }

    // 验证描述
    if (formData.description && formData.description.length > 500) {
      this.showFieldError(this.descriptionInput, '任务描述不能超过 500 个字符');
      return false;
    }

    // 验证番茄数
    if (formData.estimatedPomodoros < 1 || formData.estimatedPomodoros > 20) {
      this.showFieldError(this.pomodorosInput, '预计番茄数必须在 1-20 之间');
      return false;
    }

    return true;
  }

  /**
   * 显示字段错误
   */
  private showFieldError(field: HTMLElement, message: string): void {
    field.classList.add('shake');
    field.setAttribute('aria-invalid', 'true');

    // 移除 shake 动画类
    setTimeout(() => {
      field.classList.remove('shake');
    }, 500);

    // 显示错误消息
    const existingHint = field.parentElement?.querySelector('.field-error');
    if (existingHint) {
      existingHint.remove();
    }

    const errorHint = document.createElement('span');
    errorHint.className = 'field-error';
    errorHint.textContent = message;
    errorHint.style.color = 'var(--color-danger)';
    errorHint.style.fontSize = 'var(--font-size-sm)';
    errorHint.style.marginTop = '4px';

    field.parentElement?.appendChild(errorHint);

    // 聚焦到错误字段
    (field as HTMLInputElement).focus();
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
