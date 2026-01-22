/**
 * KeyboardShortcutManager - Manages keyboard shortcuts
 *
 * Responsibilities:
 * - Registering keyboard shortcuts
 * - Handling key press events with modifier detection
 * - Providing default shortcuts for common actions
 * - Supporting custom shortcut registration
 * - Preventing conflicts and handling edge cases
 */

import { KeyboardShortcut } from '../types/index';

/**
 * Shortcut key combination format
 */
export interface ShortcutKey {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

/**
 * Shortcut registration options
 */
export interface ShortcutOptions {
  /**
   * Whether the shortcut is currently enabled
   */
  enabled?: boolean;

  /**
   * Description of what the shortcut does
   */
  description?: string;

  /**
   * Prevent default browser behavior
   */
  preventDefault?: boolean;

  /**
   * Stop event propagation
   */
  stopPropagation?: boolean;

  /**
   * Condition that must be true for handler to execute
   */
  condition?: () => boolean;

  /**
   * Called when shortcut is triggered (before handler)
   */
  onTrigger?: (event: KeyboardEvent) => void;
}

/**
 * Keyboard event handler
 */
export type ShortcutHandler = (event: KeyboardEvent) => void | boolean;

/**
 * Shortcut registry entry
 */
interface ShortcutEntry {
  key: ShortcutKey;
  handler: ShortcutHandler;
  enabled: boolean;
  description: string;
  preventDefault: boolean;
  stopPropagation: boolean;
  condition?: () => boolean;
  onTrigger?: (event: KeyboardEvent) => void;
}

/**
 * KeyboardShortcutManager - Main class
 */
export class KeyboardShortcutManager {
  // Registered shortcuts
  private shortcuts: Map<string, ShortcutEntry> = new Map();

  // Event listener attached flag
  private attached: boolean = false;

  // Key sequence buffer for multi-key sequences
  private keySequence: string[] = [];
  private keySequenceTimeout: number | null = null;
  private readonly KEY_SEQUENCE_DELAY = 500;

  // Ignored elements (inputs, textareas, etc.)
  private ignoreSelectors = [
    'input',
    'textarea',
    'select',
    '[contenteditable="true"]',
  ];

  // Event listener reference for cleanup
  private keydownHandler: ((event: KeyboardEvent) => void) | null = null;

  // ==========================================================================
  // CONSTRUCTOR
  // ==========================================================================

  constructor() {
    this.attach();
  }

  // ==========================================================================
  // PUBLIC API - SHORTCUT REGISTRATION
  // ==========================================================================

  /**
   * Register a keyboard shortcut
   */
  register(
    keyCombo: string | ShortcutKey,
    handler: ShortcutHandler,
    options: ShortcutOptions = {}
  ): () => void {
    const shortcutKey =
      typeof keyCombo === 'string' ? this.parseKeyCombo(keyCombo) : keyCombo;

    const id = this.generateShortcutId(shortcutKey);

    const entry: ShortcutEntry = {
      key: shortcutKey,
      handler,
      enabled: options.enabled ?? true,
      description: options.description ?? '',
      preventDefault: options.preventDefault ?? true,
      stopPropagation: options.stopPropagation ?? false,
      condition: options.condition,
      onTrigger: options.onTrigger,
    };

    this.shortcuts.set(id, entry);

    // Return unregister function
    return () => this.unregister(id);
  }

  /**
   * Unregister a shortcut by ID
   */
  unregister(id: string): boolean {
    return this.shortcuts.delete(id);
  }

  /**
   * Unregister all shortcuts matching a key combo
   */
  unregisterByKey(keyCombo: string | ShortcutKey): void {
    const shortcutKey =
      typeof keyCombo === 'string' ? this.parseKeyCombo(keyCombo) : keyCombo;

    const id = this.generateShortcutId(shortcutKey);
    this.unregister(id);
  }

  /**
   * Update shortcut enabled state
   */
  setEnabled(keyCombo: string | ShortcutKey, enabled: boolean): void {
    const shortcutKey =
      typeof keyCombo === 'string' ? this.parseKeyCombo(keyCombo) : keyCombo;

    const id = this.generateShortcutId(shortcutKey);
    const entry = this.shortcuts.get(id);

    if (entry) {
      entry.enabled = enabled;
    }
  }

