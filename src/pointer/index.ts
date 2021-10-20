import {getConfig as getDOMTestingLibraryConfig} from '@testing-library/dom'
import {createKeyboardState} from '../keyboard'
import {parseKeyDef} from './parseKeyDef'
import {defaultKeyMap} from './keyMap'
import {
  pointerAction,
  PointerAction,
  PointerActionTarget,
} from './pointerAction'
import type {inputDeviceState, pointerOptions, pointerState} from './types'

export function pointer(
  input: PointerInput,
  options?: Partial<pointerOptions & {delay: 0} & inputDeviceState>,
): pointerState
export function pointer(
  input: PointerInput,
  options: Partial<pointerOptions & {delay: number} & inputDeviceState>,
): Promise<pointerState>
export function pointer(
  input: PointerInput,
  options: Partial<pointerOptions & inputDeviceState> = {},
) {
  const {promise, pointerState} = pointerImplementationWrapper(input, options)

  if ((options.delay ?? 0) > 0) {
    return getDOMTestingLibraryConfig().asyncWrapper(() =>
      promise.then(() => pointerState),
    )
  } else {
    // prevent users from dealing with UnhandledPromiseRejectionWarning in sync call
    promise.catch(console.error)

    return pointerState
  }
}

type PointerActionInput =
  | string
  | ({keys: string} & PointerActionTarget)
  | PointerAction
type PointerInput = PointerActionInput | Array<PointerActionInput>

export function pointerImplementationWrapper(
  input: PointerInput,
  config: Partial<pointerOptions & inputDeviceState>,
) {
  const {
    pointerState = createPointerState(),
    keyboardState = createKeyboardState(),
    delay = 0,
    pointerMap = defaultKeyMap,
  } = config
  const options = {
    delay,
    pointerMap,
  }

  const actions: PointerAction[] = []
  ;(Array.isArray(input) ? input : [input]).forEach(actionInput => {
    if (typeof actionInput === 'string') {
      actions.push(...parseKeyDef(actionInput, options))
    } else if ('keys' in actionInput) {
      actions.push(
        ...parseKeyDef(actionInput.keys, options).map(i => ({
          ...actionInput,
          ...i,
        })),
      )
    } else {
      actions.push(actionInput)
    }
  })

  return {
    promise: pointerAction(actions, options, {pointerState, keyboardState}),
    pointerState,
  }
}

export function createPointerState(): pointerState {
  return {
    pointerId: 1,
    position: {
      mouse: {
        pointerType: 'mouse',
        pointerId: 1,
        coords: {
          clientX: 0,
          clientY: 0,
          offsetX: 0,
          offsetY: 0,
          pageX: 0,
          pageY: 0,
          x: 0,
          y: 0,
        },
      },
    },
    pressed: [],
  }
}
