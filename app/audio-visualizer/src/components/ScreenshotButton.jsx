/**
 * ScreenshotButton.jsx - 截图按钮
 *
 * 点击将当前粒子画面保存为 PNG
 */

import { useRef, useState } from 'react';

export function ScreenshotButton({ canvasRef }) {
  const [isCapturing, setIsCapturing] = useState(false);
  const linkRef = useRef(document.createElement('a'));

  const handleScreenshot = () => {
    if (!canvasRef) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsCapturing(true);

    try {
      // 获取 canvas 数据
      const dataURL = canvas.toDataURL('image/png');

      // 创建下载链接
      const link = linkRef.current;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      link.download = `vibe-audio-${timestamp}.png`;
      link.href = dataURL;
      link.click();

      // 闪光效果反馈
      setTimeout(() => setIsCapturing(false), 200);
    } catch (error) {
      console.error('[Screenshot] Failed to capture:', error);
      setIsCapturing(false);
    }
  };

  return (
    <button
      onClick={handleScreenshot}
      disabled={isCapturing}
      className={`p-3 rounded-xl transition-all duration-300 ${
        isCapturing
          ? 'bg-white/20 scale-95'
          : 'bg-white/5 hover:bg-white/10 hover:scale-105 active:scale-95'
      } border border-white/10 group`}
      title="保存截图"
    >
      {/* 相机图标 SVG */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`text-white/70 group-hover:text-cyan-400 transition-colors ${
          isCapturing ? 'animate-pulse' : ''
        }`}
      >
        {/* 相机主体 */}
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        {/* 镜头 */}
        <circle cx="12" cy="14" r="4" />
        <circle cx="12" cy="14" r="2" fill="currentColor" className="text-white/30" />
        {/* 顶部闪光灯 */}
        <path d="M16 3l2 2h-4l2-2z" />
        {/* 快门按钮 */}
        <circle cx="18" cy="10" r="1" fill="currentColor" />
      </svg>

      {/* 截图闪光效果 */}
      {isCapturing && (
        <div className="fixed inset-0 bg-white/30 pointer-events-none z-50" />
      )}
    </button>
  );
}
