// 播放控制器组件

import React, { useEffect, useState, useRef, memo } from 'react';
import type { Layout, Move } from '../../types';
import './MoveController.css';

interface MoveControllerProps {
  layout: Layout;
  currentRound: number;
  currentTurn: 'red' | 'black' | 'none';
  onRoundChange: (round: number) => void;
  onRedMoveChange: (round: number) => void;
  onBlackMoveChange: (round: number) => void;
  autoPlay: boolean;
  autoPlaySpeed: number;
  onAutoPlayToggle: () => void;
  onSpeedChange: (speed: number) => void;
}

/**
 * 播放控制器组件
 */
const MoveControllerComponent: React.FC<MoveControllerProps> = ({
  layout,
  currentRound,
  currentTurn,
  onRoundChange,
  onRedMoveChange,
  onBlackMoveChange,
  autoPlay,
  autoPlaySpeed,
  onAutoPlayToggle,
  onSpeedChange
}) => {
  const [speed, setSpeed] = useState(autoPlaySpeed);

  // Use refs to store latest callbacks without triggering re-renders
  const onRoundChangeRef = useRef(onRoundChange);
  const onRedMoveChangeRef = useRef(onRedMoveChange);
  const onBlackMoveChangeRef = useRef(onBlackMoveChange);
  const onAutoPlayToggleRef = useRef(onAutoPlayToggle);
  const isMountedRef = useRef(true);

  useEffect(() => {
    onRoundChangeRef.current = onRoundChange;
  }, [onRoundChange]);

  useEffect(() => {
    onRedMoveChangeRef.current = onRedMoveChange;
  }, [onRedMoveChange]);

  useEffect(() => {
    onBlackMoveChangeRef.current = onBlackMoveChange;
  }, [onBlackMoveChange]);

  useEffect(() => {
    onAutoPlayToggleRef.current = onAutoPlayToggle;
  }, [onAutoPlayToggle]);

  useEffect(() => {
    setSpeed(autoPlaySpeed);
  }, [autoPlaySpeed]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Move timerRef to component level to prevent multiple timer issues
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const movesLength = layout?.moves?.length ?? 0;

  useEffect(() => {
    // Clear any existing timer before creating a new one
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // 安全检查：确保layout和moves存在
    if (!layout || !layout.moves || movesLength === 0) {
      return;
    }

    if (autoPlay && currentTurn === 'none' && currentRound < movesLength) {
      // 回合开始，执行红方走棋
      timerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          onRedMoveChangeRef.current(currentRound + 1);
        }
      }, speed / 2);
    } else if (autoPlay && currentTurn === 'red') {
      // 红方走完，执行黑方走棋
      timerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          onBlackMoveChangeRef.current(currentRound);
        }
      }, speed / 2);
    } else if (autoPlay && currentRound >= movesLength && currentTurn === 'none' && isMountedRef.current) {
      // End of playback - 使用setTimeout避免在useEffect中直接改变状态
      timerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          onAutoPlayToggleRef.current();
        }
      }, 0);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [autoPlay, currentTurn, currentRound, movesLength, speed]);

  /**
   * 处理速度变化
   */
  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    onSpeedChange(newSpeed);
  };

  /**
   * 获取当前回合的着法
   */
  const getCurrentMove = (): Move | undefined => {
    if (currentRound === 0 || !layout?.moves) return undefined;
    return layout.moves[currentRound - 1];
  };

  const currentMove = getCurrentMove();

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
          onClick={onAutoPlayToggle}
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
            width: `${(currentRound / movesLength) * 100}%`
          }}
        />
      </div>

      {/* 回合信息 */}
      <div className="round-info">
        <span className="round-text">
          {currentRound} / {movesLength} 回合
        </span>

        {/* Turn indicator */}
        {currentTurn !== 'none' && (
          <span className={`turn-badge ${currentTurn}`}>
            {currentTurn === 'red' ? '红方走棋' : '黑方走棋'}
          </span>
        )}

        <div className="speed-control">
          <label htmlFor="speed">速度:</label>
          <select
            id="speed"
            value={speed}
            onChange={e => handleSpeedChange(Number(e.target.value))}
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
            <div className={`move-side red ${currentTurn === 'red' ? 'active' : ''}`}>
              <div className="move-notation">{currentMove.red.notation}</div>
              {currentMove.red.note && (
                <div className="move-note">{currentMove.red.note}</div>
              )}
            </div>

            <div className={`move-side black ${currentTurn === 'black' ? 'active' : ''}`}>
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

      {!currentMove && (
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

/**
 * Memoized move controller component
 */
export const MoveController = memo(MoveControllerComponent);
MoveController.displayName = 'MoveController';
