import '@testing-library/jest-dom/extend-expect'
import isCI from 'is-ci'

// prevent console calls from making it out into the wild
beforeEach(() => {
  jest.spyOn(console, 'error')
  jest.spyOn(console, 'log')
  jest.spyOn(console, 'warn')
  jest.spyOn(console, 'info')
})

// but we only assert in CI because it's annoying locally during development
afterEach(() => {
  if (isCI && console.error.mock.calls.length) {
    throw new Error(`console.error should not be called in tests`)
  }
  console.error.mockRestore()

  if (isCI && console.log.mock.calls.length) {
    throw new Error(`console.log should not be called in tests`)
  }
  console.log.mockRestore()

  if (isCI && console.warn.mock.calls.length) {
    throw new Error(`console.warn should not be called in tests`)
  }
  console.warn.mockRestore()

  if (isCI && console.info.mock.calls.length) {
    throw new Error(`console.info should not be called in tests`)
  }
  console.info.mockRestore()
})
/*
eslint
  no-console: "off",
*/
