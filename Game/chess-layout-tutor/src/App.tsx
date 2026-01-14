// 主应用组件

import { ChessBoard } from './components/Board/ChessBoard';
import { ChessBoardSimple } from './components/Board/ChessBoardSimple';
import { LayoutList } from './components/LayoutList/LayoutList';
import { SafeMoveController } from './components/MoveController/MoveControllerSafe';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAppStore } from './store/appStore';
import { useCallback } from 'react';
import './App.css';

// 使用简化版本进行调试
const USE_SIMPLE_BOARD = true;

/**
 * App 组件
 */
function App() {
  console.log('=== App组件渲染开始 ===');

  const {
    currentLayout,
    board,
    currentRound,
    currentTurn,
    lastMove,
    showHints,
    showTraps,
    autoPlay,
    autoPlaySpeed,
    setCurrentLayout,
    makeRedMove,
    makeBlackMove,
    makeMove,
    toggleHints,
    toggleTraps,
    setAutoPlay,
    setAutoPlaySpeed
  } = useAppStore();

  console.log('Store数据获取完成');
  console.log('- currentLayout:', currentLayout?.name || 'none');
  console.log('- currentRound:', currentRound);

  // 调试信息
  const pieceCount = board ? board.flat().filter(p => p !== null).length : 0;
  console.log('board pieces:', pieceCount);
  console.log('USE_SIMPLE_BOARD:', USE_SIMPLE_BOARD);

  console.log('=== App组件渲染结束 ===');

  /**
   * 处理布局选择
   */
  const handleLayoutSelect = useCallback((layout: typeof currentLayout) => {
    if (layout) {
      setCurrentLayout(layout);
    }
  }, [setCurrentLayout]);

  /**
   * 获取高亮位置
   */
  const getHighlightedSquares = () => {
    if (!currentLayout || !showTraps) return [];

    // TODO: 将陷阱转换为实际位置
    return [];
  };

  return (
    <ErrorBoundary>
      <div className="app">
        {/* 调试面板 */}
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'white',
          border: '2px solid red',
          padding: '10px',
          zIndex: 9999,
          fontSize: '14px',
          borderRadius: '5px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🔍 调试信息</div>
          <div>布局: {currentLayout?.name || '未选择'}</div>
          <div>棋子数: {pieceCount}</div>
          <div>简化版: {USE_SIMPLE_BOARD ? '是' : '否'}</div>
          <div>当前回合: {currentRound}</div>
        </div>

        <header className="app-header">
          <h1>🏮 象棋布局教学</h1>
          <p className="subtitle">学习《象棋布局全书》的100+经典布局</p>
        </header>

      <div className="app-content">
        {/* 左侧：布局列表 */}
        <aside className="sidebar">
          <LayoutList
            onLayoutSelect={handleLayoutSelect}
            selectedLayoutId={currentLayout?.id}
          />
        </aside>

        {/* 中间：棋盘 */}
        <main className="main-content">
          {currentLayout ? (
            <>
              <div className="board-wrapper">
                {USE_SIMPLE_BOARD ? (
                  <ChessBoardSimple board={board} />
                ) : (
                  <ChessBoard
                    board={board}
                    highlightedSquares={getHighlightedSquares()}
                    showCoordinates={true}
                    lastMove={lastMove}
                  />
                )}
              </div>

              {/* 安全版MoveController - 带自动播放功能 */}
              <SafeMoveController
                layout={currentLayout}
                currentRound={currentRound}
                onRoundChange={makeMove}
              />
            </>
          ) : (
            <div className="welcome">
              <h2>👋 欢迎使用象棋布局教学系统</h2>
              <p>请从左侧选择一个布局开始学习</p>
              <div className="features">
                <div className="feature">
                  <div className="feature-icon">📚</div>
                  <h3>100+ 经典布局</h3>
                  <p>涵盖顺手炮、列手炮、屏风马等经典布局</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">⚠️</div>
                  <h3>陷阱识别</h3>
                  <p>学习常见陷阱和飞刀战术</p>
                </div>
                <div className="feature">
                  <div className="feature-icon">🎯</div>
                  <h3>互动学习</h3>
                  <p>逐步播放，详细讲解，轻松掌握</p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* 右侧：控制面板 */}
        <aside className="controls-panel">
          <div className="panel-section">
            <h3>显示设置</h3>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showHints}
                onChange={toggleHints}
              />
              显示提示
            </label>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={showTraps}
                onChange={toggleTraps}
              />
              高亮陷阱
            </label>
          </div>

          {currentLayout && (
            <div className="panel-section">
              <h3>布局信息</h3>
              <div className="info-item">
                <strong>名称:</strong> {currentLayout.name}
              </div>
              <div className="info-item">
                <strong>难度:</strong> {'⭐'.repeat(currentLayout.difficulty)}
              </div>
              <div className="info-item">
                <strong>回合数:</strong> {currentLayout.moves.length}
              </div>
              {currentLayout.source && (
                <div className="info-item">
                  <strong>来源:</strong> {currentLayout.source}
                </div>
              )}
            </div>
          )}

          <div className="panel-section">
            <h3>学习进度</h3>
            <p>开始学习以跟踪进度</p>
          </div>
        </aside>
      </div>
    </div>
    </ErrorBoundary>
  );
}

export default App;
