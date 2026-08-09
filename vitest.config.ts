import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        include: [
          'src/contexts/PicoUnit/helpers.ts',
          'src/hooks/useAsyncWithToast.ts',
          'src/components/ui/molecules/ErrorBoundary.tsx',
          'src/utils/methods.ts',
          'src/pages/Dashboard/methods.ts',
          'src/pages/PicoUnit/components/PicoUnitDevices/DevicesDialog.tsx',
        ],
      },
    },
  }),
);
