#!/bin/bash

# 象棋布局教学 Android 快速构建脚本

set -e

# 项目路径
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$PROJECT_DIR/android"

# 设置 Java 环境
export JAVA_HOME=/usr/local/opt/openjdk@17
export PATH="$JAVA_HOME/bin:$PATH"

echo "=== 象棋布局教学 Android 快速构建 ==="
echo "1. 构建 Web 应用..."
cd "$PROJECT_DIR"
npm run build

echo "2. 同步 Web 资源..."
./node_modules/@capacitor/cli/bin/capacitor sync android

echo "3. 构建 Android 应用..."
cd "$ANDROID_DIR"
./gradlew assembleDebug

echo "=== 构建完成！==="
echo "APK 路径: $ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"