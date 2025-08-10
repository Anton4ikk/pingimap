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
  globals: {
    NodeJS: 'readonly'
  },
  ignorePatterns: ['dist/**', 'node_modules/**', 'src/generated/**'],
  rules: {
    'no-trailing-spaces': 'error',
    'no-tabs': 'error'
  }
};