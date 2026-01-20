#!/bin/bash

# 象棋布局教学 Android 构建脚本
# 使用方法: ./build-android.sh [debug|release]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$PROJECT_DIR/android"
GRADLEW="$ANDROID_DIR/gradlew"

# 默认构建类型
BUILD_TYPE=${1:-debug}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}象棋布局教学 Android 构建脚本${NC}"
echo -e "${BLUE}========================================${NC}"

# 检查 Java 环境
echo -e "${YELLOW}检查 Java 环境...${NC}"
if ! java -version &>/dev/null; then
    echo -e "${RED}错误: Java 未安装或不在 PATH 中${NC}"
    echo "请安装 Java 17+: brew install openjdk@17"
    exit 1
fi

# 设置 Java 环境
export JAVA_HOME=/usr/local/opt/openjdk@17
export PATH="$JAVA_HOME/bin:$PATH"

# 检查 Android 项目
echo -e "${YELLOW}检查 Android 项目...${NC}"
if [ ! -d "$ANDROID_DIR" ]; then
    echo -e "${RED}错误: Android 项目不存在，请先运行:${NC}"
    echo "  npx cap init android"
    echo "  npx cap sync android"
    exit 1
fi

# 检查 gradlew
if [ ! -f "$GRADLEW" ]; then
    echo -e "${RED}错误: gradlew 不存在${NC}"
    exit 1
fi

# 检查 Web 资源
echo -e "${YELLOW}检查 Web 资源...${NC}"
if [ ! -d "$PROJECT_DIR/dist" ]; then
    echo -e "${YELLOW}构建 Web 应用...${NC}"
    cd "$PROJECT_DIR"
    npm run build
fi

# 同步 Web 资源
echo -e "${YELLOW}同步 Web 资源到 Android...${NC}"
cd "$PROJECT_DIR"
if ! ./node_modules/.bin/capacitor sync android; then
    echo -e "${RED}错误: Web 资源同步失败${NC}"
    exit 1
fi

# 执行构建
echo -e "${YELLOW}构建 Android 应用 ($BUILD_TYPE)...${NC}"
cd "$ANDROID_DIR"

if [ "$BUILD_TYPE" = "release" ]; then
    echo -e "${YELLOW}Release 构建需要签名配置${NC}"
    echo "请确保已配置签名 keystore 或使用:"
    echo "  ./gradlew assembleRelease --signing-key-path /path/to/keystore.jks"

    # 尝试构建
    if ./gradlew assembleRelease; then
        echo -e "${GREEN}构建成功！${NC}"
        echo -e "${BLUE}APK 位置:${NC}"
        find "$ANDROID_DIR/app/build/outputs/apk/release" -name "*.apk" | head -5
    else
        echo -e "${RED}构建失败！${NC}"
        exit 1
    fi
else
    # Debug 构建总是成功
    if ./gradlew assembleDebug; then
        echo -e "${GREEN}Debug 构建成功！${NC}"
        echo -e "${BLUE}APK 位置:${NC}"
        find "$ANDROID_DIR/app/build/outputs/apk/debug" -name "*.apk" | head -5

        # 尝试安装到连接的设备
        echo -e "${YELLOW}尝试安装到连接的设备...${NC}"
        if ./gradlew installDebug; then
            echo -e "${GREEN}应用已安装到设备！${NC}"
        else
            echo -e "${YELLOW}没有连接的设备或安装失败${NC}"
            echo -e "${BLUE}手动安装命令:${NC}"
            echo "  adb install app/build/outputs/apk/debug/app-debug.apk"
        fi
    else
        echo -e "${RED}构建失败！${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}构建完成！${NC}"
echo -e "${GREEN}========================================${NC}"