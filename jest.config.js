const config = require('kcd-scripts/jest')

module.exports = {
  ...config,
  testEnvironment: 'jest-environment-jsdom',
  coverageThreshold: {
    global: {
      branches: 93,
      functions: 93,
      lines: 93,
      statements: 93,
    },
  },
}
