// TODO: wrap in asyncWrapper
import {
  setSelectionRangeIfNecessary,
  getSelectionRange,
  getValue,
  isContentEditable,
  getActiveElement,
  isDisabled,
} from '../utils'
import {click} from '../click'
import {modifierCallbackMap} from './modifierCallbackMap'
import {specialCharCallbackMap} from './specialCharCallbackMap'
import {typeCharacter} from './typeCharacter'
import {callback, callbackPayload} from './callbacks'

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

  const eventCallbacks = queueCallbacks()
  await runCallbacks(eventCallbacks)

  function queueCallbacks() {
    const callbacks = []
    let remainingString = text

    while (remainingString) {
      const {
        callback: cb,
        remainingString: newRemainingString,
      } = getNextCallback(remainingString, skipAutoClose)

      callbacks.push(cb)
      remainingString = newRemainingString
    }

    return callbacks
  }

  async function runCallbacks(callbacks: callback[]) {
    const eventOverrides = {}
    let prevWasMinus, prevWasPeriod, prevValue, typedValue
    for (const cb of callbacks) {
      if (delay > 0) await wait(delay)
      if (!isDisabled(currentElement())) {
        const returnValue: Partial<callbackPayload> | undefined = cb({
          currentElement,
          prevWasMinus,
          prevWasPeriod,
          prevValue,
          eventOverrides,
          typedValue,
        })
        Object.assign(eventOverrides, returnValue?.eventOverrides)
        prevWasMinus = returnValue?.prevWasMinus
        prevWasPeriod = returnValue?.prevWasPeriod
        prevValue = returnValue?.prevValue
        typedValue = returnValue?.typedValue
      }
    }
  }
}

function wait(time?: number) {
  return new Promise<void>(resolve => setTimeout(() => resolve(), time))
}

type callbackPrep =
  | {
      callback: callback
      remainingString: string
    }
  | undefined

function getNextCallback(
  remainingString: string,
  skipAutoClose: boolean,
): NonNullable<callbackPrep> {
  const modifierCallback = getModifierCallback(remainingString, skipAutoClose)
  if (modifierCallback) {
    return modifierCallback
  }

  const specialCharCallback = getSpecialCharCallback(remainingString)
  if (specialCharCallback) {
    return specialCharCallback
  }

  return getTypeCallback(remainingString)
}

function getModifierCallback(
  remainingString: string,
  skipAutoClose: boolean,
): callbackPrep {
  const modifierKey = Object.keys(modifierCallbackMap).find(key =>
    remainingString.startsWith(key),
  )
  if (!modifierKey) {
    return undefined
  }
  const cb =
    modifierCallbackMap[modifierKey as keyof typeof modifierCallbackMap]

  // if this modifier has an associated "close" callback and the developer
  // doesn't close it themselves, then we close it for them automatically
  // Effectively if they send in: '{alt}a' then we type: '{alt}a{/alt}'
  if (
    !skipAutoClose &&
    cb.closeName &&
    !remainingString.includes(cb.closeName)
  ) {
    remainingString += cb.closeName
  }
  remainingString = remainingString.slice(modifierKey.length)
  return {
    callback: cb,
    remainingString,
  }
}

function getSpecialCharCallback(remainingString: string): callbackPrep {
  const specialChar = Object.keys(specialCharCallbackMap).find(key =>
    remainingString.startsWith(key),
  )
  if (!specialChar) {
    return undefined
  }
  return {
    callback: specialCharCallbackMap[specialChar],
    remainingString: remainingString.slice(specialChar.length),
  }
}

function getTypeCallback(remainingString: string): NonNullable<callbackPrep> {
  const character = remainingString[0]
  return {
    callback: (context: callbackPayload) => typeCharacter(character, context),
    remainingString: remainingString.slice(1),
  }
}
