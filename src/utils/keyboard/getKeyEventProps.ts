import {keyboardKey} from '../../keyboard/types'

export function getKeyEventProps(keyDef: keyboardKey) {
  return {
    key: keyDef.key,
    code: keyDef.code,
  }
}
