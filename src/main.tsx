import { CssBaseline, ThemeProvider } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { PicoUnitsProvider } from '~ctx/PicoUnits';
import { ToastProvider } from '~ctx/Toast';

import App from './App';
import './styles/global.css';
import theme from './theme/mushroomTheme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <PicoUnitsProvider>
        <ThemeProvider theme={theme}>
          <ToastProvider>
            <CssBaseline />
            <BrowserRouter>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <App />
              </LocalizationProvider>
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </PicoUnitsProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
