// 第二章：列手炮布局 (15局)

import type { Layout } from '../../types';

export const CHAPTER_02_LAYOUTS: Layout[] = [
  {
    id: '021',
    name: '列手炮 - 大列手炮',
    category: 'lieshoupao',
    difficulty: 2,
    description: '列手炮是指双方炮的位置相对，形成对攻激烈的局面。',
    keyPoints: [
      '双方炮位相对',
      '对攻性更强于顺手炮',
      '变化复杂，容易出错',
      '适合中高级棋手'
    ],
    tags: ['开局', '对攻', '激烈'],
    source: '象棋布局全书 第51局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '炮２平５', note: '列手炮应战' } },
      { round: 2, red: { notation: '马二进三', note: '出马' }, black: { notation: '马２进３', note: '出马' } },
      { round: 3, red: { notation: '车一平二', note: '出直车' }, black: { notation: '车１平２', note: '出直车' } },
      { round: 4, red: { notation: '马八进七', note: '跳正马' }, black: { notation: '马８进９', note: '跳边马' } },
      { round: 5, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '炮８进２', note: '同样巡河炮' } }
    ],
    traps: [
      {
        round: 5,
        name: '巡河炮陷阱',
        description: '双方都走巡河炮，看似平稳，实则暗藏杀机。',
        warning: '注意中路防守'
      }
    ]
  },
  {
    id: '022',
    name: '列手炮 - 小列手炮',
    category: 'lieshoupao',
    difficulty: 3,
    description: '双方炮位相对，形成激烈对攻局面，变化复杂。',
    keyPoints: [
      '对攻性极强',
      '双方都瞄准对方中路',
      '一着不慎满盘皆输',
      '适合中高级棋手'
    ],
    tags: ['开局', '对攻', '激烈', '复杂'],
    source: '象棋布局全书 第52局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮２平５', note: '列手炮' } },
      { round: 2, red: { notation: '马二进三', note: '出马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '马８进９', note: '边马' } },
      { round: 5, red: { notation: '车九平八', note: '直车' }, black: { notation: '炮５平６', note: '卸炮' } }
    ],
    traps: [
      {
        round: 5,
        name: '卸炮陷阱',
        description: '黑方卸炮准备攻红方马，红方需要防范。',
        warning: '注意保护七路马'
      }
    ]
  },
  {
    id: '023',
    name: '列手炮 - 横车对直车',
    category: 'lieshoupao',
    difficulty: 3,
    description: '红方出直车，黑方出横车，双方不同出车方式。',
    keyPoints: [
      '直车横车对比',
      '各有利弊',
      '考验布局理解',
      '灵活选择'
    ],
    tags: ['开局', '变化', '灵活'],
    source: '象棋布局全书 第53局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮２平５', note: '列手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车１进１', note: '横车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '车１平６', note: '占肋道' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '马８进７', note: '正马' } }
    ]
  },
  {
    id: '024',
    name: '列手炮 - 进七兵',
    category: 'lieshoupao',
    difficulty: 3,
    description: '红方挺七路兵，活通马路，稳健的进攻方式。',
    keyPoints: [
      '挺七兵活马',
      '稳健布局',
      '逐步推进',
      '攻守平衡'
    ],
    tags: ['开局', '稳健', '平衡'],
    source: '象棋布局全书 第54局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮２平５', note: '列手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '马８进９', note: '边马' } },
      { round: 5, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 6, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '车２进４', note: '巡河车' } }
    ]
  },
  {
    id: '025',
    name: '列手炮 - 巡河炮对骑河车',
    category: 'lieshoupao',
    difficulty: 4,
    description: '红方巡河炮，黑方骑河车，双方争夺河沿控制权。',
    keyPoints: [
      '争夺河沿',
      '控制要道',
      '攻守激烈',
      '考验计算'
    ],
    tags: ['开局', '争夺', '激烈'],
    source: '象棋布局全书 第55局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮２平５', note: '列手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '马８进９', note: '边马' } },
      { round: 5, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '车２进４', note: '骑河车' } },
      { round: 6, red: { notation: '炮八平七', note: '平炮' }, black: { notation: '车２平３', note: '捉炮' } }
    ],
    traps: [
      {
        round: 6,
        name: '捉炮陷阱',
        description: '黑方车捉炮，红方需要应对，避免失子。',
        warning: '注意炮的逃路'
      }
    ]
  },
  {
    id: '026',
    name: '列手炮 - 双过河车',
    category: 'lieshoupao',
    difficulty: 4,
    description: '双方双车过河，形成激烈对攻局面。',
    keyPoints: [
      '双车过河',
      '对攻激烈',
      '变化复杂',
      '考验双方实力'
    ],
    tags: ['开局', '对攻', '激烈', '复杂'],
    source: '象棋布局全书 第56局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮２平５', note: '列手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '马８进９', note: '边马' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '车２进６', note: '过河车' } },
      { round: 6, red: { notation: '车二平三', note: '吃卒' }, black: { notation: '炮５退１', note: '退炮' } }
    ]
  },
  {
    id: '027',
    name: '列手炮 - 急进中兵',
    category: 'lieshoupao',
    difficulty: 4,
    description: '红方急进中兵，从中路发起猛攻。',
    keyPoints: [
      '急进中兵',
      '中路猛攻',
      '攻势凌厉',
      '防守要严密'
    ],
    tags: ['开局', '进攻', '中路'],
    source: '象棋布局全书 第57局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮２平５', note: '列手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '马８进９', note: '边马' } },
      { round: 5, red: { notation: '兵五进一', note: '急进中兵' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 6, red: { notation: '兵五进一', note: '再进中兵' }, black: { notation: '炮５进２', note: '炮打兵' } }
    ]
  },
  {
    id: '028',
    name: '列手炮 - 补士',
    category: 'lieshoupao',
    difficulty: 3,
    description: '红方补士，稳固防守，然后伺机反击。',
    keyPoints: [
      '补士稳固',
      '防守反击',
      '稳健布局',
      '以静制动'
    ],
    tags: ['开局', '稳健', '防守'],
    source: '象棋布局全书 第58局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮２平５', note: '列手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '士四进五', note: '补士' }, black: { notation: '马８进９', note: '边马' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '卒９进１', note: '挺卒' } }
    ]
  },
  {
    id: '029',
    name: '列手炮 - 跳边马',
    category: 'lieshoupao',
    difficulty: 3,
    description: '红方跳边马，灵活多变，现代流行布局。',
    keyPoints: [
      '边马灵活',
      '快速出车',
      '现代流行',
      '变化丰富'
    ],
    tags: ['开局', '现代', '灵活'],
    source: '象棋布局全书 第59局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮２平５', note: '列手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '马八进九', note: '边马' }, black: { notation: '马８进９', note: '边马' } },
      { round: 5, red: { notation: '炮八平七', note: '平炮' }, black: { notation: '车２进４', note: '巡河车' } },
      { round: 6, red: { notation: '车九平八', note: '直车' }, black: { notation: '卒９进１', note: '挺卒' } }
    ]
  },
  {
    id: '030',
    name: '列手炮 - 进车卒林',
    category: 'lieshoupao',
    difficulty: 4,
    description: '红方车进卒林，压制黑方，积极主动的进攻。',
    keyPoints: [
      '车占卒林',
      '压制力强',
      '积极主动',
      '需要配合'
    ],
    tags: ['开局', '进攻', '压制'],
    source: '象棋布局全书 第60局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮２平５', note: '列手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '马８进９', note: '边马' } },
      { round: 5, red: { notation: '车二平三', note: '吃卒压马' }, black: { notation: '炮５退１', note: '退炮反击' } },
      { round: 6, red: { notation: '马八进七', note: '正马' }, black: { notation: '炮５平７', note: '平炮打车' } }
    ],
    traps: [
      {
        round: 6,
        name: '打车陷阱',
        description: '黑方平炮打车，红方需要妥善处理，避免失子。',
        warning: '注意车的安全'
      }
    ]
  },
  {
    id: '031',
    name: '列手炮 - 左炮过河',
    category: 'lieshoupao',
    difficulty: 4,
    description: '红方左炮过河，准备夺取双卒，攻守兼备。',
    keyPoints: [
      '左炮过河',
      '夺卒威胁',
      '攻守兼备',
      '需要精确'
    ],
    tags: ['开局', '复杂', '攻守'],
    source: '象棋布局全书 第61局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮２平５', note: '列手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '马８进９', note: '边马' } },
      { round: 5, red: { notation: '炮八进四', note: '过河炮' }, black: { notation: '车２进６', note: '过河车' } },
      { round: 6, red: { notation: '炮八平七', note: '平炮' }, black: { notation: '车２平３', note: '捉炮' } }
    ]
  },
  {
    id: '032',
    name: '列手炮 - 炮打中卒',
    category: 'lieshoupao',
    difficulty: 5,
    description: '红方炮打中卒，先手得利，但要注意后续。',
    keyPoints: [
      '炮打中卒',
      '得先手',
      '注意后续',
      '精确计算'
    ],
    tags: ['开局', '进攻', '复杂'],
    source: '象棋布局全书 第62局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮２平５', note: '列手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '马８进９', note: '边马' } },
      { round: 5, red: { notation: '炮八进四', note: '过河炮' }, black: { notation: '卒３进１', note: '挺卒' } },
      { round: 6, red: { notation: '炮八平五', note: '炮打中卒' }, black: { notation: '马３进５', note: '马换炮' } },
      { round: 7, red: { notation: '炮五进四', note: '打马' }, black: { notation: '士４进５', note: '补士' } }
    ],
    traps: [
      {
        round: 7,
        name: '换子陷阱',
        description: '双方换子后，需要评估局面得失。',
        warning: '注意局面评估'
      }
    ]
  },
  {
    id: '033',
    name: '列手炮 - 双横车',
    category: 'lieshoupao',
    difficulty: 3,
    description: '双方都出横车，形成对称局面。',
    keyPoints: [
      '双方横车',
      '对称局面',
      '细节重要',
      '考验理解'
    ],
    tags: ['开局', '对称', '微妙'],
    source: '象棋布局全书 第63局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮２平５', note: '列手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车一进一', note: '横车' }, black: { notation: '车１进１', note: '横车' } },
      { round: 4, red: { notation: '车一平六', note: '占肋道' }, black: { notation: '车１平６', note: '占肋道' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '马８进９', note: '边马' } }
    ]
  },
  {
    id: '034',
    name: '列手炮 - 飞相局',
    category: 'lieshoupao',
    difficulty: 4,
    description: '红方飞相，稳固防守，然后伺机反击。',
    keyPoints: [
      '飞相稳固',
      '防守反击',
      '需要耐心',
      '考验功力'
    ],
    tags: ['开局', '稳健', '反击'],
    source: '象棋布局全书 第64局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮２平５', note: '列手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '相三进五', note: '飞相' }, black: { notation: '马８进９', note: '边马' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '车２进４', note: '巡河车' } }
    ]
  },
  {
    id: '035',
    name: '列手炮 - 复杂飞刀',
    category: 'lieshoupao',
    difficulty: 5,
    description: '列手炮的复杂变着，包含多个陷阱，仅适合高手。',
    keyPoints: [
      '复杂变着',
      '陷阱重重',
      '一着不慎满盘输',
      '仅适合高手'
    ],
    tags: ['开局', '高级', '陷阱', '飞刀'],
    source: '象棋布局全书 第65局',
    chapterId: 'ch02',
    chapterNumber: 2,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮２平５', note: '列手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '马８进９', note: '边马' } },
      { round: 5, red: { notation: '车二平三', note: '吃卒' }, black: { notation: '炮５退１', note: '退炮' } },
      { round: 6, red: { notation: '马八进七', note: '正马' }, black: { notation: '炮５平７', note: '平炮打车' } },
      { round: 7, red: { notation: '车三平四', note: '避车' }, black: { notation: '车２进６', note: '过河车' } },
      { round: 8, red: { notation: '炮八进四', note: '过河炮' }, black: { notation: '卒３进１', note: '挺卒' } }
    ],
    traps: [
      {
        round: 8,
        name: '多重陷阱',
        description: '此局面包含多个陷阱，需要精确计算。',
        warning: '需要深度计算后续变化'
      }
    ]
  }
];
