import { Route, Routes } from 'react-router-dom';

import Sidebar from './layout/Sidebar';
import Dashboard from './pages/Dashboard';
import PicoUnitDetail from './pages/PicoUnit';
import PicoUnits from './pages/PicoUnits';
import { ReadingsPage } from './pages/Readings';
import { Server } from './pages/Server';

export default function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 20 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pico-units" element={<PicoUnits />} />
          <Route path="/pico-units/:id" element={<PicoUnitDetail />} />
          <Route path="/readings" element={<ReadingsPage />} />
          <Route path="/server" element={<Server />} />
        </Routes>
      </main>
    </div>
  );
}
