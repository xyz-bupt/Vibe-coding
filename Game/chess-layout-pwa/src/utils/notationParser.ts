// 棋谱解析工具 - 修复版

import type { Board, Position } from '../types';

/**
 * 棋谱着法表示
 */
export interface NotationMove {
  notation: string;  // "炮二平五"
  pieceType: string; // c/r/n/b/a/k/p
  fromFile: number; // 1-9 (起始文件)
  toFile: number;   // 1-9 (目标文件或距离)
  direction: '平' | '进' | '退'; // 方向
}

/**
 * 中文数字映射
 */
const CHINESE_NUMERAL_MAP: Record<string, number> = {
  '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
  '六': 6, '七': 7, '八': 8, '九': 9,
  '1': 1, '2': 2, '3': 3, '4': 4, '5': 5,
  '6': 6, '7': 7, '8': 8, '9': 9
};

/**
 * 棋子类型映射
 */
const PIECE_TYPE_MAP: Record<string, string> = {
  '车': 'r', '馬': 'n', '马': 'n', '炮': 'c',
  '相': 'b', '象': 'b', '仕': 'a', '士': 'a',
  '帅': 'k', '将': 'k', '兵': 'p', '卒': 'p',
  'r': 'r', 'n': 'n', 'b': 'b', 'a': 'a',
  'k': 'k', 'c': 'c', 'p': 'p'
};

/**
 * 解析棋谱notation
 */
export function parseNotation(notation: string): NotationMove | null {
  // 预处理：移除空格，统一全角半角数字
  const cleaned = notation
    .trim()
    .replace(/\s+/g, '')
    .replace(/[１２３４５６７８９]/g, c =>
      String.fromCharCode(c.charCodeAt(0) - 0xFEE0)
    );

  // 验证输入不为空
  if (!cleaned || cleaned.length === 0) {
    console.warn('空棋谱输入');
    return null;
  }

  // 简化匹配模式 - 只包含有效的棋子字符
  const piecePattern = '[车馬马炮相象士仕將将帅兵卒cCrnbB]';
  const numPattern = '[一二三四五六七八九123456789]';
  const directionPattern = '[平进退]';

  const regex = new RegExp(
    `^(${piecePattern})(${numPattern})(${directionPattern})(${numPattern})$`
  );

  const match = cleaned.match(regex);
  if (!match) {
    console.warn(`无法解析棋谱: "${notation}" (清理后: "${cleaned}")`);
    return null;
  }

  const [, pieceChar, fromStr, direction, toStr] = match;

  // 验证并映射棋子类型
  const pieceType = PIECE_TYPE_MAP[pieceChar];
  if (!pieceType) {
    console.warn(`无效的棋子类型: "${pieceChar}" 在棋谱 "${notation}" 中`);
    return null;
  }

  // 验证并转换数字
  const fromFile = CHINESE_NUMERAL_MAP[fromStr] ?? parseInt(fromStr);
  const toFile = CHINESE_NUMERAL_MAP[toStr] ?? parseInt(toStr);

  // 验证数字范围
  if (isNaN(fromFile) || isNaN(toFile) || fromFile < 1 || fromFile > 9 || toFile < 1 || toFile > 9) {
    console.warn(`无效的文件号: from=${fromFile}, to=${toFile} 在棋谱 "${notation}" 中`);
    return null;
  }

  // 验证方向
  if (direction !== '平' && direction !== '进' && direction !== '退') {
    console.warn(`无效的方向: "${direction}" 在棋谱 "${notation}" 中`);
    return null;
  }

  return {
    notation: cleaned,
    pieceType,
    fromFile,
    toFile,
    direction: direction as '平' | '进' | '退'
  };
}

/**
 * 坐标转换工具
 */
function toFile(x: number, color: 'red' | 'black'): number {
  // 红方从右到左(1-9)，黑方从左到右(1-9)
  return color === 'red' ? 9 - x : x + 1;
}

function fromX(file: number, color: 'red' | 'black'): number {
  return color === 'red' ? 9 - file : file - 1;
}

/**
 * 根据notation查找棋子位置
 */
export function findPieceByNotation(
  board: Board,
  notation: NotationMove,
  color: 'red' | 'black'
): Position | null {
  const { pieceType, fromFile } = notation;

  // 遍历棋盘寻找匹配的棋子
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 9; x++) {
      const piece = board[y]?.[x];
      if (piece && piece.color === color) {
        const pieceFile = toFile(x, color);

        // 类型匹配
        const typeMatch = piece.type === pieceType;
        if (typeMatch && pieceFile === fromFile) {
          return { x, y };
        }
      }
    }
  }

  return null;
}

/**
 * 计算目标位置
 */
