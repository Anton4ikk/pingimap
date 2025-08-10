const base = require('./eslint.js');

module.exports = {
  ...base,
  extends: [
    ...base.extends,
    'plugin:svelte/recommended'
  ],
  plugins: [
    ...base.plugins,
    'svelte'
  ],
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser'
      }
    }
  ]
};