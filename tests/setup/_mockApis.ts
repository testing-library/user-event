import type {MockedFunction, MockInstance} from 'jest-mock'
import type {Instance, UserEventApi} from '#src/setup/setup'
import { userEventApi } from '#src/setup/api'

// `const` are not initialized when mocking is executed, but `function` are when prefixed with `mock`
const mockApis = {} as {
  [name in keyof UserEventApi]: {
    mock: APIMock<name>
    real: UserEventApi[name]
  }
}

export function getSpy<K extends keyof UserEventApi>(k: K) {
  return mockApis[k].mock
}
export function getReal<K extends keyof UserEventApi>(k: K) {
  return mockApis[k].real
}

type APIMock<name extends keyof UserEventApi> = UserEventApi[name] & MockInstance<UserEventApi[name]> & {
  originalMockImplementation: (
    this: Instance,
    ...args: Parameters<UserEventApi[keyof UserEventApi]>
  ) => ReturnType<UserEventApi[keyof UserEventApi]>
  mock: {
    lastCall?: {
      this: Instance
    }
    calls: {this: Instance}[]
  }
}

const real = {
  ...userEventApi,
}
const fake = {} as {
  [K in keyof UserEventApi]: MockedFunction<UserEventApi[K]>
}
;(Object.keys(userEventApi) as Array<keyof UserEventApi>).forEach(key => {
  const mock = mocks.fn<UserEventApi[keyof UserEventApi]>(mockImpl)
  function mockImpl(this: Instance, ...args: unknown[]) {
    Object.defineProperty(mock.mock.lastCall, 'this', {
      get: () => this,
      configurable: true,
    })
    return (real[key] as Function).apply(this, args)
  }
  Object.defineProperty(mock, 'originalMockImplementation', {
    get: () => mockImpl,
    configurable: true,
  })

  Object.defineProperty(mock, 'name', {
    get: () => `mock-${key}`,
    configurable: true,
  })

  Object.defineProperty(fake, key, {
    get: () => mock,
    enumerable: true,
    configurable: true,
  })

  Object.defineProperty(mockApis, key, {
    get: () => ({
      mock: fake[key],
      real: real[key],
    }),
    configurable: true,
  })

  Object.defineProperty(userEventApi, key, {
    get: () => fake[key],
    enumerable: true,
    configurable: true,
  })
})

afterEach(async () => {
  mocks.clearAllMocks()
})
