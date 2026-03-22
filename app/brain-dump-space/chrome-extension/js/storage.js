// Storage Service for Chrome Extension

const STORAGE_KEY = 'brain-dump-thoughts';

class StorageService {
  async getThoughts() {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        resolve(result[STORAGE_KEY] || []);
      });
    });
  }

  async saveThought(thought) {
    const thoughts = await this.getThoughts();
    const newThought = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      ...thought
    };
    thoughts.unshift(newThought);
    
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: thoughts }, () => {
        resolve(newThought);
      });
    });
  }

  async deleteThought(id) {
    const thoughts = await this.getThoughts();
    const filtered = thoughts.filter(t => t.id !== id);
    
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: filtered }, resolve);
    });
  }

  async clearAll() {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: [] }, resolve);
    });
  }

  async getSettings() {
    const defaults = {
      useRealAI: false,
      apiUrl: '',
      modelName: '',
      apiKey: ''
    };

    return new Promise((resolve) => {
      chrome.storage.local.get(['brain-dump-settings'], (result) => {
        resolve({ ...defaults, ...result['brain-dump-settings'] });
      });
    });
  }

  async saveSettings(settings) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ 'brain-dump-settings': settings }, resolve);
    });
  }
}

window.storageService = new StorageService();
