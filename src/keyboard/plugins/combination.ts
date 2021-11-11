/**
 * Default behavior for key combinations
 */

import { behaviorPlugin } from '../types'
import {
    selectAll,
} from '../../utils'

export const keydownBehavior: behaviorPlugin[] = [
    {
        matches: (keyDef, element, options, state) => 
            keyDef.code === 'KeyA' && state.modifiers.ctrl,
        handle: (keyDef, element) => selectAll(element)
    },
]
