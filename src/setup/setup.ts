import {prepareDocument} from '../document'
import {createKeyboardState} from '../keyboard'
import {createPointerState} from '../pointer'
import {Options} from '../options'
import {attachClipboardStubToView, getDocumentFromNode} from '../utils'
import type {UserEvent, UserEventApi} from './index'
import {Config, defaultOptionsDirect, defaultOptionsSetup} from './config'
import {userEventApi} from './api'

/**
 * Start a "session" with userEvent.
 * All APIs returned by this function share an input device state and a default configuration.
 */
export function setupMain(options: Options = {}) {
  const doc = getDocument(options)
  prepareDocument(doc)

  const view = doc.defaultView ?? window
  attachClipboardStubToView(view)

  return doSetup({
    ...defaultOptionsSetup,
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

  return doSetup({
    keyboardState: createKeyboardState(),
    pointerState: createPointerState(doc),
    ...defaultOptionsDirect,
    ...options,
  })
}

/**
 * Create a set of callbacks with different default settings but the same state.
 */
export function setupSub(this: UserEvent, options: Options) {
  return doSetup({
    ...this[Config],
    ...options,
  })
}

function wrapImpl<
  This extends UserEvent,
  Args extends unknown[],
  Impl extends (this: This, ...args: Args) => Promise<unknown>,
>(impl: Impl) {
  function method(this: This, ...args: Args) {
    return impl.apply(this, args)
    // TODO: wrap async
    // return wrapAsync(() => impl.apply(this, args))
  }
  Object.defineProperty(method, 'name', {get: () => impl.name})

  return method
}
const wrappedApis = Object.fromEntries(
  Object.entries(userEventApi).map(([name, impl]) => [name, wrapImpl(impl)]),
) as UserEventApi

function doSetup(config: Config) {
  return {
    ...wrappedApis,
    setup: setupSub,
    [Config]: config,
  }
}

function getDocument(options: Partial<Config> = {}, node?: Node) {
  return options.document ?? (node && getDocumentFromNode(node)) ?? document
}
