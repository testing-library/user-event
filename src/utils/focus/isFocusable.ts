import {isLabelWithInternallyDisabledControl} from '../misc/isLabelWithInternallyDisabledControl'
import {FOCUSABLE_SELECTOR} from './selector'

export function isFocusable(element: Element): element is HTMLElement {
  return (
    !isLabelWithInternallyDisabledControl(element) &&
    element.matches(FOCUSABLE_SELECTOR)
  )
}
