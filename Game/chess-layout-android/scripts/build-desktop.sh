#!/bin/bash

# 桌面应用构建脚本
# 支持Windows、macOS和Linux

set -e

echo "=== 桌面应用构建脚本 ==="

# 检查Rust是否安装
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust未安装！"
    echo "请访问 https://rustup.rs/ 安装Rust"
    echo ""
    echo "安装命令:"
    echo "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    echo ""
    echo "安装后重启终端并运行:"
    echo "rustup target-add x86_64-pc-windows-gnu aarch64-apple-darwin x86_64-apple-darwin"
    exit 1
fi

# 检查Tauri CLI
if ! command -v tauri &> /dev/null; then
    echo "❌ Tauri CLI未安装！"
    echo "正在安装Tauri CLI..."
    npm install -D @tauri-apps/cli
fi

# 检查项目结构
if [ ! -d "src-tauri" ]; then
    echo "❌ src-tauri目录不存在！"
    echo "请运行 'npx tauri init' 初始化Tauri项目"
    exit 1
fi

if [ ! -d "dist" ]; then
    echo "❌ dist目录不存在！"
    echo "请先运行 'npm run build' 构建Web应用"
    exit 1
fi

# 创建输出目录
mkdir -p dist/releases

# 获取当前操作系统
OS=$(uname -s)
ARCH=$(uname -m)

echo "检测到系统: $OS $ARCH"
echo ""

# 根据操作系统构建对应版本
case $OS in
    Darwin)
        echo "=== 构建macOS版本 ==="

        # 构建Intel Mac版本
        echo "正在构建Intel Mac版本..."
        npx tauri build --target x86_64-apple-darwin --out-dir dist/releases/mac-x64

        # 如果是Apple Silicon，构建ARM64版本
        if [ "$ARCH" = "arm64" ]; then
            echo "正在构建Apple Silicon版本..."
            npx tauri build --target aarch64-apple-darwin --out-dir dist/releases/mac-arm64
        fi

        echo "✅ macOS构建完成"
        ;;
    Linux)
        echo "=== 构建Linux版本 ==="

        # 构建Linux x64版本
        echo "正在构建Linux x64版本..."
        npx tauri build --target x86_64-unknown-linux-gnu --out-dir dist/releases/linux-x64

        # 如果支持ARM64，构建ARM64版本
        if [ "$ARCH" = "aarch64" ]; then
            echo "正在构建Linux ARM64版本..."
            npx tauri build --target aarch64-unknown-linux-gnu --out-dir dist/releases/linux-arm64
        fi

        echo "✅ Linux构建完成"
        ;;
    CYGWIN*|MINGW*|MSYS*)
        echo "=== 构建Windows版本 ==="

        # 构建Windows x64版本
        echo "正在构建Windows x64版本..."
        npx tauri build --target x86_64-pc-windows-gnu --out-dir dist/releases/windows-x64

        echo "✅ Windows构建完成"
        ;;
    *)
        echo "❌ 不支持的操作系统: $OS"
        echo "目前支持: macOS、Linux、Windows"
        exit 1
        ;;
esac

# 显示构建结果
echo ""
echo "=== 构建结果 ==="
find dist/releases -name "*.dmg" -o -name "*.app" -o -name "*.exe" -o -name "*.deb" -o -name "*.AppImage" | while read file; do
    if [ -f "$file" ]; then
        size=$(du -h "$file" | cut -f1)
        echo "  - $file (大小: $size)"
    fi
done

echo ""
echo "桌面应用构建完成！"