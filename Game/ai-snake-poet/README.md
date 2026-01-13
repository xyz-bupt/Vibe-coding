# AI 贪吃蛇诗人

一个结合 AI 生成艺术和诗歌的创意贪吃蛇游戏。玩家通过收集汉字单词，让 AI 协作生成诗歌和艺术作品。

## 功能特色

### 10 大核心功能

1. **单词解锁世界** - 每个单词都会触发诗意联想，生成独特的艺术作品
2. **诗歌拼图玩法** - 收集的单词组合成 AI 生成的诗歌
3. **魔法单词 & 故事分支** - 特殊单词触发主题变化和故事演进
4. **实时互动生成** - AI 诗人实时对话，环境随单词变化
5. **创作 & 分享** - 保存并分享你的 AI 协作创作
6. **按句贪吃蛇挑战** - 反向模式：按顺序吃掉单词重构诗句
7. **主题关卡 & 风格选择** - 8 种主题：默认、唐诗、夜、梦、春、冬、童话、科幻
8. **现场共创** - 玩家输入影响诗歌生成
9. **AI 彩蛋 & 成就** - 特殊单词组合触发彩蛋，成就系统
10. **成长的故事** - 蛇的成长对应故事章节推进

## 项目结构

```
ai-snake-poet/
├── index.html              # 主页面
├── style.css               # 样式表
├── main.js                 # 主入口
├── ai-snake.js             # 游戏核心逻辑
├── word-system.js          # 单词系统
├── poem-generator.js       # 诗歌生成器
├── art-generator.js        # 艺术生成器
├── theme-manager.js        # 主题管理器
├── achievement.js          # 成就系统
├── gallery.js              # 画廊和分享
└── data/
    ├── word-library.js     # 词库数据
    ├── poem-templates.js   # 诗歌模板
    └── themes.js           # 主题配置
```

## 如何运行

### 方法 1: 使用本地服务器（推荐）

由于使用了 ES6 模块，需要通过 HTTP 服务器运行：

```bash
# Python 3
cd /Users/abc/Vibe-coding/ai-snake-poet
python3 -m http.server 8000

# 然后在浏览器打开
# http://localhost:8000
```

或使用 Node.js：

```bash
# 全局安装 http-server
npm install -g http-server

# 运行
cd /Users/abc/Vibe-coding/ai-snake-poet
http-server -p 8000

# 然后在浏览器打开
# http://localhost:8000
```

### 方法 2: 使用 VS Code Live Server

1. 在 VS Code 中打开项目
2. 安装 Live Server 扩展
3. 右键点击 `index.html` 选择 "Open with Live Server"

## 游戏玩法

### 基本操作

- **方向键** - 控制蛇的移动
- **空格键** - 暂停/继续游戏

### 游戏模式

1. **经典模式** - 自由收集单词，AI 生成诗歌
2. **诗句挑战** - 按顺序吃掉指定单词，重构诗句

### 主题选择

- **默认** - 经典贪吃蛇体验
- **唐诗** - 古典雅致，诗意盎然
- **夜** - 神秘宁静，月色如水
- **梦** - 梦幻迷离，奇幻美丽
- **春** - 生机勃勃，春意盎然
- **冬** - 清冷素雅，宁静致远
- **童话** - 梦幻童话，魔法世界
- **科幻** - 未来科技，星际探索

### 魔法单词

收集特殊单词会触发主题变化：
- 🌙 **夜** - 切换到夜间主题
- 💤 **梦** - 切换到梦幻主题
- 🍃 **风** - 自由氛围
- ❄️ **雪** - 切换到冬季主题
- ...更多等待发现

### 特殊组合彩蛋

收集特定的单词组合会触发彩蛋：
- **春江花月夜** - 千古绝唱 +100分
- **中秋** - 月圆人团圆 +50分
- **岁寒三友** (松竹梅) - 高风亮节 +30分
- **风花雪月** - 浪漫至极 +40分
- ...更多彩蛋等待发现

## 技术特点

- 纯前端实现，无需后端
- 使用 ES6 模块化开发
- Canvas 渲染游戏画面
- localStorage 持久化数据
- 模拟 AI 生成（可扩展接入真实 API）

## 扩展开发

### 接入真实 LLM API

修改 `poem-generator.js`：

```javascript
async function generatePoemLine(word, theme, mood) {
    // 调用 OpenAI/Claude API
    const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word, theme, mood })
    });
    return await response.json();
}
```

### 接入图像生成 API

修改 `art-generator.js`：

```javascript
async function generateWordArt(word) {
    // 调用 DALL-E/Stable Diffusion API
    const response = await fetch('YOUR_IMAGE_API');
    const imageUrl = await response.json();
    return { word, imageUrl };
}
```

## 数据存储

- 最高分 - `localStorage.getItem('aiSnakeHighScore')`
- 诗歌历史 - `localStorage.getItem('aiSnakePoemHistory')`
- 画廊 - `localStorage.getItem('aiSnakeGallery')`
- 成就 - `localStorage.getItem('aiSnakeAchievements')`
- 主题偏好 - `localStorage.getItem('aiSnakeTheme')`

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

需要支持 ES6 模块和 Canvas API。

## 开发团队

AI 贪吃蛇诗人 - Vibe-coding 项目

## 许可证

MIT License

---

享受你的 AI 诗歌创作之旅！ 🎮✨📜
