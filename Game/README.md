# 🎮 游戏开发项目集合

这里是所有游戏项目的集合。每个子文件夹都是一个独立的项目。

---

## 📁 项目列表

| 项目 | 描述 | 应用位置 |
|------|------|---------|
| **chess-layout-pwa** | 象棋布局教学 PWA | `chess-layout-pwa/releases/` |
| **chess-layout-android** | 象棋布局教学 Android | `chess-layout-android/releases/` |
| **ai-snake-poet** | AI 贪吃蛇游戏 | 项目根目录 |
| **chess-layout-tutor** | 象棋布局教学（原版） | 项目根目录 |
| **snake-game** | 贪吃蛇游戏 | 项目根目录 |
| **tic-tac-toe** | 井字棋游戏 | 项目根目录 |
| **中国象棋游戏** | 中国象棋游戏 | 项目根目录 |

---

## 📦 可下载的应用

### 🤖 Android 应用
**项目**: `chess-layout-android/`
**位置**: `chess-layout-android/releases/`
**文件**: `chess-layout-android-v1.0.0-debug.apk` (4.3 MB)

**安装方法**:
```bash
# 方法 1: 使用 ADB
adb install chess-layout-android/releases/chess-layout-android-v1.0.0-debug.apk

# 方法 2: 直接传输
# 将 APK 文件传输到手机，点击安装
```

### 🌐 PWA/Web 应用
**项目**: `chess-layout-pwa/`
**位置**: `chess-layout-pwa/releases/dist/`
**使用**: 直接打开 `index.html` 即可使用

**快速启动**:
```bash
# 直接打开
open chess-layout-pwa/releases/dist/index.html

# 或开发模式
cd chess-layout-pwa
npm run dev
```

### 📚 文档
**位置**: `chess-layout-pwa/releases/README.md`

---

## 💾 下载的文件

所有下载的安装包和工具都在 `downloads/` 文件夹中：

- `jdk-17.0.9_macos-x64_bin.tar.gz` (171 MB) - Java JDK 安装包

---

## 🚀 快速开始

### 象棋布局教学 - PWA/Web 版本

```bash
cd chess-layout-pwa
npm run dev
# 访问 http://localhost:3000

# 或直接打开已构建版本
open chess-layout-pwa/releases/dist/index.html
```

### 象棋布局教学 - Android 版本

```bash
# 安装 APK
adb install chess-layout-android/releases/chess-layout-android-v1.0.0-debug.apk

# 或传输到手机安装
cp chess-layout-android/releases/*.apk ~/Desktop/
```

---

## 📖 项目详细说明

### 象棋布局教学系统

这是一个完整的中国象棋布局教学应用，基于《象棋布局全书》开发。

**特性**：
- ✅ 100+ 经典布局
- ✅ 6 个章节组织
- ✅ 分步移动演示
- ✅ 详细着法讲解
- ✅ 陷阱和飞刀识别
- ✅ 完全离线使用

**版本**：
- **Web/PWA**: `chess-layout-pwa/`
- **Android**: `chess-layout-android/`

**快速链接**：
- [Web 应用](chess-layout-pwa/releases/dist/index.html)
- [Android APK](chess-layout-android/releases/chess-layout-android-v1.0.0-debug.apk)
- [详细文档](chess-layout-pwa/releases/README.md)

---

## 🛠️ 开发环境

### 通用要求
- Node.js 18+
- npm 或 yarn

### Android 开发
- Java 21
- Android Studio
- Android SDK

### PC 桌面应用
- Rust
- 平台特定的工具（Xcode/Visual Studio）

---

## 📊 项目统计

- **项目数量**: 7 个
- **代码行数**: 15,000+
- **应用版本**:
  - Android: v1.0.0
  - PWA: v1.0.0
- **支持平台**: Web, Android, iOS (PWA)

---

## 🎯 最近更新

### 2024-01-14
- ✅ 完成象棋布局教学 PWA 版本
- ✅ 完成象棋布局教学 Android APK
- ✅ 生成完整的应用图标系统
- ✅ 完成安全审计和代码审查
- ✅ 配置完整的多平台构建流程
- ✅ 整理项目结构，应用放到对应项目文件夹

---

## 📂 文件结构说明

```
Game/
├── README.md                        # 本文件
├── downloads/                       # 下载的安装包
│   └── jdk-17.0.9_macos-x64_bin.tar.gz
│
├── ai-snake-poet/                  # AI 贪吃蛇游戏
├── chess-layout-android/           # 象棋布局教学 Android
│   └── releases/                   # Android APK
├── chess-layout-pwa/               # 象棋布局教学 PWA
│   └── releases/                   # PWA 应用和文档
├── chess-layout-tutor/             # 象棋布局教学（原版）
├── snake-game/                     # 贪吃蛇游戏
├── tic-tac-toe/                    # 井字棋游戏
└── 中国象棋游戏/                   # 中国象棋游戏
```

---

## 📞 联系和支持

如有问题，请查看各项目的 README 文件。

---

**最后更新**: 2024-01-14
**维护**: Claude Code + AI Agents
