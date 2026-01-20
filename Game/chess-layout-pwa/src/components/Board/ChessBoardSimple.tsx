// 简化版棋盘组件 - 用于调试

import React, { useEffect, useRef } from 'react';
import type { Board } from '../../types';

interface SimpleChessBoardProps {
  board: Board;
}

export const ChessBoardSimple: React.FC<SimpleChessBoardProps> = ({ board }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log('ChessBoardSimple渲染, board:', board ? '存在' : '不存在');

    if (!board) {
      console.error('board is null or undefined!');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('No 2d context');
      return;
    }

    console.log('开始绘制简单棋盘');

    try {
      // 绘制背景
      ctx.fillStyle = '#f0d9b5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      console.log('背景绘制完成');

      // 绘制网格
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 2;

      const SPACE_X = 50;
      const SPACE_Y = 50;
      const START_X = 27;
      const START_Y = 27;

      // 横线
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(START_X, START_Y + i * SPACE_Y);
        ctx.lineTo(START_X + 8 * SPACE_X, START_Y + i * SPACE_Y);
        ctx.stroke();
      }

      // 竖线
      for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.moveTo(START_X + i * SPACE_X, START_Y);
        ctx.lineTo(START_X + i * SPACE_X, START_Y + 4 * SPACE_Y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(START_X + i * SPACE_X, START_Y + 5 * SPACE_Y);
        ctx.lineTo(START_X + i * SPACE_X, START_Y + 9 * SPACE_Y);
        ctx.stroke();
      }

      console.log('网格绘制完成');

      // 绘制棋子
      const pieceNames: Record<string, string> = {
        'k-red': '帅', 'k-black': '将',
        'a-red': '仕', 'a-black': '士',
        'b-red': '相', 'b-black': '象',
        'n-red': '马', 'n-black': '马',
        'r-red': '车', 'r-black': '车',
        'c-red': '炮', 'c-black': '炮',
        'p-red': '兵', 'p-black': '卒'
      };

      let pieceCount = 0;
      for (let y = 0; y < 10; y++) {
        for (let x = 0; x < 9; x++) {
          const piece = board[y]?.[x];
          if (piece) {
            pieceCount++;
            const px = START_X + x * SPACE_X;
            const py = START_Y + y * SPACE_Y;

            // 绘制圆形背景
            ctx.beginPath();
            ctx.arc(px, py, 20, 0, Math.PI * 2);
            ctx.fillStyle = piece.color === 'red' ? '#fff5e6' : '#e6e6e6';
            ctx.fill();
            ctx.strokeStyle = piece.color === 'red' ? '#cc0000' : '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 绘制文字
            const key = `${piece.type}-${piece.color}`;
            ctx.fillStyle = piece.color === 'red' ? '#cc0000' : '#000000';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pieceNames[key] || piece.type, px, py);
          }
        }
      }

      console.log(`绘制了 ${pieceCount} 个棋子`);
    } catch (error) {
      console.error('绘制棋盘时出错:', error);
    }
  }, [board]);

  return (
    <div style={{ padding: '10px', background: '#8B4513', borderRadius: '5px' }}>
      <div style={{
        position: 'absolute',
        top: '5px',
        left: '5px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '5px',
        borderRadius: '3px',
        fontSize: '12px',
        zIndex: 1000
      }}>
        <div>简化版棋盘</div>
        <div>棋子数: {board.flat().filter(p => p !== null).length}</div>
      </div>
      <canvas
        ref={canvasRef}
        width={454}
        height={504}
        style={{
          display: 'block',
          background: '#f0d9b5',
          borderRadius: '3px'
        }}
      />
    </div>
  );
};
