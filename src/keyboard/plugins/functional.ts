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
  hasFormSubmit,
  isClickableInput,
  isEditable,
  isElementType,
  prepareInput,
} from '../../utils'
import {getKeyEventProps, getMouseEventProps} from '../getEventProps'
import {behaviorPlugin} from '../types'

const modifierKeys = {
  Alt: 'alt',
  Control: 'ctrl',
  Shift: 'shift',
  Meta: 'meta',
} as const

export const preKeydownBehavior: behaviorPlugin[] = [
  // modifierKeys switch on the modifier BEFORE the keydown event
  ...Object.entries(modifierKeys).map(
    ([key, modKey]): behaviorPlugin => ({
      matches: keyDef => keyDef.key === key,
      handle: (keyDef, element, {keyboardState}) => {
        keyboardState.modifiers[modKey] = true
      },
    }),
  ),

  // AltGraph produces an extra keydown for Control
  // The modifier does not change
  {
    matches: keyDef => keyDef.key === 'AltGraph',
    handle: (keyDef, element, {keyboardMap, keyboardState}) => {
      const ctrlKeyDef = keyboardMap.find(
        k => k.key === 'Control',
      ) ?? /* istanbul ignore next */ {key: 'Control', code: 'Control'}
      fireEvent.keyDown(element, getKeyEventProps(ctrlKeyDef, keyboardState))
    },
  },
]

export const keydownBehavior: behaviorPlugin[] = [
  {
    matches: keyDef => keyDef.key === 'CapsLock',
    handle: (keyDef, element, {keyboardState}) => {
      keyboardState.modifiers.caps = !keyboardState.modifiers.caps
    },
  },
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
      const dest = getTabDestination(element, keyboardState.modifiers.shift)
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
      fireEvent.click(element, getMouseEventProps(keyboardState))
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

export const preKeyupBehavior: behaviorPlugin[] = [
  // modifierKeys switch off the modifier BEFORE the keyup event
  ...Object.entries(modifierKeys).map(
    ([key, modKey]): behaviorPlugin => ({
      matches: keyDef => keyDef.key === key,
      handle: (keyDef, element, {keyboardState}) => {
        keyboardState.modifiers[modKey] = false
      },
    }),
  ),
]

export const keyupBehavior: behaviorPlugin[] = [
  {
    matches: (keyDef, element) =>
      keyDef.key === ' ' && isClickableInput(element),
    handle: (keyDef, element, {keyboardState}) => {
      fireEvent.click(element, getMouseEventProps(keyboardState))
    },
  },
]

export const postKeyupBehavior: behaviorPlugin[] = [
  // AltGraph produces an extra keyup for Control
  // The modifier does not change
  {
    matches: keyDef => keyDef.key === 'AltGraph',
    handle: (keyDef, element, {keyboardMap, keyboardState}) => {
      const ctrlKeyDef = keyboardMap.find(
        k => k.key === 'Control',
      ) ?? /* istanbul ignore next */ {key: 'Control', code: 'Control'}
      fireEvent.keyUp(element, getKeyEventProps(ctrlKeyDef, keyboardState))
    },
  },
]
