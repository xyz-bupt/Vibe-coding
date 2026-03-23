/**
 * useAudioEngine - Web Audio API 核心逻辑
 *
 * 功能：
 * - 初始化 AudioContext
 * - 支持麦克风输入
 * - 支持本地音频文件输入
 * - 提供频域和时域数据
 * - 音效处理节点链（混响、低音、高音、音量）
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// 音频配置常量
export const AUDIO_CONFIG = Object.freeze({
  FFT_SIZE: 2048,
  SMOOTHING_TIME_CONSTANT: 0.8,
  BAR_COUNT: 128,
  DEFAULT_SAMPLE_RATE: 44100,
});

// 音源类型常量
export const SOURCE_TYPE = Object.freeze({
  MIC: 'mic',
  FILE: 'file',
});

// 生成混响脉冲响应
function createReverbImpulse(ctx, duration = 2, decay = 2) {
  const sampleRate = ctx.sampleRate;
  const length = sampleRate * duration;
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const n = i / length;
    // 指数衰减的随机噪声
    const value = (Math.random() * 2 - 1) * Math.pow(1 - n, decay);
    left[i] = value;
    right[i] = value;
  }

  return impulse;
}

export function useAudioEngine() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sourceType, setSourceType] = useState(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const audioElementRef = useRef(null);
  const blobUrlRef = useRef(null);

  // 音效节点
  const bassFilterRef = useRef(null);
  const trebleFilterRef = useRef(null);
  const gainNodeRef = useRef(null);
  const convolverNodeRef = useRef(null);
  const dryGainNodeRef = useRef(null);
  const wetGainNodeRef = useRef(null);

  // 缓存数据数组
  const frequencyDataRef = useRef(null);

  /**
   * 初始化 AudioContext 和音效节点链
   */
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      const ctx = audioContextRef.current;

      // 创建 AnalyserNode
      const analyser = ctx.createAnalyser();
      analyser.fftSize = AUDIO_CONFIG.FFT_SIZE;
      analyser.smoothingTimeConstant = AUDIO_CONFIG.SMOOTHING_TIME_CONSTANT;
      analyserRef.current = analyser;

      // 创建低音滤波器
      const bassFilter = ctx.createBiquadFilter();
      bassFilter.type = 'lowshelf';
      bassFilter.frequency.value = 200;
      bassFilter.gain.value = 0;
      bassFilterRef.current = bassFilter;

      // 创建高音滤波器
      const trebleFilter = ctx.createBiquadFilter();
      trebleFilter.type = 'highshelf';
      trebleFilter.frequency.value = 4000;
      trebleFilter.gain.value = 0;
      trebleFilterRef.current = trebleFilter;

      // 创建主音量节点
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.8;
      gainNodeRef.current = gainNode;

      // 创建混响卷积器
      const convolver = ctx.createConvolver();
      const impulse = createReverbImpulse(ctx, 2, 2);
      convolver.buffer = impulse;
      convolverNodeRef.current = convolver;

      // 创建混响干/湿混合节点
      const dryGain = ctx.createGain();
      dryGain.gain.value = 1;
      dryGainNodeRef.current = dryGain;

      const wetGain = ctx.createGain();
      wetGain.gain.value = 0;
      wetGainNodeRef.current = wetGain;

      console.log('[AudioEngine] AudioContext initialized with effects chain');
    }
    return audioContextRef.current;
  }, []);

  /**
   * 连接音效节点链
   * Source → BassFilter → TrebleFilter → GainNode → [Dry -> Out, Wet -> Convolver -> Out]
   */
  const connectEffectsChain = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    // 断开所有现有连接
    const nodes = [
      sourceRef.current,
      bassFilterRef.current,
      trebleFilterRef.current,
      gainNodeRef.current,
      analyserRef.current,
      dryGainNodeRef.current,
      wetGainNodeRef.current,
      convolverNodeRef.current,
    ].filter(Boolean);

    nodes.forEach(node => {
      try {
        node.disconnect();
      } catch {
        // Ignore errors when disconnecting
      }
    });

    const source = sourceRef.current;
    const bass = bassFilterRef.current;
    const treble = trebleFilterRef.current;
    const gain = gainNodeRef.current;
    const analyser = analyserRef.current;
    const dry = dryGainNodeRef.current;
    const wet = wetGainNodeRef.current;
    const convolver = convolverNodeRef.current;

    // 构建效果链
    // Source → Bass → Treble → Gain → [Dry + Wet(Convolver)] → Analyser → Destination
    source.connect(bass);
    bass.connect(treble);
    treble.connect(gain);

    // 干信号路径
    gain.connect(dry);
    dry.connect(analyser);
    dry.connect(ctx.destination);

    // 湿信号路径（混响）
    gain.connect(wet);
    wet.connect(convolver);
    convolver.connect(analyser);
    convolver.connect(ctx.destination);

    console.log('[AudioEngine] Effects chain connected');
  }, []);

  /**
   * 启动麦克风输入
   */
  const startMicrophone = useCallback(async () => {
    try {
      const ctx = initAudioContext();

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('[AudioEngine] Microphone access granted');

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;

      connectEffectsChain();
      setSourceType(SOURCE_TYPE.MIC);
      setIsPlaying(true);

      return stream;
    } catch (error) {
      console.error('[AudioEngine] Microphone error:', error);
      throw error;
    }
  }, [initAudioContext, connectEffectsChain]);

  /**
   * 加载本地音频文件
   *
   * 关键修复：确保每次都创建全新的 audio 元素和 MediaElementSource
   * - 将 audio 元素添加到 DOM 以确保正确的生命周期管理
   * - 完全清理之前的资源
   * - 使用唯一 ID 避免冲突
   */
  const loadAudioFile = useCallback(async (file) => {
    try {
      const ctx = initAudioContext();

      // 确保 AudioContext 处于运行状态
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // 步骤 1: 完全清理之前的资源
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch (e) {
          console.warn('[AudioEngine] Error disconnecting source:', e);
        }
        sourceRef.current = null;
      }

      // 步骤 2: 完全清理之前的 audio 元素
      if (audioElementRef.current) {
        const oldAudio = audioElementRef.current;
        oldAudio.pause();
        oldAudio.currentTime = 0;
        oldAudio.src = '';
        oldAudio.load();

        // 从 DOM 中移除
        if (oldAudio.parentNode) {
          oldAudio.parentNode.removeChild(oldAudio);
        }

        audioElementRef.current = null;
      }

      // 步骤 3: 释放之前的 blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      // 步骤 4: 创建全新的 Audio 元素
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';

      // 关键修复：将 audio 元素添加到 DOM（隐藏状态）
      // 这确保了浏览器的正确生命周期管理
      audio.style.display = 'none';
      audio.style.position = 'absolute';
      audio.style.left = '-9999px';
      document.body.appendChild(audio);
      audioElementRef.current = audio;

      // 步骤 5: 创建 blob URL 并设置到 audio 元素
      const url = URL.createObjectURL(file);
      blobUrlRef.current = url;
      audio.src = url;

      // 步骤 6: 等待音频可以播放
      await new Promise((resolve, reject) => {
        const handleCanPlay = () => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
          resolve();
        };

        const handleError = (e) => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
          reject(new Error(`Failed to load audio: ${e.message || 'Unknown error'}`));
        };

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);

        // 设置超时以防止永久等待
        setTimeout(() => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
          reject(new Error('Audio loading timeout'));
        }, 10000);
      });

      // 步骤 7: 创建 MediaElementSource（必须在 audio 元素添加到 DOM 后）
      let source;
      try {
        source = ctx.createMediaElementSource(audio);
        sourceRef.current = source;
      } catch (error) {
        // 如果创建失败，清理资源并抛出错误
        console.error('[AudioEngine] Failed to create MediaElementSource:', error);
        if (audio.parentNode) {
          audio.parentNode.removeChild(audio);
        }
        audioElementRef.current = null;
        URL.revokeObjectURL(url);
        blobUrlRef.current = null;
        throw new Error(`Failed to create audio source: ${error.message}`);
      }

      // 步骤 8: 连接效果链
      connectEffectsChain();

      // 步骤 9: 更新状态
      setSourceType(SOURCE_TYPE.FILE);
      setIsPlaying(true);

      // 步骤 10: 开始播放
      try {
        await audio.play();
      } catch (playError) {
        console.error('[AudioEngine] Failed to play audio:', playError);
        throw new Error(`Failed to play audio: ${playError.message}`);
      }

      console.log('[AudioEngine] Audio file loaded successfully:', file.name);
      console.log('[AudioEngine] Duration:', audio.duration, 'seconds');
      console.log('[AudioEngine] Audio element added to DOM');

      return audio;
    } catch (error) {
      // 错误处理：确保清理所有资源
      console.error('[AudioEngine] Audio file loading error:', error);

      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      if (audioElementRef.current) {
        const audio = audioElementRef.current;
        if (audio.parentNode) {
          audio.parentNode.removeChild(audio);
        }
        audioElementRef.current = null;
      }

      sourceRef.current = null;

      throw error;
    }
  }, [initAudioContext, connectEffectsChain]);

  /**
   * 设置低音增强 (-12 到 +12 dB)
   */
  const setBass = useCallback((value) => {
    const filter = bassFilterRef.current;
    if (filter) {
      const gain = (value - 0.5) * 24; // 0-1 映射到 -12 到 +12 dB
      filter.gain.setTargetAtTime(gain, audioContextRef.current.currentTime, 0.01);
    }
  }, []);

  /**
   * 设置高音 (-12 到 +12 dB)
   */
  const setTreble = useCallback((value) => {
    const filter = trebleFilterRef.current;
    if (filter) {
      const gain = (value - 0.5) * 24; // 0-1 映射到 -12 到 +12 dB
      filter.gain.setTargetAtTime(gain, audioContextRef.current.currentTime, 0.01);
    }
  }, []);

  /**
   * 设置音量 (0-1)
   */
  const setVolume = useCallback((value) => {
    const gain = gainNodeRef.current;
    if (gain) {
      gain.gain.setTargetAtTime(value, audioContextRef.current.currentTime, 0.01);
    }
  }, []);

  /**
   * 设置混响 (0-1)
   */
  const setReverb = useCallback((value) => {
    const dry = dryGainNodeRef.current;
    const wet = wetGainNodeRef.current;
    if (dry && wet) {
      const time = audioContextRef.current.currentTime;
      // 湿信号随值增加，干信号减少
      wet.gain.setTargetAtTime(value, time, 0.01);
      dry.gain.setTargetAtTime(1 - value * 0.5, time, 0.01); // 保留至少 50% 干信号
    }
  }, []);

  /**
   * 停止音频
   *
   * 关键修复：完全清理所有资源，确保下次可以重新创建
   */
  const stop = useCallback(() => {
    console.log('[AudioEngine] Stopping audio...');

    // 步骤 1: 断开并清理源节点
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
        console.log('[AudioEngine] Source disconnected');
      } catch (error) {
        console.warn('[AudioEngine] Error disconnecting source:', error);
      }
      sourceRef.current = null;
    }

    // 步骤 2: 完全清理音频元素
    if (audioElementRef.current) {
      const audio = audioElementRef.current;

      // 停止播放
      audio.pause();

      // 重置播放位置
      audio.currentTime = 0;

      // 清空源并重新加载
      audio.removeAttribute('src');
      audio.load();

      // 从 DOM 中移除
      if (audio.parentNode) {
        audio.parentNode.removeChild(audio);
        console.log('[AudioEngine] Audio element removed from DOM');
      }

      audioElementRef.current = null;
    }

    // 步骤 3: 释放 blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
      console.log('[AudioEngine] Blob URL revoked');
    }

    // 步骤 4: 重置状态
    setIsPlaying(false);
    setSourceType(null);

    console.log('[AudioEngine] Stopped completely');
  }, []);

  /**
   * 清理资源（组件卸载时）
   */
  useEffect(() => {
    return () => {
      console.log('[AudioEngine] Cleanup on unmount...');

      // 清理源节点
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch (error) {
          console.warn('[AudioEngine] Cleanup - Error disconnecting source:', error);
        }
        sourceRef.current = null;
      }

      // 清理音频元素
      if (audioElementRef.current) {
        const audio = audioElementRef.current;
        audio.pause();
        audio.removeAttribute('src');
        audio.load();

        // 从 DOM 中移除
        if (audio.parentNode) {
          audio.parentNode.removeChild(audio);
        }

        audioElementRef.current = null;
      }

      // 释放 blob URL
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      // 关闭 AudioContext
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(err => {
          console.warn('[AudioEngine] Cleanup - Error closing AudioContext:', err);
        });
      }

      console.log('[AudioEngine] Cleanup complete');
    };
  }, []);

  /**
   * 获取频域数据
   */
  const getFrequencyData = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return new Uint8Array(0);

    if (!frequencyDataRef.current) {
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
    analyser.getByteFrequencyData(frequencyDataRef.current);
    return frequencyDataRef.current;
  }, []);

  return {
    // 状态
    isPlaying,
    sourceType,

    // 方法
    initAudioContext,
    startMicrophone,
    loadAudioFile,
    stop,
    getFrequencyData,

    // 音效控制
    setBass,
    setTreble,
    setVolume,
    setReverb,

    // Analyser 节点（只读引用，用于可视化组件）
    // eslint-disable-next-line react-hooks/refs
    analyser: analyserRef.current,
  };
}
