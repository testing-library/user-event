import cases from 'jest-in-case'
import userEvent from '#src'
import {UserEventApis} from '#src/setup'
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
import '#src/clear'
import '#src/click'
import '#src/hover'
import '#src/keyboard'
import '#src/paste'
import '#src/pointer'
import '#src/selectOptions'
import '#src/tab'
import '#src/type'
import '#src/upload'

// `const` are not initialized when mocking is executed, but `function` are when prefixed with `mock`
function mockSpies() {}
type mockSpiesEntry<T extends keyof UserEventApis = keyof UserEventApis> = {
  mock: jest.Mock<UserEventApis[T]>
  real: UserEventApis[T]
}

// access the `function` as object
interface mockSpiesRefHack extends Record<keyof UserEventApis, mockSpiesEntry> {
  (): void
}
// make the tests more readable by applying the typecast here
function getSpy(k: keyof UserEventApis) {
  return (mockSpies as mockSpiesRefHack)[k].mock
}
function getReal(k: keyof UserEventApis) {
  return (mockSpies as mockSpiesRefHack)[k].real
}

/**
 * Mock an API module by replacing some of the exports with spies.
 */
function mockApis(modulePath: string, ...vars: string[]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const real = jest.requireActual(modulePath)
  const fake: Record<string, jest.Mock> = {}
  for (const key of vars) {
    const mock = jest.fn()
    ;(mockSpies as mockSpiesRefHack)[key as keyof UserEventApis] = {
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
jest.mock('#src/clear', () => mockApis('#src/clear', 'clear'))
jest.mock('#src/click', () =>
  mockApis('#src/click', 'click', 'dblClick', 'tripleClick'),
)
jest.mock('#src/hover', () => mockApis('#src/hover', 'hover', 'unhover'))
jest.mock('#src/keyboard', () => mockApis('#src/keyboard', 'keyboard'))
jest.mock('#src/paste', () => mockApis('#src/paste', 'paste'))
jest.mock('#src/pointer', () => mockApis('#src/pointer', 'pointer'))
jest.mock('#src/selectOptions', () =>
  mockApis('#src/selectOptions', 'selectOptions', 'deselectOptions'),
)
jest.mock('#src/tab', () => mockApis('#src/tab', 'tab'))
jest.mock('#src/type', () => mockApis('#src/type', 'type'))
jest.mock('#src/upload', () => mockApis('#src/upload', 'upload'))

beforeEach(() => {
  jest.resetAllMocks()

  // Apply the mock implementation. Any earlier implementation would be removed per `resetAllMocks`.
  for (const key of Object.keys(mockSpies as mockSpiesRefHack)) {
    getSpy(key as keyof UserEventApis).mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any
      getReal(key as keyof UserEventApis) as any,
    )
  }
})

/// end of mocking

type APICase<T = keyof UserEventApis> = {
  api: T
  args?: unknown[]
  elementArg?: number
  optionsArg?: number
  options?: Record<string, unknown>
  optionsSub?: Record<string, unknown>
}

cases<APICase>(
  'apply option defaults',
  ({api, args = [], elementArg, optionsArg, options, optionsSub}) => {
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

    const apis = userEvent.setup(options)

    ;(apis[api] as Function)(...args)

    const spy = getSpy(api)
    expect(spy).toBeCalledTimes(1)

    // ensure that options are applied correctly
    if (optionsArg !== undefined && options) {
      expect(spy.mock.calls[0][optionsArg]).toEqual(
        expect.objectContaining(options),
      )
    }

    const subOptions = {
      // just flip boolean values
      ...Object.fromEntries(
        Object.entries(options ?? {}).map(([key, value]) => [
          key,
          typeof value === 'boolean' ? !value : value,
        ]),
      ),
      ...optionsSub,
    }
    const subApis = apis.setup(subOptions)

    ;(subApis[api] as Function)(...args)

    expect(spy).toBeCalledTimes(2)

    // ensure that the new set of api receives different defaults
    if (optionsArg !== undefined) {
      expect(spy.mock.calls[1][optionsArg]).toEqual(
        expect.objectContaining(subOptions),
      )
    }
  },
  {
    clear: {api: 'clear', elementArg: 0},
    click: {
      api: 'click',
      elementArg: 0,
      optionsArg: 1,
      options: {
        skipPointerEventsCheck: true,
      },
    },
    dblClick: {
      api: 'dblClick',
      elementArg: 0,
      optionsArg: 1,
      options: {
        skipPointerEventsCheck: true,
      },
    },
    hover: {
      api: 'hover',
      elementArg: 0,
      optionsArg: 1,
      options: {
        skipPointerEventsCheck: true,
      },
    },
    unhover: {
      api: 'unhover',
      elementArg: 0,
      optionsArg: 1,
      options: {
        skipPointerEventsCheck: true,
      },
    },
    keyboard: {
      api: 'keyboard',
      args: ['foo'],
      optionsArg: 1,
      options: {
        keyboardMap: [{key: 'x', code: 'SpecialKey'}],
      },
      optionsSub: {
        keyboardMap: [{key: 'y', code: 'SpecialKey'}],
      },
    },
    paste: {api: 'paste', args: ['foo']},
    pointer: {
      api: 'pointer',
      args: ['foo'],
      optionsArg: 1,
      options: {
        pointerMap: [{name: 'x', pointerType: 'touch'}],
      },
      optionsSub: {
        pointerMap: [{name: 'y', pointerType: 'touch'}],
      },
    },
    selectOptions: {
      api: 'selectOptions',
      args: [null, ['foo']],
      elementArg: 0,
      optionsArg: 2,
      options: {
        skipPointerEventsCheck: true,
      },
    },
    deSelectOptions: {
      api: 'deselectOptions',
      args: [null, ['foo']],
      elementArg: 0,
      optionsArg: 2,
      options: {
        skipPointerEventsCheck: true,
      },
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
      optionsArg: 2,
      options: {
        skipClick: true,
      },
    },
    upload: {
      api: 'upload',
      elementArg: 0,
      optionsArg: 3,
      options: {
        applyAccept: true,
      },
    },
  },
)

test('maintain `keyboardState` through different api calls', async () => {
  const {element, getEvents} = setup<HTMLInputElement>(`<input/>`)
  element.focus()

  const api = userEvent.setup()

  expect(api.keyboard('{a>}{b>}')).toBe(undefined)

  expect(getSpy('keyboard')).toBeCalledTimes(1)

  expect(element).toHaveValue('ab')
  expect(getEvents('keyup')).toHaveLength(0)

  await expect(api.keyboard('{/a}', {delay: 1})).resolves.toBe(undefined)

  expect(element).toHaveValue('ab')
  expect(getEvents('keyup')).toHaveLength(1)

  api.setup({}).keyboard('b')

  expect(element).toHaveValue('abb')
  // if the state is shared through api the already pressed `b` is automatically released
  expect(getEvents('keyup')).toHaveLength(3)
})

test('maintain `pointerState` through different api calls', async () => {
  const {element, getEvents} = setup<HTMLInputElement>(`<input/>`)

  const api = userEvent.setup()

  expect(api.pointer({keys: '[MouseLeft>]', target: element})).toBe(undefined)

  expect(getSpy('pointer')).toBeCalledTimes(1)
  expect(getEvents('mousedown')).toHaveLength(1)
  expect(getEvents('mouseup')).toHaveLength(0)

  await expect(api.pointer('[/MouseLeft]', {delay: 1})).resolves.toBe(undefined)

  expect(getSpy('pointer')).toBeCalledTimes(2)
  expect(getEvents('mousedown')).toHaveLength(1)
  expect(getEvents('mouseup')).toHaveLength(1)

  api.setup({}).pointer({target: element.ownerDocument.body})

  expect(getSpy('pointer')).toBeCalledTimes(3)
  expect(getEvents('mouseleave')).toHaveLength(1)
})
