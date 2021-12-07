import {getWindowFromNode} from '@testing-library/dom/dist/helpers'

export function isVisible(element: Element): boolean {
  const window = getWindowFromNode(element)

  for (
    let el: Element | null = element;
    el?.ownerDocument;
    el = el.parentElement
  ) {
    const {display, visibility} = window.getComputedStyle(el)
    if (display === 'none') {
      return false
    }
    if (visibility === 'hidden') {
      return false
    }
  }

  return true
}
