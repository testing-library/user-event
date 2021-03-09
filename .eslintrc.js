module.exports = {
  extends: './node_modules/kcd-scripts/eslint.js',
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  rules: {
    'testing-library/no-dom-import': 0,
  },
}
