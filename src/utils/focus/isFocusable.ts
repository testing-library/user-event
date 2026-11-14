import {FOCUSABLE_SELECTOR} from './selector'

export function isFocusable(element: Element): element is HTMLElement {
  return element.matches(FOCUSABLE_SELECTOR)
}
