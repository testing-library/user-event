import {createPointerState} from './pointer'
import type {UserEvent} from './setup'
import {hasPointerEvents, PointerOptions} from './utils'

export function hover(
  this: UserEvent,
  element: Element,
  {skipPointerEventsCheck = false}: PointerOptions = {},
) {
  if (!skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to hover element as it has or inherits pointer-events set to "none".',
    )
  }

  const pointerState = createPointerState()
  pointerState.position.mouse.target = element.ownerDocument.body

  this.pointer({target: element}, {pointerState})
}

export function unhover(
  this: UserEvent,
  element: Element,
  {skipPointerEventsCheck = false}: PointerOptions = {},
) {
  if (!skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to unhover element as it has or inherits pointer-events set to "none".',
    )
  }

  const pointerState = createPointerState()
  pointerState.position.mouse.target = element

  this.pointer({target: element.ownerDocument.body}, {pointerState})
}
