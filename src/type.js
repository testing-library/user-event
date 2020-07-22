// TODO: wrap in asyncWrapper
import {
  fireEvent,
  getConfig as getDOMTestingLibraryConfig,
} from '@testing-library/dom'

import {
  getActiveElement,
  calculateNewValue,
  setSelectionRangeIfNecessary,
} from './utils'
import {click} from './click'

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

  const modifierCallbackMap = getModifierCallbackMap({
    currentElement,
  })

  const eventCallbackMap = getEventCallbackMap({
    currentElement,
    currentValue,
  })

  const eventCallbacks = queueCallbacks()
  await runCallbacks(eventCallbacks)

  function queueCallbacks() {
    const callbacks = []
    const appendedCallbacks = []
    let remainingString = text

    while (remainingString) {
      const {callback, appendedCallback, handledLength} = getNextCallback(
        remainingString,
      )
      callbacks.push(callback)
      if (appendedCallback) {
        appendedCallbacks.push(appendedCallback)
      }
      remainingString = remainingString.slice(handledLength)
    }

    return [...callbacks, ...appendedCallbacks]
  }

  function getNextCallback(remainingString) {
    let callback, appendedCallback, handledLength
    const modifierKey = Object.keys(modifierCallbackMap).find(key =>
      remainingString.startsWith(key),
    )
    const eventKey = Object.keys(eventCallbackMap).find(key =>
      remainingString.startsWith(key),
    )
    if (modifierKey) {
      callback = modifierCallbackMap[modifierKey]

      // if this modifier has an associated "close" callback and the developer
      // doesn't close it themselves, then we close it for them automatically
      // Effectively if they send in: '{alt}a' then we type: '{alt}a{/alt}'
      if (
        !skipAutoClose &&
        callback.close &&
        !remainingString.includes(callback.close.name)
      ) {
        appendedCallback = callback.close.fn
      }
      handledLength = modifierKey.length
    } else if (eventKey) {
      callback = eventCallbackMap[eventKey]
      handledLength = eventKey.length
    } else {
      let character = remainingString[0]
      if (remainingString.startsWith('{space}')) {
        character = ' '
        handledLength = 7
      } else {
        handledLength = 1
      }
      callback = createTypeCharacter(character, currentElement, currentValue)
    }
    return {
      callback,
      appendedCallback,
      handledLength,
    }
  }

  async function runCallbacks(callbacks) {
    const eventOverrides = {}
    let prevWasMinus, prevWasPeriod, prevValue
    for (const callback of callbacks) {
      if (delay > 0) await wait(delay)
      if (!currentElement().disabled) {
        const returnValue = callback({
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

const setSelectionRange = ({
  currentElement,
  currentValue,
  newValue,
  newSelectionStart,
}) => {
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
    currentElement().tagName !== 'BUTTON' &&
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

function createTypeCharacter(character, currentElement, currentValue) {
  return (...args) =>
    typeCharacter(character, currentElement, currentValue, ...args)
}

function typeCharacter(
  char,
  currentElement,
  currentValue,
  {prevWasMinus = false, prevWasPeriod = false, prevValue = '', eventOverrides},
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

function getModifierCallbackMap({currentElement}) {
  const callbackMap = {
    ...modifier({
      name: 'shift',
      key: 'Shift',
      keyCode: 16,
      modifierProperty: 'shiftKey',
    }),
    ...modifier({
      name: 'ctrl',
      key: 'Control',
      keyCode: 17,
      modifierProperty: 'ctrlKey',
    }),
    ...modifier({
      name: 'alt',
      key: 'Alt',
      keyCode: 18,
      modifierProperty: 'altKey',
    }),
    ...modifier({
      name: 'meta',
      key: 'Meta',
      keyCode: 93,
      modifierProperty: 'metaKey',
    }),
  }

  return callbackMap

  function modifier({name, key, keyCode, modifierProperty}) {
    function open({eventOverrides}) {
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
    open.close = {name: [`{/${name}}`], fn: close}
    function close({eventOverrides}) {
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
      [`{${name}}`]: open,
      [`{/${name}}`]: close,
    }
  }
}

function getEventCallbackMap({currentElement, currentValue}) {
  const callbackMap = {
    '{enter}': ({eventOverrides}) => {
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

      if (currentElement().tagName === 'BUTTON') {
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
    },
    '{esc}': ({eventOverrides}) => {
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
    },
    '{del}': ({eventOverrides}) => {
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
    },
    '{backspace}': ({eventOverrides}) => {
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
    },
    // the user can actually select in several different ways
    // we're not going to choose, so we'll *only* set the selection range
    '{selectall}': () => {
      currentElement().setSelectionRange(0, currentValue().length)
    },
  }

  if (currentElement().tagName === 'BUTTON') {
    callbackMap['{space}'] = handleSpaceOnButton
    callbackMap[' '] = handleSpaceOnButton
  } else {
    callbackMap['{space}'] = createTypeCharacter(
      ' ',
      currentElement,
      currentValue,
    )
  }

  return callbackMap

  function handleSpaceOnButton({eventOverrides}) {
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
}

export {type}

/*
eslint
  no-loop-func: "off",
  max-lines-per-function: "off",
*/
