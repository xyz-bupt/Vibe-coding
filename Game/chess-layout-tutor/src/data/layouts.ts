// 象棋布局数据

import type { Layout } from '../types';
import { EXTENDED_LAYOUTS } from './moreLayouts';

/**
 * 示例布局数据（基于PDF第一篇：顺手炮）
 */
const BASE_LAYOUTS: Layout[] = [
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
    moves: [
      {
        round: 1,
        red: {
          notation: '炮二平五',
          note: '架中炮，直接攻击中路，是进攻性最强的开局方式。'
        },
        black: {
          notation: '炮８平５',
          note: '黑方也架中炮，称为顺手炮。对攻性很强，意图与红方展开激烈的对攻。'
        }
      },
      {
        round: 2,
        red: {
          notation: '马二进三',
          note: '跳马保护中兵，同时出子。'
        },
        black: {
          notation: '马８进７',
          note: '跳马保护中卒，正常应对。'
        }
      },
      {
        round: 3,
        red: {
          notation: '车一平二',
          note: '出直车，准备抢占要道。'
        },
        black: {
          notation: '车９进１',
          note: '黑方出横车，意图占肋道。'
        }
      },
      {
        round: 4,
        red: {
          notation: '车二进六',
          note: '红车过河，准备压制黑方。'
        },
        black: {
          notation: '炮２平３',
          note: '黑方平炮，准备亮出车路。'
        }
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
    moves: [
      {
        round: 1,
        red: { notation: '炮二平五', note: '架中炮' },
        black: { notation: '炮８平５', note: '顺手炮应战' }
      },
      {
        round: 2,
        red: { notation: '马二进三', note: '出马' },
        black: { notation: '马８进７', note: '出马' }
      },
      {
        round: 3,
        red: { notation: '车一平二', note: '出车' },
        black: { notation: '车９进１', note: '横车' }
      },
      {
        round: 4,
        red: { notation: '车二进六', note: '过河车急进' },
        black: { notation: '卒３进１', note: '挺卒制马' }
      },
      {
        round: 5,
        red: { notation: '炮八进四', note: '进炮过河，准备夺卒' },
        black: { notation: '象３进５', note: '飞象巩固防守' }
      }
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
    moves: [
      {
        round: 1,
        red: { notation: '炮二平五', note: '架中炮' },
        black: { notation: '炮２平５', note: '列手炮应战' }
      },
      {
        round: 2,
        red: { notation: '马二进三', note: '出马' },
        black: { notation: '马２进３', note: '出马' }
      },
      {
        round: 3,
        red: { notation: '车一平二', note: '出直车' },
        black: { notation: '车１平２', note: '出直车' }
      },
      {
        round: 4,
        red: { notation: '马八进七', note: '跳正马' },
        black: { notation: '马８进９', note: '跳边马' }
      },
      {
        round: 5,
        red: { notation: '炮八进二', note: '巡河炮' },
        black: { notation: '炮８进２', note: '同样巡河炮' }
      }
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
    id: '004',
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
    moves: [
      {
        round: 1,
        red: { notation: '炮二平五', note: '架中炮' },
        black: { notation: '马８进７', note: '跳马' }
      },
      {
        round: 2,
        red: { notation: '马二进三', note: '出马' },
        black: { notation: '卒７进１', note: '挺卒' }
      },
      {
        round: 3,
        red: { notation: '车一平二', note: '出车' },
        black: { notation: '车９平８', note: '出车' }
      },
      {
        round: 4,
        red: { notation: '车二进六', note: '过河车' },
        black: { notation: '马２进３', note: '屏风马' }
      },
      {
        round: 5,
        red: { notation: '兵五进一', note: '急进中兵' },
        black: { notation: '士４进５', note: '巩固防守' }
      }
    ],
    traps: []
  },
  {
    id: '005',
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
    moves: [
      {
        round: 1,
        red: { notation: '炮二平五', note: '中炮' },
        black: { notation: '马２进３', note: '跳马' }
      },
      {
        round: 2,
        red: { notation: '马二进三', note: '出马' },
        black: { notation: '炮８平６', note: '士角炮' }
      },
      {
        round: 3,
        red: { notation: '车一平二', note: '出车' },
        black: { notation: '马８进７', note: '屏风马' }
      },
      {
        round: 4,
        red: { notation: '兵七进一', note: '挺兵' },
        black: { notation: '卒７进１', note: '挺卒' }
      },
      {
        round: 5,
        red: { notation: '炮八进四', note: '进炮过河' },
        black: { notation: '象７进５', note: '飞象' }
      }
    ],
    traps: [
      {
        round: 5,
        name: '炮击双卒',
        description: '红方进炮准备夺卒，黑方需要权衡得失。',
        warning: '注意兵卒平衡'
      }
    ]
  }
];

/**
 * 所有布局数据（基础 + 扩展）
 */
export const ALL_LAYOUTS: Layout[] = [
  ...BASE_LAYOUTS,
  ...EXTENDED_LAYOUTS
];

/**
 * 获取所有布局
 */
export function getAllLayouts(): Layout[] {
  return ALL_LAYOUTS;
}

/**
 * 根据ID获取布局
 */
export function getLayoutById(id: string): Layout | undefined {
  return ALL_LAYOUTS.find(layout => layout.id === id);
}

/**
 * 根据分类获取布局
 */
export function getLayoutsByCategory(category: string): Layout[] {
  return ALL_LAYOUTS.filter(layout => layout.category === category);
}

/**
 * 搜索布局
 */
export function searchLayouts(keyword: string): Layout[] {
  const lowerKeyword = keyword.toLowerCase();
  return ALL_LAYOUTS.filter(
    layout =>
      layout.name.toLowerCase().includes(lowerKeyword) ||
      layout.description.toLowerCase().includes(lowerKeyword) ||
      layout.tags.some(tag => tag.toLowerCase().includes(lowerKeyword))
  );
}
