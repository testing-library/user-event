import {Config, UserEvent} from '../setup'
import {keyboardAction, KeyboardAction, releaseAllKeys} from './keyboardAction'
import {parseKeyDef} from './parseKeyDef'
import type {keyboardState, keyboardKey} from './types'

export {releaseAllKeys}
export type {keyboardKey, keyboardState}

export async function keyboard(this: UserEvent, text: string): Promise<void> {
  const {keyboardMap} = this[Config]

  const actions: KeyboardAction[] = parseKeyDef(keyboardMap, text)

  return keyboardAction(this[Config], actions)
}

export function createKeyboardState(): keyboardState {
  return {
    activeElement: null,
    pressed: [],
    carryChar: '',
    modifiers: {
      alt: false,
      caps: false,
      ctrl: false,
      meta: false,
      shift: false,
    },
  }
}
