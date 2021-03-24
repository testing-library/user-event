/**
 * This file should contain behavior for arrow keys as described here:
 * https://w3c.github.io/uievents-code/#key-controlpad-section
 */

import {behaviorPlugin} from '../types'
import {
  getValue,
  isContentEditable,
  isCursorAtEnd,
  isEditable,
  isElementType,
  setSelectionRangeIfNecessary,
} from '../../utils'
import {fireInputEvent} from '../shared'
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
        setSelectionRangeIfNecessary(element, 0, 0)
      } else {
        const newPos = getValue(element)?.length ?? /* istanbul ignore next */ 0
        setSelectionRangeIfNecessary(element, newPos, newPos)
      }
    },
  },
  {
    matches: (keyDef, element) => keyDef.key === 'Delete' && isEditable(element) && !isCursorAtEnd(element),
    handle: (keDef, element) => {
      fireInputEvent(element as HTMLElement, {
        ...calculateNewDeleteValue(element),
        eventOverrides: {
          inputType: 'deleteContentForward',
        },
      })
    },
  },
]
