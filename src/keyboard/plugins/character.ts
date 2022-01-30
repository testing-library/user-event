/**
 * This file should cover the behavior for keys that produce character input
 */

import {fireChangeForInputTimeIfValid} from '../shared'
import {behaviorPlugin} from '../types'
import {
  buildTimeValue,
  calculateNewValue,
  editInputElement,
  getInputRange,
  getSpaceUntilMaxLength,
  getValue,
  isContentEditable,
  isEditableInput,
  isElementType,
  isValidDateValue,
  isValidInputTimeValue,
  prepareInput,
} from '../../utils'
import {setUIValue, UISelectionRange} from '../../document'
import {dispatchUIEvent} from '../../event'

export const keypressBehavior: behaviorPlugin[] = [
  {
    matches: (keyDef, element) =>
      keyDef.key?.length === 1 &&
      isElementType(element, 'input', {type: 'time', readOnly: false}),
    handle: (keyDef, element, config) => {
      let newEntry = keyDef.key as string

      const textToBeTyped = (config.keyboardState.carryValue ?? '') + newEntry
      const timeNewEntry = buildTimeValue(textToBeTyped)
      if (
        isValidInputTimeValue(
          element as HTMLInputElement & {type: 'time'},
          timeNewEntry,
        )
      ) {
        newEntry = timeNewEntry
      }

      const {newValue, newOffset} = calculateNewValue(
        newEntry,
        element as HTMLInputElement & {type: 'time'},
        getInputRange(element) as UISelectionRange,
      )
      const prevValue = getValue(element)

      // this check was provided by fireInputEventIfNeeded
      // TODO: verify if it is even needed by this handler
      if (prevValue !== newValue) {
        editInputElement(config, element as HTMLInputElement, {
          newValue,
          newSelection: {
            node: element,
            offset: newOffset,
          },
          eventOverrides: {
            data: keyDef.key,
            inputType: 'insertText',
          },
        })
      }

      fireChangeForInputTimeIfValid(
        config,
        element as HTMLInputElement & {type: 'time'},
        prevValue,
        timeNewEntry,
      )

      config.keyboardState.carryValue = textToBeTyped
    },
  },
  {
    matches: (keyDef, element) =>
      keyDef.key?.length === 1 &&
      isElementType(element, 'input', {type: 'date', readOnly: false}),
    handle: (keyDef, element, config) => {
      let newEntry = keyDef.key as string

      const textToBeTyped = (config.keyboardState.carryValue ?? '') + newEntry
      const isValidToBeTyped = isValidDateValue(
        element as HTMLInputElement & {type: 'date'},
        textToBeTyped,
      )
      if (isValidToBeTyped) {
        newEntry = textToBeTyped
      }

      const {newValue, newOffset} = calculateNewValue(
        newEntry,
        element as HTMLInputElement & {type: 'date'},
        getInputRange(element) as UISelectionRange,
      )
      const prevValue = getValue(element)

      // this check was provided by fireInputEventIfNeeded
      // TODO: verify if it is even needed by this handler
      if (prevValue !== newValue) {
        editInputElement(config, element as HTMLInputElement, {
          newValue,
          newSelection: {
            node: element,
            offset: newOffset,
          },
          eventOverrides: {
            data: keyDef.key,
            inputType: 'insertText',
          },
        })
      }

      if (isValidToBeTyped) {
        setUIValue(element as HTMLInputElement, textToBeTyped)
        dispatchUIEvent(config, element, 'change')
      }

      config.keyboardState.carryValue = textToBeTyped
    },
  },
  {
    matches: (keyDef, element) =>
      keyDef.key?.length === 1 &&
      isElementType(element, 'input', {type: 'number', readOnly: false}),
    handle: (keyDef, element, config) => {
      if (!/[\d.\-e]/.test(keyDef.key as string)) {
        return
      }

      const {getNewValue, commit} = prepareInput(
        config,
        keyDef.key as string,
        element,
      ) as NonNullable<ReturnType<typeof prepareInput>>
      const newValue = (getNewValue as () => string)()

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

      commit()
    },
  },
  {
    matches: (keyDef, element) =>
      keyDef.key?.length === 1 &&
      (isEditableInput(element) ||
        isElementType(element, 'textarea', {readOnly: false}) ||
        isContentEditable(element)) &&
      getSpaceUntilMaxLength(element) !== 0,
    handle: (keyDef, element, config) => {
      prepareInput(config, keyDef.key as string, element)?.commit()
    },
  },
  {
    matches: (keyDef, element) =>
      keyDef.key === 'Enter' &&
      (isElementType(element, 'textarea', {readOnly: false}) ||
        isContentEditable(element)) &&
      getSpaceUntilMaxLength(element) !== 0,
    handle: (keyDef, element, config) => {
      prepareInput(
        config,
        '\n',
        element,
        isContentEditable(element) && !config.keyboardState.modifiers.Shift
          ? 'insertParagraph'
          : 'insertLineBreak',
      )?.commit()
    },
  },
]
