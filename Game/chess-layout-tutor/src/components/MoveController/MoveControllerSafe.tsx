// 安全版MoveController - 带自动播放功能

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Layout, Move } from '../../types';
import './MoveController.css';

interface SafeMoveControllerProps {
  layout: Layout;
  currentRound: number;
  onRoundChange: (round: number) => void;
}

export const SafeMoveController: React.FC<SafeMoveControllerProps> = ({
  layout,
  currentRound,
  onRoundChange
}) => {
  const [currentMove, setCurrentMove] = useState<Move | undefined>(undefined);
  const [autoPlay, setAutoPlay] = useState(false);
  const [speed, setSpeed] = useState(2000);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // 更新当前着法
  useEffect(() => {
    if (currentRound === 0 || !layout?.moves) {
      setCurrentMove(undefined);
    } else {
      setCurrentMove(layout.moves[currentRound - 1]);
    }
  }, [currentRound, layout]);

  // 组件卸载时清理
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // 自动播放逻辑
  useEffect(() => {
    // 清除现有定时器
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const movesLength = layout?.moves?.length ?? 0;

    // 如果未启用自动播放或已到达最后，不做处理
    if (!autoPlay || currentRound >= movesLength) {
      return;
    }

    // 设置定时器执行下一步
    timerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        const nextRound = Math.min(movesLength, currentRound + 1);
        if (nextRound > currentRound) {
          onRoundChange(nextRound);
        } else {
          // 到达最后，停止自动播放
          setAutoPlay(false);
        }
      }
    }, speed);

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoPlay, currentRound, layout, speed, onRoundChange]);

  const movesLength = layout?.moves?.length ?? 0;

  // 切换自动播放
  const toggleAutoPlay = useCallback(() => {
    setAutoPlay(prev => {
      // 如果已经到达最后，先回到开始再播放
      if (currentRound >= movesLength && !prev) {
        onRoundChange(0);
        return true;
      }
      return !prev;
    });
  }, [currentRound, movesLength, onRoundChange]);

  return (
    <div className="move-controller">
      {/* 控制按钮 */}
      <div className="controls">
        <button
          className="control-btn"
          onClick={() => onRoundChange(0)}
          disabled={currentRound === 0}
          title="回到开始"
        >
          ⏮️
        </button>

        <button
          className="control-btn"
          onClick={() => onRoundChange(Math.max(0, currentRound - 1))}
          disabled={currentRound === 0}
          title="上一步"
        >
          ◀️
        </button>

        <button
          className={`control-btn ${autoPlay ? 'active' : ''}`}
          onClick={toggleAutoPlay}
          disabled={currentRound >= movesLength}
          title={autoPlay ? '暂停' : '自动播放'}
        >
          {autoPlay ? '⏸️' : '▶️'}
        </button>

        <button
          className="control-btn"
          onClick={() => onRoundChange(Math.min(movesLength, currentRound + 1))}
          disabled={currentRound >= movesLength}
          title="下一步"
        >
          ▶️
        </button>

        <button
          className="control-btn"
          onClick={() => onRoundChange(movesLength)}
          disabled={currentRound >= movesLength}
          title="跳到最后"
        >
          ⏭️
        </button>
      </div>

      {/* 进度条 */}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: movesLength > 0 ? `${(currentRound / movesLength) * 100}%` : '0%'
          }}
        />
      </div>

      {/* 回合信息 */}
      <div className="round-info">
        <span className="round-text">
          {currentRound} / {movesLength} 回合
        </span>

        {autoPlay && (
          <span className="turn-badge red">自动播放中</span>
        )}

        <div className="speed-control">
          <label htmlFor="speed">速度:</label>
          <select
            id="speed"
            value={speed}
            onChange={e => setSpeed(Number(e.target.value))}
          >
            <option value={1000}>慢</option>
            <option value={2000}>正常</option>
            <option value={3000}>快</option>
          </select>
        </div>
      </div>

      {/* 当前着法详情 */}
      {currentMove && (
        <div className="current-move">
          <h4 className="move-round">第 {currentMove.round} 回合</h4>

          <div className="move-details">
            <div className="move-side red">
              <div className="move-notation">{currentMove.red.notation}</div>
              {currentMove.red.note && (
                <div className="move-note">{currentMove.red.note}</div>
              )}
            </div>

            <div className="move-side black">
              <div className="move-notation">{currentMove.black.notation}</div>
              {currentMove.black.note && (
                <div className="move-note">{currentMove.black.note}</div>
              )}
            </div>
          </div>

          {/* 陷阱提示 */}
          {layout.traps && layout.traps.some(t => t.round === currentMove.round) && (
            <div className="trap-warning">
              ⚠️ {layout.traps.find(t => t.round === currentMove.round)?.description}
            </div>
          )}
        </div>
      )}

      {!currentMove && layout && (
        <div className="intro-text">
          <h3>{layout.name}</h3>
          <p>{layout.description}</p>
          <div className="key-points">
            <strong>要点:</strong>
            <ul>
              {layout.keyPoints.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
