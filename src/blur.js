import {fireEvent} from '@testing-library/dom'
import {getActiveElement, isFocusable, wrapInEventWrapper} from './utils'

function blur(element, init) {
  if (!isFocusable(element)) return

  const wasActive = getActiveElement(element.ownerDocument) === element
  if (!wasActive) return

  element.blur()
  fireEvent.focusOut(element, init)
}

blur = wrapInEventWrapper(blur)

export {blur}
