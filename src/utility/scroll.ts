import {type Instance} from '../setup'

export interface ScrollOptions {
  left?: number
  top?: number
}

/**
 * Set an element's scroll position and dispatch a scroll event.
 *
 * This does not calculate layout, scroll limits, or intermediate scroll positions.
 */
export async function scroll(
  this: Instance,
  element: Element,
  {left, top}: ScrollOptions = {},
) {
  if (left !== undefined) {
    element.scrollLeft = left
  }
  if (top !== undefined) {
    element.scrollTop = top
  }

  this.dispatchUIEvent(element, 'scroll')
}

/**
 * Dispatch a wheel event on an element.
 */
export async function wheel(
  this: Instance,
  element: Element,
  init: WheelEventInit = {},
) {
  this.dispatchUIEvent(element, 'wheel', init)
}
