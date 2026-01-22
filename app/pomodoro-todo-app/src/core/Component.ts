/**
 * Component Base Class - Lifecycle Management
 *
 * Provides automatic resource cleanup and memory leak prevention
 * for all components in the application.
 *
 * Features:
 * - Automatic event listener cleanup
 * - Timer (setTimeout/setInterval) tracking and cleanup
 * - AbortController for fetch requests
 * - DOM reference clearing
 * - Subscription management
 */

import { eventEmitter } from '../utils/EventEmitter';
import { EventType, EventListener } from '../types/index';

/**
 * Resource types that can be tracked
 */
type CleanupFunction = () => void;

/**
 * Base class for all components requiring lifecycle management
 */
export abstract class Component {
  /**
   * Array of cleanup functions to execute on destroy
   */
  protected cleanup: CleanupFunction[] = [];

  /**
   * Track if component has been destroyed
   */
  protected destroyed: boolean = false;

  /**
   * Track all timer IDs for cleanup
   */
  private timers: Set<number> = new Set();

  /**
   * Track all event listeners for automatic removal
   * Format: { element, event, handler, options }
   */
  private eventListeners: Array<{
    element: HTMLElement | Document | Window;
    event: string;
    handler: EventListener;
    options?: AddEventListenerOptions;
  }> = [];

  /**
   * Track event emitter subscriptions
   */
  private eventSubscriptions: Array<{
    event: EventType;
    listener: EventListener;
  }> = [];

  /**
   * Track AbortControllers for fetch requests
   */
  private abortControllers: Set<AbortController> = new Set();

  /**
   * Constructor - Subclasses should call super() if they override
   */
  constructor() {
    // Setup automatic cleanup on page unload
    this.addAutoCleanup(() => {
      this.destroyed = true;
    });
  }

  // ==========================================================================
  // PUBLIC LIFECYCLE METHODS
  // ==========================================================================

  /**
   * Destroy the component and clean up all resources
   * This should be called when the component is no longer needed
   */
  public destroy(): void {
    if (this.destroyed) {
      console.warn(
        `[Component] Attempted to destroy already destroyed component`
      );
      return;
    }

    // Run all cleanup functions in reverse order
    for (let i = this.cleanup.length - 1; i >= 0; i--) {
      try {
        this.cleanup[i]();
      } catch (error) {
        console.error('[Component] Error during cleanup:', error);
      }
    }

    // Clear all tracking collections
    this.cleanup = [];
    this.timers.clear();
    this.eventListeners = [];
    this.eventSubscriptions = [];
    this.abortControllers.clear();

    this.destroyed = true;
  }

  /**
   * Check if component has been destroyed
   */
  public isDestroyed(): boolean {
    return this.destroyed;
  }

  // ==========================================================================
  // RESOURCE MANAGEMENT - TIMERS
  // ==========================================================================

  /**
   * Wrapper for setTimeout that automatically tracks and cleans up the timer
   */
  protected setTimeout(handler: () => void, timeout: number): number {
    if (this.destroyed) {
      console.warn('[Component] Cannot set timeout on destroyed component');
      return -1;
    }

    const timerId = window.setTimeout(() => {
      this.timers.delete(timerId);
      handler();
    }, timeout);

    this.timers.add(timerId);
    return timerId;
  }

  /**
   * Wrapper for setInterval that automatically tracks and cleans up the timer
   */
  protected setInterval(handler: () => void, interval: number): number {
    if (this.destroyed) {
      console.warn('[Component] Cannot set interval on destroyed component');
      return -1;
    }

    const timerId = window.setInterval(handler, interval);
    this.timers.add(timerId);

    return timerId;
  }

  /**
   * Clear a specific timer
   */
  protected clearTimeout(timerId: number): void {
    window.clearTimeout(timerId);
    this.timers.delete(timerId);
  }

  /**
   * Clear a specific interval
   */
  protected clearInterval(timerId: number): void {
    window.clearInterval(timerId);
    this.timers.delete(timerId);
  }

  /**
   * Clear all tracked timers
   */
  protected clearAllTimers(): void {
    this.timers.forEach((timerId) => {
      window.clearTimeout(timerId);
      window.clearInterval(timerId);
    });
    this.timers.clear();
  }

