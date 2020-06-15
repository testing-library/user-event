const config = require('kcd-scripts/jest')

module.exports = {
  ...config,
  testEnvironment: 'jest-environment-jsdom',
}
