/**
 * This file should contain behavior for arrow keys as described here:
 * https://w3c.github.io/uievents-code/#key-controlpad-section
 */

import {behaviorPlugin} from '../types'
import {
  calculateNewValue,
  getValue,
  isContentEditable,
  isCursorAtEnd,
  isEditable,
  isElementType,
  setSelectionRange,
} from '../../utils'
import {carryValue, fireInputEvent} from '../shared'

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
    matches: (keyDef, element) =>
      (keyDef.key === 'PageUp' || keyDef.key === 'PageDown') &&
      isElementType(element, ['input']),
    handle: (keyDef, element) => {
      // This could probably been improved by collapsing a selection range
      if (keyDef.key === 'PageUp') {
        setSelectionRange(element, 0, 0)
      } else {
        const newPos = getValue(element)?.length ?? /* istanbul ignore next */ 0
        setSelectionRange(element, newPos, newPos)
      }
    },
  },
  {
    matches: (keyDef, element) =>
      keyDef.key === 'Delete' && isEditable(element) && !isCursorAtEnd(element),
    handle: (keDef, element, options, state) => {
      const {newValue, newSelectionStart} = calculateNewValue(
        '',
        element as HTMLElement,
        state.carryValue,
        undefined,
        'forward',
      )

      fireInputEvent(element as HTMLElement, {
        newValue,
        newSelectionStart,
        eventOverrides: {
          inputType: 'deleteContentForward',
        },
      })

      carryValue(element, state, newValue)
    },
  },
]
