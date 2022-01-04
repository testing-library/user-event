import {Config, Instance} from '../setup'
import {parseKeyDef} from './parseKeyDef'
import {
  pointerAction,
  PointerAction,
  PointerActionTarget,
} from './pointerAction'
import type {pointerState, pointerKey} from './types'

export type {pointerState, pointerKey}

type PointerActionInput =
  | string
  | ({keys: string} & PointerActionTarget)
  | PointerAction
export type PointerInput = PointerActionInput | Array<PointerActionInput>

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

  return pointerAction(this[Config], actions).then(() => undefined)
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
