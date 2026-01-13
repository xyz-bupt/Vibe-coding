// AI 贪吃蛇 - 主题配置
// 定义不同主题的视觉效果和游戏体验

// 主题配置
const THEMES = {
    default: {
        name: '默认',
        id: 'default',
        description: '经典贪吃蛇体验',
        // 颜色配置
        colors: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            container: '#ffffff',
            canvas: '#000000',
            snakeHead: '#4CAF50',
            snakeBody: '#8BC34A',
            food: '#FF5722',
            text: '#333333',
            button: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        // 游戏配置
        game: {
            initialSpeed: 100,
            speedIncrease: 2,
            minSpeed: 50,
            gridSize: 20,
            wordFrequency: 1.0  // 单词出现频率
        }
    },

    tang: {
        name: '唐诗',
        id: 'tang',
        description: '古典雅致，诗意盎然',
        colors: {
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            container: '#fffef9',
            canvas: '#1a1a1a',
            snakeHead: '#d4af37',  // 金色
            snakeBody: '#c9a031',
            food: '#8b4513',       // 古铜色
            text: '#2c1810',
            button: 'linear-gradient(135deg, #d4af37 0%, #c9a031 100%)'
        },
        game: {
            initialSpeed: 120,
            speedIncrease: 1.5,
            minSpeed: 60,
            gridSize: 20,
            wordFrequency: 1.0
        },
        // 唐诗特有配置
        special: {
            wordSet: 'tang',
            poemStyle: 'tang',
            bgPattern: 'ink-wash'
        }
    },

    night: {
        name: '夜',
        id: 'night',
        description: '神秘宁静，月色如水',
        colors: {
            background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
            container: '#1a2639',
            canvas: '#0a0e27',
            snakeHead: '#e0e5ec',
            snakeBody: '#a8b5c2',
            food: '#ffd700',       // 月光金
            text: '#e0e5ec',
            button: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)'
        },
        game: {
            initialSpeed: 110,
            speedIncrease: 2,
            minSpeed: 55,
            gridSize: 20,
            wordFrequency: 1.0
        },
        special: {
            glowEffect: true,
            starField: true
        }
    },

    dream: {
        name: '梦',
        id: 'dream',
        description: '梦幻迷离，奇幻美丽',
        colors: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            container: 'rgba(255, 255, 255, 0.95)',
            canvas: '#1a0b2e',
            snakeHead: '#ff6b9d',
            snakeBody: '#c44569',
            food: '#feca57',
            text: '#2d132c',
            button: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
        },
        game: {
            initialSpeed: 130,
            speedIncrease: 1.5,
            minSpeed: 70,
            gridSize: 20,
            wordFrequency: 0.9
        },
        special: {
            bubbleEffect: true,
            floatingParticles: true
        }
    },

    winter: {
        name: '冬',
        id: 'winter',
        description: '清冷素雅，宁静致远',
        colors: {
            background: 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)',
            container: '#ffffff',
            canvas: '#2c3e50',
            snakeHead: '#ecf0f1',
            snakeBody: '#bdc3c7',
            food: '#3498db',       // 冰蓝
            text: '#2c3e50',
            button: 'linear-gradient(135deg, #74ebd5 0%, #acb6e5 100%)'
        },
        game: {
            initialSpeed: 115,
            speedIncrease: 1.8,
            minSpeed: 58,
            gridSize: 20,
            wordFrequency: 1.0
        },
        special: {
            snowEffect: true,
            iceTexture: true
        }
    },

    spring: {
        name: '春',
        id: 'spring',
        description: '生机勃勃，春意盎然',
        colors: {
            background: 'linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)',
            container: '#fffbf0',
            canvas: '#1e3c00',
            snakeHead: '#ff6b6b',
            snakeBody: '#ee5a5a',
            food: '#ffd93d',
            text: '#2d4a22',
            button: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)'
        },
        game: {
            initialSpeed: 100,
            speedIncrease: 2.2,
            minSpeed: 50,
            gridSize: 20,
            wordFrequency: 1.0
        },
        special: {
            petalEffect: true,
            freshBloom: true
        }
    },

    fairytale: {
        name: '童话',
        id: 'fairytale',
        description: '梦幻童话，魔法世界',
        colors: {
            background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            container: '#fff5f5',
            canvas: '#4a0e4e',
            snakeHead: '#ff6b9d',
            snakeBody: '#c44569',
            food: '#f9ca24',
            text: '#2c0b37',
            button: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
        },
        game: {
            initialSpeed: 105,
            speedIncrease: 2,
            minSpeed: 52,
            gridSize: 20,
            wordFrequency: 1.0
        },
        special: {
            wordSet: 'fairytale',
            poemStyle: 'fairytale',
            sparkleEffect: true
        }
    },

    scifi: {
        name: '科幻',
        id: 'scifi',
        description: '未来科技，星际探索',
        colors: {
            background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
            container: '#0a0a0a',
            canvas: '#000000',
            snakeHead: '#00ff87',
            snakeBody: '#00d9ff',
            food: '#ff00ff',
            text: '#00ff87',
            button: 'linear-gradient(135deg, #00d9ff 0%, #00ff87 100%)'
        },
        game: {
            initialSpeed: 95,
            speedIncrease: 2.5,
            minSpeed: 45,
            gridSize: 20,
            wordFrequency: 1.0
        },
        special: {
            wordSet: 'scifi',
            poemStyle: 'scifi',
            neonEffect: true,
            gridLines: true
        }
    }
};

