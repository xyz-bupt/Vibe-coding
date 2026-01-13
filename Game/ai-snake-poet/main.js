// AI 贪吃蛇诗人 - 主入口文件
// 连接所有模块，处理用户交互

import AISnakeGame from './ai-snake.js';
import themeManager from './theme-manager.js';
import achievementManager from './achievement.js';
import galleryManager from './gallery.js';
import artGenerator from './art-generator.js';

// 游戏实例
let game;
let selectedMode = 'normal';
let selectedTheme = 'default';

// DOM 元素
const elements = {
    // 屏幕
    menuScreen: document.getElementById('menuScreen'),
    gameScreen: document.getElementById('gameScreen'),

    // 按钮
    startGameBtn: document.getElementById('startGameBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    saveBtn: document.getElementById('saveBtn'),
    backBtn: document.getElementById('backBtn'),

    // 游戏信息
    score: document.getElementById('score'),
    highScore: document.getElementById('highScore'),
    wordCount: document.getElementById('wordCount'),
    combo: document.getElementById('combo'),
    chapter: document.getElementById('chapter'),

    // 游戏区域
    canvas: document.getElementById('gameCanvas'),
    collectedWords: document.getElementById('collectedWords'),
    aiDialogue: document.getElementById('aiDialogue'),
    poemLines: document.getElementById('poemLines'),
    currentThemeBadge: document.getElementById('currentThemeBadge'),

    // 弹窗
    achievementPopup: document.getElementById('achievementPopup'),
    comboPopup: document.getElementById('comboPopup'),
    galleryModal: document.getElementById('galleryModal'),
    creationModal: document.getElementById('creationModal'),
    gameOverModal: document.getElementById('gameOverModal'),

    // 游戏结束
    finalScore: document.getElementById('finalScore'),
    finalWords: document.getElementById('finalWords'),
    finalPoem: document.getElementById('finalPoem'),
    saveFinalBtn: document.getElementById('saveFinalBtn'),
    shareBtn: document.getElementById('shareBtn'),
    playAgainBtn: document.getElementById('playAgainBtn')
};

// 初始化游戏
function init() {
    // 创建游戏实例
    game = new AISnakeGame();
    game.init(elements.canvas);

    // 设置游戏回调
    setupGameCallbacks();

    // 绑定事件
    bindEvents();

    // 加载保存的最高分
    elements.highScore.textContent = game.highScore;
}

// 设置游戏回调
function setupGameCallbacks() {
    game.setCallbacks({
        onWordCollected: handleWordCollected,
        onPoemGenerated: handlePoemGenerated,
        onThemeChanged: handleThemeChanged,
        onAchievement: handleAchievement,
        onCombo: handleCombo,
        onDialogue: handleDialogue
    });
}

// 处理单词收集
function handleWordCollected(wordData, poemLine, art) {
    // 更新收集区
    updateCollectedWords(wordData);

    // 更新诗歌区
    updatePoemLines(poemLine);

    // 更新统计
    updateStats();
}

// 处理诗歌生成
function handlePoemGenerated(poem) {
    // 游戏结束时显示完整诗歌
    showGameOverModal(poem);
}

// 处理主题变化
function handleThemeChanged(theme, effect) {
    elements.currentThemeBadge.textContent = `主题: ${theme}`;
}

// 处理成就解锁
function handleAchievement(achievement) {
    showAchievementPopup(achievement);
}

// 处理连击
function handleCombo(count) {
    showComboPopup(count);
}

// 处理 AI 对话
function handleDialogue(dialogue, isMagic) {
    elements.aiDialogue.textContent = dialogue;

    if (isMagic) {
        elements.aiDialogue.parentElement.classList.add('magic-effect');
        setTimeout(() => {
            elements.aiDialogue.parentElement.classList.remove('magic-effect');
        }, 2000);
    }
}

// 更新收集区
function updateCollectedWords(wordData) {
    const badge = document.createElement('span');
    badge.className = 'word-badge' + (wordData.isMagic ? ' magic' : '');
    badge.innerHTML = `
        <span class="word-emoji">${wordData.emoji}</span>
        <span class="word-text">${wordData.word}</span>
    `;
    elements.collectedWords.appendChild(badge);

    // 滚动到最新
    elements.collectedWords.scrollTop = elements.collectedWords.scrollHeight;
}

// 更新诗歌区
function updatePoemLines(poemLine) {
    const line = document.createElement('div');
    line.className = 'poem-line';
    line.innerHTML = `
        <span class="poem-emoji">${poemLine.emoji}</span>
        <span class="poem-text">${poemLine.line}</span>
    `;
    elements.poemLines.appendChild(line);

    // 滚动到最新
    elements.poemLines.scrollTop = elements.poemLines.scrollHeight;
}

// 更新统计
function updateStats() {
    const state = game.getGameState();
    elements.score.textContent = state.score;
    elements.wordCount.textContent = state.wordsCollected;
    elements.combo.textContent = state.combo;
    elements.chapter.textContent = state.chapter;
}

// 显示成就弹窗
function showAchievementPopup(achievement) {
    document.getElementById('achievementEmoji').textContent = achievement.emoji;
    document.getElementById('achievementTitle').textContent = achievement.name;
    document.getElementById('achievementDesc').textContent = achievement.description;

    elements.achievementPopup.classList.remove('hidden');

    setTimeout(() => {
        elements.achievementPopup.classList.add('hidden');
    }, 3000);
}

// 显示连击提示
function showComboPopup(count) {
    document.getElementById('comboNumber').textContent = count;
    elements.comboPopup.classList.remove('hidden');

    setTimeout(() => {
        elements.comboPopup.classList.add('hidden');
    }, 1000);
}

// 显示游戏结束弹窗
function showGameOverModal(poem) {
    elements.finalScore.textContent = game.score;
    elements.finalWords.textContent = game.collectedWords.length;

    // 显示诗歌
    elements.finalPoem.innerHTML = `
        <h3>你的诗歌创作</h3>
        ${poem.lines.map(line =>
            `<p>${line.emoji} ${line.line}</p>`
        ).join('')}
    `;

    elements.gameOverModal.classList.remove('hidden');
}

// 绑定事件
function bindEvents() {
    // 模式选择
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedMode = btn.dataset.mode;
        });
    });

    // 主题选择
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedTheme = btn.dataset.theme;
        });
    });

    // 开始游戏
    elements.startGameBtn.addEventListener('click', startGame);

    // 游戏控制
    elements.pauseBtn.addEventListener('click', togglePause);
    elements.saveBtn.addEventListener('click', saveCreation);
    elements.backBtn.addEventListener('click', backToMenu);

    // 键盘控制
    document.addEventListener('keydown', handleKeyDown);

    // 游戏结束操作
    elements.saveFinalBtn.addEventListener('click', () => {
        saveCreation();
        elements.gameOverModal.classList.add('hidden');
        backToMenu();
    });

    elements.shareBtn.addEventListener('click', shareCreation);

    elements.playAgainBtn.addEventListener('click', () => {
        elements.gameOverModal.classList.add('hidden');
        startGame();
    });
}

