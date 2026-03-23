# VIBE AUDIO - 沉浸式音频可视化器

> 基于 React + Vite + 原生 WebGL 的实时音频可视化体验

## ✨ 特性

- **WebGL 粒子系统** - 2000 个粒子随音乐节奏爆炸扩散
- **实时音频分析** - 频谱柱状图 + 波形线
- **音效控制面板** - 混响、低音、高音、音量实时调节
- **沉浸式视觉** - 全屏粒子背景 + 青色发光标题
- **截图功能** - 一键保存当前画面

## 🎵 使用方法

1. 点击「CLICK TO START」启动
2. 选择音源：
   - **MIC** - 麦克风输入
   - **FILE** - 本地音频文件
3. 调节右侧旋钮控制音效
4. 移动鼠标改变粒子引力方向

## 🛠️ 技术栈

- **前端框架**: React 18
- **构建工具**: Vite
- **样式**: Tailwind CSS v4
- **WebGL**: 原生 WebGL 1.0（无第三方库）
- **音频**: Web Audio API

## 📁 项目结构

```
src/
├── hooks/
│   ├── useAudioEngine.js      # 音频引擎 + 效果链
│   └── useAnimationLoop.js    # 动画循环管理
├── components/
│   ├── Visualizer.jsx          # WebGL 粒子系统
│   ├── FrequencyBars.jsx       # 频谱柱状图
│   ├── WaveformLine.jsx        # 波形线
│   ├── ControlPanel.jsx        # 音效旋钮面板
│   ├── StartOverlay.jsx        # 启动界面
│   └── ScreenshotButton.jsx    # 截图按钮
├── App.jsx                     # 主应用
└── index.css                   # 全局样式
```

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建
npm run build
```

## 🎛️ 音效控制

| 旋钮 | 功能 | 范围 |
|------|------|------|
| REVERB | 混响强度 | 0-100% |
| BASS | 低音增强 | ±12dB |
| TREBLE | 高音增强 | ±12dB |
| VOLUME | 主音量 | 0-100% |

## 📊 音频节点链

```
Source → BassFilter → TrebleFilter → GainNode → [Dry → Out]
                                              → [Wet → Convolver → Out]
                                              → Analyser (可视化)
```

## 🎨 视觉效果

- **粒子颜色**: 随生命周期从亮白 → 彩色 → 透明
- **能量响应**: 低频能量控制粒子生成速率和速度
- **鼠标交互**: 移动鼠标改变粒子引力中心

## 📝 License

MIT
