import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: 'src', replacement: path.resolve(__dirname, 'src') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '~api', replacement: path.resolve(__dirname, 'src/api') },
      { find: '~ctx', replacement: path.resolve(__dirname, 'src/contexts') },
      { find: '~hook', replacement: path.resolve(__dirname, 'src/hooks') },
      { find: '~int', replacement: path.resolve(__dirname, 'src/interfaces') },
      { find: '~type', replacement: path.resolve(__dirname, 'src/types') },
      { find: '~comp', replacement: path.resolve(__dirname, 'src/components') },
      { find: '~components', replacement: path.resolve(__dirname, 'src/components/index.ts') },
      { find: '~layout', replacement: path.resolve(__dirname, 'src/layout') },
      { find: '~utils', replacement: path.resolve(__dirname, 'src/utils') },
      { find: '~pages', replacement: path.resolve(__dirname, 'src/pages') },
    ],
  },
});
