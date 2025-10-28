import { CssBaseline, ThemeProvider } from '@mui/material';
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
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
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
              <App />
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </PicoUnitsProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
