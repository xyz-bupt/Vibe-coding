/**
 * UIController - Manages UI updates and rendering
 *
 * Responsibilities:
 * - Rendering task lists
 * - Updating timer display
 * - Displaying statistics
 * - Managing modals and toasts
 * - Handling theme changes
 * - Coordinating with DOM elements
 */

import {
  Task,
  TaskStatus,
  TaskPriority,
  TimerState,
  SessionType,
  Statistics,
  Toast,
  ToastType,
  AppState,
} from '../types/index';
import { AppStore } from '../store/AppStore';

/**
 * UI element references
 */
interface UIElements {
  // Timer elements
  timerDisplay: HTMLElement | null;
  timerState: HTMLElement | null;
  timerProgressBar: HTMLElement | null;
  timerSessionType: HTMLElement | null;
  startButton: HTMLElement | null;
  pauseButton: HTMLElement | null;
  resetButton: HTMLElement | null;
  skipButton: HTMLElement | null;

  // Task elements
  taskList: HTMLElement | null;
  taskForm: HTMLFormElement | null;
  taskInput: HTMLInputElement | null;
  activeTaskDisplay: HTMLElement | null;

  // Statistics elements
  statsPanel: HTMLElement | null;
  todayPomodoros: HTMLElement | null;
  todayFocusTime: HTMLElement | null;
  todayCompletedTasks: HTMLElement | null;

  // Modal elements
  modalOverlay: HTMLElement | null;
  modalContainer: HTMLElement | null;
  modalTitle: HTMLElement | null;
  modalContent: HTMLElement | null;
  modalClose: HTMLElement | null;

  // Toast elements
  toastContainer: HTMLElement | null;
}

/**
 * UI Controller Configuration
 */
export interface UIControllerConfig {
  store: AppStore;
  elements?: Partial<UIElements>;
  autoBind?: boolean;
  enableAnimations?: boolean;
}

/**
 * Component render function type
 */
type ComponentRenderFn<T> = (data: T, element: HTMLElement) => void;

/**
 * UIController - Main UI management class
 */
export class UIController {
  private store: AppStore;
  private elements: UIElements;
  private autoBind: boolean;
  private enableAnimations: boolean;

  // Component renderers
  private taskRenderers: Map<string, ComponentRenderFn<any>> = new Map();
  private statRenderers: Map<string, ComponentRenderFn<any>> = new Map();

  // Toast management
  private activeToasts: Map<string, HTMLElement> = new Map();
  private toastCounter: number = 0;

  // Current theme
  private currentTheme: 'light' | 'dark' = 'light';

  // Unsubscribe function for store
  private unsubscribeStore?: () => void;

