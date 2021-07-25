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

const initial = Symbol('initial input value/textContent')
const onBlur = Symbol('onBlur')
declare global {
  interface Element {
    [initial]?: string
    [onBlur]?: EventListener
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

  // Keep track of the initial value to determine if a change event should be dispatched.
  // CONSTRAINT: We can not determine what happened between focus event and our first API call.
  if (element[initial] === undefined) {
    element[initial] = String(element[propName])
  }

  element[propName] = propValue

  // Add an event listener for the blur event to the capture phase on the window.
  // CONSTRAINT: Currently there is no cross-platform solution to unshift the event handler stack.
  // Our change event might occur after other event handlers on the blur event have been processed.
  if (!element[onBlur]) {
    element.ownerDocument.defaultView?.addEventListener(
      'blur',
      (element[onBlur] = () => {
        const initV = element[initial]

        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete element[onBlur]
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete element[initial]

        if (String(element[propName]) !== initV) {
          fireEvent.change(element)
        }
      }),
      {
        capture: true,
        once: true,
      },
    )
  }

  if (descriptor) {
    Object.defineProperty(element, propName, descriptor)
  }
}
