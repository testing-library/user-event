import type {Instance, UserEventApi} from '#src/setup/setup'

// The following hacky mocking allows us to spy on imported API functions.
// This way we can test assertions on the wiring of arguments without repeating tests of each API implementation.

// `const` are not initialized when mocking is executed, but `function` are when prefixed with `mock`
function mockApis() {}
// access the `function` as object
type mockApisRefHack = (() => void) & {
  [name in keyof UserEventApi]: {
    mock: APIMock
    real: UserEventApi[name]
  }
}

// make the tests more readable by applying the typecast here
export function getSpy(k: keyof UserEventApi) {
  return (mockApis as mockApisRefHack)[k].mock
}
export function getReal(k: keyof UserEventApi) {
  return (mockApis as mockApisRefHack)[k].real
}

interface APIMock
  extends Function,
    jest.MockInstance<
      ReturnType<UserEventApi[keyof UserEventApi]>,
      Parameters<UserEventApi[keyof UserEventApi]> & {
        this?: Instance
      }
    > {
  (
    this: Instance,
    ...args: Parameters<UserEventApi[keyof UserEventApi]>
  ): ReturnType<UserEventApi[keyof UserEventApi]>
  originalMockImplementation: (
    this: Instance,
    ...args: Parameters<UserEventApi[keyof UserEventApi]>
  ) => ReturnType<UserEventApi[keyof UserEventApi]>
}

jest.mock('#src/setup/api', () => {
  const real: UserEventApi & {__esModule: true} =
    jest.requireActual('#src/setup/api')
  const fake = {} as {
    [K in keyof UserEventApi]: jest.MockedFunction<UserEventApi[K]>
  }

  ;(Object.keys(real) as Array<keyof UserEventApi>).forEach(key => {
    const mock = jest.fn<unknown, unknown[]>(mockImpl) as unknown as APIMock
    function mockImpl(this: Instance, ...args: unknown[]) {
      Object.defineProperty(mock.mock.lastCall, 'this', {
        get: () => this,
      })
      return (real[key] as Function).apply(this, args)
    }
    mock.originalMockImplementation = mockImpl

    Object.defineProperty(mock, 'name', {
      get: () => `mock-${key}`,
    })

    Object.defineProperty(fake, key, {
      get: () => mock,
      enumerable: true,
    })

    Object.defineProperty(mockApis, key, {
      get: () => ({
        mock: fake[key],
        real: real[key],
      }),
    })
  })

  return {
    __esmodule: true,
    ...fake,
  }
})

afterEach(async () => {
  jest.clearAllMocks()
})
