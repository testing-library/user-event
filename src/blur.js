import {fireEvent} from '@testing-library/dom'
import {getActiveElement, isFocusable, eventWrapper} from './utils'

function blur(element, init) {
  if (!isFocusable(element)) return

  const wasActive = getActiveElement(element.ownerDocument) === element
  if (!wasActive) return

  eventWrapper(() => element.blur())
  fireEvent.focusOut(element, init)
}

export {blur}