export function calculateTargetPosition(
  board: Board,
  notation: NotationMove,
  from: Position,
  color: 'red' | 'black'
): Position | null {
  const { direction, toFile } = notation;
  const piece = board[from.y]?.[from.x];
  if (!piece) return null;

  // 兵/卒不能后退
  if (piece.type === 'p' && direction === '退') {
    console.warn(`兵卒不能后退: ${notation.notation}`);
    return null;
  }

  let targetX: number | undefined;
  let targetY: number | undefined;

  if (direction === '平') {
    // 平移：X变化，Y不变
    targetX = fromX(toFile, color);
    targetY = from.y;

    // 兵/卒平移时需要检查是否已过河
    if (piece.type === 'p') {
      const hasCrossedRiver = color === 'red' ? from.y <= 4 : from.y >= 5;
      if (!hasCrossedRiver) {
        console.warn(`兵卒未过河不能平移: ${notation.notation}`);
        return null;
      }
    }
  } else {
    // 进/退
    const isStraightPiece = ['c', 'r', 'p'].includes(piece.type);
    const isKing = piece.type === 'k';
    const isJumpPiece = ['n', 'b', 'a'].includes(piece.type);

    if (isStraightPiece || isKing) {
      // 车、炮、兵、将/帅：toFile是移动格数
      if (direction === '进') {
        // 红方向前（Y减小），黑方向前（Y增加）
        targetY = color === 'red' ? from.y - toFile : from.y + toFile;
      } else { // '退'
        // 红方向后退（Y增加），黑方后退（Y减小）
        targetY = color === 'red' ? from.y + toFile : from.y - toFile;
      }
      targetX = from.x;
    } else if (isJumpPiece) {
      // 马、士、象：toFile是目标列号
      targetX = fromX(toFile, color);

      // 根据棋子类型计算Y
      if (piece.type === 'n') {
        // 马走日字
        const dx = Math.abs(targetX - from.x);
        if (dx === 1) {
          // 横向移动1格，纵向移动2格
          targetY = direction === '进'
            ? (color === 'red' ? from.y - 2 : from.y + 2)
            : (color === 'red' ? from.y + 2 : from.y - 2);
        } else {
          // 横向移动2格，纵向移动1格
          targetY = direction === '进'
            ? (color === 'red' ? from.y - 1 : from.y + 1)
            : (color === 'red' ? from.y + 1 : from.y - 1);
        }
      } else if (piece.type === 'a') {
        // 士走斜线1格
        targetY = direction === '进'
          ? (color === 'red' ? from.y - 1 : from.y + 1)
          : (color === 'red' ? from.y + 1 : from.y - 1);
      } else if (piece.type === 'b') {
        // 象走田字2格
        targetY = direction === '进'
          ? (color === 'red' ? from.y - 2 : from.y + 2)
          : (color === 'red' ? from.y + 2 : from.y - 2);
      }
    }
  }

  // 边界检查
  if (targetX === undefined || targetY === undefined) {
    console.warn(`无法计算目标位置: piece=${piece.type}, notation=${notation.notation}`);
    return null;
  }

  if (targetX < 0 || targetX > 8 || targetY < 0 || targetY > 9) {
    return null;
  }

  return { x: targetX, y: targetY };
}

/**
 * 执行棋谱走棋
 */
export function applyNotationMove(
  board: Board,
  notation: string,
  color: 'red' | 'black'
): Board | null {
  const parsed = parseNotation(notation);
  if (!parsed) {
    console.warn(`无法解析棋谱: ${notation}`);
    return null;
  }

  const from = findPieceByNotation(board, parsed, color);
  if (!from) {
    console.warn(`找不到棋子: ${notation}`);
    return null;
  }

  const to = calculateTargetPosition(board, parsed, from, color);
  if (!to) {
    console.warn(`无效目标位置: ${notation}`);
    return null;
  }

  // 创建新棋盘
  const newBoard = board.map(row => [...row]);

  // 移动棋子
  newBoard[to.y][to.x] = newBoard[from.y][from.x];
  newBoard[from.y][from.x] = null;

  return newBoard;
}

/**
 * 执行整个回合的走棋（红方和黑方）
 */
export function applyRoundMoves(
  board: Board,
  redNotation: string,
  blackNotation: string
): Board | null {
  // 先执行红方走棋
  let newBoard = applyNotationMove(board, redNotation, 'red');
  if (!newBoard) {
    console.warn(`红方走棋失败: ${redNotation}`);
    return null;
  }

  // 再执行黑方走棋
  newBoard = applyNotationMove(newBoard, blackNotation, 'black');
  if (!newBoard) {
    console.warn(`黑方走棋失败: ${blackNotation}`);
    return null;
  }

  return newBoard;
}
