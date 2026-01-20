#!/bin/bash

# macOS应用构建脚本
# 支持Intel Mac和Apple Silicon Mac

set -e

echo "=== macOS应用构建脚本 ==="

# 检查是否在macOS上
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ 此脚本只能在macOS上运行"
    exit 1
fi

# 检查Rust
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust未安装！"
    echo "请访问 https://rustup.rs/ 安装Rust"
    echo "运行命令: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi

# 安装必要的Rust目标
echo "检查并安装Rust目标工具链..."
rustup target list --installed | grep -q "x86_64-apple-darwin"
if [ $? -ne 0 ]; then
    echo "安装Intel Mac目标..."
    rustup target add x86_64-apple-darwin
fi

if [ "$(uname -m)" = "arm64" ]; then
    rustup target list --installed | grep -q "aarch64-apple-darwin"
    if [ $? -ne 0 ]; then
        echo "安装Apple Silicon目标..."
        rustup target add aarch64-apple-darwin
    fi
fi

# 检查Tauri CLI
if ! command -v tauri &> /dev/null; then
    echo "❌ Tauri CLI未安装！"
    npm install -D @tauri-apps/cli
fi

# 检查项目结构
if [ ! -d "src-tauri" ]; then
    echo "❌ src-tauri目录不存在！"
    exit 1
fi

if [ ! -d "dist" ]; then
    echo "❌ dist目录不存在！"
    echo "请先运行 'npm run build' 构建Web应用"
    exit 1
fi

# 创建输出目录
mkdir -p dist/releases

ARCH=$(uname -m)
echo "检测到Mac架构: $ARCH"
echo ""

# 构建Intel版本（所有Mac都支持）
echo "=== 构建Intel Mac版本 ==="
npx tauri build --target x86_64-apple-darwin --out-dir dist/releases/mac-x64

if [ $? -eq 0 ]; then
    echo "✅ Intel Mac版本构建成功"

    # 查找生成的app文件
    app_file=$(find dist/releases/mac-x64 -name "*.app" | head -1)
    if [ -d "$app_file" ]; then
        size=$(du -sh "$app_file" | cut -f1)
        echo "  - 应用程序: $app_file"
        echo "  - 大小: $size"
    fi
else
    echo "❌ Intel Mac版本构建失败"
fi

# 如果是Apple Silicon，构建ARM64版本
if [ "$ARCH" = "arm64" ]; then
    echo ""
    echo "=== 构建Apple Silicon版本 ==="
    npx tauri build --target aarch64-apple-darwin --out-dir dist/releases/mac-arm64

    if [ $? -eq 0 ]; then
        echo "✅ Apple Silicon版本构建成功"

        # 查找生成的app文件
        app_file=$(find dist/releases/mac-arm64 -name "*.app" | head -1)
        if [ -d "$app_file" ]; then
            size=$(du -sh "$app_file" | cut -ff1)
            echo "  - 应用程序: $app_file"
            echo "  - 大小: $size"
        fi

        # 创建通用二进制文件（可选）
        echo ""
        echo "=== 创建通用二进制文件 ==="
        if command -v lipo &> /dev/null; then
            echo "正在创建通用二进制文件..."

            # 创建dmg文件（如果可用）
            if command -v create-dmg &> /dev/null; then
                create-dmg --volname "象棋布局教学" --volicon "src-tauri/icons.icns" --window-pos 200 120 --window-size 600 300 --icon-size 100 --icon "象棋布局教学.app" 175 120 --hide-extension "象棋布局教学.app" dist/releases/chess-layout-macos-universal.dmg dist/releases/mac-x64/象棋布局教学.app dist/releases/mac-arm64/象棋布局教学.app

                if [ -f "dist/releases/chess-layout-macos-universal.dmg" ]; then
                    echo "✅ 通用DMG创建成功: dist/releases/chess-layout-macos-universal.dmg"
                fi
            fi
        fi
    else
        echo "❌ Apple Silicon版本构建失败"
    fi
fi

echo ""
echo "=== 构建完成 ==="
echo ""
echo "应用程序位置:"
find dist/releases -name "*.app" -exec echo "  - {}" \;
echo ""
echo "运行方式:"
echo "1. 双击.app文件"
echo "2. 或右键选择'打开'"
echo "3. 首次运行可能需要在系统偏好设置中授权"