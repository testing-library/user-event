import {fireEvent} from '@testing-library/dom'

const wait = time => {
  return new Promise(resolve => {
    setTimeout(() => resolve(), time)
  })
}

const specialKeyMap = {
  '{enter}': {
    key: 'Enter',
    code: 13,
    typed: '\n',
  },
  '{esc}': {
    key: 'Escape',
    code: 27,
    skipPressEvent: true,
  },
  '{backspace}': {
    key: 'Backspace',
    code: 8,
    inputType: 'deleteWordBackward',
    skipPressEvent: true,
  },
  '{shift}': {
    key: 'Shift',
    code: 16,
    modifier: 'shiftKey',
  },
  '{ctrl}': {
    key: 'Control',
    code: 17,
    modifier: 'ctrlKey',
  },
  '{alt}': {
    key: 'Alt',
    code: 18,
    modifier: 'altKey',
  },
  '{meta}': {
    key: 'OS',
    code: 91,
    modifier: 'metaKey',
  },
}

const parseIntoKeys = text =>
  text
    .split(/({[^{}]+?})/)
    .map(part => {
      if (specialKeyMap[part]) {
        return {
          typed: '',
          skipPressEvent: false,
          ...specialKeyMap[part],
        }
      }

      return Array.from(part).map(char => {
        const code = char.charCodeAt(0)

        return {key: char, code, typed: char, skipPressEvent: false}
      })
    })
    .reduce((acc, next) => acc.concat(next), [])

const commitKeyPress = (inputString, {element, key: {typed, inputType}}) => {
  if (inputType === 'deleteWordBackward') {
    return inputString.slice(0, -1)
  }

  if (typed === '\n' && element.tagName === 'INPUT') {
    return inputString
  }

  return inputString + typed
}

const getModifiersFromKeys = keys =>
  keys.reduce((acc, next) => ({...acc, [next.modifier]: true}), {})

const makeKeyEvent = ({key, heldKeys}) => ({
  charCode: key.code,
  key: key.key,
  keyCode: key.code,
  which: key.code,
  ...getModifiersFromKeys(heldKeys),
})

const releaseHeldKeys = ({element, heldKeys}) => {
  heldKeys.forEach((heldKey, i) => {
    fireEvent.keyUp(
      element,
      makeKeyEvent({key: heldKey, heldKeys: heldKeys.slice(i + 1)}),
    )
  })
}

const fireTypeEvents = async ({element, text, opts, computedText}) => {
  const previousText = element.value
  let actuallyTyped = previousText
  const heldKeys = []
  const keys = parseIntoKeys(text)

  for (const key of keys) {
    // eslint-disable-next-line no-await-in-loop
    if (opts.delay > 0) await wait(opts.delay)

    const downEvent = fireEvent.keyDown(element, makeKeyEvent({key, heldKeys}))

    if (key.modifier) {
      heldKeys.push(key)

      // eslint-disable-next-line no-continue
      continue
    }

    if (downEvent) {
      const pressEvent = key.skipPressEvent
        ? true
        : fireEvent.keyPress(element, makeKeyEvent({key, heldKeys}))

      const isTextPastThreshold =
        (actuallyTyped + key.typed).length >
        (previousText + computedText).length

      if (pressEvent && !isTextPastThreshold) {
        const lastTyped = actuallyTyped
        actuallyTyped = commitKeyPress(actuallyTyped, {
          element,
          key,
        })

        if (!element.readOnly && lastTyped !== actuallyTyped) {
          fireEvent.input(element, {
            target: {
              value: actuallyTyped,
            },
            inputType: key.inputType,
            bubbles: true,
            cancelable: true,
          })
        }
      }
    }

    fireEvent.keyUp(element, makeKeyEvent({key, heldKeys}))
  }

  releaseHeldKeys({element, heldKeys})
}

const type = async (element, text, userOpts = {}) => {
  if (element.disabled) return

  const defaultOpts = {
    allAtOnce: false,
    delay: 0,
  }
  const opts = Object.assign(defaultOpts, userOpts)

  const previousText = element.value
  const computedText =
    element.maxLength > 0
      ? text.slice(0, Math.max(element.maxLength - previousText.length, 0))
      : text

  if (opts.allAtOnce) {
    if (!element.readOnly) {
      fireEvent.input(element, {
        target: {value: previousText + computedText},
      })
    }

    return
  }

  await fireTypeEvents({element, text, opts, computedText})
}

export default type
