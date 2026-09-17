import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import path from 'path';
import { defineConfig } from 'vite';

/**
 * Build-time version injection (mushpi-docs/versioning.md axes ①/②).
 * Missing/unreadable file or non-string field → null — never invent a version.
 */
function readJsonStringField(file: string, field: string): string | null {
  try {
    const json: unknown = JSON.parse(readFileSync(path.resolve(__dirname, file), 'utf-8'));
    const value = (json as Record<string, unknown>)?.[field];
    return typeof value === 'string' && value.trim() !== '' ? value : null;
  } catch {
    return null;
  }
}

// release.json resolution: monorepo dev → ../release.json; Docker image → ./release.json
const releaseVersion =
  readJsonStringField('../release.json', 'release') ??
  readJsonStringField('./release.json', 'release');

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_BUILD_VERSION__: JSON.stringify(readJsonStringField('./package.json', 'version')),
    __APP_RELEASE_VERSION__: JSON.stringify(releaseVersion),
  },
  plugins: [react()],
  resolve: {
    alias: [
      { find: 'src', replacement: path.resolve(__dirname, 'src') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '~api', replacement: path.resolve(__dirname, 'src/api') },
      { find: '~assets', replacement: path.resolve(__dirname, 'src/assets') },
      { find: '~ctx', replacement: path.resolve(__dirname, 'src/contexts') },
      { find: '~hook', replacement: path.resolve(__dirname, 'src/hooks') },
      { find: '~int', replacement: path.resolve(__dirname, 'src/interfaces') },
      { find: '~type', replacement: path.resolve(__dirname, 'src/types') },
      { find: '~theme', replacement: path.resolve(__dirname, 'src/theme') },
      { find: '~comp', replacement: path.resolve(__dirname, 'src/components') },
      { find: '~components', replacement: path.resolve(__dirname, 'src/components/index.ts') },
      { find: '~layout', replacement: path.resolve(__dirname, 'src/layout') },
      { find: '~utils', replacement: path.resolve(__dirname, 'src/utils') },
      { find: '~pages', replacement: path.resolve(__dirname, 'src/pages') },
    ],
  },
});
