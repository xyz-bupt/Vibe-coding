#!/bin/bash

# 象棋布局教学 PWA - 图标生成脚本
# 使用 ImageMagick 生成所有需要的 PWA 图标尺寸

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SOURCE_SVG="$SCRIPT_DIR/icon-source.svg"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}象棋布局教学 PWA - 图标生成工具${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查 ImageMagick 是否安装
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo -e "${RED}错误: 未找到 ImageMagick${NC}"
    echo ""
    echo "请安装 ImageMagick："
    echo "  macOS:   brew install imagemagick"
    echo "  Ubuntu:  sudo apt-get install imagemagick"
    echo "  Windows: https://imagemagick.org/script/download.php"
    exit 1
fi

# 检查源文件是否存在
if [ ! -f "$SOURCE_SVG" ]; then
    echo -e "${RED}错误: 找不到源文件 $SOURCE_SVG${NC}"
    exit 1
fi

# 使用 magick 或 convert 命令
if command -v magick &> /dev/null; then
    CONVERT_CMD="magick"
else
    CONVERT_CMD="convert"
fi

echo -e "${YELLOW}步骤 1: 生成 PWA 图标（PNG 格式）${NC}"
echo ""

# PWA 图标尺寸数组
declare -A SIZES=(
    ["icon-72x72-maskable.png"]="72"
    ["icon-96x96-maskable.png"]="96"
    ["icon-128x128-maskable.png"]="128"
    ["icon-144x144-maskable.png"]="144"
    ["icon-152x152-maskable.png"]="152"
    ["icon-192x192.png"]="192"
    ["icon-192x192-maskable.png"]="192"
    ["icon-384x384.png"]="384"
    ["icon-384x384-maskable.png"]="384"
    ["icon-512x512.png"]="512"
    ["icon-512x512-maskable.png"]="512"
)

# 生成 PNG 图标
for filename in "${!SIZES[@]}"; do
    size="${SIZES[$filename]}"
    echo -e "  生成 ${GREEN}${filename}${NC} (${size}x${size})"
    $CONVERT_CMD -background none -density 300 \
        "$SOURCE_SVG" \
        -resize ${size}x${size} \
        "$SCRIPT_DIR/$filename"
done

echo ""
echo -e "${YELLOW}步骤 2: 生成 Favicon${NC}"
echo ""

# 生成 favicon.ico (包含 16x16 和 32x32)
echo "  生成 ${GREEN}favicon.ico${NC} (16x16, 32x32)"
$CONVERT_CMD -background none \
    "$SOURCE_SVG[0]" \
    -define icon:auto-resize=16,32 \
    "$SCRIPT_DIR/favicon.ico"

# 生成单独的 favicon PNG
echo "  生成 ${GREEN}favicon-16x16.png${NC}"
$CONVERT_CMD -background none -density 300 \
    "$SOURCE_SVG" \
    -resize 16x16 \
    "$SCRIPT_DIR/favicon-16x16.png"

echo "  生成 ${GREEN}favicon-32x32.png${NC}"
$CONVERT_CMD -background none -density 300 \
    "$SOURCE_SVG" \
    -resize 32x32 \
    "$SCRIPT_DIR/favicon-32x32.png"

echo ""
echo -e "${YELLOW}步骤 3: 生成 Apple Touch Icon${NC}"
echo ""

# Apple touch icon
echo "  生成 ${GREEN}apple-touch-icon.png${NC} (180x180)"
$CONVERT_CMD -background none -density 300 \
    "$SOURCE_SVG" \
    -resize 180x180 \
    "$SCRIPT_DIR/apple-touch-icon.png"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ 图标生成完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "生成的文件列表："
ls -lh "$SCRIPT_DIR"/*.png "$SCRIPT_DIR"/*.ico "$SCRIPT_DIR"/*.svg 2>/dev/null | awk '{printf "  %s (%s)\n", $9, $5}'
echo ""
echo -e "${YELLOW}下一步：${NC}"
echo "1. 将图标复制到项目根目录的 public/ 文件夹"
echo "2. 更新 manifest.json 和 index.html 中的图标引用"
echo ""
