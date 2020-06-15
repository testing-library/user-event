import {fireEvent} from '@testing-library/dom'
import {getActiveElement, isFocusable} from './utils'

function blur(element, init) {
  if (!isFocusable(element)) return

  const wasActive = getActiveElement(element.ownerDocument) === element
  if (!wasActive) return

  element.blur()
  fireEvent.focusOut(element, init)
}

export {blur}
