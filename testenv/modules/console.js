const isCI = !!process.env.CI

beforeEach(() => {
  mocks.spyOn(console, 'error')
  mocks.spyOn(console, 'log')
  mocks.spyOn(console, 'warn')
  mocks.spyOn(console, 'info')
})

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
