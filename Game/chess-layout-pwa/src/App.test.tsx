// 测试用简单App
import { useAppStore } from './store/appStore';

export default function TestApp() {
  console.log('=== TestApp 渲染 ===');

  const { board, currentLayout } = useAppStore();

  console.log('board:', board);
  console.log('currentLayout:', currentLayout);

  return (
    <div style={{
      padding: '20px',
      background: 'white',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'blue' }}>测试页面</h1>
      <p>如果你能看到这个页面，说明React工作正常</p>
      <div style={{
        padding: '20px',
        background: 'yellow',
        border: '2px solid red',
        margin: '20px 0'
      }}>
        <p><strong>调试信息:</strong></p>
        <p>Board存在: {board ? '是' : '否'}</p>
        <p>棋子数: {board ? board.flat().filter(p => p !== null).length : 0}</p>
        <p>当前布局: {currentLayout?.name || '无'}</p>
      </div>

      <div style={{
        padding: '20px',
        background: 'lightgray'
      }}>
        <h2>Board数据结构:</h2>
        <pre style={{
          background: 'white',
          padding: '10px',
          overflow: 'auto'
        }}>
          {JSON.stringify(board, null, 2)}
        </pre>
      </div>
    </div>
  );
}