  /**
   * Check if a shortcut is registered
   */
  has(keyCombo: string | ShortcutKey): boolean {
    const shortcutKey =
      typeof keyCombo === 'string' ? this.parseKeyCombo(keyCombo) : keyCombo;

    const id = this.generateShortcutId(shortcutKey);
    return this.shortcuts.has(id);
  }

  /**
   * Get all registered shortcuts
   */
  getAll(): Array<{
    id: string;
    shortcut: ShortcutKey;
    description: string;
    enabled: boolean;
  }> {
    return Array.from(this.shortcuts.entries()).map(([id, entry]) => ({
      id,
      shortcut: entry.key,
      description: entry.description,
      enabled: entry.enabled,
    }));
  }

  /**
   * Get enabled shortcuts only
   */
  getEnabled(): Array<{
    id: string;
    shortcut: ShortcutKey;
    description: string;
  }> {
    return this.getAll().filter((s) => s.enabled);
  }

  /**
   * Clear all shortcuts
   */
  clear(): void {
    this.shortcuts.clear();
  }

  // ==========================================================================
  // EVENT HANDLING
  // ==========================================================================

  /**
   * Attach keyboard event listener
   */
  private attach(): void {
    if (this.attached) return;

    this.keydownHandler = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.keydownHandler, {
      passive: false,
    });
    this.attached = true;
  }

  /**
   * Detach keyboard event listener
   */
  detach(): void {
    if (!this.attached || !this.keydownHandler) return;

    document.removeEventListener('keydown', this.keydownHandler);
    this.keydownHandler = null;
    this.attached = false;
  }

