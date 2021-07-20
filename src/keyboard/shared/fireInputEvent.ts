import {fireEvent} from '@testing-library/dom'
import {
  isElementType,
  getValue,
  hasUnreliableEmptyValue,
  isContentEditable,
  setSelectionRange,
  getSelectionRange,
} from '../../utils'

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
    applyNative(element, 'value', newValue)
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

/**
 * React tracks the changes on element properties.
 * This workaround tries to alter the DOM element without React noticing,
 * so that it later picks up the change.
 *
 * @see https://github.com/facebook/react/blob/148f8e497c7d37a3c7ab99f01dec2692427272b1/packages/react-dom/src/client/inputValueTracking.js#L51-L104
 */
function applyNative<T extends Element, P extends keyof T>(
  element: T,
  propName: P,
  propValue: T[P],
) {
  const descriptor = Object.getOwnPropertyDescriptor(element, propName)
  const nativeDescriptor = Object.getOwnPropertyDescriptor(
    element.constructor.prototype,
    propName,
  )

  if (descriptor && nativeDescriptor) {
    Object.defineProperty(element, propName, nativeDescriptor)
  }

  element[propName] = propValue

  if (descriptor) {
    Object.defineProperty(element, propName, descriptor)
  }
}
