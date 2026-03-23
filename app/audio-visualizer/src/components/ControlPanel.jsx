/**
 * ControlPanel.jsx - 音效控制旋钮面板
 *
 * 4个可拖拽旋转的旋钮控制：
 * - REVERB（混响）
 * - BASS BOOST（低音增强）
 * - TREBLE（高音）
 * - VOLUME（音量）
 */

import { useState, useRef, useEffect, useCallback } from 'react';

// 旋钮组件
function Knob({ label, value, onChange, min = 0, max = 1, suffix = '' }) {
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(value);

  // 值转换为角度 (0-1 映射到 -135° 到 +135°)
  const valueToAngle = (val) => {
    return ((val - min) / (max - min)) * 270 - 135;
  };

  const angle = valueToAngle(value);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
    e.preventDefault();
  };

  // 使用 useCallback 稳定函数引用
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const deltaY = startY - e.clientY;
    const sensitivity = 0.003; // 拖动灵敏度
    let newValue = startValue + deltaY * sensitivity;

    // 限制范围
    newValue = Math.max(min, Math.min(max, newValue));
    onChange(newValue);
  }, [isDragging, startY, startValue, min, max, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 全局鼠标事件 - 使用 useEffect 正确管理
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const displayValue = Math.round((value - min) / (max - min) * 100);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 旋钮容器 */}
      <div
        ref={knobRef}
        className={`relative w-20 h-20 cursor-grab active:cursor-grabbing select-none ${
          isDragging ? 'cursor-grabbing' : ''
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* SVG 旋钮 */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          className="drop-shadow-lg"
        >
          {/* 外圆背景 */}
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="rgba(0, 0, 0, 0.5)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="2"
          />

          {/* 刻度弧线 */}
          <path
            d="M 12 40 A 28 28 0 0 1 68 40"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="4"
            strokeLinecap="round"
            transform="rotate(135, 40, 40)"
          />

          {/* 激活弧线（根据当前值） */}
          <path
            d="M 12 40 A 28 28 0 0 1 68 40"
            fill="none"
            stroke={isDragging ? 'rgba(0, 255, 255, 0.8)' : 'rgba(0, 255, 255, 0.5)'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${(value - min) / (max - min) * 177} 177`}
            transform="rotate(135, 40, 40)"
          />

          {/* 指示线 */}
          <line
            x1="40"
            y1="40"
            x2="40"
            y2="12"
            stroke={isDragging ? '#00ffff' : 'rgba(255, 255, 255, 0.8)'}
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${angle}, 40, 40)`}
          />

          {/* 中心点 */}
          <circle
            cx="40"
            cy="40"
            r="4"
            fill={isDragging ? '#00ffff' : 'rgba(255, 255, 255, 0.5)'}
          />
        </svg>

        {/* 值显示 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className={`text-sm font-mono ${
              isDragging ? 'text-cyan-400' : 'text-white/70'
            }`}
          >
            {displayValue}{suffix}
          </span>
        </div>
      </div>

      {/* 标签 */}
      <span className="text-xs text-white/50 font-medium tracking-wider">
        {label}
      </span>
    </div>
  );
}

export function ControlPanel({
  onBassChange,
  onTrebleChange,
  onVolumeChange,
  onReverbChange,
  initialBass = 0.5,
  initialTreble = 0.5,
  initialVolume = 0.8,
  initialReverb = 0,
}) {
  const [bass, setBass] = useState(initialBass);
  const [treble, setTreble] = useState(initialTreble);
  const [volume, setVolume] = useState(initialVolume);
  const [reverb, setReverb] = useState(initialReverb);

  const handleBassChange = (value) => {
    setBass(value);
    onBassChange?.(value);
  };

  const handleTrebleChange = (value) => {
    setTreble(value);
    onTrebleChange?.(value);
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    onVolumeChange?.(value);
  };

  const handleReverbChange = (value) => {
    setReverb(value);
    onReverbChange?.(value);
  };

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 w-28">
      {/* 毛玻璃面板 */}
      <div
        className="rounded-2xl p-6 backdrop-blur-xl border border-white/10"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* 标题 */}
        <div className="text-center mb-6">
          <h3 className="text-xs text-white/40 tracking-[0.2em] font-light">
            EFFECTS
          </h3>
        </div>

        {/* 旋钮组 */}
        <div className="flex flex-col gap-6">
          <Knob
            label="REVERB"
            value={reverb}
            onChange={handleReverbChange}
            suffix="%"
          />

          <Knob
            label="BASS"
            value={bass}
            onChange={handleBassChange}
            suffix="%"
          />

          <Knob
            label="TREBLE"
            value={treble}
            onChange={handleTrebleChange}
            suffix="%"
          />

          <Knob
            label="VOLUME"
            value={volume}
            onChange={handleVolumeChange}
            suffix="%"
          />
        </div>

        {/* 底部装饰线 */}
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    </div>
  );
}
