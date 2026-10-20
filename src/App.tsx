import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './lib/store';
import { ChildLayout, ParentLayout } from './components/layout/Layout';

import Today from './pages/child/Today';
import Subjects from './pages/child/Subjects';
import ChildRewards from './pages/child/Rewards';
import ChildGrowth from './pages/child/Growth';
import ParentCenter from './pages/parent/ParentCenter';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/child" replace />} />

          <Route path="/child" element={<ChildLayout />}>
            <Route index element={<Today />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="rewards" element={<ChildRewards />} />
            <Route path="growth" element={<ChildGrowth />} />
          </Route>

          <Route path="/parent" element={<ParentLayout />}>
            <Route index element={<ParentCenter />} />
          </Route>

          <Route path="*" element={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 60, marginBottom: 16 }}>📋</div>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>页面未找到</h1>
                <p style={{ color: 'var(--mut)', marginBottom: 16 }}>你访问的页面不存在</p>
                <a href="/child" className="btn">返回首页</a>
              </div>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
