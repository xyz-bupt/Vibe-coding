// 测试MoveController
import { useAppStore } from './store/appStore';
import { ChessBoardSimple } from './components/Board/ChessBoardSimple';
import { LayoutList } from './components/LayoutList/LayoutList';
import { SimpleMoveController } from './components/MoveController/MoveControllerSimple';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function ControllerTestApp() {
  console.log('=== ControllerTestApp 渲染 ===');

  const {
    currentLayout,
    board,
    currentRound,
    setCurrentLayout,
    makeMove
  } = useAppStore();

  console.log('- currentLayout:', currentLayout?.name || 'none');
  console.log('- currentRound:', currentRound);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px'
    }}>
      {/* 调试面板 */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'white',
        border: '3px solid red',
        padding: '10px',
        zIndex: 9999,
        fontSize: '14px',
        borderRadius: '5px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🔍 调试</div>
        <div>布局: {currentLayout?.name || '无'}</div>
        <div>回合: {currentRound}</div>
      </div>

      <h1 style={{ textAlign: 'center', color: '#333' }}>🎮 MoveController测试</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '300px 1fr',
        gap: '20px',
        marginTop: '20px'
      }}>
        {/* 左侧布局列表 */}
        <div>
          <ErrorBoundary>
            <LayoutList
              onLayoutSelect={setCurrentLayout}
              selectedLayoutId={currentLayout?.id}
            />
          </ErrorBoundary>
        </div>

        {/* 右侧内容 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {currentLayout ? (
            <>
              {/* 棋盘 */}
              <ErrorBoundary>
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <ChessBoardSimple board={board} />
                </div>
              </ErrorBoundary>

              {/* 简化版控制器 */}
              <ErrorBoundary>
                <SimpleMoveController
                  layout={currentLayout}
                  currentRound={currentRound}
                  onRoundChange={makeMove}
                />
              </ErrorBoundary>
            </>
          ) : (
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '10px',
              textAlign: 'center'
            }}>
              <h2>请从左侧选择布局</h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
