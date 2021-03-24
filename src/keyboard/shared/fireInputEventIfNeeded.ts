import {fireEvent} from '@testing-library/dom'
import {
  isElementType,
  isClickableInput,
  getValue,
  isContentEditable,
} from '../../utils'
import {setSelectionRange} from './setSelectionRange'

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

    setSelectionRange({
      currentElement,
      newValue,
      newSelectionStart,
    })
  }

  return {prevValue}
}

function isReadonly(element: Element): boolean {
  return isElementType(element, ['input', 'textarea'], {readOnly: true})
}
