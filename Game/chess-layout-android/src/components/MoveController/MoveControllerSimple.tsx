// 简化版MoveController用于测试
import React, { useState } from 'react';
import type { Layout, Move } from '../../types';

interface SimpleMoveControllerProps {
  layout: Layout;
  currentRound: number;
  onRoundChange: (round: number) => void;
}

export const SimpleMoveController: React.FC<SimpleMoveControllerProps> = ({
  layout,
  currentRound,
  onRoundChange
}) => {
  const [currentMove, setCurrentMove] = useState<Move | undefined>(undefined);

  React.useEffect(() => {
    if (currentRound === 0) {
      setCurrentMove(undefined);
    } else {
      setCurrentMove(layout.moves[currentRound - 1]);
    }
  }, [currentRound, layout.moves]);

  console.log('SimpleMoveController render, currentRound:', currentRound);

  return (
    <div style={{
      padding: '20px',
      background: 'white',
      borderRadius: '10px',
      border: '2px solid green'
    }}>
      <h3>简化版控制器</h3>

      {/* 控制按钮 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => onRoundChange(0)}>⏮️ 开始</button>
        <button onClick={() => onRoundChange(Math.max(0, currentRound - 1))}>◀️ 上一步</button>
        <button onClick={() => onRoundChange(Math.min(layout.moves.length, currentRound + 1))}>▶️ 下一步</button>
        <button onClick={() => onRoundChange(layout.moves.length)}>⏭️ 结束</button>
      </div>

      {/* 进度显示 */}
      <div style={{ marginBottom: '20px' }}>
        <strong>回合: {currentRound} / {layout.moves.length}</strong>
        <div style={{
          width: '100%',
          height: '10px',
          background: '#e0e0e0',
          borderRadius: '5px',
          marginTop: '5px'
        }}>
          <div style={{
            width: `${(currentRound / layout.moves.length) * 100}%`,
            height: '100%',
            background: '#667eea',
            borderRadius: '5px'
          }} />
        </div>
      </div>

      {/* 当前着法 */}
      {currentMove ? (
        <div style={{
          padding: '15px',
          background: '#f5f5f5',
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          <h4>第 {currentMove.round} 回合</h4>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#cc0000' }}>红方:</strong> {currentMove.red.notation}
              {currentMove.red.note && (
                <div style={{ fontSize: '14px', color: '#666' }}>{currentMove.red.note}</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <strong style={{ color: '#000' }}>黑方:</strong> {currentMove.black.notation}
              {currentMove.black.note && (
                <div style={{ fontSize: '14px', color: '#666' }}>{currentMove.black.note}</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          padding: '15px',
          background: '#f0f0f0',
          borderRadius: '5px'
        }}>
          <h3>{layout.name}</h3>
          <p>{layout.description}</p>
        </div>
      )}
    </div>
  );
};
