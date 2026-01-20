#!/bin/bash

# 象棋布局教学 - 快速启动脚本

echo "🏮 象棋布局教学 - 启动应用"
echo "================================"

cd "$(dirname "$0")"

echo ""
echo "请选择启动方式："
echo "1) 开发模式 (热重载)"
echo "2) 生产模式 (已构建)"
echo "3) 打开下载页面"
echo "4) 查看项目总结"
echo ""

read -p "请输入选项 (1-4): " choice

case $choice in
  1)
    echo ""
    echo "🚀 启动开发服务器..."
    npm run dev
    ;;
  2)
    echo ""
    echo "📖 打开生产版本..."
    if [ -f "dist/index.html" ]; then
      open dist/index.html
      echo "✅ 已在浏览器中打开"
    else
      echo "❌ 生产版本不存在，请先运行: npm run build"
    fi
    ;;
  3)
    echo ""
    echo "📥 打开下载页面..."
    if [ -f "dist/download.html" ]; then
      open dist/download.html
      echo "✅ 已在浏览器中打开"
    else
      echo "❌ 下载页面不存在"
    fi
    ;;
  4)
    echo ""
    echo "📊 打开项目总结..."
    if [ -f "PROJECT_SUMMARY_FINAL.md" ]; then
      open PROJECT_SUMMARY_FINAL.md
      echo "✅ 已打开文档"
    else
      echo "❌ 项目总结不存在"
    fi
    ;;
  *)
    echo "❌ 无效选项"
    exit 1
    ;;
esac
