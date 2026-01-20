// 完整测试页面 - 测试LayoutList和ChessBoard
import { useAppStore } from './store/appStore';
import { ChessBoardSimple } from './components/Board/ChessBoardSimple';
import { LayoutList } from './components/LayoutList/LayoutList';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function FullTestApp() {
  console.log('=== FullTestApp 渲染 ===');

  const {
    currentLayout,
    board,
    currentRound,
    setCurrentLayout
  } = useAppStore();

  console.log('- currentLayout:', currentLayout?.name || 'none');
  console.log('- board pieces:', board?.flat().filter(p => p !== null).length || 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* 顶部调试栏 */}
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'white',
        border: '3px solid red',
        padding: '10px',
        zIndex: 9999,
        fontSize: '14px',
        borderRadius: '5px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '16px' }}>
          🔍 调试面板
        </div>
        <div>布局: {currentLayout?.name || '未选择'}</div>
        <div>棋子数: {board?.flat().filter(p => p !== null).length || 0}</div>
        <div>回合: {currentRound}</div>
      </div>

      {/* 主标题 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '32px' }}>🏮 象棋布局测试</h1>
        <p style={{ margin: '10px 0 0 0', fontSize: '16px' }}>完整功能测试</p>
      </div>

      {/* 主内容区 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '350px 1fr',
        gap: '20px',
        padding: '20px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* 左侧：布局列表 */}
        <div style={{
          background: 'white',
          borderRadius: '10px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          overflow: 'hidden',
          height: 'fit-content'
        }}>
          <ErrorBoundary>
            <LayoutList
              onLayoutSelect={setCurrentLayout}
              selectedLayoutId={currentLayout?.id}
            />
          </ErrorBoundary>
        </div>

        {/* 右侧：棋盘区域 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {currentLayout ? (
            <ErrorBoundary>
              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h2 style={{ marginTop: 0 }}>{currentLayout.name}</h2>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <ChessBoardSimple board={board} />
                </div>
              </div>

              <div style={{
                background: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <h3>布局信息</h3>
                <p><strong>难度:</strong> {'⭐'.repeat(currentLayout.difficulty)}</p>
                <p><strong>回合数:</strong> {currentLayout.moves.length}</p>
                <p><strong>描述:</strong> {currentLayout.description}</p>
              </div>
            </ErrorBoundary>
          ) : (
            <div style={{
              background: 'white',
              padding: '40px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <h2 style={{ color: '#666' }}>👋 请从左侧选择一个布局</h2>
              <p style={{ color: '#999' }}>选择后将显示棋盘和详细信息</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
