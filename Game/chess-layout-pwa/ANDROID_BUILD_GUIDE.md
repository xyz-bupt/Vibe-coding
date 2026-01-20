# 象棋布局教学 Android 构建指南

## 概述

本指南将帮助您将象棋布局教学 PWA 应用构建为 Android 应用。

## 系统要求

- **Java 17+**: Android 开发的必需环境
- **Android Studio**: 推荐用于开发和调试（可选）
- **Node.js 16+**: 用于构建 Web 应用
- **npm 或 yarn**: 用于依赖管理

## 环境配置

### 1. 配置 Java 环境

#### macOS
```bash
# 安装 Java 17
brew install openjdk@17

# 设置环境变量
echo 'export JAVA_HOME=/usr/local/opt/openjdk@17' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# 验证安装
java -version
```

#### Windows
1. 下载并安装 Java 17: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
2. 设置环境变量：
   - `JAVA_HOME`: `C:\Program Files\Java\jdk-17`
   - `PATH`: 添加 `%JAVA_HOME%\bin`

### 2. 验证 Android Studio SDK

如果您安装了 Android Studio：
1. 打开 Android Studio
2. 进入 `Settings > Appearance & Behavior > System Settings > Android SDK`
3. 确保已安装以下 SDK 组件：
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Latest Android SDK Platform

## 快速构建

### 方法一：使用构建脚本（推荐）

```bash
# 快速 Debug 构建
./build-android-simple.sh

# 完整构建（支持 debug/release）
./build-android.sh debug
./build-android.sh release
```

### 方法二：手动构建

```bash
# 1. 构建 Web 应用
npm run build

# 2. 同步 Web 资源到 Android
npx cap sync android

# 3. 构建 Android 应用
cd android
./gradlew assembleDebug
```

### Windows 用户

```batch
# 快速构建
build-android-simple.bat

# 完整构建
build-android.bat debug
build-android.bat release
```

## 构建输出

### Debug 构建位置
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Release 构建位置
```
android/app/build/outputs/apk/release/app-release.apk
```

## 应用安装

### 使用 ADB 安装
```bash
# 连接 Android 设备或启动模拟器
adb devices

# 安装 APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### 通过 Android Studio 安装
1. 打开 Android Studio
2. 打开项目：`android/`
3. 点击 ▶ 按钮运行应用

## 发布配置

### 1. 生成发布签名

```bash
# 创建 keystore
keytool -genkey -v \
  -keystore android/app/keystore/release.keystore \
  -storepassword YOUR_PASSWORD \
  -alias YOUR_ALIAS \
  -keypass YOUR_PASSWORD \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Your Name, O=Your Company, C=Country"
```

### 2. 配置签名

创建 `android/signing-release.properties` 文件：
```properties
storeFile=../app/keystore/release.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=YOUR_KEY_ALIAS
keyPassword=YOUR_KEY_PASSWORD
```

### 3. 构建 Release APK

```bash
./build-android.sh release
```

## 故障排除

### 常见问题

#### 1. "Java 未安装或不在 PATH 中"
- 确保 Java 17 已正确安装
- 检查 `JAVA_HOME` 环境变量设置
- 验证 `java -version` 命令可用

#### 2. "Android SDK not found"
- 安装 Android Studio
- 在 Android Studio 中安装 SDK 组件
- 设置 `ANDROID_HOME` 环境变量

#### 3. "Web 资源同步失败"
- 确保 Web 应用已构建：`npm run build`
- 检查依赖：`npm install`
- 重新同步：`npx cap sync android`

#### 4. "Gradle 构建失败"
- 检查 Java 版本是否为 17+
- 清理项目：`./gradlew clean`
- 重新构建：`./gradlew assembleDebug`

#### 5. APK 安装失败
- 确保设备已启用"开发者选项"和"USB 调试"
- 卸载旧版本：`adb uninstall com.chesslayout.app`
- 重新安装：`adb install app-debug.apk`

### 构建优化

#### 启用 ProGuard/R8 代码混淆
```bash
# 修改 build.gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

#### 启用资源压缩
```groovy
android {
    buildTypes {
        release {
            shrinkResources true
        }
    }
}
```

#### 启用增量构建
```bash
# 启用 Gradle 增量构建
./gradlew --parallel
```

## 项目结构

```
chess-layout-pwa/
├── android/                          # Android 项目
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/com/chesslayout.app/  # Java 代码
│   │   │   ├── res/                       # 资源文件
│   │   │   │   ├── mipmap-*/             # 应用图标
│   │   │   │   └── values/               # 字符串配置
│   │   │   └── assets/                   # Web 资源
│   │   └── keystore/                     # 签名文件
│   ├── gradle/                          # Gradle 配置
│   └── gradlew                          # Gradle 包装器
├── public/icons/                        # 应用图标
├── dist/                              # 构建输出的 Web 资源
├── build-android.sh                    # 构建脚本
├── build-android.bat                   # Windows 构建脚本
└── ANDROID_BUILD_GUIDE.md              # 本文档
```

## 高级配置

### 1. 自应用图标
图标已自动生成，位于：
- `/android/app/src/main/res/mipmap-*/` (各种尺寸)
- 支持圆形图标 (`ic_launcher_round`)

### 2. 应用名称和包名
- 应用名称：`象棋布局教学`
- 包名：`com.chesslayout.app`
- 修改位置：`android/app/src/main/res/values/strings.xml`

### 3. 权限配置
已在 `AndroidManifest.xml` 中配置：
- Internet 权限
- FileProvider 权限

## 发布到应用商店

### 1. 准备发布 APK
```bash
# 构建发布版本
./build-android.sh release
```

### 2. 签名 APK
```bash
# 使用 jarsigner 签名
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore android/app/keystore/release.keystore \
  android/app/build/outputs/apk/release/app-release.apk \
  YOUR_KEY_ALIAS
```

### 3. 优化 APK（可选）
```bash
# 使用 zipalign 优化
zipalign -v 4 app-release.apk app-release-aligned.apk
```

### 4. 发布渠道

#### Google Play Store
1. 创建开发者账户
2. 使用 Google Play Console 上传 APK
3. 提交审核

#### 第三方应用商店
- 应用宝（国内）
- 小米应用商店
- 华为应用市场

## 性能优化建议

### 1. 减少 APK 大小
- 启用资源压缩和代码混淆
- 使用 APK 分包配置
- 优化图片资源

### 2. 提升启动速度
- 优化 Web 资源加载
- 使用预加载策略
- 配置应用启动模式

### 3. 内存优化
- 监控内存使用情况
- 优化 Web 视图设置
- 实现图片缓存策略

## 监控和分析

### 1. 性能监控
```bash
# 启用性能分析
adb shell setprop debug.trace.output 1
```

### 2. 日志查看
```bash
# 查看应用日志
adb logcat | grep com.chesslayout.app
```

### 3. 崩溃报告
```bash
# 导出崩溃报告
adb logcat -d | grep -i crash
```

## 联系支持

如果遇到构建问题，请：

1. 检查本文档的故障排除部分
2. 查看 Gradle 构建日志
3. 确认所有依赖项版本兼容性
4. 提交 GitHub Issue 并提供以下信息：
   - 操作系统版本
   - Java 版本
   - Android Studio 版本
   - 错误日志
   - 构建配置

## 版本历史

- **v1.0.0** - 初始版本
  - 支持 Debug 构建
  - 基础图标配置
  - 简单签名设置

---

*最后更新：2026-01-14*