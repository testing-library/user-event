import {Config, UserEvent} from '../setup'
import {parseKeyDef} from './parseKeyDef'
import {
  pointerAction,
  PointerAction,
  PointerActionTarget,
} from './pointerAction'
import type {pointerOptions, pointerState, pointerKey} from './types'

export type {pointerOptions, pointerState, pointerKey}

type PointerActionInput =
  | string
  | ({keys: string} & PointerActionTarget)
  | PointerAction
export type PointerInput = PointerActionInput | Array<PointerActionInput>

export async function pointer(
  this: UserEvent,
  input: PointerInput,
): Promise<void> {
  const actions: PointerAction[] = []
  ;(Array.isArray(input) ? input : [input]).forEach(actionInput => {
    if (typeof actionInput === 'string') {
      actions.push(...parseKeyDef(actionInput, this[Config]))
    } else if ('keys' in actionInput) {
      actions.push(
        ...parseKeyDef(actionInput.keys, this[Config]).map(i => ({
          ...actionInput,
          ...i,
        })),
      )
    } else {
      actions.push(actionInput)
    }
  })

  return pointerAction(actions, this[Config], this[Config]).then(
    () => undefined,
  )
}

export function createPointerState(document: Document): pointerState {
  return {
    pointerId: 1,
    position: {
      mouse: {
        pointerType: 'mouse',
        pointerId: 1,
        target: document.body,
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
