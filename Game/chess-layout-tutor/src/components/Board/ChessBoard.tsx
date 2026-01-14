// 象棋棋盘组件 - 修复版

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Board, Piece, Position, PieceColor } from '../../types';
import './ChessBoard.css';

interface ChessBoardProps {
  board: Board;
  highlightedSquares?: Position[];
  showCoordinates?: boolean;
  onSquareClick?: (pos: Position) => void;
  lastMove?: {
    from: Position;
    to: Position;
    color: PieceColor;
  } | null;
}

/**
 * 棋盘尺寸配置
 */
const BOARD_CONFIG = {
  WIDTH: 454,
  HEIGHT: 504,
  SPACE_X: 50,
  SPACE_Y: 50,
  POINT_START_X: 27,
  POINT_START_Y: 27,
  PIECE_SIZE: 44
} as const;

/**
 * 棋盘组件
 */
export const ChessBoard: React.FC<ChessBoardProps> = React.memo(({
  board,
  highlightedSquares = [],
  showCoordinates = true,
  onSquareClick,
  lastMove = null
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());

  console.log('ChessBoard组件渲染, imagesLoaded:', imagesLoaded, 'board pieces count:', board.flat().filter(p => p !== null).length);

  // 预加载所有图片
  useEffect(() => {
    let isMounted = true;

    const imageUrls = [
      '/assets/pieces/bg.png',
      '/assets/pieces/r_c.png', '/assets/pieces/r_m.png', '/assets/pieces/r_x.png',
      '/assets/pieces/r_s.png', '/assets/pieces/r_j.png', '/assets/pieces/r_p.png',
      '/assets/pieces/r_z.png',
      '/assets/pieces/b_c.png', '/assets/pieces/b_m.png', '/assets/pieces/b_x.png',
      '/assets/pieces/b_s.png', '/assets/pieces/b_j.png', '/assets/pieces/b_p.png',
      '/assets/pieces/b_z.png'
    ];

    const loadImages = async () => {
      try {
        console.log('开始加载棋盘图片...');
        const promises = imageUrls.map(url =>
          new Promise<void>((resolve, reject) => {
            // 检查缓存
            if (imageCache.current.has(url)) {
              console.log(`图片已缓存: ${url}`);
              resolve();
              return;
            }

            const img = new Image();
            img.onload = () => {
              console.log(`成功加载: ${url}`);
              imageCache.current.set(url, img);
              resolve();
            };
            img.onerror = () => {
              console.error(`加载失败: ${url}`);
              reject(new Error(`Failed to load image: ${url}`));
            };
            img.src = url;
          })
        );

        await Promise.all(promises);
        console.log('所有图片加载完成');
        if (isMounted) {
          setImagesLoaded(true);
        }
      } catch (error) {
        console.error('图片加载出错:', error);
        // 即使图片加载失败，也继续渲染（使用fallback）
        if (isMounted) {
          setImagesLoaded(true);
        }
      }
    };

    loadImages();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * 获取棋子图片URL
   */
  const getPieceImageUrl = useCallback((piece: Piece): string => {
    const colorPrefix = piece.color === 'red' ? 'r' : 'b';
    const typeMap: Record<string, string> = {
      'k': 'j', // 将/帅
      'a': 's', // 士/仕
      'b': 'x', // 象/相
      'n': 'm', // 马
      'r': 'c', // 车
      'c': 'p', // 炮
      'p': 'z'  // 兵/卒
    };
    return `/assets/pieces/${colorPrefix}_${typeMap[piece.type]}.png`;
  }, []);

  /**
   * 绘制棋盘
   */
  useEffect(() => {
    console.log('useEffect触发, imagesLoaded:', imagesLoaded);

    if (!imagesLoaded) {
      console.log('图片未加载，跳过绘制');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    console.log('Canvas element found:', canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2d context');
      return;
    }

    console.log('Canvas 2d context obtained, canvas size:', canvas.width, 'x', canvas.height);

    try {
      // 清空画布
      ctx.clearRect(0, 0, BOARD_CONFIG.WIDTH, BOARD_CONFIG.HEIGHT);
      console.log('画布已清空');

      // 绘制背景
      const bgImg = imageCache.current.get('/assets/pieces/bg.png');
      console.log('背景图片:', bgImg ? '存在' : '不存在');

      if (bgImg && bgImg.complete && bgImg.naturalWidth > 0) {
        ctx.drawImage(bgImg, 0, 0, BOARD_CONFIG.WIDTH, BOARD_CONFIG.HEIGHT);
        console.log('使用背景图片');
      } else {
        // Fallback: 绘制纯色背景
        ctx.fillStyle = '#f0d9b5';
        ctx.fillRect(0, 0, BOARD_CONFIG.WIDTH, BOARD_CONFIG.HEIGHT);
        console.log('使用fallback背景色');
      }

      // 绘制棋盘线条
      console.log('开始绘制棋盘线条');
      drawBoardLines(ctx);

      // 绘制高亮
      highlightedSquares.forEach(pos => {
        drawHighlight(ctx, pos);
      });

      // 绘制最后一步移动的高亮
      if (lastMove) {
        drawMoveHighlight(ctx, lastMove);
      }

      // 绘制棋子
      console.log('开始绘制棋子');
      drawPieces(ctx);

      console.log('棋盘绘制完成');
    } catch (error) {
      console.error('绘制过程中出错:', error);
    }
  }, [board, highlightedSquares, imagesLoaded, lastMove]);

  /**
   * 绘制棋盘线条
   */
  const drawBoardLines = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 2;

    // 绘制横线
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.moveTo(BOARD_CONFIG.POINT_START_X, BOARD_CONFIG.POINT_START_Y + i * BOARD_CONFIG.SPACE_Y);
      ctx.lineTo(BOARD_CONFIG.POINT_START_X + 8 * BOARD_CONFIG.SPACE_X, BOARD_CONFIG.POINT_START_Y + i * BOARD_CONFIG.SPACE_Y);
      ctx.stroke();
    }

    // 绘制竖线（上半部分）
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.moveTo(BOARD_CONFIG.POINT_START_X + i * BOARD_CONFIG.SPACE_X, BOARD_CONFIG.POINT_START_Y);
      ctx.lineTo(BOARD_CONFIG.POINT_START_X + i * BOARD_CONFIG.SPACE_X, BOARD_CONFIG.POINT_START_Y + 4 * BOARD_CONFIG.SPACE_Y);
      ctx.stroke();
    }

    // 绘制竖线（下半部分）
    for (let i = 0; i < 9; i++) {
      ctx.beginPath();
      ctx.moveTo(BOARD_CONFIG.POINT_START_X + i * BOARD_CONFIG.SPACE_X, BOARD_CONFIG.POINT_START_Y + 5 * BOARD_CONFIG.SPACE_Y);
      ctx.lineTo(BOARD_CONFIG.POINT_START_X + i * BOARD_CONFIG.SPACE_X, BOARD_CONFIG.POINT_START_Y + 9 * BOARD_CONFIG.SPACE_Y);
      ctx.stroke();
    }

    // 绘制九宫格斜线（黑方）
    ctx.beginPath();
    ctx.moveTo(BOARD_CONFIG.POINT_START_X + 3 * BOARD_CONFIG.SPACE_X, BOARD_CONFIG.POINT_START_Y);
    ctx.lineTo(BOARD_CONFIG.POINT_START_X + 5 * BOARD_CONFIG.SPACE_X, BOARD_CONFIG.POINT_START_Y + 2 * BOARD_CONFIG.SPACE_Y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(BOARD_CONFIG.POINT_START_X + 5 * BOARD_CONFIG.SPACE_X, BOARD_CONFIG.POINT_START_Y);
    ctx.lineTo(BOARD_CONFIG.POINT_START_X + 3 * BOARD_CONFIG.SPACE_X, BOARD_CONFIG.POINT_START_Y + 2 * BOARD_CONFIG.SPACE_Y);
    ctx.stroke();

    // 绘制九宫格斜线（红方）
    ctx.beginPath();
    ctx.moveTo(BOARD_CONFIG.POINT_START_X + 3 * BOARD_CONFIG.SPACE_X, BOARD_CONFIG.POINT_START_Y + 7 * BOARD_CONFIG.SPACE_Y);
    ctx.lineTo(BOARD_CONFIG.POINT_START_X + 5 * BOARD_CONFIG.SPACE_X, BOARD_CONFIG.POINT_START_Y + 9 * BOARD_CONFIG.SPACE_Y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(BOARD_CONFIG.POINT_START_X + 5 * BOARD_CONFIG.SPACE_X, BOARD_CONFIG.POINT_START_Y + 7 * BOARD_CONFIG.SPACE_Y);
    ctx.lineTo(BOARD_CONFIG.POINT_START_X + 3 * BOARD_CONFIG.SPACE_X, BOARD_CONFIG.POINT_START_Y + 9 * BOARD_CONFIG.SPACE_Y);
    ctx.stroke();
  }, []);

  /**
   * 绘制高亮
   */
  const drawHighlight = useCallback((ctx: CanvasRenderingContext2D, pos: Position) => {
    const x = BOARD_CONFIG.POINT_START_X + pos.x * BOARD_CONFIG.SPACE_X;
    const y = BOARD_CONFIG.POINT_START_Y + pos.y * BOARD_CONFIG.SPACE_Y;

    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    ctx.fillRect(x - BOARD_CONFIG.SPACE_X / 2, y - BOARD_CONFIG.SPACE_Y / 2, BOARD_CONFIG.SPACE_X, BOARD_CONFIG.SPACE_Y);
  }, []);

  /**
   * 绘制移动高亮（最后一步）
   */
  const drawMoveHighlight = useCallback((ctx: CanvasRenderingContext2D, move: { from: Position; to: Position; color: PieceColor }) => {
    const fromX = BOARD_CONFIG.POINT_START_X + move.from.x * BOARD_CONFIG.SPACE_X;
    const fromY = BOARD_CONFIG.POINT_START_Y + move.from.y * BOARD_CONFIG.SPACE_Y;
    const toX = BOARD_CONFIG.POINT_START_X + move.to.x * BOARD_CONFIG.SPACE_X;
    const toY = BOARD_CONFIG.POINT_START_Y + move.to.y * BOARD_CONFIG.SPACE_Y;

    // 颜色根据移动方确定
    const highlightColor = move.color === 'red' ? '#ff0000' : '#000000';

    // 绘制源位置高亮（半透明）
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = highlightColor;
    ctx.fillRect(
      fromX - BOARD_CONFIG.SPACE_X / 2,
      fromY - BOARD_CONFIG.SPACE_Y / 2,
      BOARD_CONFIG.SPACE_X,
      BOARD_CONFIG.SPACE_Y
    );
    ctx.restore();

    // 绘制目标位置高亮（更明显）
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = highlightColor;
    ctx.fillRect(
      toX - BOARD_CONFIG.SPACE_X / 2,
      toY - BOARD_CONFIG.SPACE_Y / 2,
      BOARD_CONFIG.SPACE_X,
      BOARD_CONFIG.SPACE_Y
    );

    // 绘制边框
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(
      toX - BOARD_CONFIG.SPACE_X / 2,
      toY - BOARD_CONFIG.SPACE_Y / 2,
      BOARD_CONFIG.SPACE_X,
      BOARD_CONFIG.SPACE_Y
    );
    ctx.restore();
  }, []);

  /**
   * 绘制所有棋子
   */
  const drawPieces = useCallback((ctx: CanvasRenderingContext2D) => {
    let pieceCount = 0;
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 9; x++) {
        const piece = board[y]?.[x];
        if (piece) {
          pieceCount++;
          drawPiece(ctx, piece, { x, y });
        }
      }
    }
    console.log(`绘制了 ${pieceCount} 个棋子`);
  }, [board]);

  /**
   * 绘制单个棋子
   */
  const drawPiece = useCallback((ctx: CanvasRenderingContext2D, piece: Piece, pos: Position) => {
    const imageUrl = getPieceImageUrl(piece);
    const img = imageCache.current.get(imageUrl);

    const x = BOARD_CONFIG.POINT_START_X + pos.x * BOARD_CONFIG.SPACE_X;
    const y = BOARD_CONFIG.POINT_START_Y + pos.y * BOARD_CONFIG.SPACE_Y;

    if (!img) {
      console.warn(`图片未找到: ${imageUrl}, 使用文字fallback`);
      // Fallback: 绘制文字棋子
      ctx.save();
      ctx.fillStyle = piece.color === 'red' ? '#cc0000' : '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 绘制圆形背景
      ctx.beginPath();
      ctx.arc(x, y, BOARD_CONFIG.PIECE_SIZE / 2 - 2, 0, Math.PI * 2);
      ctx.fillStyle = piece.color === 'red' ? '#fff5e6' : '#e6e6e6';
      ctx.fill();
      ctx.strokeStyle = piece.color === 'red' ? '#cc0000' : '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制棋子文字
      const pieceTextMap: Record<string, string> = {
        'k': piece.color === 'red' ? '帅' : '将',
        'a': piece.color === 'red' ? '仕' : '士',
        'b': piece.color === 'red' ? '相' : '象',
        'n': '马',
        'r': '车',
        'c': '炮',
        'p': piece.color === 'red' ? '兵' : '卒'
      };
      ctx.fillStyle = piece.color === 'red' ? '#cc0000' : '#000000';
      ctx.fillText(pieceTextMap[piece.type] || piece.type, x, y);
      ctx.restore();
      return;
    }

    ctx.drawImage(img, x - BOARD_CONFIG.PIECE_SIZE / 2, y - BOARD_CONFIG.PIECE_SIZE / 2, BOARD_CONFIG.PIECE_SIZE, BOARD_CONFIG.PIECE_SIZE);
  }, [getPieceImageUrl]);

  /**
   * 处理棋盘点击
   */
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSquareClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // 计算点击的网格位置
    const x = Math.round((clickX - BOARD_CONFIG.POINT_START_X) / BOARD_CONFIG.SPACE_X);
    const y = Math.round((clickY - BOARD_CONFIG.POINT_START_Y) / BOARD_CONFIG.SPACE_Y);

    if (x >= 0 && x <= 8 && y >= 0 && y <= 9) {
      onSquareClick({ x, y });
    }
  }, [onSquareClick]);

  if (!imagesLoaded) {
    return <div className="loading">加载棋盘资源...</div>;
  }

  return (
    <div className="chessboard-container">
      {/* Debug overlay */}
      <div style={{
        position: 'absolute',
        top: '5px',
        left: '5px',
        background: 'rgba(255, 255, 255, 0.9)',
        padding: '5px',
        borderRadius: '3px',
        fontSize: '12px',
        zIndex: 1000,
        pointerEvents: 'none'
      }}>
        <div>图片加载: {imagesLoaded ? '✅' : '❌'}</div>
        <div>棋子数: {board.flat().filter(p => p !== null).length}</div>
        <div>缓存: {imageCache.current.size} 张</div>
      </div>
      <canvas
        ref={canvasRef}
        width={BOARD_CONFIG.WIDTH}
        height={BOARD_CONFIG.HEIGHT}
        onClick={handleClick}
        className="chessboard-canvas"
      />
      {showCoordinates && <div className="coordinates" />}
    </div>
  );
});

ChessBoard.displayName = 'ChessBoard';
