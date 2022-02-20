import {getSpy} from './_mockApis'
import userEvent from '#src'
import {Config, UserEventApi} from '#src/setup'
import {render} from '#testHelpers'

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
const apiDeclarationsEntries = Object.entries(apiDeclarations) as Array<
  [keyof ApiDeclarations, ApiDeclarations[keyof ApiDeclarations]]
>

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

test.each(apiDeclarationsEntries)(
  'call `%s` api on instance',
  async (name, {args = [], elementArg, elementHtml = `<input/>`}) => {
    const {element} = render<HTMLInputElement>(elementHtml)
    element.focus()

    if (elementArg !== undefined) {
      args[elementArg] = element
    }

    const spy = getSpy(name)

    const apis = userEvent.setup({[opt]: true})

    expect(apis[name]).toHaveProperty('name', `mock-${name}`)

    await (apis[name] as Function)(...args)

    expect(spy).toBeCalledTimes(1)
    expect(spy.mock.lastCall?.this?.[Config][opt]).toBe(true)

    const subApis = apis.setup({})

    await (subApis[name] as Function)(...args)

    expect(spy).toBeCalledTimes(2)
    expect(spy.mock.lastCall?.this?.[Config][opt]).toBe(true)
    expect(spy.mock.lastCall?.this?.[Config]).toHaveProperty(
      'keyboardState',
      expect.objectContaining({}),
    )
    expect(spy.mock.calls[1]?.this?.[Config].keyboardState).toBe(
      spy.mock.calls[0]?.this?.[Config].keyboardState,
    )
    expect(spy.mock.lastCall?.this?.[Config]).toHaveProperty(
      'pointerState',
      expect.objectContaining({}),
    )
    expect(spy.mock.calls[1]?.this?.[Config].pointerState).toBe(
      spy.mock.calls[0]?.this?.[Config].pointerState,
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
    element.focus()

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
      expect(spy.mock.lastCall?.this?.[Config][opt]).toBe(true)
    }

    // options arg can be omitted
    await (userEvent[name] as Function)(...args.slice(0, -1))

    expect(spy).toBeCalledTimes(2)
    expect(spy.mock.lastCall?.this?.[Config][opt]).toBe(undefined)
  },
)
