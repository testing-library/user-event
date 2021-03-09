import {fireEvent} from '@testing-library/dom'
import {callbackPayload} from '../callbacks'

export function handleArrowUp({
  currentElement,
  eventOverrides,
}: callbackPayload) {
  const key = 'ArrowUp'
  const keyCode = 38

  fireEvent.keyDown(currentElement() as Element, {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  fireEvent.keyUp(currentElement() as Element, {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  return undefined
}
