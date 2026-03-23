/**
 * WaveformLine.jsx - 实时波形线组件
 *
 * 使用 Canvas 渲染音频波形，带拖尾效果
 */

import { useRef, useEffect } from 'react';

export function WaveformLine({ analyser, width = 400, height = 80 }) {
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

    // 每次重新初始化动画数据，确保 fftSize 正确
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    const sliceWidth = width / bufferLength;
    const halfHeight = height / 2;

    let animationId;

    const render = () => {
      animationId = requestAnimationFrame(render);

      // 获取时域数据
      analyser.getByteTimeDomainData(dataArray);

      // 绘制半透明背景（拖尾效果）
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // 开始绘制波形线
      ctx.beginPath();
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 1.5;

      // 移动到第一个点
      let x = 0;
      const y = ((dataArray[0] - 128) / 128.0) * halfHeight + halfHeight;
      ctx.moveTo(x, y);

      // 绘制波形曲线
      for (let i = 1; i < bufferLength; i++) {
        x = i * sliceWidth;
        const y = ((dataArray[i] - 128) / 128.0) * halfHeight + halfHeight;
        ctx.lineTo(x, y);
      }

      ctx.stroke();
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [analyser, width, height]);

  return <canvas ref={canvasRef} />;
}
