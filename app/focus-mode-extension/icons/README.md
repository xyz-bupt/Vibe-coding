# Focus Mode Extension Icons

专注模式浏览器扩展的图标资源。

## 文件结构

```
icons/
├── icon-default.svg           # 默认状态SVG源文件
├── icon-default-16.png        # 默认状态 16x16 PNG
├── icon-default-48.png        # 默认状态 48x48 PNG
├── icon-default-128.png       # 默认状态 128x128 PNG
├── icon-active.svg            # 激活状态SVG源文件
├── icon-active-16.png         # 激活状态 16x16 PNG
├── icon-active-48.png         # 激活状态 48x48 PNG
└── icon-active-128.png        # 激活状态 128x128 PNG
```

## 设计说明

### 默认状态 (icon-default)
- **主题**: 眼睛图标，代表专注和注意力
- **颜色**: 蓝色系 (#4A90E2 到 #357ABD)
- **风格**: 简洁扁平化设计，带有眼睫毛装饰
- **用途**: 扩展未激活时显示

### 激活状态 (icon-active)
- **主题**: 带聚焦圈的眼睛图标
- **颜色**: 绿色系 (#10B981 到 #059669)
- **风格**: 添加了发光效果和虚线聚焦圈
- **用途**: 专注模式开启时显示

## 在 manifest.json 中使用

### Chrome/Edge 扩展

```json
{
  "name": "Focus Mode",
  "version": "1.0.0",
  "manifest_version": 3,
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

### 在扩展代码中动态切换图标

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

## 图标尺寸说明

- **16x16**: 工具栏小图标、favicon
- **48x48**: 扩展管理页面图标
- **128x128**: Chrome 网上应用店图标、安装对话框

## 重新生成图标

如果需要修改图标设计，编辑 SVG 源文件后使用 ImageMagick 重新生成 PNG：

```bash
# 生成默认状态图标
convert icon-default.svg -resize 16x16 icon-default-16.png
convert icon-default.svg -resize 48x48 icon-default-48.png
convert icon-default.svg -resize 128x128 icon-default-128.png

# 生成激活状态图标
convert icon-active.svg -resize 16x16 icon-active-16.png
convert icon-active.svg -resize 48x48 icon-active-48.png
convert icon-active.svg -resize 128x128 icon-active-128.png
```

## 设计理念

1. **眼睛符号**: 代表专注、注意力和观察
2. **蓝色系**: 冷色调有助于保持冷静和专注
3. **绿色激活态**: 绿色表示"正在专注"的积极状态
4. **虚线聚焦圈**: 激活状态添加的同心圆强调"聚焦"概念
5. **扁平化设计**: 符合现代 UI 设计趋势和 Chrome 扩展规范

## 护眼考虑

图标颜色选择考虑了护眼因素：
- 蓝色和绿色都是护眼色
- 避免使用过于鲜艳刺眼的颜色
- 透明度和渐变让图标更柔和
- 激活状态的绿色暗示"安全、专注"的状态
