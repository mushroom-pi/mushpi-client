import { Route, Routes } from 'react-router-dom';

import Sidebar from './layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Sensors from './pages/Sensors';
import Settings from './pages/Settings';

export default function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 20 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sensors" element={<Sensors />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
