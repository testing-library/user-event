import {patchFocus} from '../document/patchFocus'
import {prepareDocument} from '../document/prepareDocument'
import {dispatchEvent, dispatchUIEvent} from '../event'
import {defaultKeyMap as defaultKeyboardMap} from '../keyboard/keyMap'
import {defaultKeyMap as defaultPointerMap} from '../pointer/keyMap'
import {Options, PointerEventsCheckLevel} from '../options'
import {
  ApiLevel,
  attachClipboardStubToView,
  getDocumentFromNode,
  getWindow,
  setLevelRef,
  wait,
} from '../utils'
import {System} from '../system'
import {userEventApi} from './api'
import {wrapAsync} from './wrapAsync'
import {DirectOptions} from './directApi'

/**
 * Default options applied when API is called per `userEvent.anyApi()`
 */
const defaultOptionsDirect: Required<Options> = {
  applyAccept: true,
  autoModify: true,
  delay: 0,
  document: globalThis.document,
  keyboardMap: defaultKeyboardMap,
  pointerMap: defaultPointerMap,
  pointerEventsCheck: PointerEventsCheckLevel.EachApiCall,
  skipAutoClose: false,
  skipClick: false,
  skipHover: false,
  writeToClipboard: false,
  advanceTimers: () => Promise.resolve(),
}

/**
 * Default options applied when API is called per `userEvent().anyApi()`
 */
const defaultOptionsSetup: Required<Options> = {
  ...defaultOptionsDirect,
  writeToClipboard: true,
}

export type UserEventApi = typeof userEventApi

export type UserEvent = {
  readonly setup: (...args: Parameters<typeof setupSub>) => UserEvent
} & {
  readonly [k in keyof UserEventApi]: (
    ...args: Parameters<UserEventApi[k]>
  ) => ReturnType<UserEventApi[k]>
}

export type Instance = UserEventApi & {
  config: Config
  dispatchEvent: OmitThisParameter<typeof dispatchEvent>
  dispatchUIEvent: OmitThisParameter<typeof dispatchUIEvent>
  system: System
  levelRefs: Record<number, object | undefined>
}

export type Config = Required<Options>

export function createConfig(
  options: Options = {},
  defaults: Required<Options> = defaultOptionsSetup,
  node?: Node,
): Config {
  const document = getDocument(options, node, defaults)

  return {
    ...defaults,
    ...options,
    document,
  }
}

/**
 * Start a "session" with userEvent.
 * All APIs returned by this function share an input device state and a default configuration.
 */
export function setupMain(options: Options = {}) {
  const config = createConfig(options)
  prepareDocument(config.document)
  patchFocus(getWindow(config.document).HTMLElement)

  const view =
    config.document.defaultView ?? /* istanbul ignore next */ globalThis.window
  attachClipboardStubToView(view)

  return createInstance(config).api
}

/**
 * Setup in direct call per `userEvent.anyApi()`
 */
export function setupDirect(
  {
    keyboardState,
    pointerState,
    ...options
  }: DirectOptions & {keyboardState?: System, pointerState?: System} = {}, // backward-compatibility
  node?: Node,
) {
  const config = createConfig(options, defaultOptionsDirect, node)
  prepareDocument(config.document)
  patchFocus(getWindow(config.document).HTMLElement)

  const system = pointerState ?? keyboardState ?? new System()

  return {
    api: createInstance(config, system).api,
    system,
  }
}

/**
 * Create a set of callbacks with different default settings but the same state.
 */
export function setupSub(this: Instance, options: Options) {
  return createInstance({...this.config, ...options}, this.system).api
}

function wrapAndBindImpl<
  Args extends unknown[],
  Impl extends (this: Instance, ...args: Args) => Promise<unknown>,
>(instance: Instance, impl: Impl) {
  function method(...args: Args) {
    setLevelRef(instance, ApiLevel.Call)

    return wrapAsync(() =>
      impl.apply(instance, args).then(async ret => {
        await wait(instance.config)
        return ret
      }),
    )
  }
  Object.defineProperty(method, 'name', {get: () => impl.name})

  return method
}

export function createInstance(
  config: Config,
  system: System = new System(),
): {
    instance: Instance
    api: UserEvent
  } {
  const instance = {} as Instance
  Object.assign(instance, {
    config,
    dispatchEvent: dispatchEvent.bind(instance),
    dispatchUIEvent: dispatchUIEvent.bind(instance),
    system,
    levelRefs: {},
    ...userEventApi,
  })

  return {
    instance,
    api: {
      ...(Object.fromEntries(
        Object.entries(userEventApi).map(([name, api]) => [
          name,
          wrapAndBindImpl(instance, api),
        ]),
      ) as UserEventApi),
      setup: setupSub.bind(instance),
    },
  }
}

function getDocument(
  options: Partial<Config>,
  node: Node | undefined,
  defaults: Required<Options>,
) {
  return (
    options.document ?? (node && getDocumentFromNode(node)) ?? defaults.document
  )
}
