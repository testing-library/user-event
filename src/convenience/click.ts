import type {PointerInput} from '../pointer'
import {hasPointerEvents} from '../utils'
import {Config, UserEvent} from '../setup'

export async function click(this: UserEvent, element: Element): Promise<void> {
  if (!this[Config].skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to click element as it has or inherits pointer-events set to "none".',
    )
  }

  const pointerIn: PointerInput = []
  if (!this[Config].skipHover) {
    pointerIn.push({target: element})
  }
  pointerIn.push({keys: '[MouseLeft]', target: element})

  return this.pointer(pointerIn)
}

export async function dblClick(
  this: UserEvent,
  element: Element,
): Promise<void> {
  if (!this[Config].skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to double-click element as it has or inherits pointer-events set to "none".',
    )
  }

  return this.pointer([{target: element}, '[MouseLeft][MouseLeft]'])
}

export async function tripleClick(
  this: UserEvent,
  element: Element,
): Promise<void> {
  if (!this[Config].skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to triple-click element as it has or inherits pointer-events set to "none".',
    )
  }

  return this.pointer([{target: element}, '[MouseLeft][MouseLeft][MouseLeft]'])
}
