/**
 * This file should contain behavior for arrow keys as described here:
 * https://w3c.github.io/uievents-code/#key-controlpad-section
 */

import {behaviorPlugin} from '../types'
import {
  getValue,
  isContentEditable,
  isElementType,
  setSelectionRange,
} from '../../utils'
import {fireInputEventIfNeeded} from '../shared'
import {calculateNewDeleteValue} from './control/calculateNewDeleteValue'

export const keydownBehavior: behaviorPlugin[] = [
  {
    matches: (keyDef, element) =>
      (keyDef.key === 'Home' || keyDef.key === 'End') &&
      (isElementType(element, ['input', 'textarea']) ||
        isContentEditable(element)),
    handle: (keyDef, element) => {
      // This could probably been improved by collapsing a selection range
      if (keyDef.key === 'Home') {
        setSelectionRange(element, 0, 0)
      } else {
        const newPos = getValue(element)?.length ?? /* istanbul ignore next */ 0
        setSelectionRange(element, newPos, newPos)
      }
    },
  },
  {
    matches: keyDef => keyDef.key === 'Delete',
    handle: (keDef, element) => {
      fireInputEventIfNeeded({
        ...calculateNewDeleteValue(element),
        eventOverrides: {
          inputType: 'deleteContentForward',
        },
        currentElement: () => element,
      })
    },
  },
]