  // ==========================================================================
  // RESOURCE MANAGEMENT - DOM EVENT LISTENERS
  // ==========================================================================

  /**
   * Wrapper for addEventListener that automatically tracks and removes the listener
   */
  protected addEventListener(
    element: HTMLElement | Document | Window,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void {
    if (this.destroyed) {
      console.warn(
        '[Component] Cannot add event listener to destroyed component'
      );
      return;
    }

    element.addEventListener(event, handler as EventListener, options);
    this.eventListeners.push({
      element,
      event,
      handler: handler as EventListener,
      options,
    });
  }

  /**
   * Remove a specific tracked event listener
   */
  protected removeEventListener(
    element: HTMLElement | Document | Window,
    event: string,
    handler: EventListener
  ): void {
    element.removeEventListener(event, handler);
    this.eventListeners = this.eventListeners.filter(
      (el) =>
        !(
          el.element === element &&
          el.event === event &&
          el.handler === handler
        )
    );
  }

  /**
   * Remove all tracked event listeners
   */
  protected removeAllEventListeners(): void {
    this.eventListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this.eventListeners = [];
  }

  // ==========================================================================
  // RESOURCE MANAGEMENT - EVENT EMITTER SUBSCRIPTIONS
  // ==========================================================================

  /**
   * Subscribe to an event emitter with automatic cleanup
   */
  protected subscribeEvent(event: EventType, listener: EventListener): void {
    if (this.destroyed) {
      console.warn(
        '[Component] Cannot subscribe to event on destroyed component'
      );
      return;
    }

    eventEmitter.on(event, listener);
    this.eventSubscriptions.push({ event, listener });
  }

  /**
   * Unsubscribe from a specific event
   */
  protected unsubscribeEvent(event: EventType, listener: EventListener): void {
    eventEmitter.off(event, listener);
    this.eventSubscriptions = this.eventSubscriptions.filter(
      (sub) => !(sub.event === event && sub.listener === listener)
    );
  }

  /**
   * Unsubscribe from all tracked events
   */
  protected unsubscribeAllEvents(): void {
    this.eventSubscriptions.forEach(({ event, listener }) => {
      eventEmitter.off(event, listener);
    });
    this.eventSubscriptions = [];
  }

  // ==========================================================================
  // RESOURCE MANAGEMENT - FETCH REQUESTS
  // ==========================================================================

  /**
   * Create an AbortController for fetch requests
   */
  protected createAbortController(): AbortController {
    if (this.destroyed) {
      console.warn(
        '[Component] Cannot create abort controller for destroyed component'
      );
      throw new Error('Cannot create abort controller for destroyed component');
    }

    const controller = new AbortController();
    this.abortControllers.add(controller);

    return controller;
  }

  /**
   * Abort all tracked fetch requests
   */
  protected abortAllRequests(): void {
    this.abortControllers.forEach((controller) => {
      controller.abort();
    });
    this.abortControllers.clear();
  }

  // ==========================================================================
  // GENERAL RESOURCE MANAGEMENT
  // ==========================================================================

  /**
   * Register a custom cleanup function
   */
  protected addAutoCleanup(cleanupFn: CleanupFunction): void {
    if (this.destroyed) {
      console.warn('[Component] Cannot add cleanup to destroyed component');
      return;
    }

    this.cleanup.push(cleanupFn);
  }

  /**
   * Create a cleanup function that will run a callback once on destroy
   */
  protected registerCleanup(callback: CleanupFunction): void {
    this.addAutoCleanup(() => {
      try {
        callback();
      } catch (error) {
        console.error('[Component] Error in registered cleanup:', error);
      }
    });
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  /**
   * Safely execute a function only if component is not destroyed
   */
  protected safeExecute(fn: () => void): void {
    if (!this.destroyed) {
      fn();
    }
  }

  /**
   * Log a warning if operation is attempted on destroyed component
   */
  protected warnIfDestroyed(operation: string): void {
    if (this.destroyed) {
      console.warn(`[Component] Cannot ${operation}: component is destroyed`);
    }
  }
}

/**
 * Factory function to create a component with automatic cleanup
 */
export function createComponent<T extends Component>(
  ComponentClass: new (...args: any[]) => T,
  ...args: any[]
): T {
  return new ComponentClass(...args);
}

export default Component;
