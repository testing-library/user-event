import {hasPointerEvents, PointerOptions} from './utils'
import type {UserEvent} from './setup'

export declare interface clickOptions {
  skipHover?: boolean
  clickCount?: number
}

export function click(
  this: UserEvent,
  element: Element,
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
    this.hover(element, {skipPointerEventsCheck: true})

  this.pointer({keys: '[MouseLeft]', target: element})
}

export function dblClick(
  this: UserEvent,
  element: Element,
  {skipPointerEventsCheck = false}: clickOptions & PointerOptions = {},
) {
  if (!skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to double-click element as it has or inherits pointer-events set to "none".',
    )
  }
  this.hover(element, {skipPointerEventsCheck: true})

  this.pointer({keys: '[MouseLeft][MouseLeft]', target: element})
}

export function tripleClick(
  this: UserEvent,
  element: Element,
  {skipPointerEventsCheck = false}: clickOptions & PointerOptions = {},
) {
  if (!skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to triple-click element as it has or inherits pointer-events set to "none".',
    )
  }
  this.hover(element, {skipPointerEventsCheck: true})

  this.pointer({keys: '[MouseLeft][MouseLeft][MouseLeft]', target: element})
}
