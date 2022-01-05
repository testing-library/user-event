import {Config} from '../setup'
import {wait} from '../utils'
import {pointerMove, PointerMoveAction} from './pointerMove'
import {pointerPress, PointerPressAction} from './pointerPress'
import {pointerState, PointerTarget, SelectionTarget} from './types'

export type PointerActionTarget = Partial<PointerTarget> &
  Partial<SelectionTarget>

export type PointerAction = PointerActionTarget &
  (
    | Omit<PointerPressAction, 'target' | 'coords'>
    | Omit<PointerMoveAction, 'target' | 'coords'>
  )

export async function pointerAction(config: Config, actions: PointerAction[]) {
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
      action.target ?? getPrevTarget(pointerName, config.pointerState)
    const coords =
      action.coords ??
      (pointerName in config.pointerState.position
        ? config.pointerState.position[pointerName].coords
        : undefined)

    await ('keyDef' in action
      ? pointerPress(config, {...action, target, coords})
      : pointerMove(config, {...action, target, coords}))

    if (typeof config.delay === 'number') {
      if (i < actions.length - 1) {
        await wait(config.delay)
      }
    }
  }

  delete config.pointerState.activeClickCount
}

function getPrevTarget(pointerName: string, state: pointerState) {
  if (!(pointerName in state.position) || !state.position[pointerName].target) {
    throw new Error(
      'This pointer has no previous position. Provide a target property!',
    )
  }

  return state.position[pointerName].target as Element
}
