import {getSpy} from './_mockApis'
import userEvent from '#src'
import {Config, Instance, UserEventApi} from '#src/setup'
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

    type CallWithConfig = {config?: Config}
    const spy = getSpy(name)
    spy.mockImplementation(async function testApi(this: Instance) {
      ;(spy.mock.calls[spy.mock.calls.length - 1] as CallWithConfig).config =
        this[Config]
      expect(this[Config][opt]).toBe(true)
    })

    const apis = userEvent.setup({[opt]: true})

    expect(apis[name]).toHaveProperty('name', `mock-${name}`)

    await (apis[name] as Function)(...args)

    expect(spy).toBeCalledTimes(1)

    const subApis = apis.setup({})

    await (subApis[name] as Function)(...args)

    expect(spy).toBeCalledTimes(2)
    expect(
      (spy.mock.calls[1] as CallWithConfig).config?.keyboardState,
    ).toBeTruthy()
    expect((spy.mock.calls[1] as CallWithConfig).config?.keyboardState).toBe(
      (spy.mock.calls[0] as CallWithConfig).config?.keyboardState,
    )
    expect(
      (spy.mock.calls[1] as CallWithConfig).config?.pointerState,
    ).toBeTruthy()
    expect((spy.mock.calls[1] as CallWithConfig).config?.pointerState).toBe(
      (spy.mock.calls[0] as CallWithConfig).config?.pointerState,
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
    spy.mockImplementation(async function testApi(this: Instance) {
      // TODO: add options param to these direct APIs
      if (!['clear', 'tab'].includes(name)) {
        expect(this[Config][opt]).toBe(true)
      }
    })

    await (userEvent[name] as Function)(...args)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toBeCalledWith(...internalArgs)
  },
)
