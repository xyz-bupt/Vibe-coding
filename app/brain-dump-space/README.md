# Brain Dump Space (闪念胶囊)

<div align="center">
  <p>极简闪念记录，AI 智能标签</p>
</div>

## 项目结构

```
brain-dump-space/
├── web-app/            # Web 应用版本（力导向图可视化）
└── chrome-extension/   # Chrome 浏览器插件版（毛玻璃质感）
```

---

## Web 版本

极简单页应用，带思维星空可视化。

**运行**:
```bash
cd web-app
npm install
npm run dev
```

**特性**:
- 力导向图可视化，思维胶囊轨道旋转
- 完整的思维星空界面
- 支持拖拽、缩放交互

详见 [web-app/README.md](./web-app/)

---

## Chrome 插件版

浏览器插件，快速记录，毛玻璃质感 UI。

**安装**:
1. 打开 `chrome://extensions/`
2. 开启「开发者模式」
3. 加载 `chrome-extension` 文件夹

**特性**:
- 毛玻璃质感设计
- 弹窗快速记录
- 数据存储在 Chrome Storage
- 支持 AI 标签提取

详见 [chrome-extension/README.md](./chrome-extension/)

---

## 共同特性

- **智能标签**: AI 自动提取（GLM/通义/DeepSeek/OpenAI）或关键词匹配
- **本地存储**: 数据完全本地化，无需服务器
- **快捷键**: Enter 保存，Shift+Enter 换行

## License

MIT
