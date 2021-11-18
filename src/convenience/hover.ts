import {Config, UserEvent} from '../setup'
import {hasPointerEvents} from '../utils'

export async function hover(this: UserEvent, element: Element) {
  if (!this[Config].skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to hover element as it has or inherits pointer-events set to "none".',
    )
  }

  return this.pointer({target: element})
}

export async function unhover(this: UserEvent, element: Element) {
  if (!this[Config].skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to unhover element as it has or inherits pointer-events set to "none".',
    )
  }

  return this.pointer({target: element.ownerDocument.body})
}
