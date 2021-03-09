import {fireEvent} from '@testing-library/dom'
import {callbackPayload} from '../callbacks'

export function handleEsc({currentElement, eventOverrides}: callbackPayload) {
  const key = 'Escape'
  const keyCode = 27

  fireEvent.keyDown(currentElement() as Element, {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  // NOTE: Browsers do not fire a keypress on meta key presses

  fireEvent.keyUp(currentElement() as Element, {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  return undefined
}
