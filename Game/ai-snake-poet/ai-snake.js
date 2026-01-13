// AI 贪吃蛇 - 主游戏逻辑
// 整合所有系统，管理游戏流程

import wordSystem from './word-system.js';
import poemGenerator from './poem-generator.js';
import artGenerator from './art-generator.js';
import themeManager from './theme-manager.js';
import achievementManager from './achievement.js';
import galleryManager from './gallery.js';
import { REVERSE_SENTENCES } from './data/poem-templates.js';

class AISnakeGame {
    constructor() {
        // Canvas 相关
        this.canvas = null;
        this.ctx = null;

        // 游戏配置
        this.gridSize = 20;
        this.tileCount = 20;

        // 游戏状态
        this.snake = [];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('aiSnakeHighScore')) || 0;
        this.gameLoop = null;
        this.gameSpeed = 100;
        this.isGameRunning = false;
        this.isPaused = false;
        this.gameMode = 'normal'; // normal, reverse

        // AI 系统
        this.currentWord = null;
        this.collectedWords = [];
        this.currentPoem = [];
        this.collage = [];
        this.comboCount = 0;
        this.storyChapter = 0;

        // 反向模式
        this.targetWords = [];
        this.currentTargetIndex = 0;

        // 回调函数
        this.onWordCollected = null;
        this.onPoemGenerated = null;
        this.onThemeChanged = null;
        this.onAchievement = null;
        this.onCombo = null;
        this.onDialogue = null;
    }

    // 初始化游戏
    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileCount = canvas.width / this.gridSize;

        // 加载保存的数据
        poemGenerator.loadFromLocalStorage();
        themeManager.loadThemePreference();

        // 初始绘制
        this.resetGame();
        this.draw();
    }

    // 重置游戏
    resetGame() {
        // 初始化蛇
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];

        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.gameSpeed = 100;
        this.collectedWords = [];
        this.currentPoem = [];
        this.collage = [];
        this.comboCount = 0;
        this.storyChapter = 0;

        wordSystem.clearCollectedWords();
        poemGenerator.resetPoem();
        artGenerator.resetCollage();

        this.spawnWord();
    }

    // 生成新单词（食物）
    spawnWord() {
        let word;
        let position;

        // 反向模式：检查是否需要生成目标单词
        if (this.gameMode === 'reverse' && this.currentTargetIndex < this.targetWords.length) {
            word = this.targetWords[this.currentTargetIndex].word;
        } else {
            // 普通模式：随机生成单词
            word = wordSystem.generateRandomWord();
        }

        // 生成不与蛇重叠的位置
        do {
            position = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.isPositionOccupied(position));

        this.currentWord = {
            word: word,
            position: position,
            emoji: wordSystem.getWordEmoji(word),
            isMagic: wordSystem.isMagicWord(word)
        };
    }

    // 检查位置是否被占据
    isPositionOccupied(pos) {
        return this.snake.some(segment =>
            segment.x === pos.x && segment.y === pos.y
        );
    }

    // 开始游戏
    startGame(mode = 'normal', theme = null) {
        if (this.isGameRunning) {
            this.stopGame();
        }

        this.gameMode = mode;

        // 设置主题
        if (theme) {
            themeManager.setTheme(theme);
        }

        // 反向模式初始化
        if (mode === 'reverse') {
            this.initReverseMode();
        }

        this.resetGame();
        this.isGameRunning = true;
        this.isPaused = false;

        this.gameLoop = setInterval(() => this.gameStep(), this.gameSpeed);

        // 触发回调
        if (this.onThemeChanged) {
            this.onThemeChanged(themeManager.getCurrentTheme());
        }
    }

    // 初始化反向模式
    initReverseMode() {
        // 随机选择一个句子
        const sentence = REVERSE_SENTENCES[
            Math.floor(Math.random() * REVERSE_SENTENCES.length)
        ];

        // 拆分成单词序列
        this.targetWords = sentence.split('').map((word, index) => ({
            word: word,
            index: index,
            collected: false,
            emoji: wordSystem.getWordEmoji(word)
        }));

        this.currentTargetIndex = 0;
    }

    // 停止游戏
    stopGame() {
        this.isGameRunning = false;
        this.isPaused = false;

        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }

        // 保存创作
        this.saveCreation();
    }

    // 暂停/继续游戏
    togglePause() {
        if (!this.isGameRunning) return;

        this.isPaused = !this.isPaused;
        return this.isPaused;
    }

    // 游戏步骤
    gameStep() {
        if (this.isPaused) return;

        this.update();
        this.draw();
    }

    // 更新游戏状态
    update() {
        // 更新方向
        this.direction = { ...this.nextDirection };

        // 计算新的蛇头位置
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // 检查碰撞
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        // 添加新蛇头
        this.snake.unshift(head);

        // 检查是否吃到单词
        if (head.x === this.currentWord.position.x &&
            head.y === this.currentWord.position.y) {
            this.collectWord();
        } else {
            // 移除蛇尾
            this.snake.pop();
        }
    }

    // 检查碰撞
    checkCollision(head) {
        // 撞墙
        if (head.x < 0 || head.x >= this.tileCount ||
            head.y < 0 || head.y >= this.tileCount) {
            return true;
        }

        // 撞到自己
        return this.snake.some(segment =>
            segment.x === head.x && segment.y === head.y
        );
    }

    // 收集单词
    collectWord() {
        const word = this.currentWord.word;
        const isMagic = this.currentWord.isMagic;

        // 检查反向模式
        if (this.gameMode === 'reverse') {
            if (word !== this.targetWords[this.currentTargetIndex].word) {
                // 吃错了
                this.handleWrongWord();
                return;
            }
            this.targetWords[this.currentTargetIndex].collected = true;
            this.currentTargetIndex++;

            // 检查是否完成
            if (this.currentTargetIndex >= this.targetWords.length) {
                this.reverseModeComplete();
                return;
            }
        }

        // 添加到收集列表
        const wordData = wordSystem.collectWord(word);
        this.collectedWords.push(wordData);

        // 生成诗句
        const poemLine = poemGenerator.addLine(word);
        this.currentPoem.push(poemLine);

        // 生成艺术
        const art = artGenerator.generateWordArt(word);
        artGenerator.addToCollage(art);
        this.collage.push(art);

        // 更新连击
        this.comboCount = poemGenerator.updateCombo(word);

        // 计算得分
        this.calculateScore(word, isMagic);

        // 处理魔法单词
        if (isMagic) {
            this.handleMagicWord(word);
        }

        // 生成 AI 对话
        const dialogue = poemGenerator.generateAIDialogue(word, isMagic, this.comboCount);
        if (this.onDialogue) {
            this.onDialogue(dialogue, isMagic);
        }

        // 触发连击回调
        if (this.comboCount >= 3 && this.onCombo) {
            this.onCombo(this.comboCount);
        }

        // 检查成就
        this.checkAchievements();

        // 检查特殊组合
        this.checkSpecialCombos();

        // 更新故事章节
        this.updateStoryChapter();

        // 生成新单词
        this.spawnWord();

        // 触发单词收集回调
        if (this.onWordCollected) {
            this.onWordCollected(wordData, poemLine, art);
        }

        // 更新统计
        achievementManager.updateStats('word_collected', { isMagic });
    }

    // 计算得分
    calculateScore(word, isMagic) {
        let points = 10;

        // 魔法单词加分
        if (isMagic) {
            points += 20;
        }

        // 连击加分
        if (this.comboCount > 1) {
            points += this.comboCount * 5;
        }

        this.score += points;

        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('aiSnakeHighScore', this.highScore);
        }
    }

    // 处理魔法单词
    handleMagicWord(word) {
        const effect = themeManager.applyMagicEffect(word);

        if (effect && this.onThemeChanged) {
            this.onThemeChanged(themeManager.getCurrentTheme(), effect);
        }
    }

    // 处理反向模式吃错单词
    handleWrongWord() {
        // 扣分
        this.score = Math.max(0, this.score - 20);

        // 降低速度
        this.gameSpeed = Math.min(200, this.gameSpeed + 20);
        clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.gameStep(), this.gameSpeed);

        // 显示提示
        if (this.onDialogue) {
            this.onDialogue('哎呀！吃错了，请按顺序吃单词哦～', false);
        }
    }

    // 反向模式完成
    reverseModeComplete() {
        // 大量加分
        this.score += 100;

        if (this.onDialogue) {
            this.onDialogue('🎉 恭喜！你完成了诗句挑战！', false);
        }

        // 继续游戏
        this.initReverseMode();
        this.spawnWord();
    }

    // 检查成就
    checkAchievements() {
        const gameStats = {
            score: this.score,
            wordsCollected: this.collectedWords.length
        };

        const newAchievements = achievementManager.checkAchievements(gameStats);

        if (newAchievements.length > 0 && this.onAchievement) {
            newAchievements.forEach(achievement => {
                this.onAchievement(achievement);
            });
        }
    }

    // 检查特殊组合
    checkSpecialCombos() {
        const combo = achievementManager.checkSpecialCombo(this.collectedWords);

        if (combo && this.onAchievement) {
            // 触发特殊组合彩蛋
            this.onAchievement({
                id: 'special_' + combo.name,
                name: combo.name,
                description: '触发了特殊组合！',
                emoji: combo.reward.emoji,
                tier: 'gold'
            });

            // 加分
            this.score += combo.reward.bonus;

            if (this.onDialogue) {
                this.onDialogue(`🌟 ${combo.name}！获得 ${combo.reward.bonus} 分！`, true);
            }
        }
    }

    // 更新故事章节
    updateStoryChapter() {
        const snakeLength = this.snake.length;
        const newChapter = Math.floor(snakeLength / 5);

        if (newChapter > this.storyChapter) {
            this.storyChapter = newChapter;
            const chapter = poemGenerator.generateStoryChapter(snakeLength);

            if (this.onDialogue) {
                this.onDialogue(`📖 ${chapter.title}：${chapter.content}`, false);
            }
        }
    }

    // 绘制游戏
    draw() {
        const config = themeManager.getThemeConfig();

        // 清空画布
        this.ctx.fillStyle = config.colors.canvas;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格（如果主题启用）
        if (config.special?.gridLines) {
            this.drawGrid();
        }

        // 绘制蛇
        this.drawSnake();

        // 绘制单词（食物）
        this.drawWord();
    }

    // 绘制蛇
    drawSnake() {
        const config = themeManager.getThemeConfig();

        this.snake.forEach((segment, index) => {
            // 根据主题选择颜色
            this.ctx.fillStyle = index === 0
                ? config.colors.snakeHead
                : config.colors.snakeBody;

            // 绘制蛇身
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );

            // 蛇头绘制眼睛
            if (index === 0) {
                this.drawSnakeEyes(segment);
            }
        });
    }

    // 绘制蛇眼睛
    drawSnakeEyes(head) {
        this.ctx.fillStyle = '#fff';
        const eyeSize = 3;
        const offset = 5;

        // 根据方向调整眼睛位置
        let eye1X, eye1Y, eye2X, eye2Y;

        if (this.direction.x === 1) { // 向右
            eye1X = head.x * this.gridSize + this.gridSize - offset;
            eye1Y = head.y * this.gridSize + offset;
            eye2X = eye1X;
            eye2Y = head.y * this.gridSize + this.gridSize - offset;
        } else if (this.direction.x === -1) { // 向左
            eye1X = head.x * this.gridSize + offset;
            eye1Y = head.y * this.gridSize + offset;
            eye2X = eye1X;
            eye2Y = head.y * this.gridSize + this.gridSize - offset;
        } else if (this.direction.y === -1) { // 向上
            eye1X = head.x * this.gridSize + offset;
            eye1Y = head.y * this.gridSize + offset;
            eye2X = head.x * this.gridSize + this.gridSize - offset;
            eye2Y = eye1Y;
        } else { // 向下
            eye1X = head.x * this.gridSize + offset;
            eye1Y = head.y * this.gridSize + this.gridSize - offset;
            eye2X = head.x * this.gridSize + this.gridSize - offset;
            eye2Y = eye1Y;
        }

        this.ctx.fillRect(eye1X - eyeSize/2, eye1Y - eyeSize/2, eyeSize, eyeSize);
        this.ctx.fillRect(eye2X - eyeSize/2, eye2Y - eyeSize/2, eyeSize, eyeSize);
    }

    // 绘制单词（食物）
    drawWord() {
        const config = themeManager.getThemeConfig();

        // 绘制背景方块
        this.ctx.fillStyle = config.colors.food;
        this.ctx.fillRect(
            this.currentWord.position.x * this.gridSize + 1,
            this.currentWord.position.y * this.gridSize + 1,
            this.gridSize - 2,
            this.gridSize - 2
        );

        // 绘制文字
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            this.currentWord.word,
            this.currentWord.position.x * this.gridSize + this.gridSize / 2,
            this.currentWord.position.y * this.gridSize + this.gridSize / 2
        );
    }

    // 绘制网格
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    // 游戏结束
    gameOver() {
        this.stopGame();

        // 更新统计
        achievementManager.updateStats('game_completed', { score: this.score });

        // 完成诗歌
        const completedPoem = poemGenerator.finishPoem();
        poemGenerator.savePoemToHistory(completedPoem);

        // 绘制游戏结束画面
        this.drawGameOver();

        if (this.onPoemGenerated) {
            this.onPoemGenerated(completedPoem);
        }
    }

    // 绘制游戏结束画面
    drawGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束!', this.canvas.width / 2, this.canvas.height / 2 - 40);

        this.ctx.font = '20px Arial';
        this.ctx.fillText(`得分: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText(`收集: ${this.collectedWords.length} 个单词`, this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    // 保存创作
    saveCreation() {
        if (this.collectedWords.length === 0) return;

        const poem = {
            lines: this.currentPoem,
            formatted: this.currentPoem.map(p => p.line).join('\n'),
            emojiPoem: this.currentPoem.map(p => `${p.emoji} ${p.line}`).join('\n'),
            score: this.score
        };

        const gameStats = {
            score: this.score,
            wordsCollected: this.collectedWords.length,
            highScore: this.highScore
        };

        galleryManager.saveCreation(poem, this.collage, gameStats);
    }

    // 改变方向
    changeDirection(newDirection) {
        // 防止反向
        if (this.direction.x !== 0 && newDirection.x !== 0) return;
        if (this.direction.y !== 0 && newDirection.y !== 0) return;

        this.nextDirection = newDirection;
    }

    // 获取游戏状态
    getGameState() {
        return {
            isRunning: this.isGameRunning,
            isPaused: this.isPaused,
            score: this.score,
            highScore: this.highScore,
            snakeLength: this.snake.length,
            wordsCollected: this.collectedWords.length,
            combo: this.comboCount,
            chapter: this.storyChapter,
            currentWord: this.currentWord,
            gameMode: this.gameMode
        };
    }

    // 获取收集的单词
    getCollectedWords() {
        return this.collectedWords;
    }

    // 获取当前诗歌
    getCurrentPoem() {
        return this.currentPoem;
    }

    // 获取拼图
    getCollage() {
        return this.collage;
    }

    // 设置回调函数
    setCallbacks(callbacks) {
        if (callbacks.onWordCollected) this.onWordCollected = callbacks.onWordCollected;
        if (callbacks.onPoemGenerated) this.onPoemGenerated = callbacks.onPoemGenerated;
        if (callbacks.onThemeChanged) this.onThemeChanged = callbacks.onThemeChanged;
        if (callbacks.onAchievement) this.onAchievement = callbacks.onAchievement;
        if (callbacks.onCombo) this.onCombo = callbacks.onCombo;
        if (callbacks.onDialogue) this.onDialogue = callbacks.onDialogue;
    }
}

// 导出
export default AISnakeGame;
