// TODO: wrap in asyncWrapper
import {
  fireEvent,
  getConfig as getDOMTestingLibraryConfig,
} from '@testing-library/dom'

import {
  getActiveElement,
  calculateNewValue,
  setSelectionRangeIfNecessary,
  isClickable,
} from './utils'
import {click} from './click'

const modifierCallbackMap = {
  ...createModifierCallbackEntries({
    name: 'shift',
    key: 'Shift',
    keyCode: 16,
    modifierProperty: 'shiftKey',
  }),
  ...createModifierCallbackEntries({
    name: 'ctrl',
    key: 'Control',
    keyCode: 17,
    modifierProperty: 'ctrlKey',
  }),
  ...createModifierCallbackEntries({
    name: 'alt',
    key: 'Alt',
    keyCode: 18,
    modifierProperty: 'altKey',
  }),
  ...createModifierCallbackEntries({
    name: 'meta',
    key: 'Meta',
    keyCode: 93,
    modifierProperty: 'metaKey',
  }),
}

const specialCharCallbackMap = {
  '{enter}': handleEnter,
  '{esc}': handleEsc,
  '{del}': handleDel,
  '{backspace}': handleBackspace,
  '{selectall}': handleSelectall,
  '{space}': handleSpace,
  ' ': handleSpace,
}

function wait(time) {
  return new Promise(resolve => setTimeout(() => resolve(), time))
}

// this needs to be wrapped in the event/asyncWrapper for React's act and angular's change detection
// depending on whether it will be async.
async function type(element, text, {delay = 0, ...options} = {}) {
  // we do not want to wrap in the asyncWrapper if we're not
  // going to actually be doing anything async, so we only wrap
  // if the delay is greater than 0
  let result
  if (delay > 0) {
    await getDOMTestingLibraryConfig().asyncWrapper(async () => {
      result = await typeImpl(element, text, {delay, ...options})
    })
  } else {
    result = typeImpl(element, text, {delay, ...options})
  }
  return result
}

async function typeImpl(
  element,
  text,
  {
    delay,
    skipClick = false,
    skipAutoClose = false,
    initialSelectionStart,
    initialSelectionEnd,
  },
) {
  if (element.disabled) return

  if (!skipClick) click(element)

  // The focused element could change between each event, so get the currently active element each time
  const currentElement = () => getActiveElement(element.ownerDocument)

  const currentValue = () => {
    const activeElement = currentElement()
    const value = activeElement.value
    if (typeof value === 'undefined') {
      throw new TypeError(
        `the current element is of type ${activeElement.tagName} and doesn't have a valid value`,
      )
    }
    return value
  }

  // by default, a new element has it's selection start and end at 0
  // but most of the time when people call "type", they expect it to type
  // at the end of the current input value. So, if the selection start
  // and end are both the default of 0, then we'll go ahead and change
  // them to the length of the current value.
  // the only time it would make sense to pass the initialSelectionStart or
  // initialSelectionEnd is if you have an input with a value and want to
  // explicitely start typing with the cursor at 0. Not super common.
  if (
    currentElement().selectionStart === 0 &&
    currentElement().selectionEnd === 0
  ) {
    setSelectionRangeIfNecessary(
      currentElement(),
      initialSelectionStart ?? currentValue().length,
      initialSelectionEnd ?? currentValue().length,
    )
  }

  const eventCallbacks = queueCallbacks()
  await runCallbacks(eventCallbacks)

  function queueCallbacks() {
    const callbacks = []
    let remainingString = text

    while (remainingString) {
      const {callback, remainingString: newRemainingString} = getNextCallback(
        remainingString,
        skipAutoClose,
      )
      callbacks.push(callback)
      remainingString = newRemainingString
    }

    return callbacks
  }

  async function runCallbacks(callbacks) {
    const eventOverrides = {}
    let prevWasMinus, prevWasPeriod, prevValue
    for (const callback of callbacks) {
      if (delay > 0) await wait(delay)
      if (!currentElement().disabled) {
        const returnValue = callback({
          currentElement,
          currentValue,
          prevWasMinus,
          prevWasPeriod,
          prevValue,
          eventOverrides,
        })
        Object.assign(eventOverrides, returnValue?.eventOverrides)
        prevWasMinus = returnValue?.prevWasMinus
        prevWasPeriod = returnValue?.prevWasPeriod
        prevValue = returnValue?.prevValue
      }
    }
  }
}

