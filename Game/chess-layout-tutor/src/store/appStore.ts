// 应用状态管理

import { create } from 'zustand';
import type { AppState, Layout, LearningProgress } from '../types';
import { createBoard } from '../core/board';
import { applyNotationMove, findPieceByNotation } from '../utils/notationParser';

/**
 * 应用状态 Store
 */
export const useAppStore = create<AppState>((set, get) => ({
  // 初始状态
  currentLayout: null,
  board: createBoard(),
  currentRound: 0,
  currentTurn: 'none',
  lastMove: null,
  showHints: true,
  showTraps: true,
  autoPlay: false,
  autoPlaySpeed: 2000, // 2秒
  progress: {},

  // 设置当前布局
  setCurrentLayout: (layout: Layout) => {
    set({
      currentLayout: layout,
      board: createBoard(),
      currentRound: 0,
      currentTurn: 'none',
      lastMove: null,
      autoPlay: false
    });
  },

  // 执行红方走棋
  makeRedMove: (round: number) => {
    const { currentLayout, board } = get();
    if (!currentLayout || round === 0 || round > currentLayout.moves.length) return;

    const move = currentLayout.moves[round - 1];
    const result = applyNotationMove(board, move.red.notation, 'red');

    if (result) {
      // 计算移动位置用于高亮
      const fromPos = findPieceByNotation(board, { notation: move.red.notation, pieceType: '', fromFile: 0, toFile: 0, direction: '平' }, 'red');
      const toPos = findPieceByNotation(result, { notation: move.red.notation, pieceType: '', fromFile: 0, toFile: 0, direction: '平' }, 'red');

      set({
        board: result,
        currentTurn: 'red', // 红方刚走完，等待黑方走
        lastMove: (fromPos && toPos) ? { from: fromPos, to: toPos, color: 'red' } : null
      });
    } else {
      console.warn(`红方第${round}回合走棋失败:`, move.red.notation);
    }
  },

  // 执行黑方走棋
  makeBlackMove: (round: number) => {
    const { currentLayout, board } = get();
    if (!currentLayout || round === 0 || round > currentLayout.moves.length) return;

    const move = currentLayout.moves[round - 1];
    const result = applyNotationMove(board, move.black.notation, 'black');

    if (result) {
      // 计算移动位置用于高亮
      const fromPos = findPieceByNotation(board, { notation: move.black.notation, pieceType: '', fromFile: 0, toFile: 0, direction: '平' }, 'black');
      const toPos = findPieceByNotation(result, { notation: move.black.notation, pieceType: '', fromFile: 0, toFile: 0, direction: '平' }, 'black');

      set({
        board: result,
        currentTurn: 'none',
        currentRound: round,
        lastMove: (fromPos && toPos) ? { from: fromPos, to: toPos, color: 'black' } : null
      });
    } else {
      console.warn(`黑方第${round}回合走棋失败:`, move.black.notation);
    }
  },

  // 走到指定回合（旧方法，保持兼容性）
  makeMove: (round: number) => {
    const { currentLayout } = get();
    if (!currentLayout) return;

    if (round < 0 || round > currentLayout.moves.length) return;

    // 从初始棋盘开始，逐步应用棋谱
    let newBoard = createBoard();

    for (let i = 0; i < round; i++) {
      const move = currentLayout.moves[i];

      // 先执行红方
      let redResult = applyNotationMove(newBoard, move.red.notation, 'red');
      if (!redResult) {
        console.warn(`第${i + 1}回合红方走棋失败:`, move);
        break;
      }
      newBoard = redResult;

      // 再执行黑方
      let blackResult = applyNotationMove(newBoard, move.black.notation, 'black');
      if (!blackResult) {
        console.warn(`第${i + 1}回合黑方走棋失败:`, move);
        break;
      }
      newBoard = blackResult;
    }

    set({
      board: newBoard,
      currentRound: round,
      currentTurn: 'none'
    });
  },

  // 跳转到指定回合
  jumpToRound: (round: number) => {
    const { makeMove } = get();
    makeMove(round);
  },

  // 切换提示显示
  toggleHints: () => {
    set(state => ({ showHints: !state.showHints }));
  },

  // 切换陷阱显示
  toggleTraps: () => {
    set(state => ({ showTraps: !state.showTraps }));
  },

  // 设置自动播放
  setAutoPlay: (autoPlay: boolean) => {
    set({ autoPlay });
  },

  // 设置自动播放速度
  setAutoPlaySpeed: (speed: number) => {
    set({ autoPlaySpeed: speed });
  },

  // 保存学习进度
  saveProgress: (layoutId: string, progress: Partial<LearningProgress>) => {
    set(state => ({
      progress: {
        ...state.progress,
        [layoutId]: {
          layoutId,
          completed: state.progress[layoutId]?.completed ?? false,
          currentMove: state.progress[layoutId]?.currentMove ?? 0,
          score: state.progress[layoutId]?.score ?? 0,
          lastStudied: new Date(),
          ...progress
        }
      }
    }));
  }
}));
