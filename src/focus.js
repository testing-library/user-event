import {fireEvent} from '@testing-library/dom'
import {getActiveElement, isFocusable, wrapInEventWrapper} from './utils'

function focus(element, init) {
  if (!isFocusable(element)) return

  const isAlreadyActive = getActiveElement(element.ownerDocument) === element
  if (isAlreadyActive) return

  element.focus()
  fireEvent.focusIn(element, init)
}
focus = wrapInEventWrapper(focus)

export {focus}