// 情绪配置（影响诗歌生成和视觉效果）
const MOODS = {
    normal: {
        name: '平静',
        emotionModifier: 1.0,
        speedModifier: 1.0
    },
    peaceful: {
        name: '宁静',
        emotionModifier: 0.8,
        speedModifier: 0.9
    },
    romantic: {
        name: '浪漫',
        emotionModifier: 1.2,
        speedModifier: 1.0
    },
    melancholy: {
        name: '忧郁',
        emotionModifier: 1.5,
        speedModifier: 1.1
    },
    joyful: {
        name: '喜悦',
        emotionModifier: 0.7,
        speedModifier: 1.2
    },
    mysterious: {
        name: '神秘',
        emotionModifier: 1.3,
        speedModifier: 1.0
    },
    intense: {
        name: '激烈',
        emotionModifier: 1.8,
        speedModifier: 1.3
    },
    hopeful: {
        name: '充满希望',
        emotionModifier: 0.6,
        speedModifier: 1.1
    },
    dreamy: {
        name: '梦幻',
        emotionModifier: 1.1,
        speedModifier: 0.95
    },
    free: {
        name: '自由',
        emotionModifier: 0.9,
        speedModifier: 1.15
    }
};

// 魔法单词触发效果
const MAGIC_EFFECTS = {
    '夜': {
        theme: 'night',
        mood: 'mysterious',
        duration: 0,  // 0 = 永久
        particleEffect: 'stars'
    },
    '梦': {
        theme: 'dream',
        mood: 'dreamy',
        duration: 0,
        particleEffect: 'bubbles'
    },
    '风': {
        mood: 'free',
        duration: 0,
        particleEffect: 'wind'
    },
    '雨': {
        theme: 'night',
        mood: 'melancholy',
        duration: 0,
        particleEffect: 'rain'
    },
    '雪': {
        theme: 'winter',
        mood: 'peaceful',
        duration: 0,
        particleEffect: 'snow'
    },
    '春': {
        theme: 'spring',
        mood: 'joyful',
        duration: 0,
        particleEffect: 'petals'
    },
    '光': {
        mood: 'hopeful',
        duration: 5,
        particleEffect: 'light'
    },
    '雾': {
        theme: 'night',
        mood: 'mysterious',
        duration: 0,
        particleEffect: 'fog'
    },
    '霜': {
        theme: 'winter',
        mood: 'melancholy',
        duration: 3,
        particleEffect: 'frost'
    },
    '霞': {
        mood: 'romantic',
        duration: 4,
        particleEffect: 'glow'
    },
    '虹': {
        mood: 'joyful',
        duration: 5,
        particleEffect: 'rainbow'
    },
    '雷': {
        mood: 'intense',
        duration: 3,
        particleEffect: 'lightning'
    }
};

// 主题过渡效果
const THEME_TRANSITIONS = {
    fade: 'opacity 0.5s ease',
    slide: 'transform 0.5s ease',
    zoom: 'transform 0.3s ease, opacity 0.3s ease',
    none: 'none'
};

// 导出所有配置
export {
    THEMES,
    MOODS,
    MAGIC_EFFECTS,
    THEME_TRANSITIONS
};
