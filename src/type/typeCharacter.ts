// TODO: wrap in asyncWrapper
import {fireEvent} from '@testing-library/dom'

import {
  calculateNewValue,
  isValidDateValue,
  getValue,
  isValidInputTimeValue,
  buildTimeValue,
} from '../utils/edit'
import {callbackPayload} from './callbacks'
import {fireChangeForInputTimeIfValid, fireInputEventIfNeeded} from './shared'

export function typeCharacter(
  char: string,
  {
    currentElement,
    prevWasMinus = false,
    prevWasPeriod = false,
    prevValue = '',
    typedValue = '',
    eventOverrides,
  }: callbackPayload,
) {
  const key = char // TODO: check if this also valid for characters with diacritic markers e.g. úé etc
  const keyCode = char.charCodeAt(0)
  let nextPrevWasMinus, nextPrevWasPeriod
  const textToBeTyped = typedValue + char
  const keyDownDefaultNotPrevented = fireEvent.keyDown(
    currentElement() as Element,
    {
      key,
      keyCode,
      which: keyCode,
      ...eventOverrides,
    },
  )

  if (keyDownDefaultNotPrevented) {
    const keyPressDefaultNotPrevented = fireEvent.keyPress(
      currentElement() as Element,
      {
        key,
        keyCode,
        charCode: keyCode,
        ...eventOverrides,
      },
    )
    if (getValue(currentElement()) != null && keyPressDefaultNotPrevented) {
      let newEntry = char
      if (prevWasMinus) {
        newEntry = `-${char}`
      } else if (prevWasPeriod) {
        newEntry = `${prevValue}.${char}`
      }

      if (isValidDateValue(currentElement() as Element, textToBeTyped)) {
        newEntry = textToBeTyped
      }

      const timeNewEntry = buildTimeValue(textToBeTyped)
      if (isValidInputTimeValue(currentElement() as Element, timeNewEntry)) {
        newEntry = timeNewEntry
      }

      const inputEvent = fireInputEventIfNeeded({
        ...calculateNewValue(newEntry, currentElement() as HTMLElement),
        eventOverrides: {
          data: key,
          inputType: 'insertText',
          ...eventOverrides,
        },
        currentElement,
      })
      prevValue = inputEvent.prevValue as string

      if (isValidDateValue(currentElement() as Element, textToBeTyped)) {
        fireEvent.change(currentElement() as Element, {
          target: {value: textToBeTyped},
        })
      }

      fireChangeForInputTimeIfValid(currentElement, prevValue, timeNewEntry)

      // typing "-" into a number input will not actually update the value
      // so for the next character we type, the value should be set to
      // `-${newEntry}`
      // we also preserve the prevWasMinus when the value is unchanged due
      // to typing an invalid character (typing "-a3" results in "-3")
      // same applies for the decimal character.
      if ((currentElement() as HTMLInputElement).type === 'number') {
        const newValue = getValue(currentElement())
        if (newValue === prevValue && newEntry !== '-') {
          nextPrevWasMinus = prevWasMinus
        } else {
          nextPrevWasMinus = newEntry === '-'
        }
        if (newValue === prevValue && newEntry !== '.') {
          nextPrevWasPeriod = prevWasPeriod
        } else {
          nextPrevWasPeriod = newEntry === '.'
        }
      }
    }
  }

  fireEvent.keyUp(currentElement() as Element, {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  return {
    prevWasMinus: nextPrevWasMinus,
    prevWasPeriod: nextPrevWasPeriod,
    prevValue,
    typedValue: textToBeTyped,
  }
}
