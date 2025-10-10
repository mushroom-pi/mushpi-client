import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';

import Sidebar from './layout/Sidebar';
import Dashboard from './pages/Dashboard';
import PicoUnitsPage from './pages/PicoUnits';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 20 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pico-units" element={<PicoUnitsPage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </QueryClientProvider>
  );
}
