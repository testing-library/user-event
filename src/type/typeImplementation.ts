import {
  setSelectionRange,
  getSelectionRange,
  getValue,
  getActiveElement,
} from '../utils'
import {click} from '../click'
import {keyboardImplementationWrapper} from '../keyboard'

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
): Promise<void> {
  // TODO: properly type guard
  // we use this workaround for now to prevent changing behavior
  if ((element as {disabled?: boolean}).disabled) return

  if (!skipClick) click(element)

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

  if (value != null &&
      (selectionStart === null || selectionStart === 0) &&
      (selectionEnd === null || selectionEnd === 0)
  ) {
    setSelectionRange(
      currentElement() as Element,
      initialSelectionStart ?? value.length,
      initialSelectionEnd ?? value.length,
    )
  }

  const {promise, releaseAllKeys} = keyboardImplementationWrapper(text, {
    delay,
    document: element.ownerDocument,
  })

  if (delay > 0) {
    await promise
  }

  if (!skipAutoClose) {
    releaseAllKeys()
  }
}
