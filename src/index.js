import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import './styles.css'; // 引入 CSS 文件

const App = lazy(() => import('./App')); // 动态导入 App 组件

ReactDOM.render(
  <Suspense fallback={<div>Loading...</div>}>
    <App />
  </Suspense>,
  document.getElementById('root')
);
