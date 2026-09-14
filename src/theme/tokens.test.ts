import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { brand } from './tokens';

const THEME_DIR = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.resolve(THEME_DIR, '..');

describe('variables.css ↔ tokens.ts mirror', () => {
  it('contains exactly the documented pre-mount vars and mirrors brand tokens 1:1', () => {
    const css = readFileSync(path.join(SRC_ROOT, 'styles', 'variables.css'), 'utf8');
    const pairs = [...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(
      ([, name, value]) => [name, value.trim()] as const,
    );

    const expected: Record<string, string> = {
      '--bg': brand.bg,
      '--bg-deep': brand.bgDeep,
      '--text': brand.text,
    };

    // No extra or missing vars — the file stays a strict 3-var mirror.
    expect(pairs.map(([name]) => name).sort()).toEqual(Object.keys(expected).sort());

    // Values must match case-insensitively (CSS uses lowercase hex).
    for (const [name, value] of pairs) {
      expect(value.toLowerCase(), `${name} drifted from tokens.ts`).toBe(
        expected[name].toLowerCase(),
      );
    }
  });
});

describe('no stray color literals outside tokens.ts', () => {
  const FILE_EXT_RE = /\.(ts|tsx)$/;
  const TEST_FILE_RE = /\.test\.[cm]?[jt]sx?$/;
  // Relative to SRC_ROOT. tokens.ts is the source of truth; ColorSwatchPicker's
  // FACE_COLORS is a user-selectable data palette (DB face_color values), not
  // styling — both are documented exemptions (see AGENTS.md Coding Rules).
  const ALLOWLIST = new Set([
    path.join('theme', 'tokens.ts'),
    path.join('components', 'ui', 'atoms', 'ColorSwatchPicker.tsx'),
  ]);
  const SKIP_DIRS = [path.join('api', 'generated')];

  function walk(dir: string, found: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
      const full = path.join(dir, entry);
      const rel = path.relative(SRC_ROOT, full);
      if (SKIP_DIRS.some((skip) => rel === skip || rel.startsWith(skip + path.sep))) {
        continue;
      }
      if (statSync(full).isDirectory()) {
        walk(full, found);
      } else if (FILE_EXT_RE.test(entry) && !TEST_FILE_RE.test(entry) && !ALLOWLIST.has(rel)) {
        found.push(full);
      }
    }
    return found;
  }

  it('scans src/**/*.{ts,tsx} (raw text) and finds no hex/rgb/hsl color literals', () => {
    const offenders: string[] = [];
    for (const file of walk(SRC_ROOT)) {
      const lines = readFileSync(file, 'utf8').split(/\r?\n/);
      lines.forEach((line, i) => {
        // Raw-text scan: catches string literals, template literals AND comments.
        if (/#[0-9a-fA-F]{3,8}\b/.test(line) || /rgba?\(|hsla?\(/.test(line)) {
          offenders.push(`${path.relative(SRC_ROOT, file)}:${i + 1}: ${line.trim()}`);
        }
      });
    }
    expect(
      offenders,
      `Raw color literals found — move them to src/theme/tokens.ts:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });
});
