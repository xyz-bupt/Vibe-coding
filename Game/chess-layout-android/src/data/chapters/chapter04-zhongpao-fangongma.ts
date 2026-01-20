// 第四章：中炮对反宫马布局 (15局)

import type { Layout } from '../../types';

export const CHAPTER_04_LAYOUTS: Layout[] = [
  {
    id: '056',
    name: '中炮对反宫马 - 炮八进四',
    category: 'zhongpao_fangongma',
    difficulty: 3,
    description: '反宫马是应对中炮的重要布局，黑方士角炮配合屏风马。',
    keyPoints: [
      '黑方士角炮限制红马',
      '阵型灵活多变',
      '现代象棋流行布局',
      '需要精确计算'
    ],
    tags: ['开局', '现代', '灵活'],
    source: '象棋布局全书 第101局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '跳马' } },
      { round: 2, red: { notation: '马二进三', note: '出马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一平二', note: '出车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '兵七进一', note: '挺兵' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '炮八进四', note: '进炮过河' }, black: { notation: '象７进５', note: '飞象' } }
    ],
    traps: [
      {
        round: 5,
        name: '炮击双卒',
        description: '红方进炮准备夺卒，黑方需要权衡得失。',
        warning: '注意兵卒平衡'
      }
    ]
  },
  {
    id: '057',
    name: '中炮对反宫马 - 进七兵',
    category: 'zhongpao_fangongma',
    difficulty: 2,
    description: '红方挺七路兵，活通马路，稳健进攻。',
    keyPoints: [
      '挺七兵活马',
      '稳健布局',
      '逐步推进',
      '攻守平衡'
    ],
    tags: ['开局', '稳健', '平衡'],
    source: '象棋布局全书 第102局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '象３进５', note: '飞象' } }
    ]
  },
  {
    id: '058',
    name: '中炮对反宫马 - 巡河炮',
    category: 'zhongpao_fangongma',
    difficulty: 3,
    description: '红方巡河炮，稳健灵活，可左右调动。',
    keyPoints: [
      '巡河炮灵活',
      '可左右调动',
      '稳健不失攻击',
      '现代流行'
    ],
    tags: ['开局', '稳健', '灵活'],
    source: '象棋布局全书 第103局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '象３进５', note: '飞象' } }
    ]
  },
  {
    id: '059',
    name: '中炮对反宫马 - 横车占肋',
    category: 'zhongpao_fangongma',
    difficulty: 3,
    description: '红方出横车占肋道，控制要道。',
    keyPoints: [
      '横车占肋',
      '控制要道',
      '攻守兼备',
      '灵活多变'
    ],
    tags: ['开局', '控制', '灵活'],
    source: '象棋布局全书 第104局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一进一', note: '横车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '车一平七', note: '占七路' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '士４进５', note: '补士' } }
    ]
  },
  {
    id: '060',
    name: '中炮对反宫马 - 进车卒林',
    category: 'zhongpao_fangongma',
    difficulty: 4,
    description: '红方车进卒林，压制黑方，积极主动。',
    keyPoints: [
      '车占卒林',
      '压制力强',
      '积极主动',
      '需要配合'
    ],
    tags: ['开局', '进攻', '压制'],
    source: '象棋布局全书 第105局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '车二平三', note: '吃卒压马' }, black: { notation: '炮６退１', note: '退炮' } }
    ]
  },
  {
    id: '061',
    name: '中炮对反宫马 - 五九炮',
    category: 'zhongpao_fangongma',
    difficulty: 3,
    description: '红方五九炮阵势，灵活多变，攻守兼备。',
    keyPoints: [
      '五九炮阵势',
      '灵活多变',
      '攻守兼备',
      '现代流行'
    ],
    tags: ['开局', '现代', '灵活'],
    source: '象棋布局全书 第106局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '炮八平九', note: '平炮' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 6, red: { notation: '车九平八', note: '直车' }, black: { notation: '车１平２', note: '直车' } }
    ]
  },
  {
    id: '062',
    name: '中炮对反宫马 - 挺三兵',
    category: 'zhongpao_fangongma',
    difficulty: 2,
    description: '红方挺三路兵，活通马路，稳健进攻。',
    keyPoints: [
      '挺三兵活马',
      '稳健布局',
      '逐步推进',
      '攻守平衡'
    ],
    tags: ['开局', '稳健', '平衡'],
    source: '象棋布局全书 第107局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '象３进５', note: '飞象' } }
    ]
  },
  {
    id: '063',
    name: '中炮对反宫马 - 补士',
    category: 'zhongpao_fangongma',
    difficulty: 2,
    description: '红方补士，稳固防守，稳健布局。',
    keyPoints: [
      '补士稳固',
      '防守反击',
      '稳健布局',
      '适合初学者'
    ],
    tags: ['开局', '稳健', '防守'],
    source: '象棋布局全书 第108局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '士四进五', note: '补士' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '象３进５', note: '飞象' } }
    ]
  },
  {
    id: '064',
    name: '中炮对反宫马 - 跳边马',
    category: 'zhongpao_fangongma',
    difficulty: 3,
    description: '红方跳边马，灵活多变，现代流行。',
    keyPoints: [
      '边马灵活',
      '快速出车',
      '现代流行',
      '变化丰富'
    ],
    tags: ['开局', '现代', '灵活'],
    source: '象棋布局全书 第109局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '马八进九', note: '边马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '炮八平七', note: '平炮' }, black: { notation: '象３进５', note: '飞象' } }
    ]
  },
  {
    id: '065',
    name: '中炮对反宫马 - 飞相局',
    category: 'zhongpao_fangongma',
    difficulty: 3,
    description: '红方飞相，稳固防守，然后伺机反击。',
    keyPoints: [
      '飞相稳固',
      '防守反击',
      '需要耐心',
      '考验功力'
    ],
    tags: ['开局', '稳健', '反击'],
    source: '象棋布局全书 第110局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '相三进五', note: '飞相' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '象３进５', note: '飞象' } }
    ]
  },
  {
    id: '066',
    name: '中炮对反宫马 - 左炮过河',
    category: 'zhongpao_fangongma',
    difficulty: 3,
    description: '红方左炮过河，准备夺卒，攻守兼备。',
    keyPoints: [
      '左炮过河',
      '夺卒威胁',
      '攻守兼备',
      '需要精确'
    ],
    tags: ['开局', '复杂', '攻守'],
    source: '象棋布局全书 第111局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '炮八进四', note: '过河炮' }, black: { notation: '象３进５', note: '飞象' } }
    ]
  },
  {
    id: '067',
    name: '中炮对反宫马 - 急进中兵',
    category: 'zhongpao_fangongma',
    difficulty: 4,
    description: '红方急进中兵，从中路发起猛攻。',
    keyPoints: [
      '急进中兵',
      '中路猛攻',
      '攻势凌厉',
      '防守要严密'
    ],
    tags: ['开局', '进攻', '中路'],
    source: '象棋布局全书 第112局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '兵五进一', note: '急进中兵' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '象３进５', note: '飞象' } }
    ]
  },
  {
    id: '068',
    name: '中炮对反宫马 - 进炮打马',
    category: 'zhongpao_fangongma',
    difficulty: 4,
    description: '红方进炮打马，试探黑方应手。',
    keyPoints: [
      '进炮打马',
      '试探应手',
      '灵活多变',
      '考验判断'
    ],
    tags: ['开局', '试探', '灵活'],
    source: '象棋布局全书 第113局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '炮八进四', note: '进炮打马' }, black: { notation: '马７进６', note: '跳马' } }
    ],
    traps: [
      {
        round: 5,
        name: '打马陷阱',
        description: '红方炮打马，黑方跳马避开，红方需要后续手段。',
        warning: '注意后续发展'
      }
    ]
  },
  {
    id: '069',
    name: '中炮对反宫马 - 复杂飞刀',
    category: 'zhongpao_fangongma',
    difficulty: 5,
    description: '中炮对反宫马的复杂变着，包含多个陷阱和飞刀。',
    keyPoints: [
      '复杂变着',
      '陷阱重重',
      '一着不慎满盘输',
      '仅适合高手'
    ],
    tags: ['开局', '高级', '陷阱', '飞刀'],
    source: '象棋布局全书 第115局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '车二进六', note: '过河车' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 6, red: { notation: '车二平三', note: '吃卒压马' }, black: { notation: '炮６退１', note: '退炮' } },
      { round: 7, red: { notation: '马八进七', note: '正马' }, black: { notation: '炮６平７', note: '平炮打车' } },
      { round: 8, red: { notation: '车三平四', note: '避车' }, black: { notation: '车９平８', note: '出车' } }
    ],
    traps: [
      {
        round: 8,
        name: '复杂陷阱',
        description: '此局面包含多个陷阱，需要深度计算。',
        warning: '需要精确计算后续变化'
      }
    ]
  },
  {
    id: '070',
    name: '中炮对反宫马 - 经典防守',
    category: 'zhongpao_fangongma',
    difficulty: 2,
    description: '黑方采用经典的反宫马防守，稳健可靠。',
    keyPoints: [
      '经典反宫马',
      '防守稳健',
      '反击有力',
      '适合初学者'
    ],
    tags: ['开局', '经典', '稳健'],
    source: '象棋布局全书 第116局',
    chapterId: 'ch04',
    chapterNumber: 4,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '炮８平６', note: '士角炮' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '马８进７', note: '屏风马' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 5, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '象３进５', note: '飞象' } }
    ]
  }
];
