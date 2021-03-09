import {fireEvent} from '@testing-library/dom'
import {callbackPayload} from '../callbacks'

export function handleArrowDown({
  currentElement,
  eventOverrides,
}: callbackPayload) {
  const key = 'ArrowDown'
  const keyCode = 40

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
