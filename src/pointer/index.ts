import type {PointerCoords} from '../event'
import type {Instance} from '../setup'
import type {pointerKey, PointerPosition} from '../system/pointer'
import {ApiLevel, setLevelRef, wait} from '../utils'
import {parseKeyDef} from './parseKeyDef'

type PointerActionInput =
  | string
  | ({keys: string} & PointerActionPosition)
  | PointerAction
export type PointerInput = PointerActionInput | Array<PointerActionInput>

type PointerAction = PointerPressAction | PointerMoveAction

type PointerActionPosition = {
  target?: Element
  coords?: PointerCoords
  node?: Node
  /**
   * If `node` is set, this is the DOM offset.
   * Otherwise this is the `textContent`/`value` offset on the `target`.
   */
  offset?: number
}

interface PointerPressAction extends PointerActionPosition {
  keyDef: pointerKey
  releasePrevious: boolean
  releaseSelf: boolean
}

interface PointerMoveAction extends PointerActionPosition {
  pointerName?: string
}

export async function pointer(
  this: Instance,
  input: PointerInput,
): Promise<void> {
  const {pointerMap} = this.config

  const actions: PointerAction[] = []
  ;(Array.isArray(input) ? input : [input]).forEach(actionInput => {
    if (typeof actionInput === 'string') {
      actions.push(...parseKeyDef(pointerMap, actionInput))
    } else if ('keys' in actionInput) {
      actions.push(
        ...parseKeyDef(pointerMap, actionInput.keys).map(i => ({
          ...actionInput,
          ...i,
        })),
      )
    } else {
      actions.push(actionInput)
    }
  })

  for (let i = 0; i < actions.length; i++) {
    await wait(this.config)

    await pointerAction(this, actions[i])
  }

  this.system.pointer.resetClickCount()
}

async function pointerAction(instance: Instance, action: PointerAction) {
  const pointerName =
    'pointerName' in action && action.pointerName
      ? action.pointerName
      : 'keyDef' in action
      ? instance.system.pointer.getPointerName(action.keyDef)
      : 'mouse'

  const previousPosition =
    instance.system.pointer.getPreviousPosition(pointerName)
  const position: PointerPosition = {
    target: action.target ?? getPrevTarget(instance, previousPosition),
    coords: action.coords ?? previousPosition?.coords,
    caret: {
      node:
        action.node ??
        (hasCaretPosition(action) ? undefined : previousPosition?.caret?.node),
      offset:
        action.offset ??
        (hasCaretPosition(action)
          ? undefined
          : previousPosition?.caret?.offset),
    },
  }

  if ('keyDef' in action) {
    if (instance.system.pointer.isKeyPressed(action.keyDef)) {
      setLevelRef(instance, ApiLevel.Trigger)
      await instance.system.pointer.release(instance, action.keyDef, position)
    }

    if (!action.releasePrevious) {
      setLevelRef(instance, ApiLevel.Trigger)
      await instance.system.pointer.press(instance, action.keyDef, position)

      if (action.releaseSelf) {
        setLevelRef(instance, ApiLevel.Trigger)
        await instance.system.pointer.release(instance, action.keyDef, position)
      }
    }
  } else {
    setLevelRef(instance, ApiLevel.Trigger)
    await instance.system.pointer.move(instance, pointerName, position)
  }
}

function hasCaretPosition(action: PointerAction) {
  return !!(action.target ?? action.node ?? action.offset !== undefined)
}

function getPrevTarget(instance: Instance, position?: PointerPosition) {
  if (!position) {
    throw new Error(
      'This pointer has no previous position. Provide a target property!',
    )
  }

  return position.target ?? instance.config.document.body
}
