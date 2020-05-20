import '@testing-library/jest-dom/extend-expect'

// prevent console calls from making it out into the wild
beforeEach(() => {
  jest.spyOn(console, 'error')
  jest.spyOn(console, 'log')
  jest.spyOn(console, 'warn')
  jest.spyOn(console, 'info')
})

afterEach(() => {
  if (console.error.mock.calls.length) {
    throw new Error(`console.error should not be called in tests`)
  }
  console.error.mockRestore()

  if (console.log.mock.calls.length) {
    throw new Error(`console.log should not be called in tests`)
  }
  console.log.mockRestore()

  if (console.warn.mock.calls.length) {
    throw new Error(`console.warn should not be called in tests`)
  }
  console.warn.mockRestore()

  if (console.info.mock.calls.length) {
    throw new Error(`console.info should not be called in tests`)
  }
  console.info.mockRestore()
})

/*
eslint
  no-console: "off",
*/
