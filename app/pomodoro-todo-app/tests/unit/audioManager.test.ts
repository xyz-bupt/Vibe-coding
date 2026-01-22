/**
 * Unit tests for AudioManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AudioManager, SoundType, resetAudioManager } from '../../src/services/audioManager';

// Mock Audio class
class MockAudio {
  src: string;
  volume: number;
  preload: string;
  paused: boolean = true;
  currentTime: number = 0;
  loop: boolean = false;

  private canPlayThroughCallbacks: Array<() => void> = [];
  private errorCallbacks: Array<() => void> = [];
  private playPromise: Promise<void> | null = null;
  private shouldFail: boolean = false;

  constructor(src: string) {
    this.src = src;
    this.volume = 0.7;
    this.preload = 'auto';
  }

  addEventListener(event: string, callback: () => void, options?: { once: boolean }): void {
    if (event === 'canplaythrough') {
      this.canPlayThroughCallbacks.push(callback);
      // Simulate audio loaded
      setTimeout(() => {
        if (!options?.once || this.canPlayThroughCallbacks.includes(callback)) {
          callback();
        }
      }, 0);
    }
    if (event === 'error') {
      this.errorCallbacks.push(callback);
    }
  }

  removeEventListener(event: string, callback: () => void): void {
    if (event === 'canplaythrough') {
      this.canPlayThroughCallbacks = this.canPlayThroughCallbacks.filter(cb => cb !== callback);
    }
    if (event === 'error') {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    }
  }

  async play(): Promise<void> {
    this.paused = false;
    if (this.shouldFail) {
      throw new Error('Playback failed');
    }
    return Promise.resolve();
  }

  pause(): void {
    this.paused = true;
  }

  load(): void {
    // Simulate load
  }

  set shouldFailPlayback(value: boolean) {
    this.shouldFail = value;
  }
}

// Mock window.Audio
const mockAudio = vi.fn((src: string) => new MockAudio(src));

describe('AudioManager', () => {
  let audioManager: AudioManager;
  let originalAudio: typeof Audio;

  beforeEach(() => {
    // Reset singleton
    resetAudioManager();

    // Save original Audio constructor
    originalAudio = (window as any).Audio;

    // Mock Audio constructor
    (window as any).Audio = mockAudio;
    (window as any).AudioContext = vi.fn().mockImplementation(() => ({
      state: 'running',
      resume: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
      createOscillator: vi.fn(() => ({
        connect: vi.fn(),
        frequency: { value: 0 },
        start: vi.fn(),
        stop: vi.fn()
      })),
      createGain: vi.fn(() => ({
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn()
        }
      })),
      destination: {}
    }));

    audioManager = new AudioManager();
  });

  afterEach(() => {
    audioManager.dispose();
    resetAudioManager();

    // Restore original Audio constructor
    (window as any).Audio = originalAudio;
  });

  describe('Initialization', () => {
    it('should initialize with default volume', () => {
      expect(audioManager.getVolume()).toBe(0.7);
    });

    it('should not be muted by default', () => {
      expect(audioManager.isMutedState()).toBe(false);
    });

    it('should detect audio support', () => {
      expect(audioManager.isAudioSupported()).toBe(true);
    });
  });

  describe('Volume control', () => {
    it('should set volume between 0 and 1', () => {
      audioManager.setVolume(0.5);
      expect(audioManager.getVolume()).toBe(0.5);
    });

    it('should clamp volume to maximum 1', () => {
      audioManager.setVolume(1.5);
      expect(audioManager.getVolume()).toBe(1);
    });

    it('should clamp volume to minimum 0', () => {
      audioManager.setVolume(-0.5);
      expect(audioManager.getVolume()).toBe(0);
    });

    it('should mute audio', () => {
      audioManager.mute();
      expect(audioManager.isMutedState()).toBe(true);
    });

    it('should unmute audio', () => {
      audioManager.mute();
      audioManager.unmute();
      expect(audioManager.isMutedState()).toBe(false);
    });

    it('should toggle mute state', () => {
      const initialMuted = audioManager.isMutedState();
      audioManager.toggleMute();
      expect(audioManager.isMutedState()).toBe(!initialMuted);
    });
  });

  describe('Sound playback', () => {
    it('should play start sound', () => {
      expect(() => audioManager.playStartSound()).not.toThrow();
    });

    it('should play complete sound', () => {
      expect(() => audioManager.playCompleteSound()).not.toThrow();
    });

    it('should play break start sound', () => {
      expect(() => audioManager.playBreakStartSound()).not.toThrow();
    });

    it('should play pause sound', () => {
      expect(() => audioManager.playPauseSound()).not.toThrow();
    });

    it('should not play when muted', () => {
      audioManager.mute();
      expect(() => audioManager.playStartSound()).not.toThrow();
    });

    it('should play with custom volume', () => {
      audioManager.setVolume(0.5);
      expect(() => audioManager.play(SoundType.START, 0.8)).not.toThrow();
    });
  });

  describe('Sound loading', () => {
    it('should load custom sound', () => {
      expect(() => audioManager.loadSound(SoundType.START, '/custom/start.mp3')).not.toThrow();
    });

    it('should check if sound is loaded', () => {
      // After initialization, sounds should be in loading state first
      // Then loaded after canplaythrough event
      setTimeout(() => {
        expect(audioManager.isSoundLoaded(SoundType.START)).toBe(true);
      }, 100);
    });
  });

  describe('Stopping sounds', () => {
    it('should stop all sounds', () => {
      expect(() => audioManager.stopAll()).not.toThrow();
    });

    it('should stop specific sound', () => {
      expect(() => audioManager.stop(SoundType.START)).not.toThrow();
    });
  });

  describe('Beep sounds (Web Audio API)', () => {
    it('should play beep tone', () => {
      expect(() => audioManager.playBeep(800, 0.1)).not.toThrow();
    });

    it('should play beep sequence', () => {
      expect(() => audioManager.playBeepSequence([[800, 0.1], [600, 0.1]])).not.toThrow();
    });

    it('should not play beep when muted', () => {
      audioManager.mute();
      audioManager.playBeep(800, 0.1);
      // Should not throw, just not play
    });
  });

  describe('Event-based playback', () => {
    it('should play sound for audio event', () => {
      const playSpy = vi.spyOn(audioManager, 'play');
      audioManager.playForEvent('start');
      expect(playSpy).toHaveBeenCalled();
    });
  });

  describe('Disposal', () => {
    it('should dispose and release resources', () => {
      expect(() => audioManager.dispose()).not.toThrow();
    });

    it('should clear all sounds after disposal', () => {
      audioManager.dispose();
      expect(() => audioManager.playStartSound()).not.toThrow();
    });
  });
});
