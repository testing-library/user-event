import {fireEvent} from '@testing-library/dom'
import {
  isElementType,
  isClickableInput,
  getValue,
  hasUnreliableEmptyValue,
  isContentEditable,
  setSelectionRange,
} from '../../utils'

export function fireInputEventIfNeeded({
  currentElement,
  newValue,
  newSelectionStart,
  eventOverrides,
}: {
  currentElement: () => Element | null
  newValue: string
  newSelectionStart: number
  eventOverrides: Partial<Parameters<typeof fireEvent>[1]> & {
    [k: string]: unknown
  }
}): {
  prevValue: string | null
} {
  const el = currentElement()
  const prevValue = getValue(el)
  if (
    el &&
    !isReadonly(el) &&
    !isClickableInput(el) &&
    newValue !== prevValue
  ) {
    if (isContentEditable(el)) {
      fireEvent.input(el, {
        target: {textContent: newValue},
        ...eventOverrides,
      })
    } else {
      fireEvent.input(el, {
        target: {value: newValue},
        ...eventOverrides,
      })
    }

    setSelectionRangeAfterInput(el, newValue, newSelectionStart)
  }

  return {prevValue}
}

function isReadonly(element: Element): boolean {
  return isElementType(element, ['input', 'textarea'], {readOnly: true})
}

function setSelectionRangeAfterInput(
  element: Element,
  newValue: string,
  newSelectionStart: number,
) {
  // if we *can* change the selection start, then we will if the new value
  // is the same as the current value (so it wasn't programatically changed
  // when the fireEvent.input was triggered).
  // The reason we have to do this at all is because it actually *is*
  // programmatically changed by fireEvent.input, so we have to simulate the
  // browser's default behavior
  const value = getValue(element) as string

  // don't apply this workaround on elements that don't necessarily report the visible value - e.g. number
  if (
    value === newValue ||
    (value === '' && hasUnreliableEmptyValue(element))
  ) {
    setSelectionRange(element, newSelectionStart, newSelectionStart)
  } else {
    // If the currentValue is different than the expected newValue and we *can*
    // change the selection range, than we should set it to the length of the
    // currentValue to ensure that the browser behavior is mimicked.
    setSelectionRange(element, value.length, value.length)
  }
}