  constructor(config: UIControllerConfig) {
    this.store = config.store;
    this.autoBind = config.autoBind ?? true;
    this.enableAnimations = config.enableAnimations ?? true;

    // Initialize elements
    this.elements = {
      timerDisplay:
        config.elements?.timerDisplay ||
        document.getElementById('timer-display'),
      timerState:
        config.elements?.timerState || document.getElementById('timer-state'),
      timerProgressBar:
        config.elements?.timerProgressBar ||
        document.getElementById('timer-progress'),
      timerSessionType:
        config.elements?.timerSessionType ||
        document.getElementById('timer-session-type'),
      startButton:
        config.elements?.startButton || document.getElementById('start-button'),
      pauseButton:
        config.elements?.pauseButton || document.getElementById('pause-button'),
      resetButton:
        config.elements?.resetButton || document.getElementById('reset-button'),
      skipButton:
        config.elements?.skipButton || document.getElementById('skip-button'),
      taskList:
        config.elements?.taskList || document.getElementById('task-list'),
      taskForm:
        config.elements?.taskForm ||
        (document.getElementById('task-form') as HTMLFormElement),
      taskInput:
        config.elements?.taskInput ||
        (document.getElementById('task-input') as HTMLInputElement),
      activeTaskDisplay:
        config.elements?.activeTaskDisplay ||
        document.getElementById('active-task'),
      statsPanel:
        config.elements?.statsPanel || document.getElementById('stats-panel'),
      todayPomodoros:
        config.elements?.todayPomodoros ||
        document.getElementById('today-pomodoros'),
      todayFocusTime:
        config.elements?.todayFocusTime ||
        document.getElementById('today-focus-time'),
      todayCompletedTasks:
        config.elements?.todayCompletedTasks ||
        document.getElementById('today-completed-tasks'),
      modalOverlay:
        config.elements?.modalOverlay ||
        document.getElementById('modal-overlay'),
      modalContainer:
        config.elements?.modalContainer ||
        document.getElementById('modal-container'),
      modalTitle:
        config.elements?.modalTitle || document.getElementById('modal-title'),
      modalContent:
        config.elements?.modalContent ||
        document.getElementById('modal-content'),
      modalClose:
        config.elements?.modalClose || document.getElementById('modal-close'),
      toastContainer:
        config.elements?.toastContainer ||
        document.getElementById('toast-container'),
    };

    // Create toast container if it doesn't exist
    this.ensureToastContainer();

    // Subscribe to store changes
    this.unsubscribeStore = this.store.subscribe(
      this.handleStateChange.bind(this)
    );

    // Auto-bind elements if enabled
    if (this.autoBind) {
      this.bindElements();
    }

    // Initial render
    this.renderAll();
  }

  // ==========================================================================
  // STATE CHANGE HANDLING
  // ==========================================================================

  /**
   * Handle state changes from store
   */
  private handleStateChange(state: Readonly<AppState>): void {
    this.renderAll();
  }

  /**
   * Render all UI elements
   */
  renderAll(): void {
    const state = this.store.getState();

    this.renderTasks(state.tasks);
    this.updateTimer(state.remainingTime, state.timerState);
    this.updateStatistics(this.store.getStatistics());
    this.updateActiveTask();
  }

  // ==========================================================================
  // TASK LIST RENDERING
  // ==========================================================================

  /**
   * Render task list
   */
  renderTasks(tasks: Task[]): void {
    const taskList = this.elements.taskList;
    if (!taskList) return;

    // Clear existing content
    taskList.innerHTML = '';

    if (tasks.length === 0) {
      this.renderEmptyState(taskList);
      return;
    }

    // Sort tasks by status and priority
    const sortedTasks = this.sortTasks(tasks);

    // Create task elements
    sortedTasks.forEach((task) => {
      const taskElement = this.createTaskElement(task);
      taskList.appendChild(taskElement);
    });

    // Apply animation if enabled
    if (this.enableAnimations) {
      this.animateListItems(taskList);
    }
  }

