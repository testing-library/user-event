import {eventWrapper} from '../misc/eventWrapper'
import {getActiveElement} from './getActiveElement'
import {isFocusable} from './isFocusable'

function blur(element: Element) {
  if (!isFocusable(element)) return

  const wasActive = getActiveElement(element.ownerDocument) === element
  if (!wasActive) return

  eventWrapper(() => element.blur())
}

export {blur}
