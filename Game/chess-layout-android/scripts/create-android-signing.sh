#!/bin/bash

# Android签名配置脚本
# 此脚本将创建用于Android应用签名的keystore文件

KEYSTORE_PATH="android/app/keystore"
KEYSTORE_FILE="$KEYSTORE_PATH/keystore.jks"
KEYSTORE_PASSWORD="chesslayout2024"
KEYSTORE_ALIAS="chesslayout"
KEYSTORE_ALIAS_PASSWORD="chesslayout2024"

echo "=== Android签名配置 ==="

# 检查keystore是否已存在
if [ -f "$KEYSTORE_FILE" ]; then
    echo "Keystore文件已存在: $KEYSTORE_FILE"
    echo "跳过创建过程"
else
    echo "正在创建keystore文件..."

    # 创建keystore
    keytool -genkeypair \
        -alias "$KEYSTORE_ALIAS" \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -dname "CN=象棋布局教学, OU=开发团队, O=ChessLayout, L=北京, ST=北京, C=CN" \
        -keystore "$KEYSTORE_FILE" \
        -storepass "$KEYSTORE_PASSWORD" \
        -keypass "$KEYSTORE_ALIAS_PASSWORD"

    echo "Keystore文件创建成功: $KEYSTORE_FILE"
    echo ""
    echo "Keystore信息:"
    echo "路径: $KEYSTORE_FILE"
    echo "密码: $KEYSTORE_PASSWORD"
    echo "别名: $KEYSTORE_ALIAS"
    echo "别名密码: $KEYSTORE_ALIAS_PASSWORD"
    echo ""
fi

echo "=== 验证keystore信息 ==="
keytool -list -v -keystore "$KEYSTORE_FILE" -storepass "$KEYSTORE_PASSWORD"