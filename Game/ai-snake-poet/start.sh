#!/bin/bash

# AI 贪吃蛇诗人 - 启动脚本

echo "========================================"
echo "   AI 贪吃蛇诗人"
echo "========================================"
echo ""
echo "正在启动本地服务器..."
echo ""

# 获取脚本所在目录
cd "$(dirname "$0")"

# 启动服务器
echo "服务器地址: http://localhost:8000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""
echo "========================================"
echo ""

python3 -m http.server 8000
