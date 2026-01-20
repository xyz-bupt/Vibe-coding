// 象棋棋盘核心逻辑

import type { Board, Piece, PieceColor, PieceType, Position } from '../types';

/**
 * 初始棋盘布局
 */
export const INITIAL_BOARD: Board = [
  // 黑方 (y=0)
  [
    { type: 'r', color: 'black' },
    { type: 'n', color: 'black' },
    { type: 'b', color: 'black' },
    { type: 'a', color: 'black' },
    { type: 'k', color: 'black' },
    { type: 'a', color: 'black' },
    { type: 'b', color: 'black' },
    { type: 'n', color: 'black' },
    { type: 'r', color: 'black' }
  ],
  [null, null, null, null, null, null, null, null, null],
  [
    null,
    { type: 'c', color: 'black' },
    null,
    null,
    null,
    null,
    null,
    { type: 'c', color: 'black' },
    null
  ],
  [
    { type: 'p', color: 'black' },
    null,
    { type: 'p', color: 'black' },
    null,
    { type: 'p', color: 'black' },
    null,
    { type: 'p', color: 'black' },
    null,
    { type: 'p', color: 'black' }
  ],
  [null, null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null, null],
  [
    { type: 'p', color: 'red' },
    null,
    { type: 'p', color: 'red' },
    null,
    { type: 'p', color: 'red' },
    null,
    { type: 'p', color: 'red' },
    null,
    { type: 'p', color: 'red' }
  ],
  [
    null,
    { type: 'c', color: 'red' },
    null,
    null,
    null,
    null,
    null,
    { type: 'c', color: 'red' },
    null
  ],
  [null, null, null, null, null, null, null, null, null],
  // 红方 (y=9)
  [
    { type: 'r', color: 'red' },
    { type: 'n', color: 'red' },
    { type: 'b', color: 'red' },
    { type: 'a', color: 'red' },
    { type: 'k', color: 'red' },
    { type: 'a', color: 'red' },
    { type: 'b', color: 'red' },
    { type: 'n', color: 'red' },
    { type: 'r', color: 'red' }
  ]
];

/**
 * 创建新棋盘
 */
export function createBoard(): Board {
  return INITIAL_BOARD.map(row => [...row]);
}

/**
 * 克隆棋盘
 */
export function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

/**
 * 获取棋子
 */
export function getPiece(board: Board, pos: Position): Piece | null {
  if (pos.x < 0 || pos.x > 8 || pos.y < 0 || pos.y > 9) {
    return null;
  }
  return board[pos.y][pos.x];
}

/**
 * 设置棋子
 */
export function setPiece(board: Board, pos: Position, piece: Piece | null): Board {
  const newBoard = cloneBoard(board);
  newBoard[pos.y][pos.x] = piece;
  return newBoard;
}

/**
 * 移动棋子
 */
export function movePiece(board: Board, from: Position, to: Position): Board {
  const piece = getPiece(board, from);
  const newBoard = cloneBoard(board);
  newBoard[to.y][to.x] = piece;
  newBoard[from.y][from.x] = null;
  return newBoard;
}

/**
 * 判断是否在九宫格内
 */
export function isInPalace(pos: Position, color: PieceColor): boolean {
  if (color === 'black') {
    return pos.x >= 3 && pos.x <= 5 && pos.y >= 0 && pos.y <= 2;
  } else {
    return pos.x >= 3 && pos.x <= 5 && pos.y >= 7 && pos.y <= 9;
  }
}

/**
 * 判断是否过河
 */
export function isAcrossRiver(pos: Position, color: PieceColor): boolean {
  if (color === 'black') {
    return pos.y > 4;
  } else {
    return pos.y < 5;
  }
}

/**
 * 获取棋子中文名称
 */
export function getPieceName(piece: Piece): string {
  const names: Record<PieceColor, Record<PieceType, string>> = {
    red: {
      k: '帅',
      a: '仕',
      b: '相',
      n: '马',
      r: '车',
      c: '炮',
      p: '兵'
    },
    black: {
      k: '将',
      a: '士',
      b: '象',
      n: '马',
      r: '车',
      c: '炮',
      p: '卒'
    }
  };
  return names[piece.color][piece.type];
}
