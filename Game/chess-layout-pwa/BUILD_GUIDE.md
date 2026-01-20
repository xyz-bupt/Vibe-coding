# 🏮 象棋布局教学 - 应用构建指南

## 📦 当前状态

✅ **已完成**：
- PWA 完整功能（Web应用）
- 生产版本已构建
- 所有图标已生成
- 安全配置已完成

⏳ **需要构建**（需要开发环境）：
- Android APK
- Windows EXE
- macOS DMG

---

## 🚀 快速开始 - PWA 版本

PWA版本已经可以使用！访问：
- **开发版**：http://localhost:3000
- **生产版**：打开 `dist/index.html`

### 安装 PWA
1. 在 Chrome/Edge 中访问应用
2. 点击地址栏的"安装"图标
3. 确认安装
4. 应用将添加到桌面/启动台

---

## 📱 Android 应用构建

### 前置要求
1. **Java JDK** (17 或更高)
   ```bash
   brew install openjdk@17
   ```

2. **Android Studio**
   - 下载：https://developer.android.com/studio

3. **Android SDK**
   - 通过 Android Studio 安装

### 构建步骤

```bash
# 1. 进入项目目录
cd /Users/abc/Vibe-coding/Game/chess-layout-pwa

# 2. 同步 Web 资源
npx cap sync android

# 3. 打开 Android Studio
npx cap open android

# 4. 在 Android Studio 中
# - Build > Build Bundle(s) / APK(s) > Build APK(s)
# - APK 输出位置：android/app/build/outputs/apk/
```

### 或者使用命令行构建

```bash
cd android

# Debug 版本
./gradlew assembleDebug

# Release 版本（需要签名）
./gradlew assembleRelease
```

### 输出文件
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🪟 Windows 应用构建

### 前置要求
1. **Rust**
   ```powershell
   # 在 PowerShell 中运行
   winget install Rustlang.Rust.MSVC
   ```

2. **WebView2 Runtime**
   - 通常 Windows 11 已预装
   - Windows 10 可能需要安装：https://developer.microsoft.com/en-us/microsoft-edge/webview2/

3. **Visual Studio C++ Build Tools**
   ```powershell
   winget install Microsoft.VisualStudio.2022.BuildTools
   ```

### 构建步骤

```bash
# 1. 进入项目目录
cd C:\path\to\chess-layout-pwa

# 2. 安装依赖
npm install

# 3. 构建 Windows 应用
npm run tauri build

# 或者使用 npx
npx tauri build
```

### 输出文件
- **安装包**: `src-tauri/target/release/bundle/msi/象棋布局教学_0.0.1_x64_en-US.msi`
- **可执行文件**: `src-tauri/target/release/象棋布局教学.exe`

---

## 🍎 macOS 应用构建

### 前置要求
1. **Rust**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   ```

2. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

### 构建步骤

```bash
# 1. 进入项目目录
cd /Users/abc/Vibe-coding/Game/chess-layout-pwa

# 2. 安装依赖
npm install

# 3. 构建 macOS 应用（通用二进制）
npm run tauri build --target universal-apple-darwin

# 或者仅构建当前架构
npm run tauri build
```

### 输出文件
- **DMG 安装包**: `src-tauri/target/release/bundle/dmg/象棋布局教学_0.0.1_universal.dmg`
- **应用程序**: `src-tauri/target/release/bundle/macos/象棋布局教学.app`

---

## 🐛 常见问题

### Rust 构建失败
```bash
# 更新 Rust
rustup update

# 清理并重新构建
cargo clean
npm run tauri build
```

### Android 构建失败
```bash
# 检查 Java 版本
java -version

# 清理 Gradle 缓存
cd android
./gradlew clean
```

### Capacitor 同步失败
```bash
# 移除并重新添加平台
npx cap rm android
npx cap add android
npx cap sync android
```

---

## 📋 构建检查清单

在构建前，确保：
- [ ] Node.js 已安装（v18+）
- [ ] npm 依赖已安装：`npm install`
- [ ] 生产版本已构建：`npm run build`
- [ ] 图标已生成：`node scripts/generate-icons.mjs`
- [ ] Tauri 图标已生成：`node scripts/generate-tauri-icons.mjs`

---

## 🎯 分发

### PWA
- 部署到任何静态托管（Vercel, Netlify, GitHub Pages）
- 用户可直接安装到设备

### Android
- 上传到 Google Play Store
- 或直接分发 APK 文件

### Windows / macOS
- 上传到官网或应用商店
- 提供 DMG/MSI 直接下载

---

## 📞 支持

如有问题，请检查：
1. 系统要求是否满足
2. 所有依赖是否正确安装
3. 构建日志中的错误信息

---

**版本**: 0.0.1
**最后更新**: 2024-01-14
**项目路径**: `/Users/abc/Vibe-coding/Game/chess-layout-pwa`
