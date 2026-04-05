# 手机娘桌宠 - 设计文档

## 概述

基于"手机嘎了给木"参考项目，开发一个 Android 手机娘桌宠应用。核心区别：增加常驻手机娘角色图标、好感度等级系统。

## 技术栈

- Android Kotlin 原生
- AccessibilityService 监听全局交互
- Canvas 自绘悬浮窗（FLAG_NOT_TOUCHABLE，不影响用户操作）
- SharedPreferences 持久化好感度

## 项目结构

```
手机娘桌宠/
├── app/src/main/
│   ├── java/com/example/shoujiniang/
│   │   ├── MainActivity.kt           # 主界面：引导开启无障碍
│   │   ├── PetOverlayService.kt      # 无障碍服务：监听全局事件
│   │   ├── PetOverlayView.kt         # 悬浮视图：角色+特效+文字
│   │   └── FavorabilityManager.kt    # 好感度管理：等级、持久化
│   ├── res/
│   │   ├── drawable/
│   │   │   └── pet_character.png     # 用户提供的手机娘图片
│   │   ├── layout/activity_main.xml
│   │   ├── xml/accessibility_service_config.xml
│   │   └── values/strings.xml
│   └── AndroidManifest.xml
```

## 好感度等级系统

| 等级 | 名称 | 范围 | 角色表现 |
|------|------|------|---------|
| 0 | 陌生 | 0-30 | 缩小到 70%，半透明 0.6，缓慢呼吸动画 |
| 1 | 普通 | 31-60 | 正常大小 100%，偶尔透明度闪动模拟眨眼 |
| 2 | 友好 | 61-80 | 正常大小，每 5 秒小跳动画 |
| 3 | 亲密 | 81-100 | 正常大小，跳跳+粉色爱心粒子环绕 |

### 核心规则

- 用户操作 -> 好感度 +1（500ms 冷却防刷）
- 空闲超过 5 秒 -> 每 3 秒好感度 -1
- 好感度范围：0~100，SharedPreferences 持久化
- 等级变化时角色有过渡动画

## 悬浮窗架构

使用 TYPE_ACCESSIBILITY_OVERLAY + FLAG_NOT_TOUCHABLE，全屏透明悬浮窗，零触摸拦截。

绘制分层（从底到顶）：
1. 蓝色边框光晕（空闲时显示）
2. 气泡 + "好感度++/--" 文字特效
3. 手机娘角色 PNG + 等级标签

## 角色显示

- 位置：屏幕右下角，距边缘 16dp
- 大小：约 80x80dp（根据等级缩放）
- 绘制：Canvas.drawBitmap()
- 等级标签：角色下方显示当前等级

## 角色动画（单图动效）

| 状态 | 动画效果 | 实现方式 |
|------|---------|---------|
| 呼吸（常驻） | 缓慢 Y 轴缩放 0.95~1.05 | canvas.scale() + sin() |
| 陌生 (Lv0) | 透明度 0.6，缩小到 70% | scale(0.7f) + alpha |
| 普通 (Lv1) | 偶尔透明度闪动 | 周期性 alpha 变化 |
| 友好 (Lv2) | 每 5 秒小跳 | Y 轴偏移 + 弹簧衰减 |
| 亲密 (Lv3) | 跳跳+爱心粒子 | 继承气泡系统改爱心 |
| 用户操作时 | 放大弹跳 + "好感度++" | scale 1.0->1.2->1.0 |
| 空闲时 | 缩小变淡 + "好感度--" | 渐变 scale/alpha |

## 状态机

```
          用户操作
    ┌──────────────────┐
    │                  v
 +------+        +---------+
 | 空闲 |<-------|  活跃    |
 | IDLE | 5秒无操作| ACTIVE  |
 +------+--------+---------+
    |                  |
    v                  v
 好感度 -1/3秒    好感度 +1/操作
 蓝色光晕渐显     粉色气泡+角色弹跳
 角色缩小变淡     "好感度++"
 "好感度--"
```

## 特效系统

- 粉色气泡：用户操作时从屏幕边缘生成
- "好感度++" 文字：粉色，操作时随机位置飘出
- "好感度--" 文字：蓝色，空闲时屏幕中央飘出
- 蓝色边框光晕：空闲时渐显

## 事件监听

AccessibilityService 监听以下事件类型：
- TYPE_VIEW_CLICKED
- TYPE_VIEW_SCROLLED
- TYPE_VIEW_FOCUSED
- TYPE_VIEW_TEXT_CHANGED
- TYPE_VIEW_SELECTED
- TYPE_TOUCH_INTERACTION_START

所有事件仅触发视觉效果，不拦截、不消费、不修改。

## MainActivity

- 标题：手机娘桌宠
- 显示当前好感度等级和数值
- 按钮引导开启无障碍服务
- 开启步骤提示

## 编译配置

- compileSdk 36, minSdk 24, targetSdk 36
- Kotlin + Java 17
- 依赖：androidx.core, appcompat, material
