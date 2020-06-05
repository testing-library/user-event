import {
  getConfig as getDOMTestingLibraryConfig,
  fireEvent,
} from '@testing-library/dom'
import {tick} from './tick'

function wait(time) {
  return new Promise(resolve => setTimeout(() => resolve(), time))
}

// this needs to be wrapped in the asyncWrapper for React's act and angular's change detection
async function type(...args) {
  let result
  await getDOMTestingLibraryConfig().asyncWrapper(async () => {
    result = await typeImpl(...args)
  })
  return result
}

async function typeImpl(element, text, {allAtOnce = false, delay} = {}) {
  if (element.disabled) return

  element.focus()

  // The focused element could change between each event, so get the currently active element each time
  const currentElement = () => element.ownerDocument.activeElement
  const currentValue = () => element.ownerDocument.activeElement.value
  const setSelectionRange = newSelectionStart => {
    // if the actual selection start is different from the one we expected
    // then we set it to the end of the input
    if (currentElement().selectionStart !== newSelectionStart) {
      currentElement().setSelectionRange?.(
        currentValue().length,
        currentValue().length,
      )
    }
  }

  if (allAtOnce) {
    if (!element.readOnly) {
      const {newValue, newSelectionStart} = calculateNewValue(text)
      fireEvent.input(element, {
        target: {value: newValue},
      })
      setSelectionRange(newSelectionStart)
    }
  } else {
    const eventCallbackMap = {
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
      '{enter}': async ({eventOverrides}) => {
        const key = 'Enter'
        const keyCode = 13

        const keyDownDefaultNotPrevented = fireEvent.keyDown(currentElement(), {
          key,
          keyCode,
          which: keyCode,
          ...eventOverrides,
        })

        if (keyDownDefaultNotPrevented) {
          await tick()

          fireEvent.keyPress(currentElement(), {
            key,
            keyCode,
            charCode: keyCode,
            ...eventOverrides,
          })
        }

        if (currentElement().tagName === 'BUTTON') {
          await tick()
          fireEvent.click(currentElement(), {
            ...eventOverrides,
          })
        }

        if (currentElement().tagName === 'TEXTAREA') {
          await tick()
          const {newValue, newSelectionStart} = calculateNewValue('\n')
          fireEvent.input(currentElement(), {
            target: {value: newValue},
            inputType: 'insertLineBreak',
            ...eventOverrides,
          })
          setSelectionRange(newSelectionStart)
        }

        await tick()

        fireEvent.keyUp(currentElement(), {
          key,
          keyCode,
          which: keyCode,
          ...eventOverrides,
        })
      },
      '{esc}': async ({eventOverrides}) => {
        const key = 'Escape'
        const keyCode = 27

        fireEvent.keyDown(currentElement(), {
          key,
          keyCode,
          which: keyCode,
          ...eventOverrides,
        })

        await tick()

        // NOTE: Browsers do not fire a keypress on meta key presses

        fireEvent.keyUp(currentElement(), {
          key,
          keyCode,
          which: keyCode,
          ...eventOverrides,
        })
      },
      '{backspace}': async ({eventOverrides}) => {
        const key = 'Backspace'
        const keyCode = 8

        const keyPressDefaultNotPrevented = fireEvent.keyDown(
          currentElement(),
          {
            key,
            keyCode,
            which: keyCode,
            ...eventOverrides,
          },
        )

        if (keyPressDefaultNotPrevented) {
          await fireInputEventIfNeeded({
            ...calculateNewBackspaceValue(),
            eventOverrides: {
              inputType: 'deleteContentBackward',
              ...eventOverrides,
            },
          })
        }

        await tick()

        fireEvent.keyUp(currentElement(), {
          key,
          keyCode,
          which: keyCode,
          ...eventOverrides,
        })
      },
    }
    const eventCallbacks = []
    let remainingString = text
    while (remainingString) {
      const eventKey = Object.keys(eventCallbackMap).find(key =>
        remainingString.startsWith(key),
      )
      if (eventKey) {
        eventCallbacks.push(eventCallbackMap[eventKey])
        remainingString = remainingString.slice(eventKey.length)
      } else {
        const character = remainingString[0]
        eventCallbacks.push((...args) => typeCharacter(character, ...args))
        remainingString = remainingString.slice(1)
      }
    }
    const eventOverrides = {}
    for (const callback of eventCallbacks) {
      if (delay > 0) await wait(delay)
      if (!currentElement().disabled) {
        const returnValue = await callback({eventOverrides})
        Object.assign(eventOverrides, returnValue?.eventOverrides)
      }
    }
  }

  async function fireInputEventIfNeeded({
    newValue,
    newSelectionStart,
    eventOverrides,
  }) {
    if (!currentElement().readOnly && newValue !== currentValue()) {
      await tick()

      fireEvent.input(currentElement(), {
        target: {value: newValue},
        ...eventOverrides,
      })

      setSelectionRange(newSelectionStart)
    }
  }

  // yes, calculateNewBackspaceValue and calculateNewValue look extremely similar
  // and you may be tempted to create a shared abstraction.
  // If you, brave soul, decide to so endevor, please increment this count
  // when you inevitably fail: 1
  function calculateNewBackspaceValue() {
    const {selectionStart, selectionEnd} = currentElement()
    const value = currentValue()
    let newValue, newSelectionStart

    if (selectionStart === selectionEnd) {
      if (selectionStart === 0) {
        // at the beginning of the input
        newValue = value
      } else if (selectionStart === value.length) {
        // at the end of the input
        newValue = value.slice(0, value.length - 1)
        newSelectionStart = selectionStart - 1
      } else {
        // in the middle of the input
        newValue =
          value.slice(0, selectionStart - 1) + value.slice(selectionEnd)
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

  function calculateNewValue(newEntry) {
    const {selectionStart, selectionEnd} = currentElement()
    // can't use .maxLength property because of a jsdom bug:
    // https://github.com/jsdom/jsdom/issues/2927
    const maxLength = Number(currentElement().getAttribute('maxlength') ?? -1)
    const value = currentValue()
    let newValue, newSelectionStart

    if (selectionStart === selectionEnd) {
      if (selectionStart === 0) {
        // at the beginning of the input
        newValue = newEntry + value
      } else if (selectionStart === value.length) {
        // at the end of the input
        newValue = value + newEntry
      } else {
        // in the middle of the input
        newValue =
          value.slice(0, selectionStart) + newEntry + value.slice(selectionEnd)
      }
      newSelectionStart = selectionStart + newEntry.length
    } else {
      // we have something selected
      const firstPart = value.slice(0, selectionStart) + newEntry
      newValue = firstPart + value.slice(selectionEnd)
      newSelectionStart = firstPart.length
    }

    if (maxLength < 0) {
      return {newValue, newSelectionStart}
    } else {
      return {
        newValue: newValue.slice(0, maxLength),
        newSelectionStart:
          newSelectionStart > maxLength ? maxLength : newSelectionStart,
      }
    }
  }

  async function typeCharacter(char, {eventOverrides}) {
    const key = char // TODO: check if this also valid for characters with diacritic markers e.g. úé etc
    const keyCode = char.charCodeAt(0)

    const keyDownDefaultNotPrevented = fireEvent.keyDown(currentElement(), {
      key,
      keyCode,
      which: keyCode,
      ...eventOverrides,
    })

    if (keyDownDefaultNotPrevented) {
      await tick()

      const keyPressDefaultNotPrevented = fireEvent.keyPress(currentElement(), {
        key,
        keyCode,
        charCode: keyCode,
        ...eventOverrides,
      })

      if (keyPressDefaultNotPrevented) {
        await fireInputEventIfNeeded({
          ...calculateNewValue(key),
          eventOverrides,
        })
      }
    }

    await tick()

    fireEvent.keyUp(currentElement(), {
      key,
      keyCode,
      which: keyCode,
      ...eventOverrides,
    })
  }

  function modifier({name, key, keyCode, modifierProperty}) {
    return {
      [`{${name}}`]: ({eventOverrides}) => {
        const newEventOverrides = {[modifierProperty]: true}

        fireEvent.keyDown(currentElement(), {
          key,
          keyCode,
          which: keyCode,
          ...eventOverrides,
          ...newEventOverrides,
        })

        return {eventOverrides: newEventOverrides}
      },
      [`{/${name}}`]: ({eventOverrides}) => {
        const newEventOverrides = {[modifierProperty]: false}

        fireEvent.keyUp(currentElement(), {
          key,
          keyCode,
          which: keyCode,
          ...eventOverrides,
          ...newEventOverrides,
        })

        return {eventOverrides: newEventOverrides}
      },
    }
  }
}

export {type}

/*
eslint
  no-await-in-loop: "off",
  no-loop-func: "off",
  max-lines-per-function: "off",
*/
