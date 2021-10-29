import {fireEvent} from '@testing-library/dom'
import {blur, focus, getActiveElement, getTabDestination} from './utils'
import type {UserEvent} from './setup'

export interface tabOptions {
  shift?: boolean
  focusTrap?: Document | Element
}

export function tab(
  this: UserEvent,
  {shift = false, focusTrap}: tabOptions = {},
) {
  const doc = focusTrap?.ownerDocument ?? document
  const previousElement = getActiveElement(doc)

  // Never the case in our test environment
  // Only happens if the activeElement is inside a shadowRoot that is not part of `doc`.
  /* istanbul ignore next */
  if (!previousElement) {
    return
  }

  if (!focusTrap) {
    focusTrap = doc
  }

  const nextElement = getTabDestination(previousElement, shift, focusTrap)
  if (!nextElement) {
    return
  }

  const shiftKeyInit = {
    key: 'Shift',
    keyCode: 16,
    shiftKey: true,
  }
  const tabKeyInit = {
    key: 'Tab',
    keyCode: 9,
    shiftKey: shift,
  }

  let continueToTab = true

  if (shift) fireEvent.keyDown(previousElement, {...shiftKeyInit})
  continueToTab = fireEvent.keyDown(previousElement, {...tabKeyInit})

  const keyUpTarget = continueToTab ? nextElement : previousElement

  if (continueToTab) {
    if (nextElement === doc.body) {
      blur(previousElement)
    } else {
      focus(nextElement)
    }
  }

  fireEvent.keyUp(keyUpTarget, {...tabKeyInit})

  if (shift) {
    fireEvent.keyUp(keyUpTarget, {...shiftKeyInit, shiftKey: false})
  }
}
