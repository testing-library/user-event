import {fireEvent} from '@testing-library/dom'

function wait(time) {
  return new Promise(resolve => setTimeout(() => resolve(), time))
}

function clickLabel(label) {
  fireEvent.mouseOver(label)
  fireEvent.mouseMove(label)
  fireEvent.mouseDown(label)
  fireEvent.mouseUp(label)
  fireEvent.click(label)

  // clicking the label will trigger a click of the label.control
  // however, it will not focus the label.control so we have to do it
  // ourselves.
  if (label.control) label.control.focus()
}

function clickBooleanElement(element) {
  if (element.disabled) return

  fireEvent.mouseOver(element)
  fireEvent.mouseMove(element)
  fireEvent.mouseDown(element)
  fireEvent.focus(element)
  fireEvent.mouseUp(element)
  fireEvent.click(element)
}

function clickElement(element, previousElement, init) {
  fireEvent.mouseOver(element)
  fireEvent.mouseMove(element)
  const continueDefaultHandling = fireEvent.mouseDown(element)
  const shouldFocus = element.ownerDocument.activeElement !== element
  if (continueDefaultHandling) {
    if (previousElement) previousElement.blur()
    if (shouldFocus) element.focus()
  }
  fireEvent.mouseUp(element)
  fireEvent.click(element, init)
  const parentLabel = element.closest('label')
  if (parentLabel?.control) parentLabel?.control.focus?.()
}

function dblClickElement(element, previousElement) {
  fireEvent.mouseOver(element)
  fireEvent.mouseMove(element)
  const continueDefaultHandling = fireEvent.mouseDown(element)
  const shouldFocus = element.ownerDocument.activeElement !== element
  if (continueDefaultHandling) {
    if (previousElement) previousElement.blur()
    if (shouldFocus) element.focus()
  }
  fireEvent.mouseUp(element)
  fireEvent.click(element)
  const parentLabel = element.closest('label')
  if (parentLabel?.control) parentLabel?.control.focus?.()

  fireEvent.mouseDown(element)
  fireEvent.mouseUp(element)
  fireEvent.click(element)
  fireEvent.dblClick(element)
}

function dblClickCheckbox(checkbox) {
  fireEvent.mouseOver(checkbox)
  fireEvent.mouseMove(checkbox)
  fireEvent.mouseDown(checkbox)
  fireEvent.focus(checkbox)
  fireEvent.mouseUp(checkbox)
  fireEvent.click(checkbox)
  fireEvent.mouseDown(checkbox)
  fireEvent.mouseUp(checkbox)
  fireEvent.click(checkbox)
}

function selectOption(select, option) {
  fireEvent.mouseOver(option)
  fireEvent.mouseMove(option)
  fireEvent.mouseDown(option)
  fireEvent.focus(option)
  fireEvent.mouseUp(option)
  fireEvent.click(option)

  option.selected = true

  fireEvent.change(select)
}

const Keys = {
  Backspace: {keyCode: 8, code: 'Backspace', key: 'Backspace'},
}

function backspace(element) {
  const keyboardEventOptions = {
    key: Keys.Backspace.key,
    keyCode: Keys.Backspace.keyCode,
    which: Keys.Backspace.keyCode,
  }
  fireEvent.keyDown(element, keyboardEventOptions)
  fireEvent.keyUp(element, keyboardEventOptions)

  if (!element.readOnly) {
    fireEvent.input(element, {
      inputType: 'deleteContentBackward',
    })

    // We need to call `fireEvent.change` _before_ we change `element.value`
    // because `fireEvent.change` will use the element's native value setter
    // (meaning it will avoid prototype overrides implemented by React). If we
    // call `input.value = ""` first, React will swallow the change event (this
    // is checked in the tests). `fireEvent.change` will only call the native
    // value setter method if the event options include `{ target: { value }}`
    // (https://github.com/testing-library/dom-testing-library/blob/8846eaf20972f8e41ed11f278948ac38a692c3f1/src/events.js#L29-L32).
    //
    // Also, we still must call `element.value = ""` after calling
    // `fireEvent.change` because `fireEvent.change` will _only_ call the native
    // `value` setter and not the prototype override defined by React, causing
    // React's internal represetation of this state to get out of sync with the
    // value set on `input.value`; calling `element.value` after will also call
    // React's setter, keeping everything in sync.
    //
    // Comment either of these out or re-order them and see what parts of the
    // tests fail for more context.
    fireEvent.change(element, {target: {value: ''}})
    element.value = ''
  }
}

function selectAll(element) {
  dblClick(element) // simulate events (will not actually select)
  const elementType = element.type
  // type is a readonly property on textarea, so check if element is an input before trying to modify it
  if (isInputElement(element)) {
    // setSelectionRange is not supported on certain types of inputs, e.g. "number" or "email"
    element.type = 'text'
  }
  element.setSelectionRange(0, element.value.length)
  if (isInputElement(element)) {
    element.type = elementType
  }
}

function isInputElement(element) {
  return element.tagName.toLowerCase() === 'input'
}

function getPreviouslyFocusedElement(element) {
  const focusedElement = element.ownerDocument.activeElement
  const wasAnotherElementFocused =
    focusedElement &&
    focusedElement !== element.ownerDocument.body &&
    focusedElement !== element
  return wasAnotherElementFocused ? focusedElement : null
}

