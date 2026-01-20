# Focus Mode Extension - 快速开始指南

## 图标文件清单

### SVG 源文件（可编辑）
- `/icons/icon-default.svg` - 默认状态 SVG（1.8KB）
- `/icons/icon-active.svg` - 激活状态 SVG（2.4KB）

### PNG 图标（已生成）
#### 默认状态
- `/icons/icon-default-16.png` - 16x16 像素（1.6KB）
- `/icons/icon-default-48.png` - 48x48 像素（8.5KB）
- `/icons/icon-default-128.png` - 128x128 像素（8.7KB）

#### 激活状态
- `/icons/icon-active-16.png` - 16x16 像素（1.7KB）
- `/icons/icon-active-48.png` - 48x48 像素（11KB）
- `/icons/icon-active-128.png` - 128x128 像素（16KB）

## 快速集成

### 1. 在 manifest.json 中配置

```json
{
  "manifest_version": 3,
  "name": "Focus Mode",
  "version": "1.0.0",
  "icons": {
    "16": "icons/icon-default-16.png",
    "48": "icons/icon-default-48.png",
    "128": "icons/icon-default-128.png"
  },
  "action": {
    "default_icon": {
      "16": "icons/icon-default-16.png",
      "48": "icons/icon-default-48.png",
      "128": "icons/icon-default-128.png"
    }
  }
}
```

### 2. 在代码中切换图标

参考 `/icon-usage-example.js` 文件获取完整示例。

```javascript
// 设置默认图标
chrome.action.setIcon({
  path: {
    "16": "icons/icon-default-16.png",
    "48": "icons/icon-default-48.png",
    "128": "icons/icon-default-128.png"
  }
});

// 设置激活图标
chrome.action.setIcon({
  path: {
    "16": "icons/icon-active-16.png",
    "48": "icons/icon-active-48.png",
    "128": "icons/icon-active-128.png"
  }
});
```

## 预览图标

在浏览器中打开 `/icons/preview.html` 查看所有图标的预览效果。

## 设计特点

1. **护眼配色**
   - 默认状态：蓝色系（#4A90E2 - #357ABD）
   - 激活状态：绿色系（#10B981 - #059669）

2. **视觉元素**
   - 眼睛符号：代表专注和注意力
   - 激活状态带发光效果和虚线聚焦圈
   - 简洁的扁平化设计

3. **符合规范**
   - Chrome 扩展标准尺寸
   - 透明背景，适应各种主题
   - SVG 源文件便于后续修改

## 文件说明

- `manifest.example.json` - manifest 配置示例
- `icon-usage-example.js` - 图标切换代码示例
- `icons/README.md` - 详细的图标文档
- `icons/preview.html` - 图标预览页面

## 下一步

1. 将 `manifest.example.json` 中的配置复制到你的 `manifest.json`
2. 将 `icon-usage-example.js` 中的代码集成到你的扩展中
3. 测试图标在不同场景下的显示效果
4. 根据需要调整 SVG 源文件并重新生成 PNG

---

项目路径：`/Users/abc/Vibe-coding/app/focus-mode-extension`
