# Tavo 自动点击器

> 自动点击 Tavo AI 角色扮演应用中的"继续生成"按钮

## 目标按钮

- **位置**：对话框下方第二个按钮（双箭头图标）
- **特征**：纯图标按钮，无文本标签
- **包名**：`app.bitbear.tav`

## 实现方案

由于按钮是**纯图标**，需要通过以下方式定位：

### 方案 1：通过坐标点击（最简单）

```javascript
// 假设按钮在固定位置
click(500, 1500); // 需要根据实际屏幕调整
```

### 方案 2：通过控件描述/ID定位

```javascript
// 尝试查找带描述的按钮
desc("继续").findOne().click();
// 或者通过资源ID
id("continue_button").findOne().click();
```

### 方案 3：通过索引定位（推荐）

```javascript
// 找到对话框容器，获取其第二个子按钮
// 需要先用 UI Automator 查看实际层级结构
```

## 下一步

1. 使用 Auto.js 的 "布局分析" 功能查看按钮属性
2. 获取按钮的 resource-id、desc 或 content-desc
3. 编写定位脚本

## 工具准备

```bash
# 下载 Auto.js Pro
# https://autojs.org/

# 或使用 AutoX (免费版)
# https://github.com/kkevsekk1/AutoX
```
