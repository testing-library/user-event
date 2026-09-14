const isCI = !!process.env.CI

beforeEach(() => {
  mocks.spyOn(console, 'error')
  mocks.spyOn(console, 'log')
  mocks.spyOn(console, 'warn')
  mocks.spyOn(console, 'info')
})

afterEach(() => {
  for (const k of ['error', 'log', 'warn', 'info']) {
    const calls = console[k].mock.calls
    if (isCI && calls.length) {
      throw new Error(`console.${k} should not be calls in tests and was called ${calls.length} times:\n`
        + calls.map((args, i) => (`\n#${i}:\n` + args.map(a => (
          (typeof a === 'object' || typeof a === 'function'
              ? typeof a
              : JSON.stringify(a)
          ) + '\n'
        ))))
      )
    }
    console[k].mockRestore()
  }
})
