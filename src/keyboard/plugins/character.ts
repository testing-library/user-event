/**
 * This file should cover the behavior for keys that produce character input
 */

import {fireEvent} from '@testing-library/dom'
import {fireChangeForInputTimeIfValid, fireInputEvent} from '../shared'
import {behaviorPlugin} from '../types'
import {
  buildTimeValue,
  calculateNewValue,
  getSpaceUntilMaxLength,
  getValue,
  isClickableInput,
  isContentEditable,
  isElementType,
  isValidDateValue,
  isValidInputTimeValue,
} from '../../utils'

export const keypressBehavior: behaviorPlugin[] = [
  {
    matches: (keyDef, element) =>
      keyDef.key?.length === 1 &&
      isElementType(element, 'input', {type: 'time', readOnly: false}),
    handle: (keyDef, element, options, state) => {
      let newEntry = keyDef.key as string

      const textToBeTyped = (state.carryValue ?? '') + newEntry
      const timeNewEntry = buildTimeValue(textToBeTyped)
      if (
        isValidInputTimeValue(
          element as HTMLInputElement & {type: 'time'},
          timeNewEntry,
        )
      ) {
        newEntry = timeNewEntry
      }

      const {newValue, newSelectionStart} = calculateNewValue(
        newEntry,
        element as HTMLElement,
      )
      const prevValue = getValue(element)

      // this check was provided by fireInputEventIfNeeded
      // TODO: verify if it is even needed by this handler
      if (prevValue !== newValue) {
        fireInputEvent(element as HTMLInputElement, {
          newValue,
          newSelectionStart,
          eventOverrides: {
            data: keyDef.key,
            inputType: 'insertText',
          },
        })
      }

      fireChangeForInputTimeIfValid(
        element as HTMLInputElement & {type: 'time'},
        prevValue,
        timeNewEntry,
      )

      state.carryValue = textToBeTyped
    },
  },
  {
    matches: (keyDef, element) =>
      keyDef.key?.length === 1 &&
      isElementType(element, 'input', {type: 'date', readOnly: false}),
    handle: (keyDef, element, options, state) => {
      let newEntry = keyDef.key as string

      const textToBeTyped = (state.carryValue ?? '') + newEntry
      const isValidToBeTyped = isValidDateValue(
        element as HTMLInputElement & {type: 'date'},
        textToBeTyped,
      )
      if (isValidToBeTyped) {
        newEntry = textToBeTyped
      }

      const {newValue, newSelectionStart} = calculateNewValue(
        newEntry,
        element as HTMLElement,
      )
      const prevValue = getValue(element)

      // this check was provided by fireInputEventIfNeeded
      // TODO: verify if it is even needed by this handler
      if (prevValue !== newValue) {
        fireInputEvent(element as HTMLInputElement, {
          newValue,
          newSelectionStart,
          eventOverrides: {
            data: keyDef.key,
            inputType: 'insertText',
          },
        })
      }

      if (isValidToBeTyped) {
        fireEvent.change(element, {
          target: {value: textToBeTyped},
        })
      }

      state.carryValue = textToBeTyped
    },
  },
  {
    matches: (keyDef, element) =>
      keyDef.key?.length === 1 &&
      isElementType(element, 'input', {type: 'number', readOnly: false}),
    handle: (keyDef, element, options, state) => {
      if (!/[\d.\-e]/.test(keyDef.key as string)) {
        return
      }

      const oldValue =
        state.carryValue ?? getValue(element) ?? /* istanbul ignore next */ ''

      const {newValue, newSelectionStart} = calculateNewValue(
        keyDef.key as string,
        element as HTMLElement,
        oldValue,
      )

      // the browser allows some invalid input but not others
      // it allows up to two '-' at any place before any 'e' or one directly following 'e'
      // it allows one '.' at any place before e
      const valueParts = newValue.split('e', 2)
      if (
        Number(newValue.match(/-/g)?.length) > 2 ||
        Number(newValue.match(/\./g)?.length) > 1 ||
        (valueParts[1] && !/^-?\d*$/.test(valueParts[1]))
      ) {
        return
      }

      fireInputEvent(element as HTMLInputElement, {
        newValue,
        newSelectionStart,
        eventOverrides: {
          data: keyDef.key,
          inputType: 'insertText',
        },
      })

      const appliedValue = getValue(element)
      if (appliedValue === newValue) {
        state.carryValue = undefined
      } else {
        state.carryValue = newValue
      }
    },
  },
  {
    matches: (keyDef, element) =>
      keyDef.key?.length === 1 &&
      ((isElementType(element, ['input', 'textarea'], {readOnly: false}) &&
        !isClickableInput(element)) ||
        isContentEditable(element)) &&
      getSpaceUntilMaxLength(element) !== 0,
    handle: (keyDef, element) => {
      const {newValue, newSelectionStart} = calculateNewValue(
        keyDef.key as string,
        element as HTMLElement,
      )

      fireInputEvent(element as HTMLElement, {
        newValue,
        newSelectionStart,
        eventOverrides: {
          data: keyDef.key,
          inputType: 'insertText',
        },
      })
    },
  },
  {
    matches: (keyDef, element) =>
      keyDef.key === 'Enter' &&
      (isElementType(element, 'textarea', {readOnly: false}) ||
        isContentEditable(element)) &&
      getSpaceUntilMaxLength(element) !== 0,
    handle: (keyDef, element, options, state) => {
      const {newValue, newSelectionStart} = calculateNewValue(
        '\n',
        element as HTMLElement,
      )

      const inputType =
        isContentEditable(element) && !state.modifiers.shift
          ? 'insertParagraph'
          : 'insertLineBreak'

      fireInputEvent(element as HTMLElement, {
        newValue,
        newSelectionStart,
        eventOverrides: {
          inputType,
        },
      })
    },
  },
]
