// AI 贪吃蛇 - 成就系统
// 管理游戏成就和彩蛋

import { SPECIAL_COMBOS } from './data/word-library.js';

class AchievementManager {
    constructor() {
        this.achievements = [];
        this.unlockedAchievements = new Set();
        this.stats = {
            totalWordsCollected: 0,
            totalPoemsCreated: 0,
            totalGamesPlayed: 0,
            totalScore: 0,
            magicWordsCollected: 0,
            combosAchieved: 0,
            maxCombo: 0,
            themesUnlocked: new Set(),
            specialCombos: new Set()
        };

        // 定义所有成就
        this.defineAchievements();
        // 加载已解锁的成就
        this.loadAchievements();
    }

    // 定义所有成就
    defineAchievements() {
        this.achievementDefinitions = [
            // 基础成就
            {
                id: 'first_word',
                name: '诗人初现',
                description: '收集第一个单词',
                emoji: '✨',
                tier: 'bronze',
                condition: (stats) => stats.totalWordsCollected >= 1
            },
            {
                id: 'word_collector_5',
                name: '五言绝句',
                description: '收集 5 个单词',
                emoji: '📝',
                tier: 'bronze',
                condition: (stats) => stats.totalWordsCollected >= 5
            },
            {
                id: 'word_collector_10',
                name: '七言律诗',
                description: '收集 10 个单词',
                emoji: '📜',
                tier: 'silver',
                condition: (stats) => stats.totalWordsCollected >= 10
            },
            {
                id: 'word_collector_20',
                name: '长篇史诗',
                description: '收集 20 个单词',
                emoji: '📚',
                tier: 'gold',
                condition: (stats) => stats.totalWordsCollected >= 20
            },

            // 诗歌成就
            {
                id: 'first_poem',
                name: '诗歌新秀',
                description: '完成第一首诗歌',
                emoji: '🎭',
                tier: 'bronze',
                condition: (stats) => stats.totalPoemsCreated >= 1
            },
            {
                id: 'poet_10',
                name: '诗词达人',
                description: '创作 10 首诗歌',
                emoji: '🎨',
                tier: 'silver',
                condition: (stats) => stats.totalPoemsCreated >= 10
            },
            {
                id: 'master_poet',
                name: '诗圣在世',
                description: '创作 50 首诗歌',
                emoji: '👑',
                tier: 'gold',
                condition: (stats) => stats.totalPoemsCreated >= 50
            },

            // 魔法单词成就
            {
                id: 'first_magic',
                name: '魔法师',
                description: '收集一个魔法单词',
                emoji: '🔮',
                tier: 'bronze',
                condition: (stats) => stats.magicWordsCollected >= 1
            },
            {
                id: 'magic_master',
                name: '大魔法师',
                description: '收集 10 个魔法单词',
                emoji: '🧙',
                tier: 'silver',
                condition: (stats) => stats.magicWordsCollected >= 10
            },

            // 连击成就
            {
                id: 'combo_3',
                name: '三连贯',
                description: '达成 3 连击',
                emoji: '🔥',
                tier: 'bronze',
                condition: (stats) => stats.maxCombo >= 3
            },
            {
                id: 'combo_5',
                name: '五连星',
                description: '达成 5 连击',
                emoji: '⭐',
                tier: 'silver',
                condition: (stats) => stats.maxCombo >= 5
            },
            {
                id: 'combo_10',
                name: '十连霸',
                description: '达成 10 连击',
                emoji: '💫',
                tier: 'gold',
                condition: (stats) => stats.maxCombo >= 10
            },

            // 游戏次数成就
            {
                id: 'first_game',
                name: '初试身手',
                description: '完成第一局游戏',
                emoji: '🎮',
                tier: 'bronze',
                condition: (stats) => stats.totalGamesPlayed >= 1
            },
            {
                id: 'regular_player',
                name: '常客',
                description: '游玩 10 局游戏',
                emoji: '🎯',
                tier: 'silver',
                condition: (stats) => stats.totalGamesPlayed >= 10
            },
            {
                id: 'dedicated_player',
                name: '忠实粉丝',
                description: '游玩 50 局游戏',
                emoji: '🏆',
                tier: 'gold',
                condition: (stats) => stats.totalGamesPlayed >= 50
            },

            // 分数成就
            {
                id: 'score_100',
                name: '百分俱乐部',
                description: '单局得分超过 100',
                emoji: '💯',
                tier: 'bronze',
                condition: (stats, gameStats) => gameStats?.score >= 100
            },
            {
                id: 'score_500',
                name: '五百高手',
                description: '单局得分超过 500',
                emoji: '🎖️',
                tier: 'silver',
                condition: (stats, gameStats) => gameStats?.score >= 500
            },
            {
                id: 'score_1000',
                name: '千分传奇',
                description: '单局得分超过 1000',
                emoji: '🏅',
                tier: 'gold',
                condition: (stats, gameStats) => gameStats?.score >= 1000
            }
        ];
    }

