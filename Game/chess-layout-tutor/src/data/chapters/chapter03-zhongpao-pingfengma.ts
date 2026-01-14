// 第三章：中炮对屏风马布局 (20局)

import type { Layout } from '../../types';

export const CHAPTER_03_LAYOUTS: Layout[] = [
  {
    id: '036',
    name: '中炮对屏风马 - 急进中兵',
    category: 'zhongpao_pingfengma',
    difficulty: 3,
    description: '红方急进中兵，从中路发起猛攻，黑方屏风马稳固防守。',
    keyPoints: [
      '红方从中路进攻',
      '黑方屏风马防守稳健',
      '攻守兼备的经典布局',
      '考验双方攻防能力'
    ],
    tags: ['开局', '攻防', '经典'],
    source: '象棋布局全书 第71局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '架中炮' }, black: { notation: '马８进７', note: '跳马' } },
      { round: 2, red: { notation: '马二进三', note: '出马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '出车' }, black: { notation: '车９平８', note: '出车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '兵五进一', note: '急进中兵' }, black: { notation: '士４进５', note: '巩固防守' } }
    ],
    traps: []
  },
  {
    id: '037',
    name: '中炮对屏风马 - 左马盘河',
    category: 'zhongpao_pingfengma',
    difficulty: 4,
    description: '黑方左马盘河，反击力强，是现代象棋的重要布局。',
    keyPoints: [
      '黑方马跃河头',
      '反击力强，威胁大',
      '红方需要稳妥应对',
      '高水平对局常见'
    ],
    tags: ['开局', '反击', '现代', '复杂'],
    source: '象棋布局全书 第72局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '兵七进一', note: '挺兵' }, black: { notation: '马７进６', note: '左马盘河' } },
      { round: 6, red: { notation: '马八进七', note: '正马' }, black: { notation: '象３进５', note: '飞象' } }
    ],
    traps: [
      {
        round: 5,
        name: '盘河马反击',
        description: '黑方左马盘河，威胁红方过河车，红方需要谨慎处理。',
        warning: '注意车的安全'
      }
    ]
  },
  {
    id: '038',
    name: '中炮对屏风马 - 平炮兑车',
    category: 'zhongpao_pingfengma',
    difficulty: 3,
    description: '黑方平炮兑车，缓解红方压力，是稳健的应对方式。',
    keyPoints: [
      '黑方主动兑车',
      '减轻局面压力',
      '稳健不失反击',
      '平衡性很好'
    ],
    tags: ['开局', '稳健', '平衡'],
    source: '象棋布局全书 第73局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '兵七进一', note: '挺兵' }, black: { notation: '炮８平９', note: '平炮兑车' } }
    ],
    traps: []
  },
  {
    id: '039',
    name: '中炮对屏风马 - 进七兵',
    category: 'zhongpao_pingfengma',
    difficulty: 2,
    description: '红方挺七路兵，活通马路，稳健的进攻方式。',
    keyPoints: [
      '挺七兵活马',
      '稳健布局',
      '逐步推进',
      '攻守平衡'
    ],
    tags: ['开局', '稳健', '平衡'],
    source: '象棋布局全书 第74局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 6, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '炮２进２', note: '巡河炮' } }
    ]
  },
  {
    id: '040',
    name: '中炮对屏风马 - 巡河炮',
    category: 'zhongpao_pingfengma',
    difficulty: 3,
    description: '红方巡河炮，稳健中暗藏杀机，可左右调动。',
    keyPoints: [
      '巡河炮灵活',
      '可左右调动',
      '稳健不失攻击',
      '现代流行'
    ],
    tags: ['开局', '稳健', '灵活'],
    source: '象棋布局全书 第75局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 6, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '卒７进１', note: '兑卒' } }
    ]
  },
  {
    id: '041',
    name: '中炮对屏风马 - 五九炮',
    category: 'zhongpao_pingfengma',
    difficulty: 3,
    description: '红方五九炮阵势，灵活多变，攻守兼备。',
    keyPoints: [
      '五九炮阵势',
      '灵活多变',
      '攻守兼备',
      '现代流行'
    ],
    tags: ['开局', '现代', '灵活'],
    source: '象棋布局全书 第76局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '炮８平９', note: '平炮兑车' } },
      { round: 6, red: { notation: '车二平三', note: '避兑' }, black: { notation: '炮９退１', note: '退炮' } },
      { round: 7, red: { notation: '马八进七', note: '正马' }, black: { notation: '士４进５', note: '补士' } },
      { round: 8, red: { notation: '炮八平九', note: '平炮（五九炮）' }, black: { notation: '炮９平７', note: '平炮打车' } }
    ],
    traps: [
      {
        round: 8,
        name: '打车陷阱',
        description: '黑方平炮打车，红方需要妥善处理。',
        warning: '注意车的安全'
      }
    ]
  },
  {
    id: '042',
    name: '中炮对屏风马 - 挺三兵',
    category: 'zhongpao_pingfengma',
    difficulty: 2,
    description: '红方挺三路兵，与挺七兵类似，方向相反。',
    keyPoints: [
      '挺三兵活马',
      '与挺七兵类似',
      '方向不同',
      '根据情况选择'
    ],
    tags: ['开局', '稳健', '选择'],
    source: '象棋布局全书 第77局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 6, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '卒３进１', note: '挺卒' } }
    ]
  },
  {
    id: '043',
    name: '中炮对屏风马 - 横车占肋',
    category: 'zhongpao_pingfengma',
    difficulty: 3,
    description: '红方出横车占肋道，控制要道。',
    keyPoints: [
      '横车占肋',
      '控制要道',
      '攻守兼备',
      '灵活多变'
    ],
    tags: ['开局', '控制', '灵活'],
    source: '象棋布局全书 第78局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一进一', note: '横车' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 4, red: { notation: '车一平六', note: '占肋道' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '士４进５', note: '补士' } },
      { round: 6, red: { notation: '兵五进一', note: '挺中兵' }, black: { notation: '车１平４', note: '兑车' } }
    ]
  },
  {
    id: '044',
    name: '中炮对屏风马 - 进车卒林',
    category: 'zhongpao_pingfengma',
    difficulty: 4,
    description: '红方车进卒林，压制黑方，积极主动。',
    keyPoints: [
      '车占卒林',
      '压制力强',
      '积极主动',
      '需要配合'
    ],
    tags: ['开局', '进攻', '压制'],
    source: '象棋布局全书 第79局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '象７进５', note: '飞象' } },
      { round: 6, red: { notation: '车二平三', note: '吃卒压马' }, black: { notation: '炮８进４', note: '进炮反击' } }
    ],
    traps: [
      {
        round: 6,
        name: '进炮反击',
        description: '黑方炮进卒林，准备反击，红方需要谨慎。',
        warning: '注意炮的威胁'
      }
    ]
  },
  {
    id: '045',
    name: '中炮对屏风马 - 双头蛇',
    category: 'zhongpao_pingfengma',
    difficulty: 3,
    description: '红方挺起双兵，形成双头蛇，灵活多变。',
    keyPoints: [
      '挺起双兵',
      '双马灵活',
      '阵型稳固',
      '现代流行'
    ],
    tags: ['开局', '现代', '灵活'],
    source: '象棋布局全书 第80局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 6, red: { notation: '马八进七', note: '正马' }, black: { notation: '炮２进４', note: '进炮' } }
    ],
    traps: [
      {
        round: 6,
        name: '进炮反击',
        description: '黑方炮进兵线，准备夺兵，红方需要防守。',
        warning: '注意保护七兵'
      }
    ]
  },
  {
    id: '046',
    name: '中炮对屏风马 - 飞刀弃马',
    category: 'zhongpao_pingfengma',
    difficulty: 5,
    description: '红方弃马抢攻，危险但威力巨大，仅适合高手。',
    keyPoints: [
      '弃马抢攻',
      '危险但威力大',
      '需要精确计算',
      '仅适合高手'
    ],
    tags: ['开局', '高级', '飞刀', '弃子'],
    source: '象棋布局全书 第81局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '马７进６', note: '盘河马' } },
      { round: 6, red: { notation: '车二平四', note: '捉马' }, black: { notation: '炮８平７', note: '平炮' } },
      { round: 7, red: { notation: '车四退一', note: '吃马（弃子）' }, black: { notation: '炮７进５', note: '炮打马' } }
    ],
    traps: [
      {
        round: 7,
        name: '弃马陷阱',
        description: '红方故意弃马，换取攻势，黑方需要谨慎应对。',
        warning: '需要深度计算'
      }
    ],
    flyingDaggers: [
      {
        round: 7,
        name: '飞刀：弃马十三招',
        description: '红方弃马后，有连续的进攻手段。',
        condition: '如果黑方吃马'
      }
    ]
  },
  {
    id: '047',
    name: '中炮对屏风马 - 补士',
    category: 'zhongpao_pingfengma',
    difficulty: 2,
    description: '红方补士，稳固防守，稳健的布局方式。',
    keyPoints: [
      '补士稳固',
      '防守反击',
      '稳健布局',
      '适合初学者'
    ],
    tags: ['开局', '稳健', '防守'],
    source: '象棋布局全书 第82局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '士四进五', note: '补士' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '象３进５', note: '飞象' } }
    ]
  },
  {
    id: '048',
    name: '中炮对屏风马 - 左炮过河',
    category: 'zhongpao_pingfengma',
    difficulty: 3,
    description: '红方左炮过河，准备夺卒，攻守兼备。',
    keyPoints: [
      '左炮过河',
      '夺卒威胁',
      '攻守兼备',
      '需要精确'
    ],
    tags: ['开局', '复杂', '攻守'],
    source: '象棋布局全书 第83局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '炮八进四', note: '过河炮' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 6, red: { notation: '炮八平七', note: '平炮' }, black: { notation: '车１平２', note: '直车' } }
    ]
  },
  {
    id: '049',
    name: '中炮对屏风马 - 急进过河车',
    category: 'zhongpao_pingfengma',
    difficulty: 4,
    description: '红方急进过河车，压制黑方，积极主动。',
    keyPoints: [
      '急进过河车',
      '压制力强',
      '积极主动',
      '考验实力'
    ],
    tags: ['开局', '进攻', '压制'],
    source: '象棋布局全书 第84局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '车二进六', note: '急进过河车' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '车二平三', note: '吃卒压马' }, black: { notation: '炮８退１', note: '退炮反击' } },
      { round: 6, red: { notation: '车三退一', note: '避退' }, black: { notation: '炮８平７', note: '平炮打车' } }
    ],
    traps: [
      {
        round: 6,
        name: '打车陷阱',
        description: '黑方平炮打车，红方需要妥善处理。',
        warning: '注意车的位置'
      }
    ]
  },
  {
    id: '050',
    name: '中炮对屏风马 - 跳边马',
    category: 'zhongpao_pingfengma',
    difficulty: 3,
    description: '红方跳边马，灵活多变，现代流行布局。',
    keyPoints: [
      '边马灵活',
      '快速出车',
      '现代流行',
      '变化丰富'
    ],
    tags: ['开局', '现代', '灵活'],
    source: '象棋布局全书 第85局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '马八进九', note: '边马' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '炮八平七', note: '平炮' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 6, red: { notation: '车九平八', note: '直车' }, black: { notation: '车１平２', note: '直车' } }
    ]
  },
  {
    id: '051',
    name: '中炮对屏风马 - 飞相局',
    category: 'zhongpao_pingfengma',
    difficulty: 3,
    description: '红方飞相，稳固防守，然后伺机反击。',
    keyPoints: [
      '飞相稳固',
      '防守反击',
      '需要耐心',
      '考验功力'
    ],
    tags: ['开局', '稳健', '反击'],
    source: '象棋布局全书 第86局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '相三进五', note: '飞相' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '象３进５', note: '飞象' } }
    ]
  },
  {
    id: '052',
    name: '中炮对屏风马 - 八炮进二',
    category: 'zhongpao_pingfengma',
    difficulty: 3,
    description: '红方八炮进二，形成不同的进攻路线。',
    keyPoints: [
      '八炮进二',
      '进攻路线不同',
      '灵活多变',
      '考验理解'
    ],
    tags: ['开局', '灵活', '变化'],
    source: '象棋布局全书 第87局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '象７进５', note: '飞象' } },
      { round: 6, red: { notation: '兵三进一', note: '挺三兵' }, black: { notation: '卒７进１', note: '兑卒' } }
    ]
  },
  {
    id: '053',
    name: '中炮对屏风马 - 边炮对左马',
    category: 'zhongpao_pingfengma',
    difficulty: 4,
    description: '双方采用非标准阵势，变化复杂。',
    keyPoints: [
      '非标准阵势',
      '变化复杂',
      '考验计算',
      '适合高手'
    ],
    tags: ['开局', '复杂', '高级'],
    source: '象棋布局全书 第88局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '车９平８', note: '直车' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 4, red: { notation: '炮八平九', note: '边炮' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '车九平八', note: '直车' }, black: { notation: '炮２进２', note: '巡河炮' } }
    ]
  },
  {
    id: '054',
    name: '中炮对屏风马 - 复杂变着',
    category: 'zhongpao_pingfengma',
    difficulty: 5,
    description: '中炮对屏风马的复杂变着，包含多个陷阱和飞刀。',
    keyPoints: [
      '复杂变着',
      '陷阱重重',
      '一着不慎满盘输',
      '仅适合高手'
    ],
    tags: ['开局', '高级', '陷阱', '飞刀'],
    source: '象棋布局全书 第90局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '马７进６', note: '盘河马' } },
      { round: 6, red: { notation: '车二平四', note: '捉马' }, black: { notation: '炮８平７', note: '平炮' } },
      { round: 7, red: { notation: '车四退一', note: '吃马' }, black: { notation: '炮７进５', note: '炮打马' } },
      { round: 8, red: { notation: '马八进七', note: '跳马' }, black: { notation: '车８进８', note: '进车' } }
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
    id: '055',
    name: '中炮对屏风马 - 经典防守',
    category: 'zhongpao_pingfengma',
    difficulty: 2,
    description: '黑方采用经典的屏风马防守，稳健可靠。',
    keyPoints: [
      '经典屏风马',
      '防守稳健',
      '反击有力',
      '适合初学者'
    ],
    tags: ['开局', '经典', '稳健'],
    source: '象棋布局全书 第91局',
    chapterId: 'ch03',
    chapterNumber: 3,
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '马八进七', note: '正马' }, black: { notation: '象３进５', note: '飞象' } },
      { round: 6, red: { notation: '兵七进一', note: '挺七兵' }, black: { notation: '士４进５', note: '补士' } }
    ]
  }
];
