/**
 * Default behavior for key combinations
 */

import {behaviorPlugin} from '../types'
import {selectAll} from '../../utils'

export const keydownBehavior: behaviorPlugin[] = [
  {
    matches: (keyDef, element, {keyboardState}) =>
      keyDef.code === 'KeyA' && keyboardState.modifiers.ctrl,
    handle: (keyDef, element) => selectAll(element),
  },
]
