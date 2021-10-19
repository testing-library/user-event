import {getConfig as getDOMTestingLibraryConfig} from '@testing-library/dom'
import {defaultKeyMap} from './keyMap'
import {pointerImplementation} from './pointerImplementation'
import {Coords, pointerOptions, pointerState} from './types'

export function pointer(
  keys: string,
  target: Element,
  coords?: Partial<Coords>,
  options?: Partial<pointerOptions & {pointerState: pointerState; delay: 0}>,
): pointerState
export function pointer(
  keys: string,
  target: Element,
  coords: Partial<Coords>,
  options: Partial<
    pointerOptions & {pointerState: pointerState; delay: number}
  >,
): Promise<pointerState>
export function pointer(
  keys: string,
  target: Element,
  coords: Partial<Coords> = {},
  options: Partial<pointerOptions & {pointerState: pointerState}> = {},
) {
  const {promise, state} = pointerImplementationWrapper(
    keys,
    target,
    coords,
    options,
  )

  if ((options.delay ?? 0) > 0) {
    return getDOMTestingLibraryConfig().asyncWrapper(() =>
      promise.then(() => state),
    )
  } else {
    // prevent users from dealing with UnhandledPromiseRejectionWarning in sync call
    promise.catch(console.error)

    return state
  }
}

export function pointerImplementationWrapper(
  keys: string,
  target: Element,
  coords: Partial<Coords>,
  config: Partial<pointerOptions & {pointerState: pointerState}>,
) {
  const {
    pointerState: state = createPointerState(),
    delay = 0,
    pointerMap = defaultKeyMap,
  } = config
  const options = {
    delay,
    pointerMap,
  }

  return {
    promise: pointerImplementation(keys, target, coords, options, state),
    state,
  }
}

export function createPointerState(): pointerState {
  return {
    pointerId: 1,
    position: [],
    pressed: [],
  }
}
