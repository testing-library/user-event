// TODO: wrap in asyncWrapper
import {
  setSelectionRangeIfNecessary,
  getSelectionRange,
  getValue,
  isContentEditable,
  getActiveElement,
  wait,
} from '../utils'
import {click} from '../click'
import type {keyboardState} from '../keyboard/types'
import {defaultKeyMap} from '../keyboard/keyMap'
import {keyboardImplementation} from '../keyboard/keyboardImplementation'

export interface typeOptions {
  delay?: number
  skipClick?: boolean
  skipAutoClose?: boolean
  initialSelectionStart?: number
  initialSelectionEnd?: number
}

export async function typeImplementation(
  element: Element,
  text: string,
  {
    delay,
    skipClick = false,
    skipAutoClose = false,
    initialSelectionStart = undefined,
    initialSelectionEnd = undefined,
  }: typeOptions & {delay: number},
) {
  // TODO: properly type guard
  // we use this workaround for now to prevent changing behavior
  if ((element as {disabled?: boolean}).disabled) return

  if (!skipClick) click(element)

  if (isContentEditable(element)) {
    const selection = document.getSelection()
    // istanbul ignore else
    if (selection && selection.rangeCount === 0) {
      const range = document.createRange()
      range.setStart(element, 0)
      range.setEnd(element, 0)
      selection.addRange(range)
    }
  }
  // The focused element could change between each event, so get the currently active element each time
  const currentElement = () => getActiveElement(element.ownerDocument)

  // by default, a new element has it's selection start and end at 0
  // but most of the time when people call "type", they expect it to type
  // at the end of the current input value. So, if the selection start
  // and end are both the default of 0, then we'll go ahead and change
  // them to the length of the current value.
  // the only time it would make sense to pass the initialSelectionStart or
  // initialSelectionEnd is if you have an input with a value and want to
  // explicitely start typing with the cursor at 0. Not super common.
  const value = getValue(currentElement())

  const {selectionStart, selectionEnd} = getSelectionRange(element)

  if (value != null && selectionStart === 0 && selectionEnd === 0) {
    setSelectionRangeIfNecessary(
      currentElement() as Element,
      initialSelectionStart ?? value.length,
      initialSelectionEnd ?? value.length,
    )
  }

  // previous implementation did wait before the first character
  // this probably can be removed
  if (delay > 0) {
    await wait(delay)
  }

  await keyboardImplementation(
    element.ownerDocument,
    text,
    {
      delay,
      autoModify: false,
      keyboardMap: defaultKeyMap,
      skipAutoClose,
    },
    createKeyboardState(),
  ).catch(
    // istanbul ignore next
    e => console.error(e),
  )
}

function createKeyboardState(): keyboardState {
  return {
    activeElement: null,
    pressed: [],
    carryChar: '',
    modifiers: {
      alt: false,
      caps: false,
      ctrl: false,
      meta: false,
      shift: false,
    },
  }
}
