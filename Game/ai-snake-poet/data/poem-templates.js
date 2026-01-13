// AI 贪吃蛇 - 诗歌模板库
// 模拟 AI 诗歌生成的模板系统

// 唐诗风格模板
const TANG_TEMPLATES = [
    // 五言绝句风格
    '{word}{place}{emotion}，{related}{action}意{mood}。',
    '{place}{word}静{emotion}，{related}影{action}中。',
    '{word}{emotion}深{depth}，{related}{action}自{mood}。',
    '夜{word}{emotion}起，{related}{action}来。',

    // 七言绝句风格
    '{word}{place}{emotion}万{quantity}，{related}{action}{mood}千{quantity}。',
    '{place}{word}{emotion}{time}，{related}{action}梦{mood}。',
    '{word}{emotion}{related}{mood}，{action}{place}意{emotion}。',
    '春{word}{emotion}绿{related}，{action}{place}满{mood}。'
];

// 宋词风格模板
const SONG_TEMPLATES = [
    '{word}渐{emotion}，{related}正{action}，{place}深处{mood}。',
    '{time}{word}{emotion}，{action}{related}，{place}{mood}。',
    '{word}{related}何处，{action}{place}归去。',
    '梦{word}{emotion}，{related}{action}，{place}依旧{mood}。'
];

// 现代诗风格模板
const MODERN_TEMPLATES = [
    '{word}，{related}的{emotion}，在{place}{action}。',
    '当{word}{emotion}，{related}在{place}{mood}。',
    '我{action}{word}，{related}也{emotion}起来。',
    '{word}是{related}的{emotion}，{place}是{mood}的{action}。',
    '在{word}的{emotion}里，{related}开始{action}。',
    '{word}{action}，{related}{mood}，{place}沉默。'
];

// 童话风格模板
const FAIRYTALE_TEMPLATES = [
    '在{word}的{place}，{related}开始{action}。',
    '{word}说："{emotion}啊，{related}要{action}了！"',
    '魔法{word}带来{emotion}，{related}在{place}{mood}。',
    '小小的{word}，大大的{emotion}，{related}{action}着。'
];

// 科幻风格模板
const SCIFI_TEMPLATES = [
    '{word}穿越{emotion}，{related}在{place}{action}。',
    '当{word}{emotion}达到临界，{related}开始{mood}。',
    '{word}号{related}，{action}向{place}深处。',
    '时空{word}{emotion}，{related}{action}在{mood}边界。'
];

// 反向模式（按句贪吃蛇）预设句子
const REVERSE_SENTENCES = [
    {
        theme: 'tang',
        sentence: '春江花月夜',
        display: '春江花月夜',
        difficulty: 'easy',
        hint: '千古名句，五个字'
    },
    {
        theme: 'tang',
        sentence: '床前明月光',
        display: '床前明月光',
        difficulty: 'easy',
        hint: '李白的诗'
    },
    {
        theme: 'tang',
        sentence: '海上生明月',
        display: '海上生明月',
        difficulty: 'medium',
        hint: '张九龄的名句'
    },
    {
        theme: 'tang',
        sentence: '红豆生南国',
        display: '红豆生南国',
        difficulty: 'easy',
        hint: '王维的诗'
    },
    {
        theme: 'song',
        sentence: '明月几时有',
        display: '明月几时有',
        difficulty: 'medium',
        hint: '苏轼的水调歌头'
    },
    {
        theme: 'modern',
        sentence: '面朝大海春暖花开',
        display: '面朝大海，春暖花开',
        difficulty: 'medium',
        hint: '海子的诗'
    },
    {
        theme: 'fairytale',
        sentence: '从此幸福快乐',
        display: '从此，他们幸福快乐地生活',
        difficulty: 'easy',
        hint: '童话经典结局'
    },
    {
        theme: 'scifi',
        sentence: '星辰大海未来',
        display: '星辰大海，未来可期',
        difficulty: 'medium',
        hint: '科幻常用语'
    }
];

// AI 对话模板（吃单词后显示）
const AI_DIALOGUES = {
    default: [
        '啊，{word}... 这让我想起一首诗...',
        '真美的{word}！让我为你写点什么。',
        '{word}！这个选择充满了诗意。',
        '收到{word}，灵感涌现中...',
        '有意思！{word}会带来什么故事呢？'
    ],
    magic: [
        '✨ 魔法{word}！整个世界都在变化...',
        '{word}！这是一种神秘的力量！',
        '感受到{word}的魔法了吗？',
        '当{word}出现时，奇迹发生了！'
    ],
    combo: [
        '🔥 连击！你的诗歌天赋正在觉醒！',
        '太棒了！又一个精彩的组合！',
        '你的诗歌创作真是行云流水！'
    ],
    achievement: [
        '🏆 成就解锁！你的诗心闪耀！',
        '恭喜！你触发了诗词彩蛋！',
        '🎉 太精彩了！继续保持！'
    ]
};

