// 基础版MoveController - 不含自动播放功能

import React, { useState, useEffect } from 'react';
import type { Layout, Move } from '../../types';
import './MoveController.css';

interface BasicMoveControllerProps {
  layout: Layout;
  currentRound: number;
  onRoundChange: (round: number) => void;
}

export const BasicMoveController: React.FC<BasicMoveControllerProps> = ({
  layout,
  currentRound,
  onRoundChange
}) => {
  const [currentMove, setCurrentMove] = useState<Move | undefined>(undefined);

  useEffect(() => {
    if (currentRound === 0 || !layout?.moves) {
      setCurrentMove(undefined);
    } else {
      setCurrentMove(layout.moves[currentRound - 1]);
    }
  }, [currentRound, layout]);

  const movesLength = layout?.moves?.length ?? 0;

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
