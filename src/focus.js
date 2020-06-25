import {fireEvent} from '@testing-library/dom'
import {getActiveElement, isFocusable, eventWrapper} from './utils'

function focus(element, init) {
  if (!isFocusable(element)) return

  const isAlreadyActive = getActiveElement(element.ownerDocument) === element
  if (isAlreadyActive) return

  eventWrapper(() => element.focus())
  fireEvent.focusIn(element, init)
}

export {focus}