// 开始游戏
function startGame() {
    elements.menuScreen.classList.add('hidden');
    elements.gameScreen.classList.remove('hidden');

    // 清空显示区
    elements.collectedWords.innerHTML = '';
    elements.poemLines.innerHTML = '';
    elements.aiDialogue.textContent = '开始创作吧！';

    // 开始游戏
    game.startGame(selectedMode, selectedTheme);

    // 更新主题显示
    elements.currentThemeBadge.textContent = `主题: ${selectedTheme}`;
}

// 切换暂停
function togglePause() {
    const isPaused = game.togglePause();
    elements.pauseBtn.textContent = isPaused ? '继续' : '暂停';
}

// 保存创作
function saveCreation() {
    const poem = {
        lines: game.getCurrentPoem(),
        formatted: game.getCurrentPoem().map(p => p.line).join('\n'),
        emojiPoem: game.getCurrentPoem().map(p => `${p.emoji} ${p.line}`).join('\n'),
        score: game.score
    };

    const collage = game.getCollage();
    const gameStats = {
        score: game.score,
        wordsCollected: game.getCollectedWords().length,
        highScore: game.highScore
    };

    galleryManager.saveCreation(poem, collage, gameStats);

    alert('创作已保存到画廊！');
}

// 分享创作
function shareCreation() {
    const poem = {
        lines: game.getCurrentPoem(),
        emojiPoem: game.getCurrentPoem().map(p => `${p.emoji} ${p.line}`).join('\n')
    };

    const collage = game.getCollage();
    const gameStats = {
        score: game.score,
        wordsCollected: game.getCollectedWords().length
    };

    const creation = galleryManager.saveCreation(poem, collage, gameStats);

    // 复制分享文本
    galleryManager.copyShareText(creation).then(() => {
        alert('分享文本已复制到剪贴板！');
    });
}

// 返回菜单
function backToMenu() {
    game.stopGame();
    elements.gameScreen.classList.add('hidden');
    elements.menuScreen.classList.remove('hidden');
}

// 键盘控制
function handleKeyDown(e) {
    if (!game.isGameRunning) return;

    switch (e.key) {
        case 'ArrowUp':
            game.changeDirection({ x: 0, y: -1 });
            e.preventDefault();
            break;
        case 'ArrowDown':
            game.changeDirection({ x: 0, y: 1 });
            e.preventDefault();
            break;
        case 'ArrowLeft':
            game.changeDirection({ x: -1, y: 0 });
            e.preventDefault();
            break;
        case 'ArrowRight':
            game.changeDirection({ x: 1, y: 0 });
            e.preventDefault();
            break;
        case ' ':
            togglePause();
            e.preventDefault();
            break;
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
