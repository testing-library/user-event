import {fireEvent} from '@testing-library/dom'
import {callbackPayload} from '../callbacks'
import {fireInputEventIfNeeded} from '../shared'
import { calculateNewBackspaceValue } from '../plugins/functional/calculateBackspaceValue'

export function handleBackspace({
  currentElement,
  eventOverrides,
}: callbackPayload) {
  const key = 'Backspace'
  const keyCode = 8

  const keyPressDefaultNotPrevented = fireEvent.keyDown(
    currentElement() as Element,
    {
      key,
      keyCode,
      which: keyCode,
      ...eventOverrides,
    },
  )

  if (keyPressDefaultNotPrevented) {
    fireInputEventIfNeeded({
      ...calculateNewBackspaceValue(currentElement() as Element),
      eventOverrides: {
        inputType: 'deleteContentBackward',
        ...eventOverrides,
      },
      currentElement,
    })
  }

  fireEvent.keyUp(currentElement() as Element, {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  return undefined
}

