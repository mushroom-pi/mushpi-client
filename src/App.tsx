import { Box } from '@mui/material';
import { Route, Routes } from 'react-router-dom';

import { ErrorBoundary, ServerDownBanner } from '~components';

import Sidebar from './layout/Sidebar';
import { drawerWidth } from './layout/Sidebar/constants';
import BatchDetail from './pages/Batch';
import BatchesPage from './pages/Batches';
import Dashboard from './pages/Dashboard';
import PicoUnitDetail from './pages/PicoUnit';
import PicoUnits from './pages/PicoUnits';
import { ReadingsPage } from './pages/Readings';
import RecipeDetail from './pages/Recipe';
import RecipesPage from './pages/Recipes';
import { Server } from './pages/Server';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <Box sx={{ display: { xs: 'block', md: 'flex' }, minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          padding: '20px',
          marginLeft: { xs: 0, md: `${drawerWidth}px` },
        }}
      >
        <ServerDownBanner />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pico-units" element={<PicoUnits />} />
            <Route path="/pico-units/:id" element={<PicoUnitDetail />} />
            <Route path="/batches" element={<BatchesPage />} />
            <Route path="/batches/:id" element={<BatchDetail />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/readings" element={<ReadingsPage />} />
            <Route path="/server" element={<Server />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </ErrorBoundary>
      </Box>
    </Box>
  );
}
