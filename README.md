# Vibe-Coding

> 氛围编程 - 使用 AI 工具辅助代码开发

## 简介

使用 AI（如 Claude、GPT 等）辅助编程的项目集合。

## 目录

```
Vibe-Coding/
├── app/
│   ├── brain-dump-space/       # 闪念胶囊 - 思维记录与可视化
│   ├── MeowSimulator/          # 猫娘模拟器（Android + Mac + Windows）
│   ├── pomodoro-todo-app/      # 番茄钟待办
│   ├── focus-mode-extension/   # 专注模式浏览器扩展
│   ├── content-workbench/      # 内容工作台
│   └── word-pdf-converter/     # 文档转换工具
└── Game/
    ├── ai-snake-poet/          # AI 贪吃蛇诗人
    ├── chess-layout-android/   # 象棋布局 Android
    ├── chess-layout-pwa/       # 象棋布局 PWA
    └── ...
```

### 猫娘模拟器

自动给聊天消息加喵～的工具，支持三平台：

| 平台 | 路径 | 说明 |
|------|------|------|
| Android | `app/MeowSimulator/猫娘模拟器-v1.0.0.apk` | 悬浮输入框，复制粘贴发送 |
| macOS | `app/MeowSimulator/mac/auto_meow_mac.py` | 拦截回车键，自动输入喵～ |
| Windows | `app/MeowSimulator/win/auto_meow_win.py` | 系统托盘，拦截回车键 |

**卸载：**
- Android：关闭开关 → 卸载 APP，无残留
- Mac/Win：Ctrl+C 退出 → 删除文件夹，无残留

## 运行

```bash
cd app/<项目名>
npm install
npm run dev
```

## License

MIT
