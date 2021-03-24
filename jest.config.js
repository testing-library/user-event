const config = require('kcd-scripts/jest')

module.exports = {
  ...config,
  testEnvironment: 'jest-environment-jsdom',

  // this repo is testing utils
  testPathIgnorePatterns: config.testPathIgnorePatterns.filter(f => f !== '/__tests__/utils/'),
}
