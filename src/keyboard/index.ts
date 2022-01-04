import {Config, Instance} from '../setup'
import {keyboardAction, KeyboardAction, releaseAllKeys} from './keyboardAction'
import {parseKeyDef} from './parseKeyDef'
import type {keyboardState, keyboardKey} from './types'

export {releaseAllKeys}
export type {keyboardKey, keyboardState}

export async function keyboard(this: Instance, text: string): Promise<void> {
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
      Alt: false,
      AltGraph: false,
      Control: false,
      CapsLock: false,
      Fn: false,
      FnLock: false,
      Meta: false,
      NumLock: false,
      ScrollLock: false,
      Shift: false,
      Symbol: false,
      SymbolLock: false,
    },
    modifierPhase: {},
  }
}
