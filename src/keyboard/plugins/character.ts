/**
 * This file should cover the behavior for keys that produce character input
 */

import {fireEvent} from '@testing-library/dom'
import {fireChangeForInputTimeIfValid, fireInputEventIfNeeded} from '../shared'
import {behaviorPlugin} from '../types'
import {
  buildTimeValue,
  calculateNewValue,
  getValue,
  isContentEditable,
  isElementType,
  isValidDateValue,
  isValidInputTimeValue,
} from '../../utils'

export const keypressBehavior: behaviorPlugin[] = [
  {
    matches: (keyDef, element) =>
      keyDef.key?.length === 1 &&
      isElementType(element, 'input', {type: 'time'}),
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

      const {prevValue} = fireInputEventIfNeeded({
        newValue,
        newSelectionStart,
        eventOverrides: {
          data: keyDef.key,
          inputType: 'insertText',
        },
        currentElement: () => element,
      })

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
      isElementType(element, 'input', {type: 'date'}),
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

      fireInputEventIfNeeded({
        newValue,
        newSelectionStart,
        eventOverrides: {
          data: keyDef.key,
          inputType: 'insertText',
        },
        currentElement: () => element,
      })

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
      isElementType(element, 'input', {type: 'number'}),
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

      fireInputEventIfNeeded({
        newValue,
        newSelectionStart,
        eventOverrides: {
          data: keyDef.key,
          inputType: 'insertText',
        },
        currentElement: () => element,
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
      (isElementType(element, ['input', 'textarea']) ||
        isContentEditable(element)),
    handle: (keyDef, element) => {
      const {newValue, newSelectionStart} = calculateNewValue(
        keyDef.key as string,
        element as HTMLElement,
      )

      fireInputEventIfNeeded({
        newValue,
        newSelectionStart,
        eventOverrides: {
          data: keyDef.key,
          inputType: 'insertText',
        },
        currentElement: () => element,
      })
    },
  },
  {
    matches: (keyDef, element) =>
      keyDef.key === 'Enter' &&
      (isElementType(element, 'textarea') || isContentEditable(element)),
    handle: (keyDef, element, options, state) => {
      const {newValue, newSelectionStart} = calculateNewValue(
        '\n',
        element as HTMLElement,
      )

      const inputType =
        isContentEditable(element) && !state.modifiers.shift
          ? 'insertParagraph'
          : 'insertLineBreak'

      fireInputEventIfNeeded({
        newValue,
        newSelectionStart,
        eventOverrides: {
          inputType,
        },
        currentElement: () => element,
      })
    },
  },
]
