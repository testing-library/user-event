import {fireEvent} from '@testing-library/dom'
import type {UserEvent} from './setup'
import {
  getSpaceUntilMaxLength,
  setSelectionRange,
  eventWrapper,
  isDisabled,
  isElementType,
  editableInputTypes,
  getInputRange,
  prepareInput,
} from './utils'

interface pasteOptions {
  initialSelectionStart?: number
  initialSelectionEnd?: number
}

function isSupportedElement(
  element: HTMLElement,
): element is
  | HTMLTextAreaElement
  | (HTMLInputElement & {type: editableInputTypes}) {
  return (
    (isElementType(element, 'input') &&
      Boolean(editableInputTypes[element.type as editableInputTypes])) ||
    isElementType(element, 'textarea')
  )
}

export function paste(
  this: UserEvent,
  element: HTMLElement,
  text: string,
  init?: ClipboardEventInit,
  {initialSelectionStart, initialSelectionEnd}: pasteOptions = {},
) {
  // TODO: implement for contenteditable
  if (!isSupportedElement(element)) {
    throw new TypeError(
      `The given ${element.tagName} element is currently unsupported.
      A PR extending this implementation would be very much welcome at https://github.com/testing-library/user-event`,
    )
  }

  if (isDisabled(element)) {
    return
  }

  eventWrapper(() => element.focus())

  // by default, a new element has it's selection start and end at 0
  // but most of the time when people call "paste", they expect it to paste
  // at the end of the current input value. So, if the selection start
  // and end are both the default of 0, then we'll go ahead and change
  // them to the length of the current value.
  // the only time it would make sense to pass the initialSelectionStart or
  // initialSelectionEnd is if you have an input with a value and want to
  // explicitely start typing with the cursor at 0. Not super common.
  if (element.selectionStart === 0 && element.selectionEnd === 0) {
    setSelectionRange(
      element,
      initialSelectionStart ?? element.value.length,
      initialSelectionEnd ?? element.value.length,
    )
  }

  fireEvent.paste(element, init)

  if (element.readOnly) {
    return
  }

  text = text.substr(0, getSpaceUntilMaxLength(element))

  const inputRange = getInputRange(element)

  /* istanbul ignore if */
  if (!inputRange) {
    return
  }

  prepareInput(text, element, 'insertFromPaste')?.commit()
}
