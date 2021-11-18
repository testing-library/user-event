import {Config, UserEvent} from '../setup'
import {keyboardImplementation, releaseAllKeys} from './keyboardImplementation'
import {keyboardState, keyboardOptions, keyboardKey} from './types'

export {releaseAllKeys}
export type {keyboardOptions, keyboardKey, keyboardState}

export async function keyboard(this: UserEvent, text: string): Promise<void> {
  return keyboardImplementation(text, this[Config], this[Config].keyboardState)
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
