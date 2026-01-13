// AI 贪吃蛇 - 艺术生成器
// 使用 Emoji 和 SVG 生成艺术图像

class ArtGenerator {
    constructor() {
        this.artwork = [];
        this.currentCollage = [];
    }

    // 为单词生成艺术（主要是 Emoji + 装饰）
    generateWordArt(word) {
        const emoji = this.getWordEmoji(word);
        const style = this.generateArtStyle();

        return {
            word: word,
            emoji: emoji,
            style: style,
            svg: this.generateSVG(word, emoji, style),
            timestamp: Date.now()
        };
    }

    // 获取单词的 Emoji
    getWordEmoji(word) {
        const emojiMap = {
            // 自然
            '树': '🌳', '花': '🌸', '月': '🌙', '风': '🍃', '雨': '🌧️',
            '雪': '❄️', '山': '⛰️', '河': '🌊', '云': '☁️', '星': '⭐',
            '叶': '🍃', '草': '🌿', '林': '🌲', '海': '🌊', '天': '🌌',
            '日': '☀️', '露': '💧', '霜': '❄️', '雾': '🌫️', '霞': '🌅',
            '松': '🌲', '竹': '🎋', '梅': '🌺', '兰': '🌷', '荷': '🪷',

            // 情感
            '梦': '💤', '爱': '❤️', '忆': '💭', '愁': '😔', '喜': '😊',
            '思': '🤔', '念': '💭', '恋': '💕', '愿': '🌠', '心': '❤️',

            // 时间
            '春': '🌸', '夏': '☀️', '秋': '🍂', '冬': '❄️',
            '晨': '🌅', '暮': '🌆', '朝': '🌅', '夕': '🌇',

            // 颜色
            '红': '❤️', '绿': '💚', '蓝': '💙', '黄': '💛',
            '白': '⚪', '黑': '⚫', '金': '✨', '银': '🌟',

            // 其他
            '鸟': '🐦', '蝶': '🦋', '鱼': '🐟', '蝉': '🦗',
            '琴': '🎹', '诗': '📜', '酒': '🍷', '茶': '🍵'
        };

        return emojiMap[word] || '✨';
    }

    // 生成艺术风格
    generateArtStyle() {
        const styles = ['minimal', 'colorful', 'elegant', 'playful', 'vintage'];
        return styles[Math.floor(Math.random() * styles.length)];
    }

    // 生成 SVG 艺术图像
    generateSVG(word, emoji, style) {
        const size = 100;
        const colors = this.getColorsForStyle(style);

        return `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
                <!-- 背景 -->
                <rect width="${size}" height="${size}" fill="${colors.bg}" rx="10"/>

                <!-- 装饰圆环 -->
                <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 5}"
                        fill="none" stroke="${colors.accent}" stroke-width="2"/>

                <!-- 内圈 -->
                <circle cx="${size/2}" cy="${size/2}" r="${size/3}"
                        fill="${colors.inner}" opacity="0.5"/>

                <!-- 文字 -->
                <text x="${size/2}" y="${size/2 + 15}"
                      font-size="40" text-anchor="middle"
                      fill="${colors.text}">${emoji}</text>

                <!-- 下方文字 -->
                <text x="${size/2}" y="${size - 10}"
                      font-size="14" text-anchor="middle"
                      fill="${colors.text}" opacity="0.8">${word}</text>
            </svg>
        `;
    }

    // 根据风格获取颜色
    getColorsForStyle(style) {
        const colorPalettes = {
            minimal: {
                bg: '#f5f5f5',
                accent: '#e0e0e0',
                inner: '#ffffff',
                text: '#333333'
            },
            colorful: {
                bg: '#ffeaa7',
                accent: '#fdcb6e',
                inner: '#fff9c4',
                text: '#2d3436'
            },
            elegant: {
                bg: '#dfe6e9',
                accent: '#b2bec3',
                inner: '#ffffff',
                text: '#2d3436'
            },
            playful: {
                bg: '#fab1a0',
                accent: '#e17055',
                inner: '#ffeaa7',
                text: '#2d3436'
            },
            vintage: {
                bg: '#f5e6d3',
                accent: '#d4a574',
                inner: '#faf3e9',
                text: '#5d4e37'
            }
        };

        return colorPalettes[style] || colorPalettes.minimal;
    }

    // 添加艺术到拼图
    addToCollage(art) {
        this.currentCollage.push(art);
        return this.currentCollage;
    }

    // 获取当前拼图
    getCurrentCollage() {
        return this.currentCollage;
    }

    // 生成拼图网格
    generateCollageGrid() {
        const grid = [];
        const cols = Math.ceil(Math.sqrt(this.currentCollage.length));

        for (let i = 0; i < this.currentCollage.length; i += cols) {
            grid.push(this.currentCollage.slice(i, i + cols));
        }

        return grid;
    }

    // 生成 SVG 拼图
    generateCollageSVG() {
        if (this.currentCollage.length === 0) {
            return '';
        }

        const grid = this.generateCollageGrid();
        const tileSize = 80;
        const gap = 10;
        const cols = grid[0].length;
        const rows = grid.length;

        const width = cols * tileSize + (cols - 1) * gap + 20;
        const height = rows * tileSize + (rows - 1) * gap + 20;

        let svgContent = '';

        grid.forEach((row, rowIndex) => {
            row.forEach((art, colIndex) => {
                const x = colIndex * (tileSize + gap) + 10;
                const y = rowIndex * (tileSize + gap) + 10;

                svgContent += `
                    <g transform="translate(${x}, ${y})">
                        <rect width="${tileSize}" height="${tileSize}"
                              fill="#f9f9f9" rx="8" stroke="#e0e0e0" stroke-width="1"/>
                        <text x="${tileSize/2}" y="${tileSize/2 + 10}"
                              font-size="32" text-anchor="middle">${art.emoji}</text>
                        <text x="${tileSize/2}" y="${tileSize - 8}"
                              font-size="10" text-anchor="middle"
                              fill="#666">${art.word}</text>
                    </g>
                `;
            });
        });

        return `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
                 xmlns="http://www.w3.org/2000/svg">
                <rect width="${width}" height="${height}" fill="#ffffff" rx="10"/>
                ${svgContent}
            </svg>
        `;
    }