  /**
   * Create a task element
   */
  private createTaskElement(task: Task): HTMLElement {
    const li = document.createElement('div');
    li.className = `task-item task-${task.status} priority-${task.priority}`;
    li.dataset.taskId = task.id;

    const isActive = this.store.getActiveTask()?.id === task.id;
    if (isActive) {
      li.classList.add('active');
    }

    li.innerHTML = `
      <div class="task-checkbox">
        <input type="checkbox" ${task.status === TaskStatus.COMPLETED ? 'checked' : ''}>
      </div>
      <div class="task-content">
        <div class="task-title">${this.escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
        <div class="task-meta">
          <span class="task-priority badge badge-${task.priority}">${task.priority}</span>
          ${task.estimatedPomodoros ? `<span class="task-estimates"><span class="pomodoro-icon"></span>${task.completedPomodoros}/${task.estimatedPomodoros}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-icon btn-activate" title="Activate task">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14a6 6 0 110-12 6 6 0 010 12zm0-8a2 2 0 100 4 2 2 0 000-4z"/></svg>
        </button>
        <button class="btn-icon btn-edit" title="Edit task">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M12.854 3.146a.5.5 0 00-.708 0L10 5.293 8.854 4.146a.5.5 0 00-.708 0l-6 6A.5.5 0 002 11.5v3a.5.5 0 00.5.5h3a.5.5 0 00.354-.146l6-6a.5.5 0 000-.708L10 7.707l2.146-2.147a.5.5 0 000-.707l-.292-.293z"/></svg>
        </button>
        <button class="btn-icon btn-delete" title="Delete task">
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
        </button>
      </div>
    `;

    // Add event listeners
    this.attachTaskEventListeners(li, task);

    return li;
  }

  /**
   * Attach event listeners to task element
   */
  private attachTaskEventListeners(element: HTMLElement, task: Task): void {
    const checkbox = element.querySelector(
      '.task-checkbox input'
    ) as HTMLInputElement;
    const activateBtn = element.querySelector('.btn-activate') as HTMLElement;
    const editBtn = element.querySelector('.btn-edit') as HTMLElement;
    const deleteBtn = element.querySelector('.btn-delete') as HTMLElement;

    checkbox?.addEventListener('change', async () => {
      if (checkbox.checked) {
        await this.store.completeTask(task.id);
      } else {
        await this.store.updateTask(task.id, { status: TaskStatus.TODO });
      }
    });

    activateBtn?.addEventListener('click', async () => {
      await this.store.setActiveTask(task.id);
    });

    editBtn?.addEventListener('click', () => {
      this.showEditTaskModal(task);
    });

    deleteBtn?.addEventListener('click', async () => {
      const confirmed = await this.showConfirmDialog(
        'Delete Task',
        `Are you sure you want to delete "${task.title}"?`
      );
      if (confirmed) {
        await this.store.deleteTask(task.id);
      }
    });
  }

  /**
   * Render empty state
   */
  private renderEmptyState(container: HTMLElement): void {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon"></div>
        <h3>No tasks yet</h3>
        <p>Create your first task to get started!</p>
        <button class="btn btn-primary" id="empty-state-add-task">Add Task</button>
      </div>
    `;

    container
      .querySelector('#empty-state-add-task')
      ?.addEventListener('click', () => {
        this.showAddTaskModal();
      });
  }

