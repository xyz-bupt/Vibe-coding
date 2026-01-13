// AI 贪吃蛇 - 诗歌生成器
// 模拟 AI 生成诗歌的系统

import {
    TANG_TEMPLATES,
    SONG_TEMPLATES,
    MODERN_TEMPLATES,
    FAIRYTALE_TEMPLATES,
    SCIFI_TEMPLATES,
    AI_DIALOGUES,
    STORY_CHAPTERS,
    POEM_SCORING
} from './data/poem-templates.js';

import wordSystem from './word-system.js';
import themeManager from './theme-manager.js';

class PoemGenerator {
    constructor() {
        this.currentPoem = [];
        this.poemHistory = [];
        this.currentStyle = 'tang';
        this.comboCount = 0;
        this.lastWord = null;
    }

    // 设置诗歌风格
    setStyle(style) {
        this.currentStyle = style;
    }

    // 获取当前风格的模板
    getTemplates() {
        const styleMap = {
            tang: TANG_TEMPLATES,
            song: SONG_TEMPLATES,
            modern: MODERN_TEMPLATES,
            fairytale: FAIRYTALE_TEMPLATES,
            scifi: SCIFI_TEMPLATES
        };
        return styleMap[this.currentStyle] || MODERN_TEMPLATES;
    }

    // 随机选择模板
    selectTemplate() {
        const templates = this.getTemplates();
        return templates[Math.floor(Math.random() * templates.length)];
    }

    // 生成一行诗句
    generateLine(word) {
        const template = this.selectTemplate();
        const associatedWords = wordSystem.getAssociatedWords(word);

        // 准备替换变量
        const variables = this.prepareVariables(word, associatedWords);
        let line = template;

        // 替换所有变量
        Object.keys(variables).forEach(key => {
            const regex = new RegExp(`{${key}}`, 'g');
            line = line.replace(regex, variables[key]);
        });

        return line;
    }

    // 准备模板变量
    prepareVariables(word, associatedWords) {
        // 从关联词中随机选择
        const randomAssociated = associatedWords[Math.floor(Math.random() * associatedWords.length)];

        return {
            word: word,
            related: randomAssociated,
            emotion: this.getRandomEmotion(),
            place: this.getRandomPlace(),
            action: this.getRandomAction(),
            mood: this.getRandomMood(),
            time: this.getRandomTime(),
            depth: this.getRandomDepth(),
            quantity: this.getRandomQuantity()
        };
    }

    // 随机情感词
    getRandomEmotion() {
        const emotions = ['静', '动', '深', '浅', '远', '近', '新', '旧'];
        return emotions[Math.floor(Math.random() * emotions.length)];
    }

    // 随机地点词
    getRandomPlace() {
        const places = '山水天地江河云雾'.split('');
        return places[Math.floor(Math.random() * places.length)];
    }

    // 随机动作词
    getRandomAction() {
        const actions = '飞落流飘舞吟看听'.split('');
        return actions[Math.floor(Math.random() * actions.length)];
    }

    // 随机情绪词
    getRandomMood() {
        const moods = '意情心梦思'.split('');
        return moods[Math.floor(Math.random() * moods.length)];
    }

    // 随机时间词
    getRandomTime() {
        const times = '晨暮朝夕日夜年岁'.split('');
        return times[Math.floor(Math.random() * times.length)];
    }

    // 随机深度词
    getRandomDepth() {
        const depths = ['万丈', '千尺', '无边', '无尽', '无穷'];
        return depths[Math.floor(Math.random() * depths.length)];
    }

    // 随机数量词
    getRandomQuantity() {
        const quantities = ['重', '里', '叠', '层', '丈'];
        return quantities[Math.floor(Math.random() * quantities.length)];
    }

    // 添加诗句
    addLine(word) {
        const line = this.generateLine(word);
        const poemLine = {
            line: line,
            word: word,
            emoji: wordSystem.getWordEmoji(word),
            timestamp: Date.now()
        };

        this.currentPoem.push(poemLine);
        return poemLine;
    }

    // 获取当前诗歌
    getCurrentPoem() {
        return this.currentPoem;
    }

    // 获取格式化的诗歌文本
    getFormattedPoem() {
        return this.currentPoem.map(p => p.line).join('\n');
    }

