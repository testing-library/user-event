import {fireEvent} from '@testing-library/dom'
import {callbackPayload} from '../callbacks'
import {getSelectionRange, getValue} from '../../utils'
import {fireInputEventIfNeeded} from '../shared'

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

function calculateNewDeleteValue(element: Element) {
  const {selectionStart, selectionEnd} = getSelectionRange(element)

  // istanbul ignore next
  const value = getValue(element) ?? ''

  let newValue

  if (selectionStart === null) {
    // at the end of an input type that does not support selection ranges
    // https://github.com/testing-library/user-event/issues/316#issuecomment-639744793
    newValue = value
  } else if (selectionStart === selectionEnd) {
    if (selectionStart === 0) {
      // at the beginning of the input
      newValue = value.slice(1)
    } else if (selectionStart === value.length) {
      // at the end of the input
      newValue = value
    } else {
      // in the middle of the input
      newValue = value.slice(0, selectionStart) + value.slice(selectionEnd + 1)
    }
  } else {
    // we have something selected
    const firstPart = value.slice(0, selectionStart)
    newValue = firstPart + value.slice(selectionEnd as number)
  }

  return {newValue, newSelectionStart: selectionStart ?? 0}
}
