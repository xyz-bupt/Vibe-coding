# 象棋布局教学应用 - 打包指南

本文档说明如何将象棋布局教学应用打包为Android APK和桌面应用。

## 目录

1. [环境准备](#环境准备)
2. [Android打包](#android打包)
3. [桌面应用打包](#桌面应用打包)
4. [综合构建脚本](#综合构建脚本)
5. [发布和部署](#发布和部署)

## 环境准备

### 系统要求

- Node.js 16+
- npm 或 yarn
- 对于Android打包：
  - Android Studio
  - Java JDK 11+
  - Android SDK
- 对于桌面应用：
  - Rust (从 https://rustup.rs/ 安装)

### 安装依赖

```bash
# 安装项目依赖
npm install

# 安装Capacitor (用于Android)
npm install @capacitor/core @capacitor/cli @capacitor/android

# 安装Tauri (用于桌面应用)
npm install -D @tauri-apps/cli
```

## Android打包

### 1. 初始化Android项目

```bash
# 添加Android平台
npx cap add android

# 同步Web资源到Android项目
npx cap sync android
```

### 2. 配置签名

```bash
# 创建签名配置
./scripts/create-android-signing.sh
```

### 3. 构建APK

```bash
# 构建Debug APK
./scripts/build-android.sh

# 或使用综合脚本
./scripts/build-all.sh
```

### 4. 安装和测试

```bash
# 打开Android Studio
npx cap open android

# 或者直接安装APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Android开发命令

```bash
# 开发模式（热重载）
npx cap run android

# 同步更改
npx cap sync android

# 查看日志
npx cap log android
```

## 桌面应用打包

### 支持的平台

- Windows (.exe)
- macOS (.app, .dmg)
- Linux (AppImage, .deb)

### 1. Windows构建

```bash
# 安装Windows目标工具链
rustup target add x86_64-pc-windows-gnu

# 构建Windows应用
./scripts/build-windows.sh
```

### 2. macOS构建

```bash
# 安装必要的Rust目标
rustup target add x86_64-apple-darwin
# 如果是Apple Silicon Mac
rustup target add aarch64-apple-darwin

# 构建macOS应用
./scripts/build-macos.sh
```

### 3. Linux构建

```bash
# 安装必要的Rust目标
rustup target add x86_64-unknown-linux-gnu

# 构建Linux应用
./scripts/build-desktop.sh
```

### 4. 通用桌面构建

```bash
# 构建当前平台的桌面应用
./scripts/build-desktop.sh

# 或使用综合脚本
./scripts/build-all.sh
```

## 综合构建脚本

### build-all.sh

这是最方便的构建脚本，可以一次性构建所有平台：

```bash
# 构建所有版本
./scripts/build-all.sh

# 强制重新构建
./scripts/build-all.sh --force
```

构建完成后，所有产物会输出到 `dist/releases/` 目录。

### 构建产物

```
dist/
├── releases/
│   ├── chess-layout-android-debug.apk      # Android Debug APK
│   ├── chess-layout-android-release.apk   # Android Release APK
│   ├── windows-x64/
│   │   └── chess-layout-pwa.exe          # Windows可执行文件
│   ├── mac-x64/
│   │   └── 象棋布局教学.app              # macOS Intel版应用
│   ├── mac-arm64/
│   │   └── 象棋布局教学.app              # macOS Apple Silicon版应用
│   ├── chess-layout-macos-universal.dmg  # macOS通用版DMG
│   └── linux-x64/
│       └── chess-layout-pwa.AppImage     # Linux AppImage
└── index.html                            # Web版本
```

## 发布和部署

### Android发布

1. **Google Play Store**
   ```bash
   # 生成签名APK
   ./scripts/build-android.sh

   # 或者使用Gradle生成AAB
   cd android && ./gradlew bundleRelease
   ```

2. **第三方应用商店**
   - 直接上传 `app-release.apk`
   - 使用 `jarsigner` 或 `apksigner` 签名

### 桌面应用发布

1. **Windows**
   - 上传 `.exe` 文件
   - 建议使用Inno Setup创建安装程序

2. **macOS**
   - 开发者账号：需要Apple Developer证书
   - 分发方式：
     - 上传 `.dmg` 文件
     - 上传到Mac App Store
     - 使用Notarization服务

3. **Linux**
   - AppImage：通用格式
   - Debian包：适用于Ubuntu/Debian
   - RPM包：适用于Fedora/CentOS

### 签名和证书

#### Android签名

```bash
# 查看keystore信息
keytool -list -v -keystore android/app/keystore/keystore.jks -storepass chesslayout2024

# 使用apksigner签名
./gradlew assembleRelease
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore android/app/keystore/keystore.jks -storepass chesslayout2024 -keypass chesslayout2024 android/app/build/outputs/apk/release/app-release.apk chesslayout
```

#### macOS签名

```bash
# 创建开发者证书
# 在Xcode中注册开发者账号

# 签名应用
codesign --force --deep --sign "Developer ID Application" dist/releases/mac-x64/象棋布局教学.app
```

## 故障排除

### 常见问题

1. **Android构建失败**
   - 检查Android SDK路径
   - 确保JAVA_HOME正确设置
   - 更新Android Gradle Plugin

2. **桌面应用构建失败**
   - 确保Rust已安装
   - 检查目标工具链是否安装
   - macOS用户检查Xcode命令行工具

3. **图标缺失**
   - 将图标文件放入 `src-tauri/icons/` 目录
   - 支持的格式：.png, .icns, .ico

### 清理构建缓存

```bash
# 清理Node.js缓存
rm -rf node_modules/.cache
npm cache clean --force

# 清理Android构建缓存
cd android && ./gradlew clean

# 清理Rust构建缓存
cargo clean
```

## 更新和维护

### 更新应用

1. 更新代码
2. 修改版本号（package.json 和 tauri.conf.json）
3. 重新构建：
   ```bash
   npm run build
   ./scripts/build-all.sh
   ```

### 依赖更新

```bash
# 更新npm包
npm outdated
npm update

# 更新Rust工具链
rustup update
```

---

如有问题，请检查：
1. 所有依赖是否正确安装
2. 环境变量是否设置正确
3. 目标平台工具链是否完整