// 故事章节模板（成长的故事）
const STORY_CHAPTERS = {
    tang: [
        {
            length: 5,
            title: '初入诗境',
            content: '一条小蛇，在诗海中开始探索...',
            template: '初{word}入{place}，{emotion}自{mood}。'
        },
        {
            length: 10,
            title: '诗心渐长',
            content: '诗歌在心中萌芽，灵感如泉涌...',
            template: '{word}{related}日渐{emotion}，{action}{place}意{mood}。'
        },
        {
            length: 15,
            title: '诗酒年华',
            content: '诗酒趁年华，挥毫写春秋...',
            template: '{word}{related}{emotion}{time}，{action}{place}万{quantity}。'
        },
        {
            length: 20,
            title: '诗仙遗风',
            content: '青莲剑仙在世，诗酒趁年华...',
            template: '{word}{place}{emotion}万{quantity}，{related}{action}自{mood}。'
        },
        {
            length: 25,
            title: '诗圣情怀',
            content: '诗圣杜甫，忧国忧民...',
            template: '国破{word}{related}在，城{action}{emotion}意{mood}。'
        }
    ],
    modern: [
        {
            length: 5,
            title: '城市独行',
            content: '在钢筋水泥的森林里，寻找诗意...',
            template: '{word}穿过{place}，{emotion}在{related}中{action}。'
        },
        {
            length: 10,
            title: '夜的独白',
            content: '夜晚的城市，每个人都有故事...',
            template: '当{word}{emotion}，{related}在{place}{mood}。'
        },
        {
            length: 15,
            title: '远方的呼唤',
            content: '远方是什么？是梦想，还是归途...',
            template: '我{action}{word}，{related}也{emotion}起来。'
        },
        {
            length: 20,
            title: '时光的旅行者',
            content: '在时光的河流中，我们都是旅行者...',
            template: '{word}是{related}的{emotion}，{place}是{mood}的{action}。'
        }
    ],
    fairytale: [
        {
            length: 5,
            title: '童话开始',
            content: '很久很久以前，在一个神奇的地方...',
            template: '在{word}的{place}，{related}开始{action}。'
        },
        {
            length: 10,
            title: '魔法冒险',
            content: '勇敢的冒险者踏上了旅程...',
            template: '{word}说："{emotion}啊，{related}要{action}了！"'
        },
        {
            length: 15,
            title: '真爱奇迹',
            content: '真爱的力量，能战胜一切困难...',
            template: '魔法{word}带来{emotion}，{related}在{place}{mood}。'
        },
        {
            length: 20,
            title: '幸福结局',
            content: '从此，他们幸福快乐地生活在一起...',
            template: '小小的{word}，大大的{emotion}，{related}{action}着。'
        }
    ],
    scifi: [
        {
            length: 5,
            title: '星际启航',
            content: '飞船驶向深空，探索未知的宇宙...',
            template: '{word}穿越{emotion}，{related}在{place}{action}。'
        },
        {
            length: 10,
            title: '时空迷航',
            content: '在时空的缝隙中，寻找回家的路...',
            template: '当{word}{emotion}达到临界，{related}开始{mood}。'
        },
        {
            length: 15,
            title: '文明回响',
            content: '在宇宙的深处，发现了古老的文明...',
            template: '{word}号{related}，{action}向{place}深处。'
        },
        {
            length: 20,
            title: '未来已来',
            content: '未来不是梦，而是正在发生的现实...',
            template: '时空{word}{emotion}，{related}{action}在{mood}边界。'
        }
    ]
};

// 诗歌评分标准（用于排行榜）
const POEM_SCORING = {
    length: 5,           // 每行诗句得分
    variety: 3,          // 单词多样性得分
    rhyme: 10,           // 押韵加分（模拟）
    emotion: 7,          // 情感丰富度得分
    magic: 15,           // 魔法单词加分
    combo: 8,            // 连击得分
    special: 20          // 特殊组合得分
};

// 导出所有模板
export {
    TANG_TEMPLATES,
    SONG_TEMPLATES,
    MODERN_TEMPLATES,
    FAIRYTALE_TEMPLATES,
    SCIFI_TEMPLATES,
    REVERSE_SENTENCES,
    AI_DIALOGUES,
    STORY_CHAPTERS,
    POEM_SCORING
};
