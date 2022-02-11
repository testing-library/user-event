import type {UserEventApi} from '#src/setup'

// The following hacky mocking allows us to spy on imported API functions.
// This way we can test assertions on the wiring of arguments without repeating tests of each API implementation.

// `const` are not initialized when mocking is executed, but `function` are when prefixed with `mock`
function mockApis() {}
// access the `function` as object
type mockApisRefHack = (() => void) &
  {
    [name in keyof UserEventApi]: {
      mock: jest.MockedFunction<UserEventApi[keyof UserEventApi]>
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

jest.mock('#src/setup/api', () => {
  const real: UserEventApi & {__esModule: true} =
    jest.requireActual('#src/setup/api')
  const fake: Record<string, jest.Mock> = {}
  // eslint-disable-next-line guard-for-in
  for (const key in real) {
    const mock = jest.fn()

    Object.defineProperty(mock, 'name', {
      get: () => `mock-${key}`,
    })

    Object.defineProperty(mockApis, key, {
      get: () => ({
        mock,
        real: real[key as keyof UserEventApi],
      }),
    })

    fake[key] = mock
  }
  return {
    __esmodule: true,
    ...fake,
  }
})

afterEach(async () => {
  jest.clearAllMocks()
})