    // 获取带 Emoji 的诗歌
    getEmojiPoem() {
        return this.currentPoem.map(p => `${p.emoji} ${p.line}`).join('\n');
    }

    // 完成诗歌
    finishPoem() {
        if (this.currentPoem.length === 0) {
            return null;
        }

        const completedPoem = {
            lines: [...this.currentPoem],
            formatted: this.getFormattedPoem(),
            emojiPoem: this.getEmojiPoem(),
            style: this.currentStyle,
            score: this.calculatePoemScore(),
            timestamp: Date.now()
        };

        this.poemHistory.push(completedPoem);
        return completedPoem;
    }

    // 重置当前诗歌
    resetPoem() {
        this.currentPoem = [];
        this.comboCount = 0;
        this.lastWord = null;
    }

    // 计算诗歌得分
    calculatePoemScore() {
        let score = 0;

        // 基础分：每行诗句
        score += this.currentPoem.length * POEM_SCORING.length;

        // 单词多样性
        const uniqueWords = new Set(this.currentPoem.map(p => p.word));
        score += uniqueWords.size * POEM_SCORING.variety;

        // 连击加分
        if (this.comboCount > 1) {
            score += this.comboCount * POEM_SCORING.combo;
        }

        return score;
    }

    // 更新连击
    updateCombo(word) {
        if (this.lastWord) {
            // 检查是否有语义关联（简单实现）
            const lastAssociated = wordSystem.getAssociatedWords(this.lastWord);
            if (lastAssociated.includes(word)) {
                this.comboCount++;
            } else {
                this.comboCount = 1;
            }
        } else {
            this.comboCount = 1;
        }

        this.lastWord = word;
        return this.comboCount;
    }

    // 生成 AI 对话
    generateAIDialogue(word, isMagic = false, combo = 0) {
        let dialogues;

        if (isMagic) {
            dialogues = AI_DIALOGUES.magic;
        } else if (combo >= 3) {
            dialogues = AI_DIALOGUES.combo;
        } else {
            dialogues = AI_DIALOGUES.default;
        }

        const template = dialogues[Math.floor(Math.random() * dialogues.length)];
        return template.replace('{word}', word);
    }

    // 生成故事章节内容
    generateStoryChapter(snakeLength) {
        const theme = themeManager.getCurrentTheme();
        const chapters = STORY_CHAPTERS[theme] || STORY_CHAPTERS.tang;

        // 找到对应的章节
        let currentChapter = chapters[0];
        for (let i = chapters.length - 1; i >= 0; i--) {
            if (snakeLength >= chapters[i].length) {
                currentChapter = chapters[i];
                break;
            }
        }

        // 使用最近的单词生成诗句
        const recentWord = this.lastWord || '春';
        const line = this.generateLine(recentWord);

        return {
            title: currentChapter.title,
            content: currentChapter.content,
            line: line,
            chapterNumber: chapters.indexOf(currentChapter) + 1
        };
    }

    // 保存诗歌到历史记录
    savePoemToHistory(poem) {
        this.poemHistory.push(poem);

        // 限制历史记录数量
        if (this.poemHistory.length > 50) {
            this.poemHistory.shift();
        }

        // 同时保存到 localStorage
        this.saveToLocalStorage();
    }

    // 从 localStorage 加载诗歌历史
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('aiSnakePoemHistory');
            if (saved) {
                this.poemHistory = JSON.parse(saved);
            }
        } catch (e) {
            console.error('Failed to load poem history:', e);
        }
    }

    // 保存到 localStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('aiSnakePoemHistory', JSON.stringify(this.poemHistory));
        } catch (e) {
            console.error('Failed to save poem history:', e);
        }
    }

    // 获取诗歌历史
    getPoemHistory() {
        return this.poemHistory;
    }

    // 清空历史记录
    clearHistory() {
        this.poemHistory = [];
        localStorage.removeItem('aiSnakePoemHistory');
    }

    // 获取最高分诗歌
    getBestPoem() {
        if (this.poemHistory.length === 0) {
            return null;
        }

        return this.poemHistory.reduce((best, poem) =>
            poem.score > best.score ? poem : best
        );
    }

    // 获取最近创作的诗歌
    getRecentPoems(count = 5) {
        return this.poemHistory.slice(-count).reverse();
    }
}

// 导出单例
export default new PoemGenerator();
