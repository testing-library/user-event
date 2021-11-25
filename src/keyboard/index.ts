import {Config, UserEvent} from '../setup'
import {keyboardImplementation, releaseAllKeys} from './keyboardImplementation'
import type {keyboardState, keyboardKey} from './types'

export {releaseAllKeys}
export type {keyboardKey, keyboardState}

export async function keyboard(this: UserEvent, text: string): Promise<void> {
  return keyboardImplementation(this[Config], text)
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
