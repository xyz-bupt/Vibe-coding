/**
 * App.jsx - 音频可视化应用主组件
 *
 * VIBE AUDIO - 沉浸式音频可视化体验
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import { useAudioEngine, SOURCE_TYPE } from './hooks/useAudioEngine';
import { Visualizer } from './components/Visualizer';
import { ControlPanel } from './components/ControlPanel';
import { FrequencyBars } from './components/FrequencyBars';
import { WaveformLine } from './components/WaveformLine';
import { StartOverlay } from './components/StartOverlay';
import { ScreenshotButton } from './components/ScreenshotButton';

// 由于 Visualizer 现在是 named export，需要正确引用
const VisualizerComponent = Visualizer;

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // 用于标题发光效果
  const visualizerCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    isPlaying,
    sourceType,
    startMicrophone,
    loadAudioFile,
    stop,
    analyser,
    setBass,
    setTreble,
    setVolume,
    setReverb,
    getFrequencyData,
  } = useAudioEngine();

  // 计算音频能量用于标题发光效果
  useEffect(() => {
    if (!isPlaying || !analyser) return;

    let animationId;
    const updateLevel = () => {
      const data = getFrequencyData();
      if (data.length > 0) {
        // 计算平均音量
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setAudioLevel(avg / 255);
      }
      animationId = requestAnimationFrame(updateLevel);
    };
    updateLevel();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, analyser, getFrequencyData]);

  // 启动应用
  const handleStart = useCallback(() => {
    setHasStarted(true);
  }, []);

  // 处理麦克风点击
  const handleMicClick = useCallback(async () => {
    try {
      if (sourceType === SOURCE_TYPE.MIC && isPlaying) {
        stop();
      } else {
        await startMicrophone();
      }
    } catch (error) {
      alert('无法访问麦克风: ' + error.message);
    }
  }, [sourceType, isPlaying, stop, startMicrophone]);

  // 处理文件选择
  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await loadAudioFile(file);
      } catch (error) {
        alert('无法加载音频文件: ' + error.message);
      }
    }
  }, [loadAudioFile]);

  // 处理文件按钮点击
  const handleFileClick = useCallback(() => {
    if (sourceType === SOURCE_TYPE.FILE && isPlaying) {
      stop();
    } else {
      fileInputRef.current.click();
    }
  }, [sourceType, isPlaying, stop]);

  // 标题发光强度计算
  const glowIntensity = 0.5 + audioLevel * 1.5;
  const titleStyle = {
    fontFamily: 'Orbitron, sans-serif',
    textShadow: `0 0 ${20 * glowIntensity}px rgba(0, 255, 255, ${glowIntensity * 0.8}),
                 0 0 ${40 * glowIntensity}px rgba(0, 255, 255, ${glowIntensity * 0.5}),
                 0 0 ${60 * glowIntensity}px rgba(0, 255, 255, ${glowIntensity * 0.3})`,
  };

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      {/* 启动界面 */}
      {!hasStarted && <StartOverlay onStart={handleStart} />}

      {/* WebGL 粒子背景层 */}
      <VisualizerComponent analyser={analyser} ref={visualizerCanvasRef} />

      {/* 顶部栏 */}
      <header className="fixed top-0 left-0 right-0 z-20 p-6">
        <div className="flex items-center justify-between">
          {/* 左侧：空 */}
          <div className="w-24" />

          {/* 中心：标题 */}
          <h1
            className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-widest title-glow text-center"
            style={titleStyle}
          >
            VIBE AUDIO
          </h1>

          {/* 右侧：截图按钮 + 音源控制 */}
          <div className="flex items-center gap-3">
            <ScreenshotButton canvasRef={visualizerCanvasRef} />

            {/* 麦克风按钮 */}
            <button
              onClick={handleMicClick}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all hover-glow ${
                sourceType === SOURCE_TYPE.MIC && isPlaying
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-white/5 text-white/70 border border-white/10'
              }`}
            >
              {sourceType === SOURCE_TYPE.MIC && isPlaying ? 'STOP MIC' : 'MIC'}
            </button>

            {/* 文件按钮 */}
            <button
              onClick={handleFileClick}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all hover-glow ${
                sourceType === SOURCE_TYPE.FILE && isPlaying
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                  : 'bg-white/5 text-white/70 border border-white/10'
              }`}
            >
              {sourceType === SOURCE_TYPE.FILE && isPlaying ? 'STOP' : 'FILE'}
            </button>

            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </header>

      {/* 左下角：波形线 */}
      <div className="fixed bottom-6 left-6 z-10">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-3 hover-glow">
          <div className="text-xs text-white/40 mb-2 px-1">WAVEFORM</div>
          <WaveformLine
            analyser={analyser}
            width={400}
            height={80}
          />
        </div>
      </div>

      {/* 底部居中：频谱柱状图 */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/40 backdrop-blur-sm rounded-xl border border-white/10 p-3 hover-glow">
          <div className="text-xs text-white/40 mb-2 px-1 text-center">FREQUENCY</div>
          <FrequencyBars
            analyser={analyser}
            width={600}
            height={120}
          />
        </div>
      </div>

      {/* 右侧：音效控制面板 */}
      <ControlPanel
        onBassChange={setBass}
        onTrebleChange={setTreble}
        onVolumeChange={setVolume}
        onReverbChange={setReverb}
      />

      {/* 待机提示 */}
      {!isPlaying && hasStarted && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="text-center">
            <p className="text-white/30 text-lg tracking-wider">
              选择音源开始体验
            </p>
            <p className="mt-2 text-xs text-white/20">
              点击 MIC 使用麦克风，或 FILE 选择音频文件
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
