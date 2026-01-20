#!/bin/bash

# Windows应用构建脚本
# 在WSL或Cygwin环境下运行

echo "=== Windows应用构建脚本 ==="

# 检查是否在Windows环境中
if [[ "$OSTYPE" != "msys" && "$OSTYPE" != "cygwin" && "$OS" != "Windows_NT" ]]; then
    echo "⚠️  此脚本建议在Windows环境(Cygwin/MSYS/WSL)中运行"
    echo "在Linux/macOS上构建Windows应用需要交叉编译工具链"
fi

# 检查Rust
if ! command -v cargo &> /dev/null; then
    echo "❌ Rust未安装！"
    echo "请访问 https://rustup.rs/ 安装Rust"
    echo ""
    echo "对于Windows，推荐使用rustup-init.exe"
    exit 1
fi

# 检查是否安装了Windows目标
echo "检查Windows目标工具链..."
rustup target list --installed | grep -q "x86_64-pc-windows-gnu"
if [ $? -ne 0 ]; then
    echo "正在安装Windows目标工具链..."
    rustup target add x86_64-pc-windows-gnu
fi

# 检查Tauri CLI
if ! command -v tauri &> /dev/null; then
    echo "❌ Tauri CLI未安装！"
    npm install -D @tauri-apps/cli
fi

# 构建Windows应用
echo ""
echo "=== 构建Windows应用 ==="

# 创建输出目录
mkdir -p dist/releases

# 构建Windows x64版本
echo "正在构建Windows x64版本..."
npx tauri build --target x86_64-pc-windows-gnu --out-dir dist/releases/windows-x64

if [ $? -eq 0 ]; then
    echo "✅ Windows构建成功！"

    # 查找生成的exe文件
    exe_file=$(find dist/releases -name "*.exe" | head -1)
    if [ -f "$exe_file" ]; then
        size=$(du -h "$exe_file" | cut -f1)
        echo ""
        echo "构建结果:"
        echo "  - 可执行文件: $exe_file"
        echo "  - 大小: $size"
        echo ""
        echo "运行方式:"
        echo "  - 直接双击 $exe_file"
        echo "  - 或在命令行中: $exe_file"
    fi
else
    echo "❌ Windows构建失败"
    echo ""
    echo "可能的解决方案:"
    echo "1. 安装Visual Studio Build Tools"
    echo "2. 或者安装MinGW-w64"
    echo "3. 检查系统PATH环境变量"
fi