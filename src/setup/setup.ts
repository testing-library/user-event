import {prepareDocument} from '../document'
import {createKeyboardState} from '../keyboard'
import {createPointerState} from '../pointer'
import {defaultOptionsDirect, defaultOptionsSetup, Options} from '../options'
import {
  ApiLevel,
  attachClipboardStubToView,
  getDocumentFromNode,
  setLevelRef,
} from '../utils'
import type {Instance, UserEvent, UserEventApi} from './index'
import {Config} from './config'
import * as userEventApi from './api'
import {wrapAsync} from './wrapAsync'

/**
 * Start a "session" with userEvent.
 * All APIs returned by this function share an input device state and a default configuration.
 */
export function setupMain(options: Options = {}) {
  const doc = getDocument(options)
  prepareDocument(doc)

  const view = doc.defaultView ?? /* istanbul ignore next */ window
  attachClipboardStubToView(view)

  return doSetup({
    ...defaultOptionsSetup,
    ...options,
    keyboardState: createKeyboardState(),
    pointerState: createPointerState(doc),
  })
}

/**
 * Setup in direct call per `userEvent.anyApi()`
 */
export function setupDirect(options: Partial<Config> = {}, node?: Node) {
  const doc = getDocument(options, node)
  prepareDocument(doc)

  const config: Config = {
    keyboardState: createKeyboardState(),
    pointerState: createPointerState(doc),
    ...defaultOptionsDirect,
    ...options,
  }

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

    return wrapAsync(() => impl.apply(instance, args))
  }
  Object.defineProperty(method, 'name', {get: () => impl.name})

  return method
}

function doSetup(config: Config): UserEvent {
  const instance: Instance = {
    [Config]: config,
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

function getDocument(options: Partial<Config>, node?: Node) {
  return options.document ?? (node && getDocumentFromNode(node)) ?? document
}
