// AI 贪吃蛇 - 画廊和分享功能
// 管理诗歌画廊、保存和分享

import poemGenerator from './poem-generator.js';
import artGenerator from './art-generator.js';
import achievementManager from './achievement.js';

class GalleryManager {
    constructor() {
        this.gallery = [];
        this.currentCreation = null;
        this.loadGallery();
    }

    // 保存当前创作到画廊
    saveCreation(poem, collage, gameStats) {
        const creation = {
            id: this.generateId(),
            poem: poem,
            collage: collage,
            gameStats: gameStats,
            timestamp: Date.now(),
            shareCount: 0
        };

        this.gallery.unshift(creation);
        this.currentCreation = creation;

        // 限制画廊大小
        if (this.gallery.length > 50) {
            this.gallery.pop();
        }

        this.saveGalleryToStorage();
        return creation;
    }

    // 生成唯一 ID
    generateId() {
        return 'creation_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // 获取所有创作
    getAllCreations() {
        return this.gallery;
    }

    // 获取最近的创作
    getRecentCreations(count = 10) {
        return this.gallery.slice(0, count);
    }

    // 获取最佳创作（按分数）
    getBestCreations(count = 5) {
        return [...this.gallery]
            .sort((a, b) => b.gameStats.score - a.gameStats.score)
            .slice(0, count);
    }

    // 根据 ID 获取创作
    getCreationById(id) {
        return this.gallery.find(c => c.id === id);
    }

    // 删除创作
    deleteCreation(id) {
        const index = this.gallery.findIndex(c => c.id === id);
        if (index !== -1) {
            this.gallery.splice(index, 1);
            this.saveGalleryToStorage();
            return true;
        }
        return false;
    }

    // 生成分享文本
    generateShareText(creation) {
        const poem = creation.poem;
        const stats = creation.gameStats;

        let text = '🎮 我的 AI 贪吃蛇诗歌创作\n\n';

        // 诗歌内容
        text += '✨ 我的诗歌：\n';
        text += poem.emojiPoem + '\n\n';

        // 游戏统计
        text += `📊 得分：${stats.score}\n`;
        text += `📝 收集单词：${stats.wordsCollected}个\n`;
        text += `🏆 最高分：${stats.highScore}\n`;

        // 标签
        text += '\n🎨 #AI贪吃蛇 #诗歌创作 #AIArt';

        return text;
    }

    // 复制分享文本
    copyShareText(creation) {
        const text = this.generateShareText(creation);
        return navigator.clipboard.writeText(text).then(() => {
            creation.shareCount++;
            this.saveGalleryToStorage();
            return true;
        }).catch(err => {
            console.error('Failed to copy:', err);
            return false;
        });
    }

    // 生成分享卡片（SVG）
    generateShareCard(creation) {
        return artGenerator.generateShareCard(
            creation.poem,
            creation.collage
        );
    }

    // 导出为图片
    exportAsImage(creation) {
        const svg = this.generateShareCard(creation);
        const dataUrl = artGenerator.svgToDataUrl(svg);

        // 创建下载链接
        const link = document.createElement('a');
        link.download = `ai-snake-poem-${creation.id}.svg`;
        link.href = dataUrl;
        link.click();
    }

    // 导出为文本文件
    exportAsText(creation) {
        const content = this.generateShareText(creation);
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.download = `ai-snake-poem-${creation.id}.txt`;
        link.href = url;
        link.click();

        URL.revokeObjectURL(url);
    }

    // 导出为 JSON（完整数据）
    exportAsJSON(creation) {
        const data = JSON.stringify(creation, null, 2);
        const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.download = `ai-snake-poem-${creation.id}.json`;
        link.href = url;
        link.click();

        URL.revokeObjectURL(url);
    }

    // 生成分享链接（使用 Base64 编码）
    generateShareLink(creation) {
        const data = btoa(JSON.stringify({
            p: creation.poem.lines.map(l => l.line),
            s: creation.gameStats.score,
            w: creation.gameStats.wordsCollected
        }));

        return `${window.location.origin}${window.location.pathname}#share=${data}`;
    }

    // 从分享链接加载
    loadFromShareLink(hash) {
        try {
            if (hash.startsWith('#share=')) {
                const data = JSON.parse(atob(hash.substring(7)));

                // 重建创作对象
                const creation = {
                    id: this.generateId(),
                    poem: {
                        lines: data.p.map((line, index) => ({
                            line: line,
                            emoji: '✨',
                            timestamp: Date.now() + index
                        })),
                        emojiPoem: data.p.join('\n'),
                        score: data.s
                    },
                    collage: [],
                    gameStats: {
                        score: data.s,
                        wordsCollected: data.w
                    },
                    timestamp: Date.now(),
                    isShared: true
                };

                return creation;
            }
        } catch (e) {
            console.error('Failed to load from share link:', e);
        }
        return null;
    }

    // 分享到社交媒体
    shareToSocialMedia(platform, creation) {
        const text = encodeURIComponent(this.generateShareText(creation));
        const url = encodeURIComponent(window.location.href);

        const platformUrls = {
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
            weibo: `https://service.weibo.com/share/share.php?title=${text}&url=${url}`,
            copy: null
        };

        if (platform === 'copy') {
            return this.copyShareText(creation);
        }

        const shareUrl = platformUrls[platform];
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }

    // 保存画廊到 localStorage
    saveGalleryToStorage() {
        try {
            localStorage.setItem('aiSnakeGallery', JSON.stringify(this.gallery));
        } catch (e) {
            console.error('Failed to save gallery:', e);
        }
    }

    // 从 localStorage 加载画廊
    loadGallery() {
        try {
            const saved = localStorage.getItem('aiSnakeGallery');
            if (saved) {
                this.gallery = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load gallery:', e);
            this.gallery = [];
        }
    }

    // 清空画廊
    clearGallery() {
        if (confirm('确定要清空画廊吗？这将删除所有保存的创作。')) {
            this.gallery = [];
            this.currentCreation = null;
            localStorage.removeItem('aiSnakeGallery');
        }
    }

    // 获取画廊统计
    getGalleryStats() {
        return {
            totalCreations: this.gallery.length,
            totalShares: this.gallery.reduce((sum, c) => sum + (c.shareCount || 0), 0),
            highestScore: Math.max(...this.gallery.map(c => c.gameStats.score), 0),
            avgScore: this.gallery.length > 0
                ? Math.round(this.gallery.reduce((sum, c) => sum + c.gameStats.score, 0) / this.gallery.length)
                : 0
        };
    }

    // 获取排行榜
    getLeaderboard(category = 'score') {
        const sorted = [...this.gallery].sort((a, b) => {
            switch (category) {
                case 'score':
                    return b.gameStats.score - a.gameStats.score;
                case 'words':
                    return b.gameStats.wordsCollected - a.gameStats.wordsCollected;
                case 'shares':
                    return (b.shareCount || 0) - (a.shareCount || 0);
                default:
                    return 0;
            }
        });

        return sorted.slice(0, 10);
    }

    // 点赞创作
    likeCreation(id) {
        const creation = this.getCreationById(id);
        if (creation) {
            creation.likes = (creation.likes || 0) + 1;
            this.saveGalleryToStorage();
            return creation.likes;
        }
        return 0;
    }

    // 生成画廊 HTML（用于显示）
    generateGalleryHTML(creations) {
        if (creations.length === 0) {
            return '<p class="empty-message">还没有创作，快去玩一局吧！</p>';
        }

        return creations.map(creation => `
            <div class="gallery-item" data-id="${creation.id}">
                <div class="gallery-preview">
                    ${artGenerator.generateCollageSVG()}
                </div>
                <div class="gallery-info">
                    <h4>得分：${creation.gameStats.score}</h4>
                    <p class="gallery-poem">${creation.poem.emojiPoem.substring(0, 50)}...</p>
                    <div class="gallery-actions">
                        <button class="btn-view" data-id="${creation.id}">查看</button>
                        <button class="btn-share" data-id="${creation.id}">分享</button>
                        <button class="btn-delete" data-id="${creation.id}">删除</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // 生成创作详情 HTML
    generateCreationDetailHTML(creation) {
        return `
            <div class="creation-detail">
                <div class="creation-header">
                    <h2>AI 诗歌创作</h2>
                    <p class="creation-date">${new Date(creation.timestamp).toLocaleString()}</p>
                </div>

                <div class="creation-stats">
                    <div class="stat-item">
                        <span class="stat-label">得分</span>
                        <span class="stat-value">${creation.gameStats.score}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">单词</span>
                        <span class="stat-value">${creation.gameStats.wordsCollected}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">分享</span>
                        <span class="stat-value">${creation.shareCount || 0}</span>
                    </div>
                </div>

                <div class="creation-poem">
                    <h3>📜 诗歌</h3>
                    <div class="poem-content">
                        ${creation.poem.lines.map(line =>
                            `<p>${line.emoji} ${line.line}</p>`
                        ).join('')}
                    </div>
                </div>

                <div class="creation-collage">
                    <h3>🎨 艺术拼图</h3>
                    <div class="collage-content">
                        ${artGenerator.generateCollageSVG()}
                    </div>
                </div>

                <div class="creation-actions">
                    <button class="btn-export-text">导出文本</button>
                    <button class="btn-export-image">导出图片</button>
                    <button class="btn-copy">复制分享</button>
                </div>
            </div>
        `;
    }
}

// 导出单例
export default new GalleryManager();
