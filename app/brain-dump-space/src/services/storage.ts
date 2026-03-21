/**
 * LocalStorage Service for Brain Dump Space
 *
 * Handles persistence of thoughts and application settings.
 */

import type { Thought, AppSettings } from '../types';

const STORAGE_KEYS = {
  THOUGHTS: 'brain-dump-thoughts',
  SETTINGS: 'brain-dump-settings',
} as const;

/**
 * Generate a unique ID for a thought
 */
function generateId(): string {
  return `thought-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Storage service for managing thoughts and settings in LocalStorage
 */
export class StorageService {
  /**
   * Save a new thought to LocalStorage
   * @param thoughtData - The thought content and tags (without id and createdAt)
   * @returns The complete saved thought with generated id and timestamp
   */
  static saveThought(thoughtData: Omit<Thought, 'id' | 'createdAt'>): Thought {
    const thought: Thought = {
      id: generateId(),
      content: thoughtData.content,
      tags: thoughtData.tags,
      createdAt: Date.now(),
    };

    const thoughts = this.getThoughts();
    thoughts.unshift(thought); // Add to beginning
    this.setThoughts(thoughts);

    return thought;
  }

  /**
   * Retrieve all thoughts from LocalStorage
   * @returns Array of all saved thoughts, sorted by creation date (newest first)
   */
  static getThoughts(): Thought[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.THOUGHTS);
      if (!data) return [];
      const thoughts = JSON.parse(data) as Thought[];
      // Sort by createdAt descending
      return thoughts.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error reading thoughts from storage:', error);
      return [];
    }
  }

  /**
   * Save the entire thoughts array to LocalStorage
   * @param thoughts - Array of thoughts to save
   */
  static setThoughts(thoughts: Thought[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THOUGHTS, JSON.stringify(thoughts));
    } catch (error) {
      console.error('Error saving thoughts to storage:', error);
    }
  }

  /**
   * Delete a specific thought by ID
   * @param thoughtId - The ID of the thought to delete
   */
  static deleteThought(thoughtId: string): void {
    const thoughts = this.getThoughts().filter(t => t.id !== thoughtId);
    this.setThoughts(thoughts);
  }

  /**
   * Clear all thoughts from LocalStorage
   */
  static clearThoughts(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.THOUGHTS);
    } catch (error) {
      console.error('Error clearing thoughts from storage:', error);
    }
  }

  /**
   * Save application settings
   * @param settings - Settings object to save
   */
  static saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings to storage:', error);
    }
  }

  /**
   * Retrieve application settings
   * @returns Current settings object
   */
  static getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading settings from storage:', error);
      return {};
    }
  }

  /**
   * Export all data as JSON (excluding sensitive data like API keys)
   * @returns JSON string of all thoughts and safe settings
   */
  static exportData(): string {
    const settings = this.getSettings();
    const safeSettings = {
      useRealAI: settings.useRealAI,
      apiUrl: settings.apiUrl,
      modelName: settings.modelName,
      // Explicitly exclude API keys
    };
    const data = {
      thoughts: this.getThoughts(),
      settings: safeSettings,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from JSON
   * @param jsonData - JSON string to import
   * @returns true if import was successful
   */
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.thoughts && Array.isArray(data.thoughts)) {
        this.setThoughts(data.thoughts);
      }
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}