  /**
   * Sort tasks for display
   */
  private sortTasks(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
      // Active task first
      const aActive = this.store.getActiveTask()?.id === a.id;
      const bActive = this.store.getActiveTask()?.id === b.id;
      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      // Then by completion status
      if (
        a.status === TaskStatus.COMPLETED &&
        b.status !== TaskStatus.COMPLETED
      )
        return 1;
      if (
        a.status !== TaskStatus.COMPLETED &&
        b.status === TaskStatus.COMPLETED
      )
        return -1;

      // Then by priority
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      const aPriority = priorityOrder[a.priority] ?? 2;
      const bPriority = priorityOrder[b.priority] ?? 2;
      if (aPriority !== bPriority) return aPriority - bPriority;

      // Finally by creation date
      return b.createdAt - a.createdAt;
    });
  }

  // ==========================================================================
  // TIMER UI UPDATES
  // ==========================================================================

  /**
   * Update timer display
   */
  updateTimer(time: number, state: TimerState): void {
    const display = this.elements.timerDisplay;
    const stateDisplay = this.elements.timerState;
    const progressBar = this.elements.timerProgressBar;
    const sessionType = this.elements.timerSessionType;

    // Update time display
    if (display) {
      display.textContent = this.formatTime(time);
    }

    // Update state display
    if (stateDisplay) {
      stateDisplay.textContent = this.getStateText(state);
      stateDisplay.className = `timer-state state-${state}`;
    }

    // Update progress bar
    if (progressBar) {
      const sessionTypeValue = this.store.getCurrentSessionType();
      const duration = sessionTypeValue
        ? this.getSessionDuration(sessionTypeValue)
        : time;
      const percentage =
        duration > 0 ? ((duration - time) / duration) * 100 : 0;
      progressBar.style.width = `${percentage}%`;
      progressBar.className = `timer-progress-bar state-${state}`;
    }

    // Update session type
    if (sessionType) {
      sessionType.textContent = this.getSessionTypeText();
    }

    // Update button states
    this.updateTimerButtons(state);
  }

  /**
   * Update timer button states
   */
  private updateTimerButtons(state: TimerState): void {
    const startBtn = this.elements.startButton;
    const pauseBtn = this.elements.pauseButton;
    const resetBtn = this.elements.resetButton;
    const skipBtn = this.elements.skipButton;

    // Start/pause button visibility
    if (startBtn && pauseBtn) {
      const isRunning =
        state === TimerState.WORKING ||
        state === TimerState.SHORT_BREAK ||
        state === TimerState.LONG_BREAK;

      startBtn.style.display =
        isRunning || state === TimerState.PAUSED ? 'none' : 'flex';
      pauseBtn.style.display = isRunning ? 'flex' : 'none';
    }

    // Reset and skip button states
    if (resetBtn) {
      resetBtn.disabled = state === TimerState.IDLE;
    }
    if (skipBtn) {
      skipBtn.disabled = state === TimerState.IDLE;
    }
  }

  /**
   * Update active task display
   */
  updateActiveTask(): void {
    const display = this.elements.activeTaskDisplay;
    if (!display) return;

    const activeTask = this.store.getActiveTask();

    if (activeTask) {
      display.innerHTML = `
        <div class="active-task-label">Focusing on:</div>
        <div class="active-task-title">${this.escapeHtml(activeTask.title)}</div>
        <div class="active-task-pomodoros">
          <span class="pomodoro-icon"></span>
          ${activeTask.completedPomodoros}${activeTask.estimatedPomodoros ? `/${activeTask.estimatedPomodoros}` : ''}
        </div>
      `;
      display.classList.add('has-active-task');
    } else {
      display.innerHTML = `
        <div class="active-task-placeholder">No active task</div>
      `;
      display.classList.remove('has-active-task');
    }
  }

  // ==========================================================================
  // STATISTICS UPDATES
  // ==========================================================================

  /**
   * Update statistics display
   */
  updateStatistics(stats: Statistics): void {
    // Today's stats
    if (this.elements.todayPomodoros) {
      this.elements.todayPomodoros.textContent =
        stats.today.workSessions.toString();
    }

    if (this.elements.todayFocusTime) {
      this.elements.todayFocusTime.textContent = this.formatDuration(
        stats.today.totalWorkTime
      );
    }

    if (this.elements.todayCompletedTasks) {
      this.elements.todayCompletedTasks.textContent =
        stats.today.completedTasks.toString();
    }
  }

  // ==========================================================================
  // MODAL MANAGEMENT
  // ==========================================================================

  /**
   * Show modal
   */
  showModal(modal: HTMLElement): void {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Hide modal
   */
  hideModal(modal: HTMLElement): void {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  /**
   * Show confirm dialog
   */
  async showConfirmDialog(title: string, message: string): Promise<boolean> {
    return new Promise((resolve) => {
      const overlay = this.elements.modalOverlay;
      const container = this.elements.modalContainer;
      const titleEl = this.elements.modalTitle;
      const contentEl = this.elements.modalContent;

      if (!overlay || !container || !titleEl || !contentEl) {
        resolve(false);
        return;
      }

      titleEl.textContent = title;
      contentEl.innerHTML = `
        <p>${this.escapeHtml(message)}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="confirm-cancel">Cancel</button>
          <button class="btn btn-danger" id="confirm-ok">Confirm</button>
        </div>
      `;

      overlay.classList.add('active');

      const cancelBtn = contentEl.querySelector(
        '#confirm-cancel'
      ) as HTMLButtonElement;
      const okBtn = contentEl.querySelector('#confirm-ok') as HTMLButtonElement;

      const cleanup = () => {
        overlay.classList.remove('active');
        cancelBtn.removeEventListener('click', onCancel);
        okBtn.removeEventListener('click', onConfirm);
      };

      const onCancel = () => {
        cleanup();
        resolve(false);
      };

      const onConfirm = () => {
        cleanup();
        resolve(true);
      };

      cancelBtn.addEventListener('click', onCancel);
      okBtn.addEventListener('click', onConfirm);
    });
  }

  /**
   * Show add task modal
   */
  showAddTaskModal(): void {
    const overlay = this.elements.modalOverlay;
    const container = this.elements.modalContainer;
    const titleEl = this.elements.modalTitle;
    const contentEl = this.elements.modalContent;

    if (!overlay || !container || !titleEl || !contentEl) return;

    titleEl.textContent = 'Add New Task';

    contentEl.innerHTML = `
      <form id="add-task-form" class="task-form">
        <div class="form-group">
          <label for="task-title-input">Task Title *</label>
          <input type="text" id="task-title-input" class="form-input" required placeholder="What do you need to do?">
        </div>
        <div class="form-group">
          <label for="task-desc-input">Description</label>
          <textarea id="task-desc-input" class="form-textarea" rows="3" placeholder="Add more details..."></textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="task-priority-input">Priority</label>
            <select id="task-priority-input" class="form-select">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div class="form-group">
            <label for="task-estimates-input">Estimated Pomodoros</label>
            <input type="number" id="task-estimates-input" class="form-input" min="1" max="20" value="1">
          </div>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="add-task-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Task</button>
        </div>
      </form>
    `;

    overlay.classList.add('active');

    const form = contentEl.querySelector('#add-task-form') as HTMLFormElement;
    const cancelBtn = contentEl.querySelector(
      '#add-task-cancel'
    ) as HTMLButtonElement;

    cancelBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = (
        form.querySelector('#task-title-input') as HTMLInputElement
      ).value;
      const description = (
        form.querySelector('#task-desc-input') as HTMLTextAreaElement
      ).value;
      const priority = (
        form.querySelector('#task-priority-input') as HTMLSelectElement
      ).value as TaskPriority;
      const estimatedPomodoros = parseInt(
        (form.querySelector('#task-estimates-input') as HTMLInputElement).value
      );

      try {
        await this.store.addTask({
          title,
          description: description || undefined,
          priority,
          status: TaskStatus.TODO,
          estimatedPomodoros,
          completedPomodoros: 0,
        });

        overlay.classList.remove('active');
        this.showToast('Task added successfully', 'success');
      } catch (error) {
        this.showToast('Failed to add task', 'error');
        console.error(error);
      }
    });
  }

  /**
   * Show edit task modal
   */
  showEditTaskModal(task: Task): void {
    const overlay = this.elements.modalOverlay;
    const container = this.elements.modalContainer;
    const titleEl = this.elements.modalTitle;
    const contentEl = this.elements.modalContent;

    if (!overlay || !container || !titleEl || !contentEl) return;

    titleEl.textContent = 'Edit Task';

    contentEl.innerHTML = `
      <form id="edit-task-form" class="task-form">
        <div class="form-group">
          <label for="edit-task-title-input">Task Title *</label>
          <input type="text" id="edit-task-title-input" class="form-input" required value="${this.escapeHtml(task.title)}">
        </div>
        <div class="form-group">
          <label for="edit-task-desc-input">Description</label>
          <textarea id="edit-task-desc-input" class="form-textarea" rows="3">${this.escapeHtml(task.description || '')}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="edit-task-priority-input">Priority</label>
            <select id="edit-task-priority-input" class="form-select">
              <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
              <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
              <option value="urgent" ${task.priority === 'urgent' ? 'selected' : ''}>Urgent</option>
            </select>
          </div>
          <div class="form-group">
            <label for="edit-task-estimates-input">Estimated Pomodoros</label>
            <input type="number" id="edit-task-estimates-input" class="form-input" min="1" max="20" value="${task.estimatedPomodoros || 1}">
          </div>
        </div>
        <div class="form-group">
          <label for="edit-task-status-input">Status</label>
          <select id="edit-task-status-input" class="form-select">
            <option value="todo" ${task.status === TaskStatus.TODO ? 'selected' : ''}>To Do</option>
            <option value="in_progress" ${task.status === TaskStatus.IN_PROGRESS ? 'selected' : ''}>In Progress</option>
            <option value="completed" ${task.status === TaskStatus.COMPLETED ? 'selected' : ''}>Completed</option>
            <option value="archived" ${task.status === TaskStatus.ARCHIVED ? 'selected' : ''}>Archived</option>
          </select>
        </div>
        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="edit-task-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    `;

    overlay.classList.add('active');

    const form = contentEl.querySelector('#edit-task-form') as HTMLFormElement;
    const cancelBtn = contentEl.querySelector(
      '#edit-task-cancel'
    ) as HTMLButtonElement;

    cancelBtn.addEventListener('click', () => {
      overlay.classList.remove('active');
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const title = (
        form.querySelector('#edit-task-title-input') as HTMLInputElement
      ).value;
      const description = (
        form.querySelector('#edit-task-desc-input') as HTMLTextAreaElement
      ).value;
      const priority = (
        form.querySelector('#edit-task-priority-input') as HTMLSelectElement
      ).value as TaskPriority;
      const estimatedPomodoros = parseInt(
        (form.querySelector('#edit-task-estimates-input') as HTMLInputElement)
          .value
      );
      const status = (
        form.querySelector('#edit-task-status-input') as HTMLSelectElement
      ).value as TaskStatus;

      try {
        await this.store.updateTask(task.id, {
          title,
          description: description || undefined,
          priority,
          estimatedPomodoros,
          status,
        });

        overlay.classList.remove('active');
        this.showToast('Task updated successfully', 'success');
      } catch (error) {
        this.showToast('Failed to update task', 'error');
        console.error(error);
      }
    });
  }

  // ==========================================================================
  // TOAST NOTIFICATIONS
  // ==========================================================================

  /**
   * Show toast notification
   */
  showToast(
    message: string,
    type: ToastType = 'info',
    duration: number = 3000
  ): void {
    const container = this.ensureToastContainer();

    const toast = document.createElement('div');
    const toastId = `toast-${++this.toastCounter}`;

    toast.className = `toast toast-${type}`;
    toast.id = toastId;
    toast.innerHTML = `
      <span class="toast-message">${this.escapeHtml(message)}</span>
      <button class="toast-close" aria-label="Close notification">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
        </svg>
      </button>
    `;

    container.appendChild(toast);

    // Auto-remove after duration
    const timeoutId = setTimeout(() => {
      this.removeToast(toastId);
    }, duration);

    // Store reference
    this.activeToasts.set(toastId, toast);
    (toast as any)._timeoutId = timeoutId;

    // Add close button listener
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn?.addEventListener('click', () => {
      this.removeToast(toastId);
    });

    // Animate in
    if (this.enableAnimations) {
      requestAnimationFrame(() => {
        toast.classList.add('active');
      });
    }
  }

  /**
   * Remove toast notification
   */
  private removeToast(toastId: string): void {
    const toast = this.activeToasts.get(toastId);
    if (!toast) return;

    // Clear timeout
    const timeoutId = (toast as any)._timeoutId;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Animate out
    if (this.enableAnimations) {
      toast.classList.remove('active');
      setTimeout(() => {
        toast.remove();
        this.activeToasts.delete(toastId);
      }, 300);
    } else {
      toast.remove();
      this.activeToasts.delete(toastId);
    }
  }

  /**
   * Ensure toast container exists
   */
  private ensureToastContainer(): HTMLElement {
    let container = this.elements.toastContainer;

    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
      this.elements.toastContainer = container;
    }

    return container;
  }

  // ==========================================================================
  // ELEMENT BINDING
  // ==========================================================================

  /**
   * Bind UI elements to event handlers
   */
  bindElements(): void {
    // Timer buttons
    this.elements.startButton?.addEventListener('click', () => {
      this.emit('timer:start');
    });

    this.elements.pauseButton?.addEventListener('click', () => {
      this.emit('timer:pause');
    });

    this.elements.resetButton?.addEventListener('click', () => {
      this.emit('timer:reset');
    });

    this.elements.skipButton?.addEventListener('click', () => {
      this.emit('timer:skip');
    });

    // Task form
    this.elements.taskForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleTaskFormSubmit();
    });

    // Modal close
    this.elements.modalClose?.addEventListener('click', () => {
      this.elements.modalOverlay?.classList.remove('active');
    });

    this.elements.modalOverlay?.addEventListener('click', (e) => {
      if (e.target === this.elements.modalOverlay) {
        this.elements.modalOverlay.classList.remove('active');
      }
    });
  }

  /**
   * Handle task form submission
   */
  private async handleTaskFormSubmit(): Promise<void> {
    const input = this.elements.taskInput;
    if (!input || !input.value.trim()) return;

    try {
      await this.store.addTask({
        title: input.value.trim(),
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        completedPomodoros: 0,
      });

      input.value = '';
      this.showToast('Task added', 'success');
    } catch (error) {
      this.showToast('Failed to add task', 'error');
    }
  }

  // ==========================================================================
  // THEME MANAGEMENT
  // ==========================================================================

  /**
   * Set theme
   */
  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  /**
   * Get current theme
   */
  getTheme(): 'light' | 'dark' {
    return this.currentTheme;
  }

  /**
   * Toggle theme
   */
  toggleTheme(): void {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  }

  // ==========================================================================
  // CUSTOM RENDERERS
  // ==========================================================================

  /**
   * Register custom task renderer
   */
  registerTaskRenderer(name: string, renderer: ComponentRenderFn<Task>): void {
    this.taskRenderers.set(name, renderer);
  }

  /**
   * Register custom statistics renderer
   */
  registerStatRenderer(name: string, renderer: ComponentRenderFn<any>): void {
    this.statRenderers.set(name, renderer);
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Format time as MM:SS
   */
  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  /**
   * Get state display text
   */
  private getStateText(state: TimerState): string {
    switch (state) {
      case TimerState.IDLE:
        return 'Ready';
      case TimerState.WORKING:
        return 'Focus Time';
      case TimerState.SHORT_BREAK:
        return 'Short Break';
      case TimerState.LONG_BREAK:
        return 'Long Break';
      case TimerState.PAUSED:
        return 'Paused';
      default:
        return '';
    }
  }

  /**
   * Get session type text
   */
  private getSessionTypeText(): string {
    const sessionType = this.store.getCurrentSessionType();
    const completedCount =
      this.store.getState().completedSessionsSinceLastLongBreak;
    const interval = this.store.getSettings().longBreakInterval;

    switch (sessionType) {
      case SessionType.WORK:
        return `Pomodoro ${completedCount + 1} of ${interval}`;
      case SessionType.SHORT_BREAK:
        return 'Short Break';
      case SessionType.LONG_BREAK:
        return 'Long Break';
      default:
        return '';
    }
  }

  /**
   * Get session duration
   */
  private getSessionDuration(sessionType: SessionType): number {
    const settings = this.store.getSettings();

    switch (sessionType) {
      case SessionType.WORK:
        return settings.workDuration;
      case SessionType.SHORT_BREAK:
        return settings.shortBreakDuration;
      case SessionType.LONG_BREAK:
        return settings.longBreakDuration;
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Animate list items
   */
  private animateListItems(container: HTMLElement): void {
    const items = container.querySelectorAll('.task-item');
    items.forEach((item, index) => {
      (item as HTMLElement).style.animationDelay = `${index * 50}ms`;
      item.classList.add('animate-in');
    });
  }

  /**
   * Emit custom event
   */
  private emit(eventName: string, detail?: any): void {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Cleanup and destroy the controller
   */
  destroy(): void {
    // Unsubscribe from store
    if (this.unsubscribeStore) {
      this.unsubscribeStore();
    }

    // Clear all toasts
    this.activeToasts.forEach((_, id) => this.removeToast(id));

    // Clear renderers
    this.taskRenderers.clear();
    this.statRenderers.clear();
  }
}

/**
 * Default export
 */
export default UIController;