function getNextCallback(remainingString, skipAutoClose) {
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

function getModifierCallback(remainingString, skipAutoClose) {
  const modifierKey = Object.keys(modifierCallbackMap).find(key =>
    remainingString.startsWith(key),
  )
  if (!modifierKey) {
    return null
  }
  const callback = modifierCallbackMap[modifierKey]

  // if this modifier has an associated "close" callback and the developer
  // doesn't close it themselves, then we close it for them automatically
  // Effectively if they send in: '{alt}a' then we type: '{alt}a{/alt}'
  if (
    !skipAutoClose &&
    callback.closeName &&
    !remainingString.includes(callback.closeName)
  ) {
    remainingString += callback.closeName
  }
  remainingString = remainingString.slice(modifierKey.length)
  return {
    callback,
    remainingString,
  }
}

function getSpecialCharCallback(remainingString) {
  const specialChar = Object.keys(specialCharCallbackMap).find(key =>
    remainingString.startsWith(key),
  )
  if (!specialChar) {
    return null
  }
  return {
    callback: specialCharCallbackMap[specialChar],
    remainingString: remainingString.slice(specialChar.length),
  }
}

function getTypeCallback(remainingString) {
  const character = remainingString[0]
  const callback = createTypeCharacter(character)
  return {
    callback,
    remainingString: remainingString.slice(1),
  }
}

function setSelectionRange({
  currentElement,
  currentValue,
  newValue,
  newSelectionStart,
}) {
  // if we *can* change the selection start, then we will if the new value
  // is the same as the current value (so it wasn't programatically changed
  // when the fireEvent.input was triggered).
  // The reason we have to do this at all is because it actually *is*
  // programmatically changed by fireEvent.input, so we have to simulate the
  // browser's default behavior
  const value = currentValue()

  if (value === newValue) {
    setSelectionRangeIfNecessary(
      currentElement(),
      newSelectionStart,
      newSelectionStart,
    )
  } else {
    // If the currentValue is different than the expected newValue and we *can*
    // change the selection range, than we should set it to the length of the
    // currentValue to ensure that the browser behavior is mimicked.
    setSelectionRangeIfNecessary(currentElement(), value.length, value.length)
  }
}

function fireInputEventIfNeeded({
  newValue,
  newSelectionStart,
  eventOverrides,
  currentValue,
  currentElement,
}) {
  const prevValue = currentValue()
  if (
    !currentElement().readOnly &&
    !isClickable(currentElement()) &&
    newValue !== prevValue
  ) {
    fireEvent.input(currentElement(), {
      target: {value: newValue},
      ...eventOverrides,
    })

    setSelectionRange({
      currentElement,
      currentValue,
      newValue,
      newSelectionStart,
    })
  }

  return {prevValue}
}

function createTypeCharacter(character) {
  return context => typeCharacter(character, context)
}

function typeCharacter(
  char,
  {
    currentElement,
    currentValue,
    prevWasMinus = false,
    prevWasPeriod = false,
    prevValue = '',
    eventOverrides,
  },
) {
  const key = char // TODO: check if this also valid for characters with diacritic markers e.g. úé etc
  const keyCode = char.charCodeAt(0)
  let nextPrevWasMinus, nextPrevWasPeriod

  const keyDownDefaultNotPrevented = fireEvent.keyDown(currentElement(), {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  if (keyDownDefaultNotPrevented) {
    const keyPressDefaultNotPrevented = fireEvent.keyPress(currentElement(), {
      key,
      keyCode,
      charCode: keyCode,
      ...eventOverrides,
    })

    if (keyPressDefaultNotPrevented) {
      let newEntry = char
      if (prevWasMinus) {
        newEntry = `-${char}`
      } else if (prevWasPeriod) {
        newEntry = `${prevValue}.${char}`
      }

      const inputEvent = fireInputEventIfNeeded({
        ...calculateNewValue(newEntry, currentElement(), currentValue()),
        eventOverrides: {
          data: key,
          inputType: 'insertText',
          ...eventOverrides,
        },
        currentValue,
        currentElement,
      })
      prevValue = inputEvent.prevValue

      // typing "-" into a number input will not actually update the value
      // so for the next character we type, the value should be set to
      // `-${newEntry}`
      // we also preserve the prevWasMinus when the value is unchanged due
      // to typing an invalid character (typing "-a3" results in "-3")
      // same applies for the decimal character.
      if (currentElement().type === 'number') {
        const newValue = currentValue()
        if (newValue === prevValue && newEntry !== '-') {
          nextPrevWasMinus = prevWasMinus
        } else {
          nextPrevWasMinus = newEntry === '-'
        }
        if (newValue === prevValue && newEntry !== '.') {
          nextPrevWasPeriod = prevWasPeriod
        } else {
          nextPrevWasPeriod = newEntry === '.'
        }
      }
    }
  }

  fireEvent.keyUp(currentElement(), {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  return {
    prevWasMinus: nextPrevWasMinus,
    prevWasPeriod: nextPrevWasPeriod,
    prevValue,
  }
}

// yes, calculateNewBackspaceValue and calculateNewValue look extremely similar
// and you may be tempted to create a shared abstraction.
// If you, brave soul, decide to so endevor, please increment this count
// when you inevitably fail: 1
function calculateNewBackspaceValue(element, value) {
  const {selectionStart, selectionEnd} = element
  let newValue, newSelectionStart

  if (selectionStart === null) {
    // at the end of an input type that does not support selection ranges
    // https://github.com/testing-library/user-event/issues/316#issuecomment-639744793
    newValue = value.slice(0, value.length - 1)
    newSelectionStart = selectionStart - 1
  } else if (selectionStart === selectionEnd) {
    if (selectionStart === 0) {
      // at the beginning of the input
      newValue = value
      newSelectionStart = selectionStart
    } else if (selectionStart === value.length) {
      // at the end of the input
      newValue = value.slice(0, value.length - 1)
      newSelectionStart = selectionStart - 1
    } else {
      // in the middle of the input
      newValue = value.slice(0, selectionStart - 1) + value.slice(selectionEnd)
      newSelectionStart = selectionStart - 1
    }
  } else {
    // we have something selected
    const firstPart = value.slice(0, selectionStart)
    newValue = firstPart + value.slice(selectionEnd)
    newSelectionStart = firstPart.length
  }

  return {newValue, newSelectionStart}
}

function calculateNewDeleteValue(element, value) {
  const {selectionStart, selectionEnd} = element
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
    newValue = firstPart + value.slice(selectionEnd)
  }

  return {newValue, newSelectionStart: selectionStart}
}

function createModifierCallbackEntries({name, key, keyCode, modifierProperty}) {
  const openName = `{${name}}`
  const closeName = `{/${name}}`

  function open({currentElement, eventOverrides}) {
    const newEventOverrides = {[modifierProperty]: true}

    fireEvent.keyDown(currentElement(), {
      key,
      keyCode,
      which: keyCode,
      ...eventOverrides,
      ...newEventOverrides,
    })

    return {eventOverrides: newEventOverrides}
  }
  open.closeName = closeName
  function close({currentElement, eventOverrides}) {
    const newEventOverrides = {[modifierProperty]: false}

    fireEvent.keyUp(currentElement(), {
      key,
      keyCode,
      which: keyCode,
      ...eventOverrides,
      ...newEventOverrides,
    })

    return {eventOverrides: newEventOverrides}
  }
  return {
    [openName]: open,
    [closeName]: close,
  }
}

function handleEnter({currentElement, currentValue, eventOverrides}) {
  const key = 'Enter'
  const keyCode = 13

  const keyDownDefaultNotPrevented = fireEvent.keyDown(currentElement(), {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  if (keyDownDefaultNotPrevented) {
    fireEvent.keyPress(currentElement(), {
      key,
      keyCode,
      charCode: keyCode,
      ...eventOverrides,
    })
  }

  if (isClickable(currentElement())) {
    fireEvent.click(currentElement(), {
      ...eventOverrides,
    })
  }

  if (currentElement().tagName === 'TEXTAREA') {
    const {newValue, newSelectionStart} = calculateNewValue(
      '\n',
      currentElement(),
      currentValue(),
    )
    fireEvent.input(currentElement(), {
      target: {value: newValue},
      inputType: 'insertLineBreak',
      ...eventOverrides,
    })
    setSelectionRange({
      currentElement,
      currentValue,
      newValue,
      newSelectionStart,
    })
  }

  fireEvent.keyUp(currentElement(), {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })
}

function handleEsc({currentElement, eventOverrides}) {
  const key = 'Escape'
  const keyCode = 27

  fireEvent.keyDown(currentElement(), {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  // NOTE: Browsers do not fire a keypress on meta key presses

  fireEvent.keyUp(currentElement(), {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })
}

function handleDel({currentElement, currentValue, eventOverrides}) {
  const key = 'Delete'
  const keyCode = 46

  const keyPressDefaultNotPrevented = fireEvent.keyDown(currentElement(), {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  if (keyPressDefaultNotPrevented) {
    fireInputEventIfNeeded({
      ...calculateNewDeleteValue(currentElement(), currentValue()),
      eventOverrides: {
        inputType: 'deleteContentForward',
        ...eventOverrides,
      },
      currentElement,
      currentValue,
    })
  }

  fireEvent.keyUp(currentElement(), {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })
}

function handleBackspace({currentElement, currentValue, eventOverrides}) {
  const key = 'Backspace'
  const keyCode = 8

  const keyPressDefaultNotPrevented = fireEvent.keyDown(currentElement(), {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  if (keyPressDefaultNotPrevented) {
    fireInputEventIfNeeded({
      ...calculateNewBackspaceValue(currentElement(), currentValue()),
      eventOverrides: {
        inputType: 'deleteContentBackward',
        ...eventOverrides,
      },
      currentElement,
      currentValue,
    })
  }

  fireEvent.keyUp(currentElement(), {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })
}

function handleSelectall({currentElement, currentValue}) {
  // the user can actually select in several different ways
  // we're not going to choose, so we'll *only* set the selection range
  currentElement().setSelectionRange(0, currentValue().length)
}

function handleSpace(context) {
  if (isClickable(context.currentElement())) {
    handleSpaceOnClickable(context)
    return
  }
  typeCharacter(' ', context)
}

function handleSpaceOnClickable({currentElement, eventOverrides}) {
  const key = ' '
  const keyCode = 32

  const keyDownDefaultNotPrevented = fireEvent.keyDown(currentElement(), {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  if (keyDownDefaultNotPrevented) {
    fireEvent.keyPress(currentElement(), {
      key,
      keyCode,
      charCode: keyCode,
      ...eventOverrides,
    })
  }

  fireEvent.keyUp(currentElement(), {
    key,
    keyCode,
    which: keyCode,
    ...eventOverrides,
  })

  fireEvent.click(currentElement(), {
    ...eventOverrides,
  })
}

export {type}

/*
eslint
  no-loop-func: "off",
*/