  /**
   * Handle keyboard events
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Check if we should ignore this event (input fields)
    if (this.shouldIgnoreEvent(event)) {
      return;
    }

    // Build shortcut key from event
    const eventKey = this.eventToShortcutKey(event);

    // Find matching shortcut
    const entry = this.findMatchingShortcut(eventKey);

    if (entry && entry.enabled) {
      // Check condition
      if (entry.condition && !entry.condition()) {
        return;
      }

      // Call onTrigger callback
      if (entry.onTrigger) {
        entry.onTrigger(event);
      }

      // Prevent default if configured
      if (entry.preventDefault) {
        event.preventDefault();
      }

      // Stop propagation if configured
      if (entry.stopPropagation) {
        event.stopPropagation();
      }

      // Execute handler
      const result = entry.handler(event);

      // If handler returns false, prevent default and stop propagation
      if (result === false) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }

  /**
   * Check if event should be ignored
   */
  private shouldIgnoreEvent(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement;

    // Check if target matches any ignore selector
    for (const selector of this.ignoreSelectors) {
      if (target.matches(selector)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Convert keyboard event to shortcut key
   */
  private eventToShortcutKey(event: KeyboardEvent): ShortcutKey {
    return {
      key: event.key.toLowerCase(),
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    };
  }

  /**
   * Find matching shortcut entry
   */
  private findMatchingShortcut(eventKey: ShortcutKey): ShortcutEntry | null {
    for (const entry of this.shortcuts.values()) {
      if (this.shortcutsMatch(entry.key, eventKey)) {
        return entry;
      }
    }
    return null;
  }

  /**
   * Check if two shortcut keys match
   */
  private shortcutsMatch(a: ShortcutKey, b: ShortcutKey): boolean {
    const normalizeKey = (key: string): string => {
      // Handle special keys
      const specialKeys: Record<string, string> = {
        ' ': 'space',
        arrowup: 'up',
        arrowdown: 'down',
        arrowleft: 'left',
        arrowright: 'right',
        escape: 'esc',
        control: 'ctrl',
      };
      return specialKeys[key.toLowerCase()] || key.toLowerCase();
    };

    return (
      normalizeKey(a.key) === normalizeKey(b.key) &&
      !!a.ctrlKey === !!b.ctrlKey &&
      !!a.metaKey === !!b.metaKey &&
      !!a.shiftKey === !!b.shiftKey &&
      !!a.altKey === !!b.altKey
    );
  }

  // ==========================================================================
  // KEY COMBO PARSING
  // ==========================================================================

  /**
   * Parse key combination string to ShortcutKey
   * Supports formats like:
   * - "Ctrl+Enter"
   * - "Cmd+S"
   * - "Ctrl+Shift+N"
   * - "Meta+,"
   */
  private parseKeyCombo(combo: string): ShortcutKey {
    const parts = combo
      .toLowerCase()
      .split('+')
      .map((p) => p.trim());

    const result: ShortcutKey = {
      key: '',
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      altKey: false,
    };

    for (const part of parts) {
      switch (part) {
        case 'ctrl':
        case 'control':
          result.ctrlKey = true;
          break;
        case 'cmd':
        case 'meta':
        case 'command':
          result.metaKey = true;
          break;
        case 'shift':
          result.shiftKey = true;
          break;
        case 'alt':
        case 'option':
          result.altKey = true;
          break;
        default:
          // The actual key
          result.key = this.normalizeKeyName(part);
      }
    }

    return result;
  }

  /**
   * Normalize key name
   */
  private normalizeKeyName(name: string): string {
    const aliases: Record<string, string> = {
      space: ' ',
      esc: 'escape',
      up: 'arrowup',
      down: 'arrowdown',
      left: 'arrowleft',
      right: 'arrowright',
      return: 'enter',
      plus: '+',
      minus: '-',
    };

    return aliases[name.toLowerCase()] || name.toLowerCase();
  }

  /**
   * Format shortcut key for display
   */
  formatShortcut(shortcutKey: ShortcutKey): string {
    const parts: string[] = [];

    if (shortcutKey.ctrlKey) parts.push(this.isMac() ? 'Cmd' : 'Ctrl');
    if (shortcutKey.metaKey) parts.push('Cmd');
    if (shortcutKey.shiftKey) parts.push('Shift');
    if (shortcutKey.altKey) parts.push(this.isMac() ? 'Option' : 'Alt');

    // Format the main key
    let key = shortcutKey.key;
    if (key === ' ') key = 'Space';
    else if (key === 'escape') key = 'Esc';
    else key = key.charAt(0).toUpperCase() + key.slice(1);

    parts.push(key);

    return parts.join(this.isMac() ? '' : '+');
  }

  /**
   * Generate unique ID for shortcut
   */
  private generateShortcutId(shortcutKey: ShortcutKey): string {
    const parts: string[] = [];

    if (shortcutKey.ctrlKey) parts.push('ctrl');
    if (shortcutKey.metaKey) parts.push('meta');
    if (shortcutKey.shiftKey) parts.push('shift');
    if (shortcutKey.altKey) parts.push('alt');
    parts.push(shortcutKey.key);

    return parts.join('-');
  }

  /**
   * Detect if running on Mac
   */
  private isMac(): boolean {
    return /mac|ipod|iphone|ipad/.test(window.navigator.platform.toLowerCase());
  }

  // ==========================================================================
  // CLEANUP
  // ==========================================================================

  /**
   * Destroy the manager
   */
  destroy(): void {
    this.detach();
    this.shortcuts.clear();

    if (this.keySequenceTimeout) {
      clearTimeout(this.keySequenceTimeout);
    }
  }
}

/**
 * Default shortcuts for Pomodoro Todo App
 */
export class DefaultShortcuts {
  /**
   * Register all default shortcuts
   */
  static register(
    manager: KeyboardShortcutManager,
    handlers: {
      startPauseTimer?: () => void;
      newTask?: () => void;
      completeTask?: () => void;
      nextTask?: () => void;
      previousTask?: () => void;
      openSettings?: () => void;
      resetTimer?: () => void;
      skipSession?: () => void;
      toggleTimer?: () => void;
      deleteTask?: () => void;
      editTask?: () => void;
      focusSearch?: () => void;
      toggleSidebar?: () => void;
    }
  ): Array<() => void> {
    const unsubs: Array<() => void> = [];

    // Timer shortcuts
    if (handlers.startPauseTimer) {
      unsubs.push(
        manager.register('Ctrl+Enter', handlers.startPauseTimer, {
          description: 'Start/Pause Timer',
        })
      );
    }

    if (handlers.toggleTimer) {
      unsubs.push(
        manager.register('Space', handlers.toggleTimer, {
          description: 'Toggle Timer (when not in input)',
        })
      );
    }

    if (handlers.resetTimer) {
      unsubs.push(
        manager.register('Ctrl+R', handlers.resetTimer, {
          description: 'Reset Timer',
        })
      );
    }

    if (handlers.skipSession) {
      unsubs.push(
        manager.register('Ctrl+Shift+S', handlers.skipSession, {
          description: 'Skip Current Session',
        })
      );
    }

    // Task shortcuts
    if (handlers.newTask) {
      unsubs.push(
        manager.register('Ctrl+N', handlers.newTask, {
          description: 'New Task',
        })
      );
    }

    if (handlers.completeTask) {
      unsubs.push(
        manager.register('Ctrl+D', handlers.completeTask, {
          description: 'Complete Task',
        })
      );
    }

    if (handlers.nextTask) {
      unsubs.push(
        manager.register('Ctrl+Shift+N', handlers.nextTask, {
          description: 'Next Task',
        })
      );
    }

    if (handlers.previousTask) {
      unsubs.push(
        manager.register('Ctrl+Shift+P', handlers.previousTask, {
          description: 'Previous Task',
        })
      );
    }

    if (handlers.deleteTask) {
      unsubs.push(
        manager.register('Ctrl+Backspace', handlers.deleteTask, {
          description: 'Delete Task',
        })
      );
    }

    if (handlers.editTask) {
      unsubs.push(
        manager.register('Ctrl+E', handlers.editTask, {
          description: 'Edit Task',
        })
      );
    }

    // App shortcuts
    if (handlers.openSettings) {
      unsubs.push(
        manager.register('Ctrl+,', handlers.openSettings, {
          description: 'Open Settings',
        })
      );
    }

    if (handlers.focusSearch) {
      unsubs.push(
        manager.register('Ctrl+F', handlers.focusSearch, {
          description: 'Focus Search',
        })
      );
    }

    if (handlers.toggleSidebar) {
      unsubs.push(
        manager.register('Ctrl+B', handlers.toggleSidebar, {
          description: 'Toggle Sidebar',
        })
      );
    }

    return unsubs;
  }

  /**
   * Get default shortcuts as an array for display
   */
  static getShortcutList(manager: KeyboardShortcutManager): Array<{
    combo: string;
    description: string;
    category: string;
  }> {
    return [
      // Timer
      {
        combo: 'Ctrl+Enter',
        description: 'Start/Pause Timer',
        category: 'Timer',
      },
      { combo: 'Space', description: 'Toggle Timer', category: 'Timer' },
      { combo: 'Ctrl+R', description: 'Reset Timer', category: 'Timer' },
      { combo: 'Ctrl+Shift+S', description: 'Skip Session', category: 'Timer' },
      // Tasks
      { combo: 'Ctrl+N', description: 'New Task', category: 'Tasks' },
      { combo: 'Ctrl+D', description: 'Complete Task', category: 'Tasks' },
      { combo: 'Ctrl+Shift+N', description: 'Next Task', category: 'Tasks' },
      {
        combo: 'Ctrl+Shift+P',
        description: 'Previous Task',
        category: 'Tasks',
      },
      { combo: 'Ctrl+E', description: 'Edit Task', category: 'Tasks' },
      {
        combo: 'Ctrl+Backspace',
        description: 'Delete Task',
        category: 'Tasks',
      },
      // App
      { combo: 'Ctrl+,', description: 'Open Settings', category: 'App' },
      { combo: 'Ctrl+F', description: 'Search', category: 'App' },
      { combo: 'Ctrl+B', description: 'Toggle Sidebar', category: 'App' },
    ];
  }
}

/**
 * Create a singleton keyboard manager instance
 */
let keyboardManager: KeyboardShortcutManager | null = null;

/**
 * Get or create the keyboard manager singleton
 */
export function getKeyboardManager(): KeyboardShortcutManager {
  if (!keyboardManager) {
    keyboardManager = new KeyboardShortcutManager();
  }
  return keyboardManager;
}

/**
 * Destroy the keyboard manager singleton
 */
export function destroyKeyboardManager(): void {
  if (keyboardManager) {
    keyboardManager.destroy();
    keyboardManager = null;
  }
}

export default KeyboardShortcutManager;
