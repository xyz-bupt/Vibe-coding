// AI 贪吃蛇 - 主题管理器
// 管理游戏主题、情绪和视觉效果

import { THEMES, MOODS, MAGIC_EFFECTS } from './data/themes.js';

class ThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.currentMood = 'normal';
        this.activeEffects = [];
        this.transitionEffect = 'fade';
        this.customColors = null;
    }

    // 设置主题
    setTheme(themeId) {
        if (THEMES[themeId]) {
            this.currentTheme = themeId;
            this.applyTheme();
            return true;
        }
        return false;
    }

    // 获取当前主题
    getCurrentTheme() {
        return this.currentTheme;
    }

    // 获取当前主题配置
    getThemeConfig() {
        return THEMES[this.currentTheme] || THEMES.default;
    }

    // 设置情绪
    setMood(moodId) {
        if (MOODS[moodId]) {
            this.currentMood = moodId;
            this.applyMood();
            return true;
        }
        return false;
    }

    // 获取当前情绪
    getCurrentMood() {
        return this.currentMood;
    }

    // 获取当前情绪配置
    getMoodConfig() {
        return MOODS[this.currentMood] || MOODS.normal;
    }

    // 应用主题到 DOM
    applyTheme() {
        const config = this.getThemeConfig();
        const root = document.documentElement;

        // 设置 CSS 变量
        root.style.setProperty('--bg-gradient', config.colors.background);
        root.style.setProperty('--container-bg', config.colors.container);
        root.style.setProperty('--canvas-bg', config.colors.canvas);
        root.style.setProperty('--snake-head', config.colors.snakeHead);
        root.style.setProperty('--snake-body', config.colors.snakeBody);
        root.style.setProperty('--food-color', config.colors.food);
        root.style.setProperty('--text-color', config.colors.text);
        root.style.setProperty('--button-gradient', config.colors.button);

        // 应用到 body
        document.body.style.background = config.colors.background;

        // 应用主题特殊效果
        if (config.special) {
            this.applySpecialEffects(config.special);
        }
    }

    // 应用情绪到 DOM
    applyMood() {
        const moodConfig = this.getMoodConfig();
        // 情绪主要影响诗歌生成和游戏速度，不需要额外 DOM 操作
    }

    // 应用特殊效果
    applySpecialEffects(special) {
        // 星空效果
        if (special.starField) {
            this.createStarField();
        }

        // 发光效果
        if (special.glowEffect) {
            document.body.classList.add('glow-effect');
        }

        // 霓虹效果
        if (special.neonEffect) {
            document.body.classList.add('neon-effect');
        }

        // 网格线
        if (special.gridLines) {
            document.body.classList.add('grid-lines');
        }
    }

    // 创建星空背景
    createStarField() {
        let starField = document.getElementById('starField');
        if (!starField) {
            starField = document.createElement('div');
            starField.id = 'starField';
            starField.className = 'star-field';
            document.body.appendChild(starField);
        }

        // 清空现有星星
        starField.innerHTML = '';

        // 生成星星
        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 2 + 's';
            star.style.animationDuration = (Math.random() * 2 + 1) + 's';
            starField.appendChild(star);
        }
    }

    // 处理魔法单词效果
    applyMagicEffect(word) {
        const effect = MAGIC_EFFECTS[word];
        if (!effect) return null;

        let themeChanged = false;
        let moodChanged = false;

        // 应用主题变化
        if (effect.theme && effect.theme !== this.currentTheme) {
            this.setTheme(effect.theme);
            themeChanged = true;
        }

        // 应用情绪变化
        if (effect.mood && effect.mood !== this.currentMood) {
            this.setMood(effect.mood);
            moodChanged = true;
        }

        // 应用粒子效果
        if (effect.particleEffect) {
            this.createParticleEffect(effect.particleEffect);
        }

        return {
            themeChanged,
            moodChanged,
            effect
        };
    }

    // 创建粒子效果
    createParticleEffect(type) {
        const container = document.getElementById('gameContainer');
        if (!container) return;

        // 移除旧的粒子效果
        this.removeParticleEffect();

        const particles = document.createElement('div');
        particles.className = `particle-effect ${type}`;
        particles.id = 'particleEffect';

        switch (type) {
            case 'stars':
                this.createStars(particles);
                break;
            case 'bubbles':
                this.createBubbles(particles);
                break;
            case 'snow':
                this.createSnow(particles);
                break;
            case 'petals':
                this.createPetals(particles);
                break;
            case 'rain':
                this.createRain(particles);
                break;
            case 'rainbow':
                this.createRainbow(particles);
                break;
        }

        container.appendChild(particles);
    }

    // 创建星星粒子
    createStars(container) {
        for (let i = 0; i < 30; i++) {
            const star = document.createElement('div');
            star.className = 'particle star';
            star.innerHTML = '⭐';
            star.style.left = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(star);
        }
    }

    // 创建气泡粒子
    createBubbles(container) {
        for (let i = 0; i < 20; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'particle bubble';
            bubble.innerHTML = '💭';
            bubble.style.left = Math.random() * 100 + '%';
            bubble.style.animationDelay = Math.random() * 3 + 's';
            container.appendChild(bubble);
        }
    }

    // 创建雪花粒子
    createSnow(container) {
        for (let i = 0; i < 50; i++) {
            const flake = document.createElement('div');
            flake.className = 'particle snowflake';
            flake.innerHTML = '❄️';
            flake.style.left = Math.random() * 100 + '%';
            flake.style.animationDelay = Math.random() * 2 + 's';
            flake.style.animationDuration = (Math.random() * 3 + 2) + 's';
            container.appendChild(flake);
        }
    }

    // 创建花瓣粒子
    createPetals(container) {
        const petals = ['🌸', '🌺', '🌼'];
        for (let i = 0; i < 30; i++) {
            const petal = document.createElement('div');
            petal.className = 'particle petal';
            petal.innerHTML = petals[Math.floor(Math.random() * petals.length)];
            petal.style.left = Math.random() * 100 + '%';
            petal.style.animationDelay = Math.random() * 2 + 's';
            container.appendChild(petal);
        }
    }

    // 创建雨滴粒子
    createRain(container) {
        for (let i = 0; i < 40; i++) {
            const drop = document.createElement('div');
            drop.className = 'particle raindrop';
            drop.style.left = Math.random() * 100 + '%';
            drop.style.animationDelay = Math.random() * 1 + 's';
            drop.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
            container.appendChild(drop);
        }
    }

    // 创建彩虹效果
    createRainbow(container) {
        for (let i = 0; i < 7; i++) {
            const arc = document.createElement('div');
            arc.className = 'rainbow-arc';
            arc.style.animationDelay = (i * 0.2) + 's';
            container.appendChild(arc);
        }
    }

    // 移除粒子效果
    removeParticleEffect() {
        const existing = document.getElementById('particleEffect');
        if (existing) {
            existing.remove();
        }
    }

    // 设置过渡效果
    setTransition(effect) {
        this.transitionEffect = effect;
        document.body.style.transition = effect;
    }

    // 获取游戏速度调整（基于情绪）
    getSpeedModifier() {
        const moodConfig = this.getMoodConfig();
        return moodConfig.speedModifier;
    }

    // 获取情绪修饰符（用于诗歌生成）
    getEmotionModifier() {
        const moodConfig = this.getMoodConfig();
        return moodConfig.emotionModifier;
    }

    // 重置到默认主题
    resetToDefault() {
        this.setTheme('default');
        this.setMood('normal');
        this.removeParticleEffect();
    }

    // 获取所有可用主题
    getAvailableThemes() {
        return Object.keys(THEMES).map(key => ({
            id: THEMES[key].id,
            name: THEMES[key].name,
            description: THEMES[key].description
        }));
    }

    // 获取所有可用情绪
    getAvailableMoods() {
        return Object.keys(MOODS).map(key => ({
            id: MOODS[key].name,
            name: MOODS[key].name
        }));
    }

    // 保存主题偏好
    saveThemePreference() {
        try {
            localStorage.setItem('aiSnakeTheme', this.currentTheme);
            localStorage.setItem('aiSnakeMood', this.currentMood);
        } catch (e) {
            console.error('Failed to save theme preference:', e);
        }
    }

    // 加载主题偏好
    loadThemePreference() {
        try {
            const savedTheme = localStorage.getItem('aiSnakeTheme');
            const savedMood = localStorage.getItem('aiSnakeMood');

            if (savedTheme && THEMES[savedTheme]) {
                this.setTheme(savedTheme);
            }
            if (savedMood && MOODS[savedMood]) {
                this.setMood(savedMood);
            }
        } catch (e) {
            console.error('Failed to load theme preference:', e);
        }
    }

    // 根据游戏模式自动选择主题
    autoSelectTheme(mode) {
        const themeMap = {
            tang: 'tang',
            song: 'tang',
            modern: 'default',
            fairytale: 'fairytale',
            scifi: 'scifi'
        };

        const theme = themeMap[mode] || 'default';
        this.setTheme(theme);
    }
}

// 导出单例
export default new ThemeManager();
