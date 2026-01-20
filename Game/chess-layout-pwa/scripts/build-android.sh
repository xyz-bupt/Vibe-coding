#!/bin/bash

# Android应用构建脚本
# 此脚本用于构建Android APK

set -e

echo "=== 开始构建Android应用 ==="

# 检查node_modules是否存在
if [ ! -d "node_modules" ]; then
    echo "错误: node_modules目录不存在，请先运行 npm install"
    exit 1
fi

# 检查dist目录是否存在
if [ ! -d "dist" ]; then
    echo "构建生产版本..."
    npm run build
else
    echo "使用现有的dist目录..."
fi

# 检查Android项目是否存在
if [ ! -d "android" ]; then
    echo "错误: Android项目不存在，请先运行 npx cap add android"
    exit 1
fi

# 同步Web资源到Android项目
echo "同步Web资源到Android项目..."
npx cap sync android

# 检查keystore是否存在
if [ ! -f "android/app/keystore/keystore.jks" ]; then
    echo "keystore文件不存在，正在创建..."
    ./scripts/create-android-signing.sh
fi

echo "=== 开始Android构建 ==="
cd android

# 使用Gradle构建APK
echo "正在构建Debug APK..."
./gradlew assembleDebug

# 构建Release APK
echo "正在构建Release APK..."
./gradlew assembleRelease

cd ..

echo "=== 构建完成 ==="
echo "APK文件位置:"
echo "Debug: android/app/build/outputs/apk/debug/app-debug.apk"
echo "Release: android/app/build/outputs/apk/release/app-release.apk"

# 如果需要签名APK，可以运行以下命令：
# echo "正在签名Release APK..."
# jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore android/app/keystore/keystore.jks -storepass chesslayout2024 -keypass chesslayout2024 android/app/build/outputs/apk/release/app-release.apk chesslayout

echo ""
echo "=== 安装到Android设备 ==="
echo "安装Debug APK: npx cap open android"
echo "然后在Android Studio中运行设备"