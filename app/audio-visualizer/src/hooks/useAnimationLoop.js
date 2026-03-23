/**
 * useAnimationLoop - 统一的 requestAnimationFrame 管理
 *
 * 所有可视组件注册回调，由顶层统一管理渲染循环
 */

import { useEffect, useRef } from 'react';

// 全局回调注册表
const callbacks = new Set();
let isRunning = false;
let animationFrameId = null;

/**
 * 注册渲染回调
 * @param {Function} callback - 每帧调用的回调函数
 * @returns {Function} - 取消注册的函数
 */
export function registerRenderCallback(callback) {
  callbacks.add(callback);

  // 返回取消注册函数
  return () => {
    callbacks.delete(callback);
  };
}

/**
 * 启动全局动画循环
 */
function startLoop() {
  if (isRunning) return;

  isRunning = true;

  const loop = (timestamp) => {
    // 调用所有注册的回调
    callbacks.forEach(callback => {
      try {
        callback(timestamp);
      } catch (error) {
        console.error('[AnimationLoop] Callback error:', error);
      }
    });

    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);
}

/**
 * 停止全局动画循环
 */
function stopLoop() {
  if (!isRunning) return;

  isRunning = false;
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

/**
 * useAnimationLoop Hook
 *
 * 自动管理动画循环，组件卸载时自动清理
 *
 * @param {Function} callback - 渲染回调函数
 * @param {Array} deps - 依赖数组，变化时重新注册
 */
export function useAnimationLoop(callback, deps = []) {
  const cleanupRef = useRef(null);

  useEffect(() => {
    // 注册回调
    cleanupRef.current = registerRenderCallback(callback);

    // 启动循环（如果还没启动）
    startLoop();

    // 组件卸载时清理
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      // 如果没有回调了，停止循环
      if (callbacks.size === 0) {
        stopLoop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callback, ...deps]);
}
