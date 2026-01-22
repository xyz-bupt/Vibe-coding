/**
 * Audio Manager for Pomodoro Timer
 * Handles all audio feedback for timer events
 */

import { AudioEventType } from '../types/index';

/**
 * Audio configuration for different notification types
 */
interface AudioConfig {
  src: string;
  volume: number;
  loop?: boolean;
}

/**
 * Sound effect types
 */
export enum SoundType {
  START = 'start',
  COMPLETE = 'complete',
  BREAK_START = 'break_start',
  PAUSE = 'pause',
  TICK = 'tick',
}

/**
 * Default sound URLs (can be overridden)
 */
const DEFAULT_SOUNDS: Record<SoundType, string> = {
  [SoundType.START]: '/sounds/start.mp3',
  [SoundType.COMPLETE]: '/sounds/complete.mp3',
  [SoundType.BREAK_START]: '/sounds/break.mp3',
  [SoundType.PAUSE]: '/sounds/pause.mp3',
  [SoundType.TICK]: '/sounds/tick.mp3',
};

/**
 * Audio load state
 */
enum AudioLoadState {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
}

/**
 * Audio element wrapper with load state
 */
interface AudioElement {
  element: HTMLAudioElement;
  state: AudioLoadState;
  config: AudioConfig;
}

/**
 * AudioManager class for handling all timer-related audio feedback
 * Supports preloading, volume control, and muting
 */
export class AudioManager {
  private audioElements: Map<SoundType, AudioElement>;
  private masterVolume: number;
  private isMuted: boolean;
  private isBrowserSupported: boolean;
  private audioContext: AudioContext | null;

  constructor() {
    this.audioElements = new Map();
    this.masterVolume = 0.7;
    this.isMuted = false;
    this.isBrowserSupported = this.checkBrowserSupport();
    this.audioContext = this.initAudioContext();

    // Preload default sounds
    this.preloadSounds();
  }

  /**
   * Check if browser supports HTML5 Audio
   */
  private checkBrowserSupport(): boolean {
    return typeof Audio !== 'undefined';
  }

