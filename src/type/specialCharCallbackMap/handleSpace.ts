import {fireEvent} from '@testing-library/dom'
import {callbackPayload} from '../callbacks'
import {isClickableInput} from '../../utils/click'
import {typeCharacter} from '../typeCharacter'

export function handleSpace(context: callbackPayload) {
  const el = context.currentElement()
  if (el && isClickableInput(el)) {
    return handleSpaceOnClickable(context)
  }

  return typeCharacter(' ', context)
}

function handleSpaceOnClickable({
  currentElement,
  eventOverrides,
}: callbackPayload) {
  const key = ' '
  const keyCode = 32

  const keyDownDefaultNotPrevented = fireEvent.keyDown(
    currentElement() as Element,
    {
      key,
      keyCode,
      which: keyCode,
      ...eventOverrides,
    },
  )

  if (keyDownDefaultNotPrevented) {
    fireEvent.keyPress(currentElement() as Element, {
      key,
      keyCode,
      charCode: keyCode,
      ...eventOverrides,
    })
  }

  const keyUpDefaultNotPrevented = fireEvent.keyUp(
    currentElement() as Element,
    {
      key,
      keyCode,
      which: keyCode,
      ...eventOverrides,
    },
  )

  if (keyDownDefaultNotPrevented && keyUpDefaultNotPrevented) {
    fireEvent.click(currentElement() as Element, {
      ...eventOverrides,
    })
  }

  return undefined
}
