/**
 * StartOverlay.jsx - 启动界面
 *
 * 首次进入显示，点击后初始化 AudioContext
 */

import { useEffect, useState } from 'react';

export function StartOverlay({ onStart }) {
  const [pulse, setPulse] = useState(0);

  // 脉冲动画
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 3);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const pulseClass = {
    0: 'scale-100 opacity-100',
    1: 'scale-105 opacity-90',
    2: 'scale-110 opacity-80',
  }[pulse];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <button
        onClick={onStart}
        className={`transition-all duration-500 ${pulseClass}`}
      >
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-cyan-400 tracking-widest"
              style={{
                fontFamily: 'Orbitron, sans-serif',
                textShadow: '0 0 20px rgba(0, 255, 255, 0.8), 0 0 40px rgba(0, 255, 255, 0.4)',
              }}>
            CLICK TO START
          </h1>
          <p className="mt-4 text-white/40 text-sm tracking-wider">
            点击初始化音频引擎
          </p>
        </div>
      </button>
    </div>
  );
}
