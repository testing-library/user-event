import cases from 'jest-in-case'
import userEvent from '#src'
import {UserEventApi} from '#src/setup'
import {setup} from '#testHelpers/utils'

/// start of mocking

// The following hacky mocking allows us to spy on imported API functions.
// The API imports are replaced with a mock with the real API as implementation.
// This way we can run the real APIs here and without repeating tests of each API implementation,
// we still can test assertions on the wiring of arguments.

// Disable eslint rules that are not worth it here as they heavily reduce readability
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable import/order */

// List of API modules imported by `setup`
import '#src/clipboard'
import '#src/convenience'
import '#src/keyboard'
import '#src/pointer'
import '#src/utility'

// `const` are not initialized when mocking is executed, but `function` are when prefixed with `mock`
function mockSpies() {}
type mockSpiesEntry<T extends keyof UserEventApi = keyof UserEventApi> = {
  mock: jest.Mock<ReturnType<UserEventApi[T]>>
  real: UserEventApi[T]
}

// access the `function` as object
interface mockSpiesRefHack extends Record<keyof UserEventApi, mockSpiesEntry> {
  (): void
}
// make the tests more readable by applying the typecast here
function getSpy(k: keyof UserEventApi) {
  return (mockSpies as mockSpiesRefHack)[k].mock
}
function getReal(k: keyof UserEventApi) {
  return (mockSpies as mockSpiesRefHack)[k].real
}

/**
 * Mock an API module by replacing some of the exports with spies.
 */
function mockApis(modulePath: string, vars: string[]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const real = jest.requireActual(modulePath)
  const fake: Record<string, jest.Mock> = {}
  for (const key of vars) {
    const mock = jest.fn()
    ;(mockSpies as mockSpiesRefHack)[key as keyof UserEventApi] = {
      mock,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      real: real[key],
    }
    fake[key] = mock
  }
  return {
    __esmodule: true,
    ...real,
    ...fake,
  }
}

// List of API functions per module
jest.mock('#src/clipboard', () =>
  mockApis('#src/clipboard', ['copy', 'cut', 'paste']),
)
jest.mock('#src/convenience', () =>
  mockApis('#src/convenience', [
    'click',
    'dblClick',
    'hover',
    'tab',
    'tripleClick',
    'unhover',
  ]),
)
jest.mock('#src/keyboard', () => mockApis('#src/keyboard', ['keyboard']))
jest.mock('#src/pointer', () => mockApis('#src/pointer', ['pointer']))
jest.mock('#src/utility', () =>
  mockApis('#src/utility', [
    'clear',
    'deselectOptions',
    'selectOptions',
    'type',
    'upload',
  ]),
)

beforeEach(async () => {
  jest.clearAllMocks()

  // Apply the mock implementation. Any earlier implementation would be removed per `resetAllMocks`.
  for (const key of Object.keys(mockSpies as mockSpiesRefHack)) {
    getSpy(key as keyof UserEventApi).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any
      getReal(key as keyof UserEventApi) as any,
    )
  }
})

/// end of mocking

type APICase<T = keyof UserEventApi> = {
  api: T
  args?: unknown[]
  elementArg?: number
}

cases<APICase>(
  'apply option defaults',
  async ({api, args = [], elementArg}) => {
    const {element} = setup<HTMLInputElement>(
      ['selectOptions', 'deselectOptions'].includes(api)
        ? `<select multiple><option>foo</option></select>`
        : api === 'upload'
        ? `<input type="file"/>`
        : `<input/>`,
    )
    element.focus()

    if (elementArg !== undefined) {
      args[elementArg] = element
    }

    const apis = userEvent.setup()

    // The wrapped API gets the name from the implementation
    // which in this case is the mock from above wrapping the original implementation.
    expect(apis[api]).toHaveProperty('name', 'mockConstructor')

    await (apis[api] as Function)(...args)

    const spy = getSpy(api)
    expect(spy).toBeCalledTimes(1)

    const subApis = apis.setup({})

    await (subApis[api] as Function)(...args)

    expect(spy).toBeCalledTimes(2)
  },
  {
    clear: {api: 'clear', elementArg: 0},
    click: {
      api: 'click',
      elementArg: 0,
    },
    copy: {
      api: 'copy',
    },
    cut: {
      api: 'cut',
    },
    dblClick: {
      api: 'dblClick',
      elementArg: 0,
    },
    hover: {
      api: 'hover',
      elementArg: 0,
    },
    unhover: {
      api: 'unhover',
      elementArg: 0,
    },
    keyboard: {
      api: 'keyboard',
      args: ['foo'],
    },
    paste: {
      api: 'paste',
      args: ['foo'],
    },
    pointer: {
      api: 'pointer',
      args: ['foo'],
    },
    selectOptions: {
      api: 'selectOptions',
      args: [null, ['foo']],
      elementArg: 0,
    },
    deSelectOptions: {
      api: 'deselectOptions',
      args: [null, ['foo']],
      elementArg: 0,
    },
    tab: {
      api: 'tab',
    },
    tripleClick: {
      api: 'tripleClick',
      elementArg: 0,
    },
    type: {
      api: 'type',
      args: [null, 'foo'],
      elementArg: 0,
    },
    upload: {
      api: 'upload',
      elementArg: 0,
    },
  },
)

test('maintain `keyboardState` through different api calls', async () => {
  const {element, getEvents} = setup<HTMLInputElement>(`<input/>`)
  element.focus()

  const api = userEvent.setup()

  await expect(api.keyboard('{a>}{b>}')).resolves.toBe(undefined)

  expect(getSpy('keyboard')).toBeCalledTimes(1)

  expect(element).toHaveValue('ab')
  expect(getEvents('keyup')).toHaveLength(0)

  await expect(api.setup({delay: 1}).keyboard('{/a}')).resolves.toBe(undefined)

  expect(element).toHaveValue('ab')
  expect(getEvents('keyup')).toHaveLength(1)

  await api.setup({delay: 0}).keyboard('b')

  expect(element).toHaveValue('abb')
  // if the state is shared through api the already pressed `b` is automatically released
  expect(getEvents('keyup')).toHaveLength(3)
})

test('maintain `pointerState` through different api calls', async () => {
  const {element, getEvents} = setup<HTMLInputElement>(`<input/>`)

  const api = userEvent.setup()

  await expect(
    api.pointer({keys: '[MouseLeft>]', target: element}),
  ).resolves.toBe(undefined)

  expect(getSpy('pointer')).toBeCalledTimes(1)
  expect(getEvents('mousedown')).toHaveLength(1)
  expect(getEvents('mouseup')).toHaveLength(0)

  await expect(api.setup({delay: 1}).pointer('[/MouseLeft]')).resolves.toBe(
    undefined,
  )

  expect(getSpy('pointer')).toBeCalledTimes(2)
  expect(getEvents('mousedown')).toHaveLength(1)
  expect(getEvents('mouseup')).toHaveLength(1)

  await api.setup({delay: 0}).pointer({target: element.ownerDocument.body})

  expect(getSpy('pointer')).toBeCalledTimes(3)
  expect(getEvents('mouseleave')).toHaveLength(1)
})
