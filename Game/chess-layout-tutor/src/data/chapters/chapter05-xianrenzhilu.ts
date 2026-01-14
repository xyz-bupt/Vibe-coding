// 第五章：仙人指路布局 (20局)

import type { Layout } from '../../types';

export const CHAPTER_05_LAYOUTS: Layout[] = [
  {
    id: '071',
    name: '仙人指路 - 卒底炮',
    category: 'xianrenzhilu',
    difficulty: 2,
    description: '红方挺兵试探，黑方卒底炮应战，灵活多变。',
    keyPoints: [
      '红方试探性进攻',
      '黑方积极应对',
      '变化灵活多样',
      '中局较量关键'
    ],
    tags: ['开局', '灵活', '试探'],
    source: '象棋布局全书 第121局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '仙人指路' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '马８进９', note: '边马' } },
      { round: 3, red: { notation: '马二进三', note: '正马' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '兵三进一', note: '吃卒' }, black: { notation: '炮７进５', note: '炮打兵' } }
    ],
    traps: [
      {
        round: 5,
        name: '炮打兵反击',
        description: '黑方炮打三兵，同时威胁红马，是积极的反击手段。',
        warning: '注意马的安全'
      }
    ]
  },
  {
    id: '072',
    name: '仙人指路 - 对卒',
    category: 'xianrenzhilu',
    difficulty: 1,
    description: '红方挺兵，黑方也挺卒，对称局面，稳健开局。',
    keyPoints: [
      '双方都挺卒',
      '对称局面',
      '稳健开局',
      '适合初学者'
    ],
    tags: ['开局', '稳健', '对称'],
    source: '象棋布局全书 第122局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '卒３进１', note: '挺卒' } },
      { round: 2, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 4, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } }
    ]
  },
  {
    id: '073',
    name: '仙人指路 - 飞象',
    category: 'xianrenzhilu',
    difficulty: 1,
    description: '红方挺兵，黑方飞象，稳健应对。',
    keyPoints: [
      '黑方飞象',
      '稳固防守',
      '稳健布局',
      '适合初学者'
    ],
    tags: ['开局', '稳健', '防守'],
    source: '象棋布局全书 第123局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 2, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 4, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } }
    ]
  },
  {
    id: '074',
    name: '仙人指路 - 跳马',
    category: 'xianrenzhilu',
    difficulty: 1,
    description: '红方挺兵，黑方跳马，积极应对。',
    keyPoints: [
      '黑方跳马',
      '积极应对',
      '灵活布局',
      '适合初学者'
    ],
    tags: ['开局', '积极', '灵活'],
    source: '象棋布局全书 第124局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '马２进３', note: '跳马' } },
      { round: 2, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 3, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 4, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } }
    ]
  },
  {
    id: '075',
    name: '仙人指路 - 架中炮',
    category: 'xianrenzhilu',
    difficulty: 2,
    description: '红方挺兵后架中炮，积极主动。',
    keyPoints: [
      '挺兵后架炮',
      '积极主动',
      '灵活多变',
      '考验判断'
    ],
    tags: ['开局', '积极', '灵活'],
    source: '象棋布局全书 第125局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '马８进９', note: '边马' } },
      { round: 3, red: { notation: '马二进三', note: '正马' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } }
    ]
  },
  {
    id: '076',
    name: '仙人指路 - 挺七兵',
    category: 'xianrenzhilu',
    difficulty: 2,
    description: '红方挺七兵，与挺三兵类似，方向相反。',
    keyPoints: [
      '挺七兵',
      '与挺三兵类似',
      '方向不同',
      '根据情况选择'
    ],
    tags: ['开局', '灵活', '选择'],
    source: '象棋布局全书 第126局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '炮２平３', note: '卒底炮' } },
      { round: 2, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '马２进１', note: '边马' } },
      { round: 3, red: { notation: '马二进三', note: '正马' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '卒３进１', note: '挺卒' } },
      { round: 5, red: { notation: '兵七进一', note: '吃卒' }, black: { notation: '炮３进５', note: '炮打兵' } }
    ]
  },
  {
    id: '077',
    name: '仙人指路 - 飞相局',
    category: 'xianrenzhilu',
    difficulty: 2,
    description: '红方挺兵后飞相，稳健防守。',
    keyPoints: [
      '挺兵后飞相',
      '稳健防守',
      '以静制动',
      '考验中局'
    ],
    tags: ['开局', '稳健', '防守'],
    source: '象棋布局全书 第127局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '相三进五', note: '飞相' }, black: { notation: '马８进９', note: '边马' } },
      { round: 3, red: { notation: '马二进三', note: '正马' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } }
    ]
  },
  {
    id: '078',
    name: '仙人指路 - 跳正马',
    category: 'xianrenzhilu',
    difficulty: 2,
    description: '红方挺兵后跳马，正常布局。',
    keyPoints: [
      '挺兵后跳马',
      '正常布局',
      '稳步推进',
      '平衡发展'
    ],
    tags: ['开局', '稳健', '平衡'],
    source: '象棋布局全书 第128局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进９', note: '边马' } },
      { round: 3, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } }
    ]
  },
  {
    id: '079',
    name: '仙人指路 - 进马',
    category: 'xianrenzhilu',
    difficulty: 2,
    description: '红方挺兵后进马，灵活布局。',
    keyPoints: [
      '挺兵后进马',
      '灵活布局',
      '攻守兼备',
      '考验理解'
    ],
    tags: ['开局', '灵活', '攻守'],
    source: '象棋布局全书 第129局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进９', note: '边马' } },
      { round: 3, red: { notation: '马三进四', note: '进马' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '卒７进１', note: '挺卒' } }
    ]
  },
  {
    id: '080',
    name: '仙人指路 - 平炮',
    category: 'xianrenzhilu',
    difficulty: 2,
    description: '红方挺兵后平炮，灵活多变。',
    keyPoints: [
      '挺兵后平炮',
      '灵活多变',
      '攻守兼备',
      '考验判断'
    ],
    tags: ['开局', '灵活', '变化'],
    source: '象棋布局全书 第130局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '炮八平五', note: '架中炮' }, black: { notation: '马８进９', note: '边马' } },
      { round: 3, red: { notation: '马八进七', note: '正马' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '车九平八', note: '直车' }, black: { notation: '卒７进１', note: '挺卒' } }
    ]
  },
  {
    id: '081',
    name: '仙人指路 - 进卒',
    category: 'xianrenzhilu',
    difficulty: 1,
    description: '红方挺兵，黑方进卒，对抢先手。',
    keyPoints: [
      '双方挺卒',
      '对抢先手',
      '灵活变化',
      '考验计算'
    ],
    tags: ['开局', '对攻', '灵活'],
    source: '象棋布局全书 第131局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 2, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 4, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } }
    ]
  },
  {
    id: '082',
    name: '仙人指路 - 补士',
    category: 'xianrenzhilu',
    difficulty: 1,
    description: '红方挺兵后补士，稳固防守。',
    keyPoints: [
      '挺兵后补士',
      '稳固防守',
      '稳健布局',
      '适合初学者'
    ],
    tags: ['开局', '稳健', '防守'],
    source: '象棋布局全书 第132局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '士四进五', note: '补士' }, black: { notation: '马８进９', note: '边马' } },
      { round: 3, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } }
    ]
  },
  {
    id: '083',
    name: '仙人指路 - 出车',
    category: 'xianrenzhilu',
    difficulty: 2,
    description: '红方挺兵后出车，快速出动。',
    keyPoints: [
      '挺兵后出车',
      '快速出动',
      '灵活布局',
      '考验判断'
    ],
    tags: ['开局', '灵活', '出动'],
    source: '象棋布局全书 第133局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '车一平二', note: '直车' }, black: { notation: '马８进９', note: '边马' } },
      { round: 3, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } }
    ]
  },
  {
    id: '084',
    name: '仙人指路 - 进边马',
    category: 'xianrenzhilu',
    difficulty: 2,
    description: '红方挺兵后进边马，灵活多变。',
    keyPoints: [
      '挺兵后进边马',
      '灵活多变',
      '快速出车',
      '现代流行'
    ],
    tags: ['开局', '现代', '灵活'],
    source: '象棋布局全书 第134局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进９', note: '边马' } },
      { round: 3, red: { notation: '马八进九', note: '边马' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '卒７进１', note: '挺卒' } }
    ]
  },
  {
    id: '085',
    name: '仙人指路 - 进炮',
    category: 'xianrenzhilu',
    difficulty: 2,
    description: '红方挺兵后进炮，灵活进攻。',
    keyPoints: [
      '挺兵后进炮',
      '灵活进攻',
      '攻守兼备',
      '考验判断'
    ],
    tags: ['开局', '灵活', '进攻'],
    source: '象棋布局全书 第135局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '炮二进二', note: '进炮' }, black: { notation: '马８进９', note: '边马' } },
      { round: 3, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } }
    ]
  },
  {
    id: '086',
    name: '仙人指路 - 卒底炮变着',
    category: 'xianrenzhilu',
    difficulty: 3,
    description: '红方挺兵，黑方卒底炮，双方灵活变着。',
    keyPoints: [
      '灵活变着',
      '考验双方',
      '变化丰富',
      '需要计算'
    ],
    tags: ['开局', '灵活', '变化'],
    source: '象棋布局全书 第136局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 3, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进９', note: '边马' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '车９平８', note: '直车' } },
      { round: 5, red: { notation: '车一平二', note: '直车' }, black: { notation: '卒７进１', note: '挺卒' } }
    ]
  },
  {
    id: '087',
    name: '仙人指路 - 飞刀布局',
    category: 'xianrenzhilu',
    difficulty: 3,
    description: '仙人指路的飞刀布局，包含陷阱。',
    keyPoints: [
      '飞刀布局',
      '包含陷阱',
      '一着不慎满盘输',
      '需要谨慎'
    ],
    tags: ['开局', '陷阱', '飞刀'],
    source: '象棋布局全书 第137局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '马８进９', note: '边马' } },
      { round: 3, red: { notation: '马二进三', note: '正马' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '兵三进一', note: '吃卒' }, black: { notation: '炮７进５', note: '炮打兵' } },
      { round: 6, red: { notation: '马三进四', note: '跃马' }, black: { notation: '炮７平３', note: '平炮' } }
    ],
    traps: [
      {
        round: 6,
        name: '跃马陷阱',
        description: '红方跃马弃子，黑方需要谨慎应对。',
        warning: '注意红方反击'
      }
    ]
  },
  {
    id: '088',
    name: '仙人指路 - 双头蛇',
    category: 'xianrenzhilu',
    difficulty: 2,
    description: '红方挺起双兵，形成双头蛇阵势。',
    keyPoints: [
      '挺起双兵',
      '双马灵活',
      '阵型稳固',
      '现代流行'
    ],
    tags: ['开局', '现代', '灵活'],
    source: '象棋布局全书 第138局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '马８进９', note: '边马' } },
      { round: 3, red: { notation: '马二进三', note: '正马' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '卒７进１', note: '挺卒' } }
    ]
  },
  {
    id: '089',
    name: '仙人指路 - 巡河炮',
    category: 'xianrenzhilu',
    difficulty: 2,
    description: '红方巡河炮，稳健中暗藏杀机。',
    keyPoints: [
      '巡河炮',
      '稳健灵活',
      '可左右调动',
      '攻守兼备'
    ],
    tags: ['开局', '稳健', '灵活'],
    source: '象棋布局全书 第139局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '马８进９', note: '边马' } },
      { round: 3, red: { notation: '马二进三', note: '正马' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '卒７进１', note: '挺卒' } }
    ]
  },
  {
    id: '090',
    name: '仙人指路 - 经典变着',
    category: 'xianrenzhilu',
    difficulty: 2,
    description: '仙人指路的经典变着，稳健可靠。',
    keyPoints: [
      '经典变着',
      '稳健可靠',
      '适合初学者',
      '基础布局'
    ],
    tags: ['开局', '经典', '稳健'],
    source: '象棋布局全书 第140局',
    chapterId: 'ch05',
    chapterNumber: 5,
    moves: [
      { round: 1, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '炮８平７', note: '卒底炮' } },
      { round: 2, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '马８进９', note: '边马' } },
      { round: 3, red: { notation: '马二进三', note: '正马' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 5, red: { notation: '车一平二', note: '直车' }, black: { notation: '卒７进１', note: '挺卒' } }
    ]
  }
];