    // 生成诗歌卷轴（带 Emoji 的诗歌长卷）
    generatePoemScroll(poemLines) {
        const lineHeight = 80;
        const padding = 40;
        const height = poemLines.length * lineHeight + padding * 2;
        const width = 600;

        let content = '';

        poemLines.forEach((line, index) => {
            const y = padding + index * lineHeight;
            content += `
                <g transform="translate(${padding}, ${y})">
                    <text x="40" y="35" font-size="28">${line.emoji}</text>
                    <text x="80" y="35" font-size="20" fill="#333">${line.line}</text>
                </g>
            `;
        });

        return `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
                 xmlns="http://www.w3.org/2000/svg">
                <!-- 纸张背景 -->
                <defs>
                    <linearGradient id="paperGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#f5f5dc;stop-opacity:1" />
                        <stop offset="50%" style="stop-color:#faf8f0;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#f5f5dc;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="${width}" height="${height}" fill="url(#paperGradient)" rx="10"/>

                <!-- 边框 -->
                <rect x="10" y="10" width="${width - 20}" height="${height - 20}"
                      fill="none" stroke="#d4af37" stroke-width="3" rx="8"/>

                <!-- 标题 -->
                <text x="${width/2}" y="35" font-size="24" text-anchor="middle"
                      fill="#8b4513" font-weight="bold">AI 协作诗歌</text>

                <!-- 内容 -->
                ${content}
            </svg>
        `;
    }

    // 生成成就徽章 SVG
    generateAchievementBadge(achievement) {
        const colors = {
            gold: { bg: '#ffd700', border: '#b8860b' },
            silver: { bg: '#c0c0c0', border: '#808080' },
            bronze: { bg: '#cd7f32', border: '#8b4513' }
        };

        const color = colors[achievement.tier] || colors.bronze;

        return `
            <svg width="120" height="120" viewBox="0 0 120 120"
                 xmlns="http://www.w3.org/2000/svg">
                <!-- 外圈 -->
                <circle cx="60" cy="60" r="55" fill="${color.bg}"
                        stroke="${color.border}" stroke-width="4"/>

                <!-- 内圈装饰 -->
                <circle cx="60" cy="60" r="45" fill="none"
                        stroke="${color.border}" stroke-width="2" opacity="0.5"/>

                <!-- Emoji 图标 -->
                <text x="60" y="55" font-size="36" text-anchor="middle">
                    ${achievement.emoji || '🏆'}
                </text>

                <!-- 成就名称 -->
                <text x="60" y="85" font-size="12" text-anchor="middle"
                      fill="#333" font-weight="bold">${achievement.name}</text>
            </svg>
        `;
    }

    // 生成分享卡片（诗歌 + 拼图）
    generateShareCard(poem, collage) {
        const width = 800;
        const height = 600;

        return `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"
                 xmlns="http://www.w3.org/2000/svg">
                <!-- 渐变背景 -->
                <defs>
                    <linearGradient id="shareBg" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                    </linearGradient>
                </defs>

                <rect width="${width}" height="${height}" fill="url(#shareBg)"/>

                <!-- 卡片容器 -->
                <rect x="50" y="50" width="${width - 100}" height="${height - 100}"
                      fill="#ffffff" rx="20" opacity="0.95"/>

                <!-- 标题 -->
                <text x="${width/2}" y="100" font-size="28" text-anchor="middle"
                      fill="#333" font-weight="bold">我的 AI 诗歌创作</text>

                <!-- Emoji 拼图区域 -->
                <g transform="translate(100, 130)">
                    ${this.generateMiniCollage(collage, 600, 200)}
                </g>

                <!-- 诗歌区域 -->
                <g transform="translate(100, 350)">
                    ${this.generatePoemText(poem, 600, 200)}
                </g>

                <!-- 底部信息 -->
                <text x="${width/2}" y="${height - 60}" font-size="14"
                      text-anchor="middle" fill="#666">
                    由 AI 贪吃蛇诗人生成
                </text>
            </svg>
        `;
    }

    // 生成迷你拼图
    generateMiniCollage(collage, width, height) {
        const emojiSize = 40;
        const cols = Math.floor(width / (emojiSize + 10));
        let content = '';

        collage.forEach((art, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = col * (emojiSize + 10);
            const y = row * (emojiSize + 10);

            if (y + emojiSize <= height) {
                content += `<text x="${x}" y="${y + emojiSize}" font-size="${emojiSize}">${art.emoji}</text>`;
            }
        });

        return content;
    }

    // 生成诗歌文本
    generatePoemText(poem, width, height) {
        const lines = poem.lines || [];
        let content = '';
        let y = 30;

        lines.slice(0, 5).forEach(line => {
            content += `<text x="0" y="${y}" font-size="18" fill="#333">${line.emoji} ${line.line}</text>`;
            y += 35;
        });

        return content;
    }

    // 重置拼图
    resetCollage() {
        this.currentCollage = [];
    }

    // 导出 SVG 为字符串（可用于下载）
    exportSVG(svgString) {
        return svgString;
    }

    // 将 SVG 转换为 Data URL
    svgToDataUrl(svgString) {
        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    }
}

// 导出单例
export default new ArtGenerator();
