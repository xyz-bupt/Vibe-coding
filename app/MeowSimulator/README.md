# 猫娘模拟器

自动给聊天消息加喵～的工具，支持三平台。

## 下载使用

### Android

| 文件 | 使用方式 |
|------|----------|
| `猫娘模拟器-v1.0.0.apk` | 安装APK → 开启悬浮输入框 → 打字 → 复制 → 粘贴发送 |

### macOS

```bash
cd mac
pip3 install -r requirements.txt
python3 auto_meow_mac.py
```

快捷键 `Cmd+Shift+M` 切换开关，编辑 `config.json` 自定义白名单APP。

### Windows

```bash
cd win
pip install -r requirements.txt
# 以管理员身份运行
python auto_meow_win.py
```

右键系统托盘图标控制开关。

## 卸载

- **Android**：关闭开关 → 卸载APP，无残留
- **macOS**：`Ctrl+C` 退出 → 删除文件夹，无残留
- **Windows**：右键托盘点退出 → 删除文件夹，无残留

## 自定义

编辑 `config.json`：

```json
{
  "prefix": "喵～",
  "suffix": "喵～",
  "whitelist": ["微信", "WeChat", "QQ", "Telegram"]
}
```

## 从源码构建 Android APK

```bash
./gradlew assembleRelease
```

输出在 `app/build/outputs/apk/release/`。
