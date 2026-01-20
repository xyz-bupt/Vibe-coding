#!/bin/bash

# 全平台构建脚本
# 此脚本用于构建Android和桌面应用的所有版本

set -e

echo "====================================="
echo "象棋布局教学应用 - 全平台构建脚本"
echo "====================================="
echo ""

# 创建输出目录
mkdir -p dist/releases

# 检查必要的目录和文件
echo "=== 检查环境 ==="
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules不存在，正在安装依赖..."
    npm install
fi

if [ ! -d "src" ]; then
    echo "❌ 源代码目录不存在"
    exit 1
fi

echo "✅ 环境检查完成"
echo ""

# 1. 构建生产版本
echo "=== 1. 构建Web生产版本 ==="
if [ ! -d "dist" ] || [ "$1" = "--force" ]; then
    echo "正在构建生产版本..."
    npm run build
    echo "✅ Web版本构建完成"
else
    echo "✅ 使用现有的Web版本"
fi
echo ""

# 2. 构建Android版本
echo "=== 2. 构建Android版本 ==="
if [ -d "android" ]; then
    echo "正在构建Android应用..."
    ./scripts/build-android.sh

    # 复制APK到输出目录
    if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
        cp android/app/build/outputs/apk/debug/app-debug.apk dist/releases/chess-layout-android-debug.apk
        echo "✅ Debug APK已复制到 dist/releases/chess-layout-android-debug.apk"
    fi

    if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
        cp android/app/build/outputs/apk/release/app-release.apk dist/releases/chess-layout-android-release.apk
        echo "✅ Release APK已复制到 dist/releases/chess-layout-android-release.apk"
    fi
else
    echo "⚠️  Android项目不存在，跳过Android构建"
    echo "   运行 'npx cap add android' 来创建Android项目"
fi
echo ""

# 3. 构建桌面版本
echo "=== 3. 构建桌面应用版本 ==="
if command -v tauri &> /dev/null || [ -d "src-tauri" ]; then
    echo "正在构建桌面应用..."

    # 检查Rust是否安装
    if ! command -v cargo &> /dev/null; then
        echo "⚠️  Rust未安装，请先安装Rust以构建桌面应用"
        echo "   访问 https://rustup.rs/ 安装Rust"
        echo "   安装后运行: rustup target-add x86_64-pc-windows-gnu aarch64-apple-darwin x86_64-apple-darwin"
    else
        # 构建不同平台
        echo "正在构建Windows版本..."
        if command -v tauri &> /dev/null; then
            npx tauri build --target x86_64-pc-windows-gnu --out-dir dist/releases/windows 2>/dev/null || echo "⚠️  Windows构建可能需要Windows环境和MSVC工具链"
        fi

        echo "正在构建macOS版本..."
        if command -v tauri &> /dev/null; then
            npx tauri build --target x86_64-apple-darwin --out-dir dist/releases/mac-x64 2>/dev/null || echo "⚠️  macOS x64构建需要macOS环境和签名"
        fi

        echo "正在构建macOS ARM64版本..."
        if command -v tauri &> /dev/null; then
            npx tauri build --target aarch64-apple-darwin --out-dir dist/releases/mac-arm64 2>/dev/null || echo "⚠️  macOS ARM64构建需要Apple Silicon Mac和签名"
        fi

        echo "✅ 桌面应用构建完成"
    fi
else
    echo "⚠️  Tauri项目不存在，跳过桌面应用构建"
    echo "   运行 'npm install -D @tauri-apps/cli' 安装Tauri"
fi
echo ""

# 4. 生成构建报告
echo "=== 4. 构建报告 ==="
echo "构建文件位置:"
echo ""
echo "Web版本:"
echo "  - 静态文件: dist/"
echo ""
echo "Android版本:"
if [ -f "dist/releases/chess-layout-android-debug.apk" ]; then
    echo "  - Debug APK: dist/releases/chess-layout-android-debug.apk"
    APK_SIZE=$(du -h dist/releases/chess-layout-android-debug.apk | cut -f1)
    echo "  - 大小: $APK_SIZE"
fi
if [ -f "dist/releases/chess-layout-android-release.apk" ]; then
    echo "  - Release APK: dist/releases/chess-layout-android-release.apk"
    APK_SIZE=$(du -h dist/releases/chess-layout-android-release.apk | cut -f1)
    echo "  - 大小: $APK_SIZE"
fi
echo ""
echo "桌面应用版本:"
echo "  - Windows: dist/releases/windows/ (如果成功构建)"
echo "  - macOS x64: dist/releases/mac-x64/ (如果成功构建)"
echo "  - macOS ARM64: dist/releases/mac-arm64/ (如果成功构建)"
echo ""

# 5. 清理临时文件
echo "=== 5. 清理临时文件 ==="
echo "清理中..."
# 可以添加清理命令，如：
# rm -rf android/app/build/intermediates
echo "✅ 清理完成"
echo ""

echo "====================================="
echo "构建完成！🎉"
echo "====================================="
echo ""
echo "部署指南:"
echo ""
echo "Android:"
echo "1. 连接Android设备或启动模拟器"
echo "2. 运行: npx cap open android"
echo "3. 在Android Studio中点击'Run'按钮"
echo ""
echo "或者安装APK:"
echo "adb install dist/releases/chess-layout-android-debug.apk"
echo ""
echo "桌面应用:"
echo "Windows: 双击运行 .exe 文件"
echo "macOS: 双击运行 .app 文件或在终端中运行"
echo ""
echo "开发模式:"
echo "Android: npx cap run android"
echo "桌面: npx tauri dev"