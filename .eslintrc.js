module.exports = {
  extends: './node_modules/kcd-scripts/eslint.js',
  parserOptions: {
    project: ['./tsconfig.json', './tests/tsconfig.json'],
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  plugins: ['eslint-plugin-local-rules'],
  rules: {
    'no-await-in-loop': 0,
    'testing-library/no-dom-import': 0,
    '@typescript-eslint/non-nullable-type-assertion-style': 0,
    // ES2022 will be released in June 2022
    'prefer-object-has-own': 0,
  },
  overrides: [
    {
      files: ['src/**'],
      rules: {
        'local-rules/explicit-globals': 'error',
      },
    },
  ],
}
