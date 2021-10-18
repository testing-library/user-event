import {fireEvent} from '@testing-library/dom'
import {
  isElementType,
  getValue,
  hasUnreliableEmptyValue,
  isContentEditable,
  setSelectionRange,
  getSelectionRange,
} from '../utils'
import {applyNative} from './applyNative'
import {setUIValue} from './value'

export function fireInputEvent(
  element: HTMLElement,
  {
    newValue,
    newSelectionStart,
    eventOverrides,
  }: {
    newValue: string
    newSelectionStart: number
    eventOverrides: Partial<Parameters<typeof fireEvent>[1]> & {
      [k: string]: unknown
    }
  },
) {
  // apply the changes before firing the input event, so that input handlers can access the altered dom and selection
  if (isContentEditable(element)) {
    applyNative(element, 'textContent', newValue)
  } else /* istanbul ignore else */ if (
    isElementType(element, ['input', 'textarea'])
  ) {
    setUIValue(element, newValue)
  } else {
    // TODO: properly type guard
    throw new Error('Invalid Element')
  }
  setSelectionRangeAfterInput(element, newSelectionStart)

  fireEvent.input(element, {
    ...eventOverrides,
  })

  setSelectionRangeAfterInputHandler(element, newValue, newSelectionStart)
}

function setSelectionRangeAfterInput(
  element: Element,
  newSelectionStart: number,
) {
  setSelectionRange(element, newSelectionStart, newSelectionStart)
}

function setSelectionRangeAfterInputHandler(
  element: Element,
  newValue: string,
  newSelectionStart: number,
) {
  const value = getValue(element) as string

  // don't apply this workaround on elements that don't necessarily report the visible value - e.g. number
  // TODO: this could probably be only applied when there is keyboardState.carryValue
  const isUnreliableValue = value === '' && hasUnreliableEmptyValue(element)

  if (!isUnreliableValue && value === newValue) {
    const {selectionStart} = getSelectionRange(element)
    if (selectionStart === value.length) {
      // The value was changed as expected, but the cursor was moved to the end
      // TODO: this could probably be only applied when we work around a framework setter on the element in applyNative
      setSelectionRange(element, newSelectionStart, newSelectionStart)
    }
  }
}
