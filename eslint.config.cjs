const ts = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const importPlugin = require('eslint-plugin-import');
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = [
  // Global ignores — never lint build output, and never lint the generated API
  // client: src/api/generated/** is gitignored, tool-emitted (openapi-generator-cli
  // / openapi-zod-client headers include file-wide `/* eslint-disable */` banners)
  // and reproducible by the gen:* scripts. Findings there are neither actionable
  // nor committable, and hand-edits would be destroyed by the next regeneration.
  {
    ignores: ['dist/**', 'src/api/generated/**'],
  },
  // Apply to TS/JS files in the project
  {
    files: ['**/*.{ts,tsx,js,jsx}'],

    // languageOptions used by flat config
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.app.json'], // important for type-aware rules (optional)
        sourceType: 'module',
        ecmaVersion: 2024,
        ecmaFeatures: { jsx: true },
      },
    },

    plugins: {
      '@typescript-eslint': ts,
      import: importPlugin,
      'react-hooks': reactHooks,
    },

    settings: {
      // Tell eslint-plugin-import to use the typescript resolver which understands tsconfig "paths".
      // This requires devDependency: eslint-import-resolver-typescript
      'import/resolver': {
        typescript: {
          // path to your tsconfig that contains "paths"
          project: './tsconfig.app.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      },
    },

    rules: {
      // recommended baseline: you can add/override rules here
      'import/no-unresolved': 'error',
      'import/order': [
        'warn',
        {
          groups: [['builtin', 'external'], 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [
            // keep these in sync with your tsconfig/vite aliases if you want special ordering
            { pattern: '~api/**', group: 'internal' },
            { pattern: '~assets/**', group: 'internal' },
            { pattern: '~ctx/**', group: 'internal' },
            { pattern: '~hook/**', group: 'internal' },
            { pattern: '~int/**', group: 'internal' },
            { pattern: '~type/**', group: 'internal' },
            { pattern: '~theme/**', group: 'internal' },
            { pattern: '~comp/**', group: 'internal' },
            { pattern: '~components', group: 'internal' },
            { pattern: '~layout/**', group: 'internal' },
            { pattern: '@/**', group: 'internal' },
            { pattern: 'src/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          // NOTE: `alphabetize` is deliberately NOT set. Import sorting is owned
          // by @trivago/prettier-plugin-sort-imports (`.prettierrc` importOrder),
          // which every `prettier --write` / lint-staged pass applies. Its
          // comparator is javascript-natural-sort (code-unit: `../x` sorts before
          // `./y`); import/order's alphabetize uses localeCompare('en') (`./y`
          // first). The two disagree on any file mixing `../` and `./` imports
          // (e.g. `../../test/fixtures` vs `./helpers` in test files), and
          // Prettier always wins because lint-staged runs `eslint --fix` first
          // and `prettier --write` after — enabling alphabetize here produces an
          // unfixable ping-pong, not fixable by reordering. ESLint remains the
          // group + blank-line validator; Prettier stays the single authority
          // for ordering within groups.
        },
      ],

      // typescript plugin rule recommendations — adapt to preference
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',

      // react-hooks: enable exhaustive-deps so eslint-disable comments are meaningful
      'react-hooks/exhaustive-deps': 'warn',

      // Single-source-of-truth colors: raw literals live only in src/theme/tokens.ts
      // (exempted below) and ColorSwatchPicker's FACE_COLORS data palette
      // (file-level disable). Error severity is deliberate — blocks pre-commit.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
          message: 'Raw hex color — use ~theme/tokens or theme.palette.*',
        },
        {
          selector: 'Literal[value=/rgba?\\(|hsla?\\(/]',
          message: 'Raw rgb/hsl color — use ~theme/tokens or theme.palette + alpha()',
        },
      ],
    },
  },
  {
    // tokens.ts is the single source of truth — raw literals allowed here
    files: ['src/theme/tokens.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
];
