/**
 * This file should contain behavior for functional keys as described here:
 * https://w3c.github.io/uievents-code/#key-alphanumeric-functional
 */

import {fireEvent} from '@testing-library/dom'
import {setUISelection} from '../../document'
import {
  blur,
  calculateNewValue,
  fireInputEvent,
  focus,
  getTabDestination,
  hasFormSubmit,
  isClickableInput,
  isCursorAtStart,
  isEditable,
  isElementType,
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
      handle: (keyDef, element, options, state) => {
        state.modifiers[modKey] = true
      },
    }),
  ),

  // AltGraph produces an extra keydown for Control
  // The modifier does not change
  {
    matches: keyDef => keyDef.key === 'AltGraph',
    handle: (keyDef, element, options, state) => {
      const ctrlKeyDef = options.keyboardMap.find(
        k => k.key === 'Control',
      ) ?? /* istanbul ignore next */ {key: 'Control', code: 'Control'}
      fireEvent.keyDown(element, getKeyEventProps(ctrlKeyDef, state))
    },
  },
]

export const keydownBehavior: behaviorPlugin[] = [
  {
    matches: keyDef => keyDef.key === 'CapsLock',
    handle: (keyDef, element, options, state) => {
      state.modifiers.caps = !state.modifiers.caps
    },
  },
  {
    matches: (keyDef, element) =>
      keyDef.key === 'Backspace' &&
      isEditable(element) &&
      !isCursorAtStart(element),
    handle: (keyDef, element) => {
      const {newValue, newSelectionStart} = calculateNewValue(
        '',
        element as HTMLElement,
        undefined,
        undefined,
        'backward',
      )

      fireInputEvent(element as HTMLElement, {
        newValue,
        newSelectionStart,
        eventOverrides: {
          inputType: 'deleteContentBackward',
        },
      })
    },
  },
  {
    matches: keyDef => keyDef.key === 'Tab',
    handle: (keyDef, element, options, state) => {
      const dest = getTabDestination(element, state.modifiers.shift)
      if (dest === element.ownerDocument.body) {
        blur(element)
      } else {
        focus(dest)
        if (isElementType(dest, ['input', 'textarea'])) {
          setUISelection(dest, 0, dest.value.length)
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
    handle: (keyDef, element, options, state) => {
      fireEvent.click(element, getMouseEventProps(state))
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
      handle: (keyDef, element, options, state) => {
        state.modifiers[modKey] = false
      },
    }),
  ),
]

export const keyupBehavior: behaviorPlugin[] = [
  {
    matches: (keyDef, element) =>
      keyDef.key === ' ' && isClickableInput(element),
    handle: (keyDef, element, options, state) => {
      fireEvent.click(element, getMouseEventProps(state))
    },
  },
]

export const postKeyupBehavior: behaviorPlugin[] = [
  // AltGraph produces an extra keyup for Control
  // The modifier does not change
  {
    matches: keyDef => keyDef.key === 'AltGraph',
    handle: (keyDef, element, options, state) => {
      const ctrlKeyDef = options.keyboardMap.find(
        k => k.key === 'Control',
      ) ?? /* istanbul ignore next */ {key: 'Control', code: 'Control'}
      fireEvent.keyUp(element, getKeyEventProps(ctrlKeyDef, state))
    },
  },
]
