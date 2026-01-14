// 第一章：顺手炮布局 (20局)

import type { Layout } from '../../types';

export const CHAPTER_01_LAYOUTS: Layout[] = [
  {
    id: '001',
    name: '顺手炮 - 炮二平五',
    category: 'shunshunpao',
    difficulty: 1,
    description: '顺手炮是最常见的布局之一，双方首着都走中炮，形成对攻局面。',
    keyPoints: [
      '红方架中炮，直接攻击中路',
      '黑方应以中炮，称为顺手炮',
      '对攻性强，变化复杂',
      '适合喜欢进攻的棋手'
    ],
    tags: ['开局', '进攻', '经典'],
    source: '象棋布局全书 第1局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      {
        round: 1,
        red: { notation: '炮二平五', note: '架中炮，直接攻击中路，是进攻性最强的开局方式。' },
        black: { notation: '炮８平５', note: '黑方也架中炮，称为顺手炮。对攻性很强，意图与红方展开激烈的对攻。' }
      },
      {
        round: 2,
        red: { notation: '马二进三', note: '跳马保护中兵，同时出子。' },
        black: { notation: '马８进７', note: '跳马保护中卒，正常应对。' }
      },
      {
        round: 3,
        red: { notation: '车一平二', note: '出直车，准备抢占要道。' },
        black: { notation: '车９进１', note: '黑方出横车，意图占肋道。' }
      },
      {
        round: 4,
        red: { notation: '车二进六', note: '红车过河，准备压制黑方。' },
        black: { notation: '炮２平３', note: '黑方平炮，准备亮出车路。' }
      }
    ],
    traps: [
      {
        round: 4,
        name: '空头炮陷阱',
        description: '红方如果贪吃中卒，可能被黑方利用空头炮反击。',
        warning: '注意：中卒不可轻弃'
      }
    ]
  },
  {
    id: '002',
    name: '顺手炮 - 急进过河车',
    category: 'shunshunpao',
    difficulty: 2,
    description: '红方急进过河车，意图快速压制黑方，但也存在被反击的风险。',
    keyPoints: [
      '红车快速过河，压制力强',
      '黑方需要灵活应对',
      '变化较多，考验双方实力',
      '适合有经验的棋手'
    ],
    tags: ['开局', '进攻', '复杂'],
    source: '象棋布局全书 第2局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '炮８平５', note: '顺手炮应战' } },
      { round: 2, red: { notation: '马二进三', note: '出马' }, black: { notation: '马８进７', note: '出马' } },
      { round: 3, red: { notation: '车一平二', note: '出车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车急进' }, black: { notation: '卒３进１', note: '挺卒制马' } },
      { round: 5, red: { notation: '炮八进四', note: '进炮过河，准备夺卒' }, black: { notation: '象３进５', note: '飞象巩固防守' } }
    ],
    traps: [
      {
        round: 5,
        name: '夺卒陷阱',
        description: '红方进炮意图夺卒，黑方需要谨慎应对，避免失先。',
        warning: '注意保持局面平衡'
      }
    ]
  },
  {
    id: '003',
    name: '顺手炮 - 两头蛇',
    category: 'shunshunpao',
    difficulty: 2,
    description: '红方挺起双兵，形成两头蛇阵势，灵活多变。',
    keyPoints: [
      '红方挺起三、七路兵',
      '双马灵活，阵型稳固',
      '可随时选择进攻方向',
      '是现代象棋流行布局'
    ],
    tags: ['开局', '灵活', '现代'],
    source: '象棋布局全书 第6局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '出马' }, black: { notation: '马８进７', note: '出马' } },
      { round: 3, red: { notation: '车一平二', note: '出车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '兵三进一', note: '挺三路兵' }, black: { notation: '车９平４', note: '车占肋道' } },
      { round: 5, red: { notation: '兵七进一', note: '挺七路兵' }, black: { notation: '车４进３', note: '骑河车' } }
    ],
    traps: [
      {
        round: 5,
        name: '骑河车陷阱',
        description: '黑方车进骑河，准备压制红方兵线，红方需要谨慎应对。',
        warning: '注意保护三、七路兵'
      }
    ]
  },
  {
    id: '004',
    name: '顺手炮 - 横车对直车',
    category: 'shunshunpao',
    difficulty: 2,
    description: '红方出直车，黑方出横车，双方采用不同的出车方式。',
    keyPoints: [
      '直车利于快速出动',
      '横车可占肋道或巡河',
      '各有优势',
      '考验双方的布局理解'
    ],
    tags: ['开局', '经典', '变化'],
    source: '象棋布局全书 第7局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 5, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '车４进３', note: '骑河' } }
    ]
  },
  {
    id: '005',
    name: '顺手炮 - 巡河炮',
    category: 'shunshunpao',
    difficulty: 2,
    description: '红方炮八进二，形成巡河炮阵势，稳健中暗藏杀机。',
    keyPoints: [
      '巡河炮可以左右调动',
      '配合车马进攻',
      '稳健不失攻击性',
      '适合稳健型棋手'
    ],
    tags: ['开局', '稳健', '灵活'],
    source: '象棋布局全书 第8局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 5, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '卒３进１', note: '挺卒' } }
    ]
  },
  {
    id: '006',
    name: '顺手炮 - 进车卒林',
    category: 'shunshunpao',
    difficulty: 3,
    description: '红方车进卒林，压制黑方，是积极主动的进攻方式。',
    keyPoints: [
      '车占卒林，压制力强',
      '可以随时扫卒',
      '黑方需要妥善应对',
      '考验中局实力'
    ],
    tags: ['开局', '进攻', '压制'],
    source: '象棋布局全书 第9局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 5, red: { notation: '车二平三', note: '吃卒压马' }, black: { notation: '马２进３', note: '跳马保护' } },
      { round: 6, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '车４进４', note: '骑河车对捉' } }
    ],
    traps: [
      {
        round: 6,
        name: '骑河车反击',
        description: '黑方车进骑河，捉红炮，化解红方攻势。',
        warning: '注意巡河炮安全'
      }
    ]
  },
  {
    id: '007',
    name: '顺手炮 - 左炮过河',
    category: 'shunshunpao',
    difficulty: 3,
    description: '红方左炮过河，准备夺取双卒，但需要注意防守。',
    keyPoints: [
      '左炮过河，攻守兼备',
      '可以夺取卒林',
      '要注意黑方反击',
      '需要精确计算'
    ],
    tags: ['开局', '复杂', '攻守'],
    source: '象棋布局全书 第10局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '卒３进１', note: '挺卒' } },
      { round: 5, red: { notation: '炮八进四', note: '过河炮' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 6, red: { notation: '马八进七', note: '正马' }, black: { notation: '车４进３', note: '捉炮' } }
    ],
    traps: [
      {
        round: 6,
        name: '捉炮反击',
        description: '黑方车捉红炮，红方需要妥善处理，避免失先。',
        warning: '注意炮的逃路'
      }
    ]
  },
  {
    id: '008',
    name: '顺手炮 - 马后炮',
    category: 'shunshunpao',
    difficulty: 4,
    description: '双方跳马后架中炮，形成经典的马后炮阵势。',
    keyPoints: [
      '马后炮威力强大',
      '中路攻击力强',
      '防守要严密',
      '适合高手对局'
    ],
    tags: ['开局', '经典', '强力'],
    source: '象棋布局全书 第11局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '马二进三', note: '先跳马' }, black: { notation: '马８进７', note: '跳马' } },
      { round: 2, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 3, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 4, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 5, red: { notation: '兵七进一', note: '挺兵' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 6, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '卒３进１', note: '挺卒' } }
    ]
  },
  {
    id: '009',
    name: '顺手炮 - 双横车',
    category: 'shunshunpao',
    difficulty: 2,
    description: '双方都出横车，形成对称局面，变化微妙。',
    keyPoints: [
      '双方都出横车',
      '局面相对对称',
      '细节决定成败',
      '考验布局理解'
    ],
    tags: ['开局', '对称', '微妙'],
    source: '象棋布局全书 第12局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一进一', note: '横车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '车一平六', note: '占肋道' }, black: { notation: '车９平６', note: '占肋道' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '正马' } }
    ]
  },
  {
    id: '010',
    name: '顺手炮 - 进七兵',
    category: 'shunshunpao',
    difficulty: 2,
    description: '红方挺七路兵，开通马路，稳健的进攻方式。',
    keyPoints: [
      '挺七兵活马',
      '稳健的布局',
      '逐步推进',
      '适合稳健型棋手'
    ],
    tags: ['开局', '稳健', '推进'],
    source: '象棋布局全书 第13局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 5, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '马２进３', note: '正马' } },
      { round: 6, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '卒３进１', note: '挺卒' } }
    ]
  },
  {
    id: '011',
    name: '顺手炮 - 进三兵',
    category: 'shunshunpao',
    difficulty: 2,
    description: '红方挺三路兵，与进七兵类似，但方向相反。',
    keyPoints: [
      '挺三兵活马',
      '与进七兵类似',
      '方向不同',
      '根据情况选择'
    ],
    tags: ['开局', '稳健', '选择'],
    source: '象棋布局全书 第14局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 6, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '卒７进１', note: '挺卒' } }
    ]
  },
  {
    id: '012',
    name: '顺手炮 - 跳边马',
    category: 'shunshunpao',
    difficulty: 3,
    description: '红方跳边马，灵活多变，是现代流行的布局。',
    keyPoints: [
      '边马灵活',
      '可以快速出车',
      '现代流行布局',
      '变化丰富'
    ],
    tags: ['开局', '现代', '灵活'],
    source: '象棋布局全书 第15局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '马八进九', note: '边马' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 5, red: { notation: '炮八平七', note: '平炮' }, black: { notation: '马２进１', note: '边马' } },
      { round: 6, red: { notation: '车九平八', note: '直车' }, black: { notation: '车４进３', note: '骑河' } }
    ]
  },
  {
    id: '013',
    name: '顺手炮 - 补士',
    category: 'shunshunpao',
    difficulty: 2,
    description: '红方补士，稳固防守，以静制动。',
    keyPoints: [
      '补士稳固',
      '防守反击',
      '以静制动',
      '稳健应对'
    ],
    tags: ['开局', '稳健', '防守'],
    source: '象棋布局全书 第16局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '士四进五', note: '补士' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 6, red: { notation: '兵七进一', note: '挺兵' }, black: { notation: '卒３进１', note: '挺卒' } }
    ]
  },
  {
    id: '014',
    name: '顺手炮 - 飞相',
    category: 'shunshunpao',
    difficulty: 3,
    description: '红方飞相，稳固防守，然后伺机反击。',
    keyPoints: [
      '飞相稳固',
      '防守反击',
      '需要耐心',
      '考验中局功力'
    ],
    tags: ['开局', '稳健', '反击'],
    source: '象棋布局全书 第17局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '相三进五', note: '飞相' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 6, red: { notation: '兵七进一', note: '挺兵' }, black: { notation: '卒３进１', note: '挺卒' } }
    ]
  },
  {
    id: '015',
    name: '顺手炮 - 进车河沿',
    category: 'shunshunpao',
    difficulty: 3,
    description: '红方车进河沿，控制要道，攻守兼备。',
    keyPoints: [
      '车占河沿',
      '控制要道',
      '攻守兼备',
      '灵活多变'
    ],
    tags: ['开局', '灵活', '控制'],
    source: '象棋布局全书 第18局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '车二进四', note: '进车河沿' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 6, red: { notation: '兵七进一', note: '挺兵' }, black: { notation: '卒３进１', note: '挺卒' } },
      { round: 7, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '车４进３', note: '骑河' } }
    ]
  },
  {
    id: '016',
    name: '顺手炮 - 双车过河',
    category: 'shunshunpao',
    difficulty: 4,
    description: '双方双车过河，形成激烈对攻局面。',
    keyPoints: [
      '双车过河',
      '对攻激烈',
      '变化复杂',
      '考验计算能力'
    ],
    tags: ['开局', '对攻', '激烈', '复杂'],
    source: '象棋布局全书 第19局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 5, red: { notation: '车二平三', note: '吃卒压马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 6, red: { notation: '马八进七', note: '正马' }, black: { notation: '车４进５', note: '过河车' } },
      { round: 7, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '车４平３', note: '捉马' } }
    ],
    traps: [
      {
        round: 7,
        name: '捉马反击',
        description: '黑方车捉红马，红方需要妥善处理，避免失子。',
        warning: '注意保护七路马'
      }
    ]
  },
  {
    id: '017',
    name: '顺手炮 - 炮打中卒',
    category: 'shunshunpao',
    difficulty: 4,
    description: '红方炮打中卒，先手得利，但要注意后续发展。',
    keyPoints: [
      '炮打中卒',
      '得先手',
      '要注意后续',
      '不能贪功冒进'
    ],
    tags: ['开局', '进攻', '得利'],
    source: '象棋布局全书 第20局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 5, red: { notation: '炮八进四', note: '过河炮' }, black: { notation: '卒３进１', note: '挺卒' } },
      { round: 6, red: { notation: '炮八平五', note: '炮打中卒' }, black: { notation: '马７进５', note: '马换炮' } },
      { round: 7, red: { notation: '炮五进四', note: '打马' }, black: { notation: '士４进５', note: '补士' } }
    ],
    traps: [
      {
        round: 7,
        name: '空头炮陷阱',
        description: '红方炮打中卒后，黑方马换炮，红方得卒但失炮，需要评估得失。',
        warning: '注意得失评估'
      }
    ]
  },
  {
    id: '018',
    name: '顺手炮 - 马进七路',
    category: 'shunshunpao',
    difficulty: 2,
    description: '红方马进七路，配合七路兵，形成标准阵势。',
    keyPoints: [
      '马进七路',
      '标准阵势',
      '攻守平衡',
      '适合初学者'
    ],
    tags: ['开局', '标准', '平衡'],
    source: '象棋布局全书 第21局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 5, red: { notation: '兵七进一', note: '挺兵' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 6, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '卒３进１', note: '挺卒' } }
    ]
  },
  {
    id: '019',
    name: '顺手炮 - 车进骑河',
    category: 'shunshunpao',
    difficulty: 3,
    description: '红方车进骑河，压制对方，积极主动的进攻方式。',
    keyPoints: [
      '车进骑河',
      '压制对方',
      '积极主动',
      '需要配合'
    ],
    tags: ['开局', '进攻', '压制'],
    source: '象棋布局全书 第22局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '车二进五', note: '骑河车' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 6, red: { notation: '兵七进一', note: '挺兵' }, black: { notation: '车４进５', note: '过河车' } }
    ]
  },
  {
    id: '020',
    name: '顺手炮 - 变着飞刀',
    category: 'shunshunpao',
    difficulty: 5,
    description: '顺手炮的复杂变着，包含多个陷阱和飞刀，适合高手。',
    keyPoints: [
      '复杂变着',
      '陷阱重重',
      '一着不慎满盘输',
      '仅适合高手'
    ],
    tags: ['开局', '高级', '陷阱', '飞刀'],
    source: '象棋布局全书 第25局',
    chapterId: 'ch01',
    chapterNumber: 1,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 5, red: { notation: '车二平三', note: '吃卒压马' }, black: { notation: '马２进３', note: '正马' } },
      { round: 6, red: { notation: '士四进五', note: '补士' }, black: { notation: '车４进５', note: '过河车' } },
      { round: 7, red: { notation: '马八进七', note: '正马' }, black: { notation: '车４平３', note: '捉马' } },
      { round: 8, red: { notation: '炮八进四', note: '过河炮' }, black: { notation: '卒３进１', note: '挺卒' } }
    ],
    traps: [
      {
        round: 8,
        name: '捉马陷阱',
        description: '黑方车捉马，红方进炮反击，形成复杂对攻。',
        warning: '需要精确计算后续变化'
      }
    ],
    flyingDaggers: [
      {
        round: 7,
        name: '飞刀：弃马',
        description: '红方可以弃马，换取攻势。',
        condition: '如果黑方车吃马'
      }
    ]
  }
];
