# PWA 功能说明

## 已完成的 PWA 功能

### 1. 基础配置
- ✅ 更新了 package.json，添加了 PWA 相关依赖
- ✅ 配置了 vite.config.ts，集成了 vite-plugin-pwa
- ✅ 添加了 manifest.webmanifest 配置文件
- ✅ 更新了 index.html，添加了 PWA meta 标签

### 2. 核心功能
- ✅ Service Worker 注册和自动更新
- ✅ Workbox 缓存策略配置
  - API 请求缓存（NetworkFirst）
  - 图片缓存（CacheFirst）
  - 字体缓存（CacheFirst）
  - 静态资源缓存（StaleWhileRevalidate）

### 3. 用户界面组件
- ✅ OfflineIndicator - 显示离线状态
- ✅ InstallPrompt - 处理应用安装提示

### 4. 构建脚本
- ✅ `npm run build` - 标准构建
- ✅ `npm run pwa:build` - PWA 构建（生成 Service Worker）

## 使用方法

### 开发模式
```bash
npm run dev
```

### 构建 PWA
```bash
npm run pwa:build
```

### 预览构建结果
```bash
npm run preview
```

## PWA 特性

### 1. 离线功能
- 应用缓存关键资源
- 离线时显示提示信息
- Service Worker 自动缓存策略

### 2. 安装到主屏幕
- 支持安装提示
- 自定义应用图标
- 原生应用体验

### 3. 响应式设计
- 适配各种设备尺寸
- 支持移动端手势
- PWA 特性优化

### 4. 性能优化
- 资源预加载
- 缓存策略优化
- Service Worker 自动更新

## 注意事项

1. **图标资源**: 需要提供正确的图标文件（icon-192.png, icon-512.png 等）
2. **HTTPS**: 生产环境必须使用 HTTPS
3. **构建环境**: Service Worker 只在生产环境生成
4. **更新机制**: 检测到新版本时会提示用户刷新

## 测试 PWA 功能

1. **离线测试**:
   - 在开发者工具中勾选 "Offline"
   - 刷新页面，查看 OfflineIndicator

2. **安装测试**:
   - 在支持 PWA 的浏览器中访问
   - 查看安装提示
   - 可以安装到主屏幕

3. **缓存测试**:
   - 清空缓存后重新加载
   - 观察资源加载速度