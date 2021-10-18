import {fireEvent} from '@testing-library/dom'
import {isElementType} from '../misc/isElementType'
import {applyNative, hasUISelection, setUIValue} from '../../document'
import {isContentEditable} from './isContentEditable'
import {setSelectionRange} from './selectionRange'

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
  } /* istanbul ignore else */ else if (
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

  setSelectionRangeAfterInputHandler(element, newSelectionStart)
}

function setSelectionRangeAfterInput(
  element: Element,
  newSelectionStart: number,
) {
  setSelectionRange(element, newSelectionStart, newSelectionStart)
}

function setSelectionRangeAfterInputHandler(
  element: Element,
  newSelectionStart: number,
) {
  // On controlled inputs the selection changes without a call to
  // either the `value` setter or the `setSelectionRange` method.
  // So if our tracked position for UI still exists and derives from a valid selectionStart,
  // the cursor was moved due to an input being controlled.

  if (
    isElementType(element, ['input', 'textarea']) &&
    typeof element.selectionStart === 'number' &&
    element.selectionStart !== newSelectionStart &&
    hasUISelection(element)
  ) {
    setSelectionRange(element, newSelectionStart, newSelectionStart)
  }
}
