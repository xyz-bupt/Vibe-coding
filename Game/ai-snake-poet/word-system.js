// AI 贪吃蛇 - 单词系统
// 管理单词生成、分类、关联等功能

import {
    NATURE_WORDS,
    EMOTION_WORDS,
    MAGIC_WORDS,
    TIME_WORDS,
    COLOR_WORDS,
    ACTION_WORDS,
    OBJECT_WORDS,
    WORD_ASSOCIATIONS,
    EMOJI_MAP,
    THEME_SPECIFIC_WORDS
} from './data/word-library.js';

class WordSystem {
    constructor() {
        this.currentTheme = 'default';
        this.collectedWords = [];
        this.wordHistory = [];
    }

    // 设置当前主题
    setTheme(theme) {
        this.currentTheme = theme;
    }

    // 获取主题特定词库
    getThemeWords() {
        if (THEME_SPECIFIC_WORDS[this.currentTheme]) {
            return THEME_SPECIFIC_WORDS[this.currentTheme].words;
        }
        return [];
    }

    // 生成随机单词
    generateRandomWord() {
        const themeWords = this.getThemeWords();

        // 如果有主题特定词库，60% 概率使用主题词
        if (themeWords.length > 0 && Math.random() < 0.6) {
            return themeWords[Math.floor(Math.random() * themeWords.length)];
        }

        // 否则从所有词库中随机选择
        const allWords = [
            ...NATURE_WORDS,
            ...EMOTION_WORDS,
            ...TIME_WORDS,
            ...COLOR_WORDS,
            ...ACTION_WORDS,
            ...OBJECT_WORDS
        ];

        return allWords[Math.floor(Math.random() * allWords.length)];
    }

    // 检查是否是魔法单词
    isMagicWord(word) {
        return MAGIC_WORDS.hasOwnProperty(word);
    }

    // 获取魔法单词的属性
    getMagicWordProperties(word) {
        if (this.isMagicWord(word)) {
            return MAGIC_WORDS[word];
        }
        return null;
    }

    // 获取单词的 Emoji
    getWordEmoji(word) {
        // 先检查魔法单词
        if (MAGIC_WORDS[word] && MAGIC_WORDS[word].emoji) {
            return MAGIC_WORDS[word].emoji;
        }

        // 然后检查 Emoji 映射表
        if (EMOJI_MAP[word]) {
            return EMOJI_MAP[word];
        }

        // 根据字义生成默认 Emoji
        return this.generateDefaultEmoji(word);
    }

    // 生成默认 Emoji（当映射表中没有时）
    generateDefaultEmoji(word) {
        const category = this.getWordCategory(word);
        const defaultEmojis = {
            nature: '🌿',
            emotion: '💭',
            time: '⏰',
            color: '🎨',
            action: '✨',
            object: '📦',
            magic: '🔮'
        };
        return defaultEmojis[category] || '✨';
    }

    // 获取单词分类
    getWordCategory(word) {
        if (this.isMagicWord(word)) return 'magic';
        if (NATURE_WORDS.includes(word)) return 'nature';
        if (EMOTION_WORDS.includes(word)) return 'emotion';
        if (TIME_WORDS.includes(word)) return 'time';
        if (COLOR_WORDS.includes(word)) return 'color';
        if (ACTION_WORDS.includes(word)) return 'action';
        if (OBJECT_WORDS.includes(word)) return 'object';
        return 'other';
    }

    // 获取关联词
    getAssociatedWords(word) {
        if (WORD_ASSOCIATIONS[word]) {
            return WORD_ASSOCIATIONS[word];
        }

        // 如果没有预定义的关联词，根据类别返回
        const category = this.getWordCategory(word);
        const relatedCategories = {
            nature: EMOTION_WORDS,
            emotion: NATURE_WORDS,
            time: NATURE_WORDS,
            color: NATURE_WORDS,
            action: EMOTION_WORDS,
            object: EMOTION_WORDS
        };

        const candidates = relatedCategories[category] || NATURE_WORDS;
        // 随机返回 3 个关联词
        const shuffled = candidates.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }

    // 添加收集的单词
    collectWord(word) {
        const wordData = {
            word: word,
            emoji: this.getWordEmoji(word),
            category: this.getWordCategory(word),
            isMagic: this.isMagicWord(word),
            timestamp: Date.now()
        };

        this.collectedWords.push(wordData);
        this.wordHistory.push(word);

        return wordData;
    }

    // 获取收集的单词列表
    getCollectedWords() {
        return this.collectedWords;
    }

    // 清空收集的单词
    clearCollectedWords() {
        this.collectedWords = [];
        this.wordHistory = [];
    }

    // 检查特殊组合
    checkSpecialCombo() {
        const recentWords = this.wordHistory.slice(-10); // 检查最近10个单词
        // 这里需要导入特殊组合数据并检查
        // 暂时返回 null
        return null;
    }

    // 获取单词的拼音（用于排序等）
    getWordPinyin(word) {
        // 简单实现，实际项目可以使用完整的拼音库
        const pinyinMap = {
            '春': 'chun', '夏': 'xia', '秋': 'qiu', '冬': 'dong',
            '花': 'hua', '月': 'yue', '风': 'feng', '雪': 'xue',
            // 可以添加更多
        };
        return pinyinMap[word] || word;
    }

    // 获取单词的难度等级（用于反向模式）
    getWordDifficulty(word) {
        const commonWords = ['人', '大', '小', '多', '少', '好', '坏'];
        const rareWords = ['黛', '醑', '霭', '霏'];

        if (commonWords.includes(word)) return 1;
        if (rareWords.includes(word)) return 5;
        return 3;
    }

    // 生成反向模式的单词序列
    generateReverseSequence(sentence) {
        // 将句子拆分成单词
        const words = sentence.split('').filter(char => char.trim());
        return words.map(word => ({
            word: word,
            emoji: this.getWordEmoji(word),
            collected: false
        }));
    }

    // 获取单词统计信息
    getWordStats() {
        const stats = {
            total: this.collectedWords.length,
            byCategory: {},
            magicCount: 0,
            uniqueCount: new Set(this.collectedWords.map(w => w.word)).size
        };

        this.collectedWords.forEach(wordData => {
            const cat = wordData.category;
            stats.byCategory[cat] = (stats.byCategory[cat] || 0) + 1;
            if (wordData.isMagic) {
                stats.magicCount++;
            }
        });

        return stats;
    }

    // 获取推荐单词（用于提示）
    getRecommendedWords(currentWord) {
        const associated = this.getAssociatedWords(currentWord);
        const themeWords = this.getThemeWords();

        // 合并并去重
        const recommendations = [...new Set([...associated, ...themeWords.slice(0, 5)])];
        return recommendations.slice(0, 5);
    }
}

// 导出单例
export default new WordSystem();
