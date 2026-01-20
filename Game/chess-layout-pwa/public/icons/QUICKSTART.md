# 快速开始 - 生成 PWA 图标

## 最简单的方法（推荐）

### 使用 ImageMagick（最快）

```bash
# 1. 安装 ImageMagick（如果未安装）
brew install imagemagick

# 2. 进入图标目录
cd /Users/abc/Vibe-coding/Game/chess-layout-pwa/public/icons

# 3. 运行生成脚本
bash generate-icons.sh

# 完成！所有图标已生成。
```

### 使用 Node.js

```bash
# 1. 安装依赖
npm install sharp

# 2. 生成图标
cd /Users/abc/Vibe-coding/Game/chess-layout-pwa/public/icons
node generate-icons.js

# 完成！
```

## 验证生成结果

```bash
# 查看生成的文件
ls -lh *.png *.ico

# 应该看到以下文件：
# icon-72x72-maskable.png
# icon-96x96-maskable.png
# icon-128x128-maskable.png
# icon-144x144-maskable.png
# icon-152x152-maskable.png
# icon-192x192.png
# icon-192x192-maskable.png
# icon-384x384.png
# icon-384x384-maskable.png
# icon-512x512.png
# icon-512x512-maskable.png
# favicon.ico
# favicon-16x16.png
# favicon-32x32.png
# apple-touch-icon.png
```

## 测试 PWA

```bash
# 启动开发服务器
cd /Users/abc/Vibe-coding/Game/chess-layout-pwa
npm run dev

# 在浏览器中打开
# http://localhost:5173

# 打开 Chrome DevTools > Lighthouse > Progressive Web App
# 运行审计，确保图标相关检查通过
```

## 如果遇到问题

### ImageMagick 未找到
```bash
# macOS
brew install imagemagick

# Ubuntu
sudo apt-get install imagemagick
```

### Node.js sharp 安装失败
```bash
# 清除缓存重试
npm cache clean --force
npm install sharp
```

### 图标质量不佳
使用 ImageMagick 版本生成，质量更高。

## 需要帮助？

查看详细文档：`README.md`
