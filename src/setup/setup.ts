import {prepareDocument} from '../document'
import {bindDispatchUIEvent} from '../event'
import {defaultOptionsDirect, defaultOptionsSetup, Options} from '../options'
import {
  ApiLevel,
  attachClipboardStubToView,
  getDocumentFromNode,
  setLevelRef,
  wait,
} from '../utils'
import {System} from '../system'
import type {Instance, UserEvent, UserEventApi} from './index'
import {Config} from './config'
import * as userEventApi from './api'
import {wrapAsync} from './wrapAsync'
import {DirectOptions} from './directApi'

export function createConfig(
  options: Partial<Config> = {},
  defaults: Required<Options> = defaultOptionsSetup,
  node?: Node,
): Config {
  const document = getDocument(options, node, defaults)

  return {
    ...defaults,
    ...options,
    document,
    system: options.system ?? new System(),
  }
}

/**
 * Start a "session" with userEvent.
 * All APIs returned by this function share an input device state and a default configuration.
 */
export function setupMain(options: Options = {}) {
  const config = createConfig(options)
  prepareDocument(config.document)

  const view =
    config.document.defaultView ?? /* istanbul ignore next */ globalThis.window
  attachClipboardStubToView(view)

  return doSetup(config)
}

/**
 * Setup in direct call per `userEvent.anyApi()`
 */
export function setupDirect(
  {
    keyboardState,
    pointerState,
    ...options
  }: DirectOptions & // backward-compatibility
  {keyboardState?: System; pointerState?: System} = {},
  node?: Node,
) {
  const config = createConfig(
    {
      ...options,
      system: pointerState ?? keyboardState,
    },
    defaultOptionsDirect,
    node,
  )
  prepareDocument(config.document)

  return {
    config,
    api: doSetup(config),
  }
}

/**
 * Create a set of callbacks with different default settings but the same state.
 */
export function setupSub(this: Instance, options: Options) {
  return doSetup({
    ...this[Config],
    ...options,
  })
}

function wrapAndBindImpl<
  Args extends unknown[],
  Impl extends (this: Instance, ...args: Args) => Promise<unknown>,
>(instance: Instance, impl: Impl) {
  function method(...args: Args) {
    setLevelRef(instance[Config], ApiLevel.Call)

    return wrapAsync(() =>
      impl.apply(instance, args).then(async ret => {
        await wait(instance[Config])
        return ret
      }),
    )
  }
  Object.defineProperty(method, 'name', {get: () => impl.name})

  return method
}

function doSetup(config: Config): UserEvent {
  const instance: Instance = {
    [Config]: config,
    dispatchUIEvent: bindDispatchUIEvent(config),
    ...userEventApi,
  }
  return {
    ...(Object.fromEntries(
      Object.entries(userEventApi).map(([name, api]) => [
        name,
        wrapAndBindImpl(instance, api),
      ]),
    ) as UserEventApi),
    setup: setupSub.bind(instance),
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