  /**
   * Initialize Web Audio API for advanced features
   */
  private initAudioContext(): AudioContext | null {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      return AudioContextClass ? new AudioContextClass() : null;
    } catch {
      return null;
    }
  }

  /**
   * Preload all default sounds
   */
  private preloadSounds(): void {
    if (!this.isBrowserSupported) {
      return;
    }

    Object.values(SoundType).forEach((soundType) => {
      this.loadSound(soundType, DEFAULT_SOUNDS[soundType]);
    });
  }

  /**
   * Load a sound file
   * @param soundType - Type of sound to load
   * @param src - URL to the sound file
   */
  public loadSound(soundType: SoundType, src: string): void {
    if (!this.isBrowserSupported) {
      return;
    }

    // Unload existing sound if present
    const existing = this.audioElements.get(soundType);
    if (existing) {
      existing.element.pause();
      existing.element.src = '';
    }

    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = this.getEffectiveVolume();

    const audioElement: AudioElement = {
      element: audio,
      state: AudioLoadState.LOADING,
      config: { src, volume: this.masterVolume },
    };

    audio.addEventListener(
      'canplaythrough',
      () => {
        audioElement.state = AudioLoadState.LOADED;
      },
      { once: true }
    );

    audio.addEventListener(
      'error',
      () => {
        audioElement.state = AudioLoadState.ERROR;
        console.warn(`Failed to load audio: ${src}`);
      },
      { once: true }
    );

    this.audioElements.set(soundType, audioElement);
  }

  /**
   * Play a sound by type
   * @param soundType - Type of sound to play
   * @param volume - Optional volume override (0-1)
   */
  public play(soundType: SoundType, volume?: number): void {
    if (!this.isBrowserSupported || this.isMuted) {
      return;
    }

    // Resume AudioContext if suspended (required by some browsers)
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume().catch(() => {
        // Ignore resume errors
      });
    }

    const audioWrapper = this.audioElements.get(soundType);

    if (!audioWrapper || audioWrapper.state === AudioLoadState.ERROR) {
      return;
    }

    const audio = audioWrapper.element;
    audio.volume =
      volume !== undefined
        ? volume * this.masterVolume
        : this.getEffectiveVolume();

    // Reset to beginning if already playing
    audio.currentTime = 0;

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        // Auto-play was prevented, log for debugging
        console.debug('Audio playback prevented:', error);
      });
    }
  }

  /**
   * Play sound when timer starts
   */
  public playStartSound(): void {
    this.play(SoundType.START);
  }

  /**
   * Play sound when timer completes
   */
  public playCompleteSound(): void {
    this.play(SoundType.COMPLETE);
  }

  /**
   * Play sound when break starts
   */
  public playBreakStartSound(): void {
    this.play(SoundType.BREAK_START);
  }

  /**
   * Play sound when timer is paused
   */
  public playPauseSound(): void {
    this.play(SoundType.PAUSE);
  }

  /**
   * Play tick sound (for optional ticking)
   */
  public playTickSound(): void {
    this.play(SoundType.TICK, 0.3); // Lower volume for tick
  }

  /**
   * Set master volume
   * @param volume - Volume level between 0 and 1
   */
  public setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));

    // Update all loaded audio elements
    this.audioElements.forEach((wrapper) => {
      wrapper.element.volume = this.getEffectiveVolume();
      wrapper.config.volume = this.masterVolume;
    });
  }

  /**
   * Get current master volume
   */
  public getVolume(): number {
    return this.masterVolume;
  }

  /**
   * Mute all sounds
   */
  public mute(): void {
    this.isMuted = true;

    this.audioElements.forEach((wrapper) => {
      wrapper.element.volume = 0;
    });
  }

  /**
   * Unmute sounds
   */
  public unmute(): void {
    this.isMuted = false;

    this.audioElements.forEach((wrapper) => {
      wrapper.element.volume = this.getEffectiveVolume();
    });
  }

  /**
   * Toggle mute state
   */
  public toggleMute(): void {
    if (this.isMuted) {
      this.unmute();
    } else {
      this.mute();
    }
  }

  /**
   * Check if currently muted
   */
  public isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * Get effective volume considering mute state
   */
  private getEffectiveVolume(): number {
    return this.isMuted ? 0 : this.masterVolume;
  }

  /**
   * Stop all currently playing sounds
   */
  public stopAll(): void {
    this.audioElements.forEach((wrapper) => {
      if (!wrapper.element.paused) {
        wrapper.element.pause();
        wrapper.element.currentTime = 0;
      }
    });
  }

  /**
   * Stop a specific sound
   */
  public stop(soundType: SoundType): void {
    const wrapper = this.audioElements.get(soundType);
    if (wrapper) {
      wrapper.element.pause();
      wrapper.element.currentTime = 0;
    }
  }

  /**
   * Check if browser audio is supported
   */
  public isAudioSupported(): boolean {
    return this.isBrowserSupported;
  }

  /**
   * Check if a specific sound is loaded
   */
  public isSoundLoaded(soundType: SoundType): boolean {
    const wrapper = this.audioElements.get(soundType);
    return wrapper?.state === AudioLoadState.LOADED || false;
  }

  /**
   * Set custom sound URL for a sound type
   * @param soundType - Type of sound to customize
   * @param url - URL to the custom sound file
   */
  public setCustomSound(soundType: SoundType, url: string): void {
    this.loadSound(soundType, url);
  }

  /**
   * Play audio event based on timer event type
   */
  public playForEvent(eventType: AudioEventType): void {
    switch (eventType) {
      case AudioEventType.START:
        this.playStartSound();
        break;
      case AudioEventType.COMPLETE:
        this.playCompleteSound();
        break;
      case AudioEventType.BREAK_START:
        this.playBreakStartSound();
        break;
      case AudioEventType.PAUSE:
        this.playPauseSound();
        break;
    }
  }

  /**
   * Cleanup and release resources
   */
  public dispose(): void {
    this.stopAll();
    this.audioElements.forEach((wrapper) => {
      wrapper.element.src = '';
      wrapper.element.load();
    });
    this.audioElements.clear();

    if (this.audioContext) {
      this.audioContext.close().catch(() => {
        // Ignore close errors
      });
      this.audioContext = null;
    }
  }

  /**
   * Generate a simple beep tone using Web Audio API
   * Useful as fallback when sound files fail to load
   * @param frequency - Frequency in Hz
   * @param duration - Duration in seconds
   */
  public playBeep(frequency: number = 800, duration: number = 0.1): void {
    if (!this.audioContext || this.isMuted) {
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(
        this.masterVolume,
        this.audioContext.currentTime
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.debug('Web Audio API beep failed:', error);
    }
  }

  /**
   * Play a sequence of beeps
   * @param pattern - Array of [frequency, duration] pairs
   * @param interval - Delay between beeps in ms
   */
  public playBeepSequence(
    pattern: Array<[number, number]>,
    interval: number = 100
  ): void {
    if (!this.audioContext || this.isMuted) {
      return;
    }

    pattern.forEach(([frequency, duration], index) => {
      setTimeout(
        () => {
          this.playBeep(frequency, duration);
        },
        index * (duration * 1000 + interval)
      );
    });
  }
}

/**
 * Singleton instance for global use
 */
let audioManagerInstance: AudioManager | null = null;

/**
 * Get or create the singleton AudioManager instance
 */
export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetAudioManager(): void {
  if (audioManagerInstance) {
    audioManagerInstance.dispose();
  }
  audioManagerInstance = null;
}
