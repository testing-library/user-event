import {eventWrapper} from '../misc/eventWrapper'
import {findClosest} from '../misc/findClosest'
import {getActiveElement} from './getActiveElement'
import {isFocusable} from './isFocusable'
import {updateSelectionOnFocus} from './selection'

/**
 * Focus closest focusable element.
 */
function focus(element: Element) {
  const target = findClosest(element, isFocusable)

  const activeElement = getActiveElement(element.ownerDocument)
  if ((target ?? element.ownerDocument.body) === activeElement) {
    return
  } else if (target) {
    eventWrapper(() => target.focus())
  } else {
    eventWrapper(() => (activeElement as HTMLElement | null)?.blur())
  }

  updateSelectionOnFocus(target ?? element.ownerDocument.body)
}

export {focus}
