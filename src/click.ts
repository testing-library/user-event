import {hasPointerEvents, PointerOptions} from './utils'
import {hover} from './hover'
import type {UserEvent} from './setup'

export declare interface clickOptions {
  skipHover?: boolean
  clickCount?: number
}

export function click(
  this: UserEvent,
  element: Element,
  init?: MouseEventInit,
  {
    skipHover = false,
    skipPointerEventsCheck = false,
  }: clickOptions & PointerOptions = {},
) {
  if (!skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to click element as it has or inherits pointer-events set to "none".',
    )
  }
  // istanbul ignore else
  if (!skipHover)
    // We just checked for `pointerEvents`. We can always skip this one in `hover`.
    hover.call(this, element, init, {skipPointerEventsCheck: true})

  const keys =
    init?.button === 2 || init?.buttons === 2 ? '[MouseRight]' : '[MouseLeft]'
  this.pointer({keys, target: element})
}

export function dblClick(
  this: UserEvent,
  element: Element,
  init?: MouseEventInit,
  {skipPointerEventsCheck = false}: clickOptions & PointerOptions = {},
) {
  if (!skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to double-click element as it has or inherits pointer-events set to "none".',
    )
  }
  hover.call(this, element, init, {skipPointerEventsCheck})

  this.pointer({keys: '[MouseLeft][MouseLeft]', target: element})
}
