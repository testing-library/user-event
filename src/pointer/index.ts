import {PointerCoords} from '../event'
import {Config, Instance} from '../setup'
import {pointerKey, PointerPosition} from '../system/pointer'
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
  const {pointerMap} = this[Config]

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
    await wait(this[Config])

    await pointerAction(this[Config], actions[i])
  }

  this[Config].system.pointer.resetClickCount()
}

async function pointerAction(config: Config, action: PointerAction) {
  const pointerName =
    'pointerName' in action && action.pointerName
      ? action.pointerName
      : 'keyDef' in action
      ? config.system.pointer.getPointerName(action.keyDef)
      : 'mouse'

  const previousPosition =
    config.system.pointer.getPreviousPosition(pointerName)
  const position: PointerPosition = {
    target: action.target ?? getPrevTarget(config, previousPosition),
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
    if (config.system.pointer.isKeyPressed(action.keyDef)) {
      setLevelRef(config, ApiLevel.Trigger)
      await config.system.pointer.release(config, action.keyDef, position)
    }

    if (!action.releasePrevious) {
      setLevelRef(config, ApiLevel.Trigger)
      await config.system.pointer.press(config, action.keyDef, position)

      if (action.releaseSelf) {
        setLevelRef(config, ApiLevel.Trigger)
        await config.system.pointer.release(config, action.keyDef, position)
      }
    }
  } else {
    setLevelRef(config, ApiLevel.Trigger)
    await config.system.pointer.move(config, pointerName, position)
  }
}

function hasCaretPosition(action: PointerAction) {
  return !!(action.target ?? action.node ?? action.offset !== undefined)
}

function getPrevTarget(config: Config, position?: PointerPosition) {
  if (!position) {
    throw new Error(
      'This pointer has no previous position. Provide a target property!',
    )
  }

  return position.target ?? config.document.body
}
