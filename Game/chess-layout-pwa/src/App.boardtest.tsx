// 测试棋盘渲染
import { useAppStore } from './store/appStore';
import { ChessBoardSimple } from './components/Board/ChessBoardSimple';
import { useState, useEffect } from 'react';

export default function BoardTestApp() {
  console.log('=== BoardTestApp 渲染 ===');
  const { board, setCurrentLayout } = useAppStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log('自动加载第一个布局...');
    // 尝试加载第一个布局
    import('./data/chapters').then(({ getAllLayouts }) => {
      const layouts = getAllLayouts();
      if (layouts.length > 0) {
        console.log('加载布局:', layouts[0].name);
        setCurrentLayout(layouts[0]);
        setIsLoaded(true);
      }
    });
  }, [setCurrentLayout]);

  return (
    <div style={{
      padding: '20px',
      background: 'white',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: 'green' }}>棋盘测试页面</h1>

      <div style={{
        padding: '20px',
        background: 'yellow',
        border: '2px solid red',
        margin: '20px 0'
      }}>
        <p><strong>调试信息:</strong></p>
        <p>Board存在: {board ? '是' : '否'}</p>
        <p>棋子数: {board ? board.flat().filter(p => p !== null).length : 0}</p>
        <p>布局已加载: {isLoaded ? '是' : '否'}</p>
      </div>

      <div style={{
        padding: '20px',
        background: 'lightblue',
        margin: '20px 0'
      }}>
        <h2>棋盘组件:</h2>
        {board ? (
          <ChessBoardSimple board={board} />
        ) : (
          <p style={{ color: 'red' }}>Board为空，无法渲染棋盘</p>
        )}
      </div>
    </div>
  );
}
