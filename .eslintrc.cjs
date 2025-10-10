module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 2024, sourceType: 'module', ecmaFeatures: { jsx: true } },
  env: { browser: true, es2021: true, node: true },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'simple-import-sort',
    'import',
    'prettier',
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:prettier/recommended', // runs Prettier as an ESLint rule and turns off conflicting rules
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    // Prettier reported as ESLint error
    'prettier/prettier': ['error'],

    // import sorting: auto-fixable by ESLint
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',

    // optional: helpful import rules
    'import/no-duplicates': 'error',
    'import/order': 'off', // turned off because simple-import-sort handles ordering

    // stylistic / quality rules you may want:
    'react/react-in-jsx-scope': 'off', // new React doesn't require import React
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
};
