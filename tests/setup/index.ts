import DOMTestingLibrary from '#src/_interop/dtl'
import {getSpy} from './_mockApis'
import userEvent from '#src'
import type {Instance, UserEventApi} from '#src/setup/setup'
import {render} from '#testHelpers'

const { getConfig } = DOMTestingLibrary

type ApiDeclarations = {
  [api in keyof UserEventApi]: {
    args?: unknown[]
    elementArg?: number
    elementHtml?: string
    optionsArg?: number
  }
}

const apiDeclarations: ApiDeclarations = {
  clear: {elementArg: 0},
  click: {
    elementArg: 0,
  },
  copy: {},
  cut: {},
  dblClick: {
    elementArg: 0,
  },
  hover: {
    elementArg: 0,
  },
  unhover: {
    elementArg: 0,
  },
  keyboard: {
    args: ['foo'],
  },
  paste: {
    args: ['foo'],
  },
  pointer: {
    args: ['foo'],
  },
  selectOptions: {
    args: [null, ['foo']],
    elementArg: 0,
    elementHtml: `<select multiple><option>foo</option></select>`,
  },
  deselectOptions: {
    args: [null, ['foo']],
    elementArg: 0,
    elementHtml: `<select multiple><option>foo</option></select>`,
  },
  tab: {
    optionsArg: 0,
  },
  tripleClick: {
    elementArg: 0,
  },
  type: {
    args: [null, 'foo'],
    elementArg: 0,
    optionsArg: 2,
  },
  upload: {
    args: [null, new File(['foo'], 'foo.txt')],
    elementArg: 0,
    elementHtml: `<input type="file"/>`,
  },
}

type ApiDeclarationsEntry<k extends keyof ApiDeclarations = keyof ApiDeclarations> = [k, ApiDeclarations[k]]
const apiDeclarationsEntries = Object.entries(apiDeclarations) as ApiDeclarationsEntry[]

const opt = Symbol('testOption')
declare module '#src/setup' {
  export interface Config {
    [opt]?: true
  }
}
declare module '#src/options' {
  export interface Options {
    [opt]?: true
  }
}

// eslint-disable-next-line @typescript-eslint/unbound-method
const realAsyncWrapper = getConfig().asyncWrapper
afterEach(() => {
  getConfig().asyncWrapper = realAsyncWrapper
  mocks.restoreAllMocks()
})

test.each(apiDeclarationsEntries)(
  'call `%s` api on instance',
  async (name, {args = [], elementArg, elementHtml = `<input/>`}) => {
    const {element} = render<HTMLInputElement>(elementHtml)

    if (elementArg !== undefined) {
      args[elementArg] = element
    }

    const spy = getSpy(name)

    const apis = userEvent.setup({[opt]: true})

    expect(apis[name]).toHaveProperty('name', `mock-${name}`)

    // Replace the asyncWrapper to make sure that a delayed state update happens inside of it
    const stateUpdate = mocks.fn()
    spy.mockImplementation(async function impl(
      this: Instance,
      ...a: Parameters<typeof spy>
    ) {
      const ret = spy.originalMockImplementation.apply(this, a)
      void ret.then(() => setTimeout(stateUpdate))
      return ret
    } as UserEventApi[typeof name])
    const asyncWrapper = mocks.fn(async (cb: () => Promise<unknown>) => {
      stateUpdate.mockClear()
      const ret = cb()
      expect(stateUpdate).not.toBeCalled()
      await ret
      expect(stateUpdate).toBeCalled()
      return ret
    })
    getConfig().asyncWrapper = asyncWrapper

    await (apis[name] as Function)(...args)

    expect(spy).toBeCalledTimes(1)
    expect(spy.mock.lastCall?.this?.config[opt]).toBe(true)

    // Make sure the asyncWrapper mock has been used in the API call
    expect(asyncWrapper).toBeCalled()

    const subApis = apis.setup({})

    await (subApis[name] as Function)(...args)

    expect(spy).toBeCalledTimes(2)
    expect(spy.mock.lastCall?.this?.config[opt]).toBe(true)
    expect(spy.mock.calls[1]?.this?.system).toBe(
      spy.mock.calls[0]?.this?.system,
    )
  },
)

test.each(apiDeclarationsEntries)(
  'call `%s` api as directApi',
  async (
    name,
    {args = [], elementArg, elementHtml = `<input/>`, optionsArg},
  ) => {
    const {element} = render<HTMLInputElement>(elementHtml)

    if (elementArg !== undefined) {
      args[elementArg] = element
    }
    args.push({[opt]: true})

    const internalArgs =
      optionsArg === undefined ? args.slice(0, -1) : [...args]

    const spy = getSpy(name)

    await (userEvent[name] as Function)(...args)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith(...internalArgs)

    if (!['clear', 'tab'].includes(name)) {
      // TODO: add options param to these direct APIs
      expect(spy.mock.lastCall?.this?.config[opt]).toBe(true)
    }

    // options arg can be omitted
    await (userEvent[name] as Function)(...args.slice(0, -1))

    expect(spy).toBeCalledTimes(2)
    expect(spy.mock.lastCall?.this?.config[opt]).toBe(undefined)
  },
)
