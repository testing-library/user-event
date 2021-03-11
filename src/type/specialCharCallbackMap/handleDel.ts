import {fireEvent} from '@testing-library/dom'
import {callbackPayload} from '../callbacks'
import {fireInputEventIfNeeded} from '../shared'
import { calculateNewDeleteValue } from '../plugins/control/calculateNewDeleteValue'

export function handleDel({currentElement, eventOverrides}: callbackPayload) {
  const key = 'Delete'
  const keyCode = 46

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
      ...calculateNewDeleteValue(currentElement() as Element),
      eventOverrides: {
        inputType: 'deleteContentForward',
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

