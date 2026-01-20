#!/bin/bash

# 专注模式扩展图标生成脚本
# Focus Mode Extension Icon Generation Script

echo "生成专注模式扩展图标..."

# 检查是否安装了 ImageMagick
if ! command -v convert &> /dev/null; then
    echo "错误: 需要安装 ImageMagick"
    echo "请运行: brew install imagemagick (macOS)"
    echo "或访问: https://imagemagick.org/script/download.php"
    exit 1
fi

# 从 SVG 生成不同尺寸的 PNG 图标
convert -background none -density 300 -resize 16x16 icon.svg icon16.png
convert -background none -density 300 -resize 32x32 icon.svg icon32.png
convert -background none -density 300 -resize 48x48 icon.svg icon48.png
convert -background none -density 300 -resize 128x128 icon.svg icon128.png

echo "图标生成完成！"
echo "已生成: icon16.png, icon32.png, icon48.png, icon128.png"