    // 检查成就
    checkAchievements(gameStats = {}) {
        const newUnlocks = [];

        this.achievementDefinitions.forEach(achievement => {
            // 跳过已解锁的成就
            if (this.unlockedAchievements.has(achievement.id)) {
                return;
            }

            // 检查解锁条件
            if (achievement.condition(this.stats, gameStats)) {
                this.unlockAchievement(achievement);
                newUnlocks.push(achievement);
            }
        });

        return newUnlocks;
    }

    // 解锁成就
    unlockAchievement(achievement) {
        this.unlockedAchievements.add(achievement.id);
        this.achievements.push({
            ...achievement,
            unlockedAt: Date.now()
        });

        this.saveAchievements();

        return achievement;
    }

    // 检查特殊组合彩蛋
    checkSpecialCombo(collectedWords) {
        const recentWords = collectedWords.slice(-10);

        for (const combo of SPECIAL_COMBOS) {
            // 检查是否收集了组合中的所有单词
            const allWordsFound = combo.words.every(word =>
                recentWords.some(w => w.word === word)
            );

            if (allWordsFound && !this.stats.specialCombos.has(combo.name)) {
                this.stats.specialCombos.add(combo.name);
                this.saveAchievements();
                return combo;
            }
        }

        return null;
    }

    // 更新统计
    updateStats(event, data = {}) {
        switch (event) {
            case 'word_collected':
                this.stats.totalWordsCollected++;
                if (data.isMagic) {
                    this.stats.magicWordsCollected++;
                }
                break;
            case 'poem_created':
                this.stats.totalPoemsCreated++;
                break;
            case 'game_completed':
                this.stats.totalGamesPlayed++;
                this.stats.totalScore += data.score || 0;
                break;
            case 'combo':
                this.stats.combosAchieved++;
                if (data.comboCount > this.stats.maxCombo) {
                    this.stats.maxCombo = data.comboCount;
                }
                break;
            case 'theme_unlocked':
                this.stats.themesUnlocked.add(data.theme);
                break;
        }

        this.saveAchievements();
    }

    // 获取已解锁的成就
    getUnlockedAchievements() {
        return this.achievements;
    }

    // 获取所有成就定义
    getAllAchievements() {
        return this.achievementDefinitions;
    }

    // 获取未解锁的成就
    getLockedAchievements() {
        return this.achievementDefinitions.filter(a =>
            !this.unlockedAchievements.has(a.id)
        );
    }

    // 获取进度
    getProgress(achievementId) {
        const achievement = this.achievementDefinitions.find(a => a.id === achievementId);
        if (!achievement) return null;

        // 这里可以根据成就类型返回具体进度
        // 简化实现，返回是否解锁
        return {
            unlocked: this.unlockedAchievements.has(achievementId),
            current: 0,
            target: 1
        };
    }

    // 保存成就到 localStorage
    saveAchievements() {
        try {
            const data = {
                unlocked: Array.from(this.unlockedAchievements),
                stats: {
                    ...this.stats,
                    themesUnlocked: Array.from(this.stats.themesUnlocked),
                    specialCombos: Array.from(this.stats.specialCombos)
                },
                achievements: this.achievements
            };
            localStorage.setItem('aiSnakeAchievements', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save achievements:', e);
        }
    }

    // 从 localStorage 加载成就
    loadAchievements() {
        try {
            const saved = localStorage.getItem('aiSnakeAchievements');
            if (saved) {
                const data = JSON.parse(saved);
                this.unlockedAchievements = new Set(data.unlocked || []);
                this.stats = {
                    ...this.stats,
                    ...data.stats,
                    themesUnlocked: new Set(data.stats?.themesUnlocked || []),
                    specialCombos: new Set(data.stats?.specialCombos || [])
                };
                this.achievements = data.achievements || [];
            }
        } catch (e) {
            console.error('Failed to load achievements:', e);
        }
    }

    // 重置所有成就
    resetAchievements() {
        this.unlockedAchievements.clear();
        this.achievements = [];
        this.stats = {
            totalWordsCollected: 0,
            totalPoemsCreated: 0,
            totalGamesPlayed: 0,
            totalScore: 0,
            magicWordsCollected: 0,
            combosAchieved: 0,
            maxCombo: 0,
            themesUnlocked: new Set(),
            specialCombos: new Set()
        };
        localStorage.removeItem('aiSnakeAchievements');
    }

    // 获取成就统计
    getStats() {
        return {
            ...this.stats,
            themesUnlocked: Array.from(this.stats.themesUnlocked),
            specialCombos: Array.from(this.stats.specialCombos),
            totalUnlocked: this.unlockedAchievements.size,
            totalAchievements: this.achievementDefinitions.length
        };
    }

    // 获取成就进度百分比
    getCompletionPercentage() {
        const total = this.achievementDefinitions.length;
        const unlocked = this.unlockedAchievements.size;
        return Math.round((unlocked / total) * 100);
    }

    // 检查是否有新解锁的成就
    hasNewAchievements() {
        return this.achievements.some(a =>
            Date.now() - a.unlockedAt < 5000 // 5秒内解锁的算"新"
        );
    }
}

// 导出单例
export default new AchievementManager();
