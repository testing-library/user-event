module.exports = {
  extends: './node_modules/kcd-scripts/eslint.js',
  parser: '@typescript-eslint/parser',
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
  rules: {
    'no-await-in-loop': 0,
    'testing-library/no-dom-import': 0,
    '@typescript-eslint/non-nullable-type-assertion-style': 0,
  },
}
