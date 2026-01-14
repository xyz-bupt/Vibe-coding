// 象棋布局教学应用 - 类型定义

/**
 * 棋子类型
 */
export type PieceType = 'k' | 'a' | 'b' | 'n' | 'r' | 'c' | 'p'; // 将/帅, 士/仕, 象/相, 马, 车, 炮, 兵/卒

/**
 * 棋子颜色
 */
export type PieceColor = 'red' | 'black';

/**
 * 棋子
 */
export interface Piece {
  type: PieceType;
  color: PieceColor;
}

/**
 * 位置坐标
 */
export interface Position {
  x: number; // 0-8
  y: number; // 0-9
}

/**
 * 棋盘状态 (10x9)
 */
export type Board = (Piece | null)[][];

/**
 * 着法
 */
export interface Move {
  round: number;
  red: {
    notation: string; // "炮二平五"
    from?: Position;
    to?: Position;
    note?: string; // 讲解
  };
  black: {
    notation: string; // "马8进7"
    from?: Position;
    to?: Position;
    note?: string; // 讲解
  };
}

/**
 * 陷阱
 */
export interface Trap {
  round: number;
  name: string;
  description: string;
  warning?: string;
}

/**
 * 飞刀
 */
export interface FlyingDagger {
  round: number;
  name: string;
  description: string;
  condition: string;
}

/**
 * 布局分类
 */
export type LayoutCategory =
  | 'shunshunpao' // 顺手炮
  | 'lieshoupao' // 列手炮
  | 'zhongpao_pingfengma' // 中炮对屏风马
  | 'zhongpao_fangongma' // 中炮对反宫马
  | 'xianrenzhilu' // 仙人指路
  | 'feixiangju' // 飞相局
  | 'tijuyin' // 提野局
  | 'guoyingju' // 过宫炮
  | 'other'; // 其他

/**
 * 布局
 */
export interface Layout {
  id: string;
  name: string;
  category: LayoutCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  moves: Move[];
  description: string;
  keyPoints: string[];
  traps?: Trap[];
  flyingDaggers?: FlyingDagger[];
  tags: string[];
  source?: string;
  chapterId?: string;
  chapterNumber?: number;
}

/**
 * 章节
 */
export interface Chapter {
  id: string;
  number: number;
  title: string;
  category: LayoutCategory;
  description: string;
  layoutIds: string[];
}

/**
 * 学习进度
 */
export interface LearningProgress {
  layoutId: string;
  completed: boolean;
  currentMove: number;
  score: number;
  lastStudied: Date;
}

/**
 * 应用状态
 */
export interface AppState {
  // 当前布局
  currentLayout: Layout | null;

  // 棋盘状态
  board: Board;

  // 当前回合
  currentRound: number;

  // 当前轮次（红方/黑方/无）
  currentTurn: 'red' | 'black' | 'none';

  // 最后一步移动（用于动画和高亮）
  lastMove: {
    from: Position;
    to: Position;
    color: PieceColor;
  } | null;

  // 显示设置
  showHints: boolean;
  showTraps: boolean;
  autoPlay: boolean;
  autoPlaySpeed: number;

  // 学习进度
  progress: Record<string, LearningProgress>;

  // 动作
  setCurrentLayout: (layout: Layout) => void;
  makeMove: (round: number) => void;
  makeRedMove: (round: number) => void;
  makeBlackMove: (round: number) => void;
  jumpToRound: (round: number) => void;
  toggleHints: () => void;
  toggleTraps: () => void;
  setAutoPlay: (autoPlay: boolean) => void;
  setAutoPlaySpeed: (speed: number) => void;
  saveProgress: (layoutId: string, progress: Partial<LearningProgress>) => void;
}
