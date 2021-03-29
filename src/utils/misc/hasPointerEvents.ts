import {getWindowFromNode} from '@testing-library/dom/dist/helpers'

export function hasPointerEvents(element: Element): boolean {
  const window = getWindowFromNode(element)

  for (
    let el: Element | null = element;
    el?.ownerDocument;
    el = el.parentElement
  ) {
    const pointerEvents = window.getComputedStyle(el).pointerEvents
    if (pointerEvents && !['inherit', 'unset'].includes(pointerEvents)) {
       return pointerEvents !== 'none'
    }
  }

  return true
}
