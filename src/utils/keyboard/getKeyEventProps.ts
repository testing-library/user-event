import {keyboardKey, keyboardState} from '../../keyboard/types'
import {getUIEventModifiers} from './getUIEventModifiers'

export function getKeyEventProps(keyDef: keyboardKey, state: keyboardState) {
  return {
    key: keyDef.key,
    code: keyDef.code,
    ...getUIEventModifiers(state),
  }
}
