module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020
  },
  env: {
    browser: true,
    es2017: true,
    node: true
  },
  ignorePatterns: ['build/**', 'dist/**', '.svelte-kit/**', 'node_modules/**'],
  rules: {
    'no-trailing-spaces': 'error',
    'no-tabs': 'error'
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      },
      rules: {
        'no-inner-declarations': 'off'
      }
    }
  ]
};