function click(element, init) {
  const previouslyFocusedElement = getPreviouslyFocusedElement(element)
  if (previouslyFocusedElement) {
    fireEvent.mouseMove(previouslyFocusedElement)
    fireEvent.mouseLeave(previouslyFocusedElement)
  }

  switch (element.tagName) {
    case 'LABEL':
      clickLabel(element)
      break
    case 'INPUT':
      if (element.type === 'checkbox' || element.type === 'radio') {
        clickBooleanElement(element)
        break
      }
    // eslint-disable-next-line no-fallthrough
    default:
      clickElement(element, previouslyFocusedElement, init)
  }
}

function dblClick(element) {
  const previouslyFocusedElement = getPreviouslyFocusedElement(element)
  if (previouslyFocusedElement) {
    fireEvent.mouseMove(previouslyFocusedElement)
    fireEvent.mouseLeave(previouslyFocusedElement)
  }

  switch (element.tagName) {
    case 'INPUT':
      if (element.type === 'checkbox') {
        dblClickCheckbox(element, previouslyFocusedElement)
        break
      }
    // eslint-disable-next-line no-fallthrough
    default:
      dblClickElement(element, previouslyFocusedElement)
  }
}

function selectOptions(element, values) {
  const previouslyFocusedElement = getPreviouslyFocusedElement(element)
  if (previouslyFocusedElement) {
    fireEvent.mouseMove(previouslyFocusedElement)
    fireEvent.mouseLeave(previouslyFocusedElement)
  }

  clickElement(element, previouslyFocusedElement)

  const valArray = Array.isArray(values) ? values : [values]
  const selectedOptions = Array.from(
    element.querySelectorAll('option'),
  ).filter(opt => valArray.includes(opt.value))

  if (selectedOptions.length > 0) {
    if (element.multiple) {
      selectedOptions.forEach(option => selectOption(element, option))
    } else {
      selectOption(element, selectedOptions[0])
    }
  }
}

function clear(element) {
  if (element.disabled) return

  selectAll(element)
  backspace(element)
}

async function type(element, text, {allAtOnce = false, delay} = {}) {
  if (element.disabled) return
  const previousText = element.value

  const computedText =
    element.maxLength > 0
      ? text.slice(0, Math.max(element.maxLength - previousText.length, 0))
      : text

  if (allAtOnce) {
    if (!element.readOnly) {
      fireEvent.input(element, {
        target: {value: previousText + computedText},
      })
    }
  } else {
    let actuallyTyped = previousText
    for (let index = 0; index < text.length; index++) {
      const char = text[index]
      const key = char // TODO: check if this also valid for characters with diacritic markers e.g. úé etc
      const keyCode = char.charCodeAt(0)

      // eslint-disable-next-line no-await-in-loop
      if (delay > 0) await wait(delay)

      const downEvent = fireEvent.keyDown(element, {
        key,
        keyCode,
        which: keyCode,
      })

      if (downEvent) {
        const pressEvent = fireEvent.keyPress(element, {
          key,
          keyCode,
          charCode: keyCode,
        })

        const isTextPastThreshold =
          (actuallyTyped + key).length > (previousText + computedText).length

        if (pressEvent && !isTextPastThreshold) {
          actuallyTyped += key
          if (!element.readOnly) {
            fireEvent.input(element, {
              target: {
                value: actuallyTyped,
              },
              bubbles: true,
              cancelable: true,
            })
          }
        }
      }

      fireEvent.keyUp(element, {
        key,
        keyCode,
        which: keyCode,
      })
    }
  }
}

function upload(element, fileOrFiles, {clickInit, changeInit} = {}) {
  if (element.disabled) return
  const focusedElement = element.ownerDocument.activeElement

  let files

  if (element.tagName === 'LABEL') {
    clickLabel(element)
    files = element.control.multiple ? fileOrFiles : [fileOrFiles]
  } else {
    files = element.multiple ? fileOrFiles : [fileOrFiles]
    clickElement(element, focusedElement, clickInit)
  }

  fireEvent.change(element, {
    target: {
      files: {
        length: files.length,
        item: index => files[index] || null,
        ...files,
      },
    },
    ...changeInit,
  })
}

function tab({shift = false, focusTrap = document} = {}) {
  const focusableElements = focusTrap.querySelectorAll(
    'input, button, select, textarea, a[href], [tabindex]',
  )

  const enabledElements = [...focusableElements].filter(
    el => el.getAttribute('tabindex') !== '-1' && !el.disabled,
  )

  if (enabledElements.length === 0) return

  const orderedElements = enabledElements
    .map((el, idx) => ({el, idx}))
    .sort((a, b) => {
      const tabIndexA = a.el.getAttribute('tabindex')
      const tabIndexB = b.el.getAttribute('tabindex')

      const diff = tabIndexA - tabIndexB

      return diff === 0 ? a.idx - b.idx : diff
    })

  const index = orderedElements.findIndex(
    ({el}) => el === el.ownerDocument.activeElement,
  )

  const nextIndex = shift ? index - 1 : index + 1
  const defaultIndex = shift ? orderedElements.length - 1 : 0

  const {el: next} = orderedElements[nextIndex] || orderedElements[defaultIndex]

  if (next.getAttribute('tabindex') === null) {
    next.setAttribute('tabindex', '0') // jsdom requires tabIndex=0 for an item to become 'document.activeElement'
    next.focus()
    next.removeAttribute('tabindex') // leave no trace. :)
  } else {
    next.focus()
  }
}

const userEvent = {
  click,
  dblClick,
  selectOptions,
  clear,
  type,
  upload,
  tab,
}

export default userEvent

/*
eslint
  max-depth: ["error", 6],
*/
