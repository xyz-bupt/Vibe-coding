#!/bin/bash

# 象棋布局教学 - Android APK 构建脚本

set -e

PROJECT_DIR="/Users/abc/Vibe-coding/Game/chess-layout-pwa"
ANDROID_DIR="$PROJECT_DIR/android"
DIST_DIR="$PROJECT_DIR/dist/releases"

echo "🚀 构建象棋布局教学 Android APK"
echo "================================"

# 创建输出目录
mkdir -p "$DIST_DIR"

# 检查Android项目
if [ ! -d "$ANDROID_DIR" ]; then
  echo "❌ Android 项目不存在"
  echo "请运行: npx cap add android"
  exit 1
fi

# 方法1: 使用 Gradlew 构建调试版
echo ""
echo "📱 构建 Debug APK..."
cd "$ANDROID_DIR"

if [ -f "./gradlew" ]; then
  ./gradlew assembleDebug
  cp app/build/outputs/apk/debug/app-debug.apk "$DIST_DIR/chess-layout-android-debug.apk"
  echo "✅ Debug APK: $DIST_DIR/chess-layout-android-debug.apk"
else
  echo "⚠️  gradlew 不存在"
  echo "请使用 Android Studio 打开项目构建"
  echo "路径: $ANDROID_DIR"
fi

# 方法2: 使用 Gradlew 构建发布版（需要签名）
echo ""
echo "📱 构建 Release APK (需要签名)..."
if [ -f "./gradlew" ]; then
  echo "⚠️  Release APK 需要签名配置"
  echo "如需构建，请在 Android Studio 中配置签名"
fi

echo ""
echo "================================"
echo "✅ 构建完成！"
echo "📁 输出目录: $DIST_DIR"
