// 更多布局示例（从PDF提取）

import type { Layout } from '../types';

/**
 * 扩展布局数据
 */
export const EXTENDED_LAYOUTS: Layout[] = [
  // 从PDF第6-10页提取的顺手炮布局
  {
    id: '006',
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
    id: '007',
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
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '炮８平５', note: '顺手炮' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '马８进７', note: '正马' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９进１', note: '横车' } },
      { round: 4, red: { notation: '马八进七', note: '正马' }, black: { notation: '车９平４', note: '占肋道' } },
      { round: 5, red: { notation: '炮八进二', note: '巡河炮' }, black: { notation: '车４进３', note: '骑河' } }
    ]
  },
  // 从PDF第51页开始的列手炮布局
  {
    id: '008',
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
  // 中炮对屏风马布局
  {
    id: '009',
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
    id: '010',
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
    moves: [
      { round: 1, red: { notation: '炮二平五', note: '中炮' }, black: { notation: '马８进７', note: '正马' } },
      { round: 2, red: { notation: '马二进三', note: '正马' }, black: { notation: '卒７进１', note: '挺卒' } },
      { round: 3, red: { notation: '车一平二', note: '直车' }, black: { notation: '车９平８', note: '直车' } },
      { round: 4, red: { notation: '车二进六', note: '过河车' }, black: { notation: '马２进３', note: '屏风马' } },
      { round: 5, red: { notation: '兵七进一', note: '挺兵' }, black: { notation: '炮８平９', note: '平炮兑车' } }
    ],
    traps: []
  },
  // 仙人指路布局
  {
    id: '011',
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
    id: '012',
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
    source: '象棋布局全书 补充',
    moves: [
      { round: 1, red: { notation: '相三进五', note: '飞相' }, black: { notation: '炮２平５', note: '中炮' } },
      { round: 2, red: { notation: '炮八平五', note: '架中炮' }, black: { notation: '马２进３', note: '正马' } },
      { round: 3, red: { notation: '马八进七', note: '正马' }, black: { notation: '车１平２', note: '直车' } },
      { round: 4, red: { notation: '车九平八', note: '直车' }, black: { notation: '马８进７', note: '正马' } },
      { round: 5, red: { notation: '兵三进一', note: '挺兵' }, black: { notation: '车２进４', note: '巡河车' } }
    ]
  }
];

export function getAllExtendedLayouts(): Layout[] {
  return EXTENDED_LAYOUTS;
}
