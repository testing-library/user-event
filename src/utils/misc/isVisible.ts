import {getWindowFromNode} from '@testing-library/dom/dist/helpers'

export function isVisible(element: Element): boolean {
  const window = getWindowFromNode(element)

  for (
    let el: Element | null = element;
    el?.ownerDocument;
    el = el.parentElement
  ) {
    const display = window.getComputedStyle(el).display
    if (display === 'none') {
      return false
    }
  }

  return true
}
