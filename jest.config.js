const config = require('kcd-scripts/jest')

config.roots = ['<rootDir>']

config.moduleNameMapper = {
  '^#src$': '<rootDir>/src/index',
  '^#src/(.*)$': '<rootDir>/src/$1',
  '^#testHelpers$': '<rootDir>/tests/_helpers/index',
}

config.testEnvironment = 'jsdom'

config.setupFilesAfterEnv = [
  '<rootDir>/tests/_setup-env.js',
  '<rootDir>/tests/react/_env/setup-env.js',
]

config.testMatch.push('<rootDir>/tests/**/*.+(js|jsx|ts|tsx)')

// Ignore files/dirs starting with an underscore (setup, helper, ...)
// unless the file ends on `.test.{type}` so that we can add tests of our test utilities.
config.testPathIgnorePatterns.push('/_.*(?<!\\.test\\.[jt]sx?)$')

// Ignore declaration files
config.testPathIgnorePatterns.push('\\.d\\.ts$')

module.exports = config
