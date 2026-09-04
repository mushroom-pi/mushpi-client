const ts = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const { group } = require('console');
const importPlugin = require('eslint-plugin-import');
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = [
  // Global ignores — never lint build output
  {
    ignores: ['dist/**'],
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
            { pattern: '~comp/**', group: 'internal' },
            { pattern: '~components', group: 'internal' },
            { pattern: '~layout/**', group: 'internal' },
            { pattern: '@/**', group: 'internal' },
            { pattern: 'src/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // typescript plugin rule recommendations — adapt to preference
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',

      // react-hooks: enable exhaustive-deps so eslint-disable comments are meaningful
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
