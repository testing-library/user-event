/**
 * This file should contain behavior for functional keys as described here:
 * https://w3c.github.io/uievents-code/#key-alphanumeric-functional
 */

import {fireEvent} from '@testing-library/dom'
import {setUISelection} from '../../document'
import {
  blur,
  focus,
  getTabDestination,
  getUIEventModifiers,
  hasFormSubmit,
  isClickableInput,
  isEditable,
  isElementType,
  prepareInput,
} from '../../utils'
import {behaviorPlugin} from '../types'

export const keydownBehavior: behaviorPlugin[] = [
  {
    matches: (keyDef, element) =>
      keyDef.key === 'Backspace' && isEditable(element),
    handle: (keyDef, element) => {
      prepareInput('', element, 'deleteContentBackward')?.commit()
    },
  },
  {
    matches: keyDef => keyDef.key === 'Tab',
    handle: (keyDef, element, {keyboardState}) => {
      const dest = getTabDestination(element, keyboardState.modifiers.Shift)
      if (dest === element.ownerDocument.body) {
        blur(element)
      } else {
        focus(dest)
        if (isElementType(dest, ['input', 'textarea'])) {
          setUISelection(dest, {
            anchorOffset: 0,
            focusOffset: dest.value.length,
          })
        }
      }
    },
  },
]

export const keypressBehavior: behaviorPlugin[] = [
  {
    matches: (keyDef, element) =>
      keyDef.key === 'Enter' &&
      isElementType(element, 'input') &&
      ['checkbox', 'radio'].includes(element.type),
    handle: (keyDef, element) => {
      const form = (element as HTMLInputElement).form

      if (hasFormSubmit(form)) {
        fireEvent.submit(form)
      }
    },
  },
  {
    matches: (keyDef, element) =>
      keyDef.key === 'Enter' &&
      (isClickableInput(element) ||
        // Links with href defined should handle Enter the same as a click
        (isElementType(element, 'a') && Boolean(element.href))),
    handle: (keyDef, element, {keyboardState}) => {
      fireEvent.click(element, getUIEventModifiers(keyboardState))
    },
  },
  {
    matches: (keyDef, element) =>
      keyDef.key === 'Enter' && isElementType(element, 'input'),
    handle: (keyDef, element) => {
      const form = (element as HTMLInputElement).form

      if (
        form &&
        (form.querySelectorAll('input').length === 1 || hasFormSubmit(form))
      ) {
        fireEvent.submit(form)
      }
    },
  },
]

export const keyupBehavior: behaviorPlugin[] = [
  {
    matches: (keyDef, element) =>
      keyDef.key === ' ' && isClickableInput(element),
    handle: (keyDef, element, {keyboardState}) => {
      fireEvent.click(element, getUIEventModifiers(keyboardState))
    },
  },
]
