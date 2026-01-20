// 第六章：飞相局及其他布局 (10局)

import type { Layout } from '../../types';

export const CHAPTER_06_LAYOUTS: Layout[] = [
  {
    id: '091',
    name: '飞相局 - 对中炮',
    category: 'feixiangju',
    difficulty: 3,
    description: '红方飞相局开局，稳健为主，黑方以中炮应战。',
    keyPoints: [
      '红方防守反击',
      '以静制动',
      '考验中局功力',
      '适合稳健型棋手'
    ],
    tags: ['开局', '稳健', '防守'],
    source: '象棋布局全书 补充1',
    chapterId: 'ch06',
    chapterNumber: 6,
    moves: [
      { round: 1, red: { notation: '相三进五', note: '飞相' }, black: { notation: '炮２平５', note: '中炮' } },
      { round: 2, red: { notation: '炮八平五', note: '架中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '马八进七', note: '正马' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '车九平八', note: '直车' }, black: { notation: '马８进７', note: '正马' } },
      { round: 5, red: { notation: '兵三进一', note: '挺兵' }, black: { notation: '车２进４', note: '巡河车' } }
    ]
  },
  {
    id: '092',
    name: '飞相局 - 对过宫炮',
    category: 'feixiangju',
    difficulty: 3,
    description: '红方飞相，黑方过宫炮应战，双方稳健布局。',
    keyPoints: [
      '双方稳健',
      '以静制动',
      '考验中局',
      '平衡布局'
    ],
    tags: ['开局', '稳健', '平衡'],
    source: '象棋布局全书 补充2',
    chapterId: 'ch06',
    chapterNumber: 6,
    moves: [
      { round: 1, red: { notation: '相三进五', note: '飞相' }, black: { notation: '炮２平６', note: '过宫炮' } },
      { round: 2, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '车九平八', note: '直车' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '炮八进四', note: '进炮' }, black: { notation: '象７进５', note: '飞象' } }
    ]
  },
  {
    id: '093',
    name: '飞相局 - 对挺卒',
    category: 'feixiangju',
    difficulty: 2,
    description: '红方飞相，黑方挺卒，双方稳健开局。',
    keyPoints: [
      '双方稳健',
      '逐步推进',
      '考验耐心',
      '适合初学者'
    ],
    tags: ['开局', '稳健', '推进'],
    source: '象棋布局全书 补充3',
    chapterId: 'ch06',
    chapterNumber: 6,
    moves: [
      { round: 1, red: { notation: '相三进五', note: '飞相' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 2, red: { notation: '兵三进一', note: '挺兵' }, black: { notation: '卒７进１', note: '兑卒' } },
      { round: 3, red: { notation: '相五进三', note: '吃卒' }, black: { notation: '马８进７', note: '跳马' } },
      { round: 4, red: { notation: '相三退五', note: '飞回' }, black: { notation: '炮２平５', note: '架中炮' } }
    ]
  },
  {
    id: '094',
    name: '飞相局 - 对飞象',
    category: 'feixiangju',
    difficulty: 2,
    description: '红方飞相，黑方飞象，对称稳健局面。',
    keyPoints: [
      '双方飞相象',
      '对称局面',
      '非常稳健',
      '考验中局'
    ],
    tags: ['开局', '稳健', '对称'],
    source: '象棋布局全书 补充4',
    chapterId: 'ch06',
    chapterNumber: 6,
    moves: [
      { round: 1, red: { notation: '相三进五', note: '飞相' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '卒３进１', note: '挺卒' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '马８进７', note: '正马' } }
    ]
  },
  {
    id: '095',
    name: '飞相局 - 对起马',
    category: 'feixiangju',
    difficulty: 2,
    description: '红方飞相，黑方起马，灵活开局。',
    keyPoints: [
      '灵活开局',
      '稳步推进',
      '攻守兼备',
      '考验判断'
    ],
    tags: ['开局', '灵活', '稳步'],
    source: '象棋布局全书 补充5',
    chapterId: 'ch06',
    chapterNumber: 6,
    moves: [
      { round: 1, red: { notation: '相三进五', note: '飞相' }, black: { notation: '马２进３', note: '跳马' } },
      { round: 2, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '卒３进１', note: '挺卒' } },
      { round: 3, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '象３进５', note: '飞象' } }
    ]
  },
  {
    id: '096',
    name: '过宫炮 - 对中炮',
    category: 'guoyingju',
    difficulty: 3,
    description: '红方过宫炮，黑方中炮应战，灵活布局。',
    keyPoints: [
      '过宫炮灵活',
      '可攻可守',
      '考验布局',
      '现代流行'
    ],
    tags: ['开局', '现代', '灵活'],
    source: '象棋布局全书 补充6',
    chapterId: 'ch06',
    chapterNumber: 6,
    moves: [
      { round: 1, red: { notation: '炮二平六', note: '过宫炮' }, black: { notation: '炮８平５', note: '中炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '正马' } }
    ]
  },
  {
    id: '097',
    name: '起马局 - 对挺卒',
    category: 'other',
    difficulty: 2,
    description: '红方起马，黑方挺卒，灵活开局。',
    keyPoints: [
      '起马开局',
      '灵活多变',
      '稳步推进',
      '考验判断'
    ],
    tags: ['开局', '灵活', '稳步'],
    source: '象棋布局全书 补充7',
    chapterId: 'ch06',
    chapterNumber: 6,
    moves: [
      { round: 1, red: { notation: '马二进三', note: '起马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 2, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 4, red: { notation: '炮二进二', note: '巡河炮' }, black: { notation: '象３进５', note: '飞象' } }
    ]
  },
  {
    id: '098',
    name: '起马局 - 对中炮',
    category: 'other',
    difficulty: 3,
    description: '红方起马，黑方中炮应战，对攻性强。',
    keyPoints: [
      '起马对中炮',
      '对攻性强',
      '灵活多变',
      '考验计算'
    ],
    tags: ['开局', '对攻', '灵活'],
    source: '象棋布局全书 补充8',
    chapterId: 'ch06',
    chapterNumber: 6,
    moves: [
      { round: 1, red: { notation: '马二进三', note: '起马' }, black: { notation: '炮８平５', note: '中炮' } },
      { round: 2, red: { notation: '马八进七', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '相三进五', note: '飞相' }, black: { notation: '马２进３', note: '正马' } }
    ]
  },
  {
    id: '099',
    name: '上士局 - 对中炮',
    category: 'other',
    difficulty: 2,
    description: '红方上士，黑方中炮，稳健开局。',
    keyPoints: [
      '上士稳健',
      '防守为主',
      '考验中局',
      '适合初学者'
    ],
    tags: ['开局', '稳健', '防守'],
    source: '象棋布局全书 补充9',
    chapterId: 'ch06',
    chapterNumber: 6,
    moves: [
      { round: 1, red: { notation: '士四进五', note: '上士' }, black: { notation: '炮８平５', note: '中炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '相三进五', note: '飞相' }, black: { notation: '马２进３', note: '正马' } }
    ]
  },
  {
    id: '100',
    name: '综合布局 - 复杂飞刀',
    category: 'other',
    difficulty: 4,
    description: '综合布局的复杂飞刀，包含多个陷阱。',
    keyPoints: [
      '复杂飞刀',
      '陷阱重重',
      '一着不慎满盘输',
      '仅适合高手'
    ],
    tags: ['开局', '高级', '陷阱', '飞刀'],
    source: '象棋布局全书 补充10',
    chapterId: 'ch06',
    chapterNumber: 6,
    moves: [
      { round: 1, red: { notation: '相三进五', note: '飞相' }, black: { notation: '炮２平５', note: '中炮' } },
      { round: 2, red: { notation: '炮八平五', note: '架中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '马八进七', note: '正马' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '车九平八', note: '直车' }, black: { notation: '车２进６', note: '过河车' } },
      { round: 5, red: { notation: '炮二进四', note: '进炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 6, red: { notation: '炮二平七', note: '平炮' }, black: { notation: '象３进５', note: '飞象' } }
    ],
    traps: [
      {
        round: 6,
        name: '综合陷阱',
        description: '此局面包含多个陷阱，需要深度计算。',
        warning: '需要精确计算后续变化'
      }
    ]
  }
];
