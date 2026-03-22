# 闪念胶囊 - Chrome Extension

浏览器插件版的闪念胶囊，支持快速记录和 AI 智能标签。

## 特性

- 毛玻璃质感的 UI 设计
- 快速弹出记录，无需离开当前页面
- AI 自动提取标签（支持 OpenAI/通义/DeepSeek/GLM 等）
- 关键词智能匹配
- 本地存储，数据隐私

## 安装方法

1. 打开 Chrome 浏览器，进入 `chrome://extensions/`
2. 开启右上角的「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择此 `chrome-extension` 文件夹

## 使用方法

- 点击浏览器工具栏中的闪念胶囊图标
- 输入闪念内容，会自动预览标签
- 按 Enter 或点击「保存」按钮
- 点击设置图标配置 AI API

## 文件结构

```
chrome-extension/
├── manifest.json      # 扩展配置
├── popup.html         # 弹窗页面
├── css/
│   └── style.css      # 毛玻璃样式
├── js/
│   ├── storage.js     # Chrome storage 封装
│   ├── analyzer.js    # 标签分析服务
│   └── popup.js       # 主逻辑
└── icons/             # 扩展图标
```

## 快捷键

- `Enter` - 保存闪念
- `Shift + Enter` - 换行
