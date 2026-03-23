/**
 * FrequencyBars.jsx - 频谱柱状图组件
 *
 * 使用 Canvas 渲染实时音频频谱
 */

import { useRef, useEffect } from 'react';

export function FrequencyBars({ analyser, width = 600, height = 120 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置 canvas 实际尺寸
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // 频谱配置
    const barCount = 64; // 减少柱子数量以适应更小的宽度
    const bufferLength = analyser.frequencyBinCount;
    const step = Math.floor(bufferLength / barCount);
    const barWidth = (width / barCount) - 1;

    // 每次重新初始化动画数据，确保 bufferLength 正确
    const dataArray = new Uint8Array(bufferLength);

    let animationId;

    const render = () => {
      animationId = requestAnimationFrame(render);

      // 获取频域数据
      analyser.getByteFrequencyData(dataArray);

      // 清空画布
      ctx.clearRect(0, 0, width, height);

      // 渲染每一根柱子
      for (let i = 0; i < barCount; i++) {
        // 计算该柱子对应频率范围内的平均值
        let value = 0;
        for (let j = 0; j < step; j++) {
          const index = i * step + j;
          if (index < bufferLength) {
            value += dataArray[index];
          }
        }
        value = value / step;

        // 计算柱子高度
        const barHeight = (value / 255) * height;

        // 计算颜色
        const hue = (i / barCount) * 280;

        // 绘制柱子
        const x = i * (barWidth + 1);
        const y = height - barHeight;

        ctx.fillStyle = `hsl(${hue}, 80%, 60%)`;
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyser, width, height]);

  return <canvas ref={canvasRef} />;
}
