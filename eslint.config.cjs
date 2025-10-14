const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  // Convert the legacy "extends" entries into flat-config objects:
  ...compat.extends(
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ),

  // Project-level settings / rules (applies to js/ts/jsx/tsx)
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    ignores: ['eslint.config.cjs', 'node_modules/**', 'dist/**', 'build/**'],

    // same "settings" you had (react version detect)
    settings: { react: { version: 'detect' } },

    rules: {
      // Prettier errors surfaced as ESLint errors (same as 'prettier/prettier': ['error'])
      'prettier/prettier': ['error'],

      // import sorting (auto-fixable)
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',

      // import helper rules
      'import/no-duplicates': 'error',
      'import/order': 'off', // turned off because we use simple-import-sort

      // keep the small react/typescript rule tweaks you had
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },
];
