import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import TestApp from './App.test';
import BoardTestApp from './App.boardtest';
import FullTestApp from './App.fulltest';
import ControllerTestApp from './App.controllertest';
import './index.css';

console.log('=== 应用开始启动 ===');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find the root element');
}
console.log('Root element found:', rootElement);

// 使用测试App进行调试
// 0 = 正常App, 1 = 简单测试, 2 = 棋盘测试, 3 = 完整测试, 4 = 控制器测试
const TEST_MODE = 0;

let AppComponent;
switch (TEST_MODE) {
  case 1: AppComponent = TestApp; break;
  case 2: AppComponent = BoardTestApp; break;
  case 3: AppComponent = FullTestApp; break;
  case 4: AppComponent = ControllerTestApp; break;
  default: AppComponent = App;
}

ReactDOM.createRoot(rootElement).render(<AppComponent />);

console.log('=== 应用渲染完成, TEST_MODE:', TEST_MODE, '===');
