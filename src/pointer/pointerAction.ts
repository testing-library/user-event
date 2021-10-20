import {Coords, wait} from '../utils'
import {pointerMove, PointerMoveAction} from './pointerMove'
import {pointerPress, PointerPressAction} from './pointerPress'
import {inputDeviceState, pointerOptions, pointerState} from './types'

export type PointerActionTarget = {
  target?: Element
  coords?: Partial<Coords>
}

export type PointerAction = PointerActionTarget &
  (
    | Omit<PointerPressAction, 'target' | 'coords'>
    | Omit<PointerMoveAction, 'target' | 'coords'>
  )

export async function pointerAction(
  actions: PointerAction[],
  options: pointerOptions,
  state: inputDeviceState,
): Promise<unknown[]> {
  const ret: Array<Promise<void>> = []

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i]
    const pointerName =
      'pointerName' in action && action.pointerName
        ? action.pointerName
        : 'keyDef' in action
        ? action.keyDef.pointerType === 'touch'
          ? action.keyDef.name
          : action.keyDef.pointerType
        : 'mouse'

    const target =
      action.target ?? getPrevTarget(pointerName, state.pointerState)
    const coords = completeCoords({
      ...(pointerName in state.pointerState.position
        ? state.pointerState.position[pointerName].coords
        : undefined),
      ...action.coords,
    })

    const promise =
      'keyDef' in action
        ? pointerPress({...action, target, coords}, state)
        : pointerMove({...action, target, coords}, state)

    ret.push(promise)

    if (options.delay > 0) {
      await promise
      if (i < actions.length - 1) {
        await wait(options.delay)
      }
    }
  }

  delete state.pointerState.activeClickCount

  return Promise.all(ret)
}

function getPrevTarget(pointerName: string, state: pointerState) {
  if (!(pointerName in state.position) || !state.position[pointerName].target) {
    throw new Error(
      'This pointer has no previous position. Provide a target property!',
    )
  }

  return state.position[pointerName].target as Element
}

function completeCoords({
  x = 0,
  y = 0,
  clientX = x,
  clientY = y,
  offsetX = x,
  offsetY = y,
  pageX = clientX,
  pageY = clientY,
}: Partial<Coords>) {
  return {x, y, clientX, clientY, offsetX, offsetY, pageX, pageY}
}
