import {getWindowFromNode} from '@testing-library/dom/dist/helpers.js'

/**
 * Options that can be passed to any event that relies
 * on pointer-events property
 */
export declare interface PointerOptions {
  /**
   * When set to `true` the event skips checking if any element
   * in the DOM-tree has `'pointer-events: none'` set. This check is
   * costly in general  and very costly when rendering large DOM-trees.
   * Can be used to speed up tests.
   * Default: `false`
   * */
  skipPointerEventsCheck?: boolean
}

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
