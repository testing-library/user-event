import userEvent from '../'
import {setup, addListeners} from './helpers/utils'
import './helpers/custom-element'

test('types text in input', () => {
  const {element, getEventSnapshot} = setup('<input />')
  userEvent.type(element, 'Sup')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="Sup"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - keydown: S (83)
    input[value=""] - keypress: S (83)
    input[value="S"] - input
      "{CURSOR}" -> "S{CURSOR}"
    input[value="S"] - keyup: S (83)
    input[value="S"] - keydown: u (117)
    input[value="S"] - keypress: u (117)
    input[value="Su"] - input
      "S{CURSOR}" -> "Su{CURSOR}"
    input[value="Su"] - keyup: u (117)
    input[value="Su"] - keydown: p (112)
    input[value="Su"] - keypress: p (112)
    input[value="Sup"] - input
      "Su{CURSOR}" -> "Sup{CURSOR}"
    input[value="Sup"] - keyup: p (112)
  `)
})

test('can skip the initial click', () => {
  const {element, getEventSnapshot, clearEventCalls} = setup('<input />')
  element.focus() // users MUST focus themselves if they wish to skip the click
  clearEventCalls()
  userEvent.type(element, 'Sup', {skipClick: true})
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="Sup"]

    input[value=""] - keydown: S (83)
    input[value=""] - keypress: S (83)
    input[value="S"] - input
      "{CURSOR}" -> "S{CURSOR}"
    input[value="S"] - keyup: S (83)
    input[value="S"] - keydown: u (117)
    input[value="S"] - keypress: u (117)
    input[value="Su"] - input
      "S{CURSOR}" -> "Su{CURSOR}"
    input[value="Su"] - keyup: u (117)
    input[value="Su"] - keydown: p (112)
    input[value="Su"] - keypress: p (112)
    input[value="Sup"] - input
      "Su{CURSOR}" -> "Sup{CURSOR}"
    input[value="Sup"] - keyup: p (112)
  `)
})

test('types text inside custom element', () => {
  const element = document.createElement('custom-el')
  document.body.append(element)
  const inputEl = element.shadowRoot.querySelector('input')
  const {getEventSnapshot} = addListeners(inputEl)

  userEvent.type(inputEl, 'Sup')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="Sup"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - keydown: S (83)
    input[value=""] - keypress: S (83)
    input[value="S"] - input
      "{CURSOR}" -> "S{CURSOR}"
    input[value="S"] - keyup: S (83)
    input[value="S"] - keydown: u (117)
    input[value="S"] - keypress: u (117)
    input[value="Su"] - input
      "S{CURSOR}" -> "Su{CURSOR}"
    input[value="Su"] - keyup: u (117)
    input[value="Su"] - keydown: p (112)
    input[value="Su"] - keypress: p (112)
    input[value="Sup"] - input
      "Su{CURSOR}" -> "Sup{CURSOR}"
    input[value="Sup"] - keyup: p (112)
  `)
})

test('types text in textarea', () => {
  const {element, getEventSnapshot} = setup('<textarea></textarea>')
  userEvent.type(element, 'Sup')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value="Sup"]

    textarea[value=""] - pointerover
    textarea[value=""] - pointerenter
    textarea[value=""] - mouseover: Left (0)
    textarea[value=""] - mouseenter: Left (0)
    textarea[value=""] - pointermove
    textarea[value=""] - mousemove: Left (0)
    textarea[value=""] - pointerdown
    textarea[value=""] - mousedown: Left (0)
    textarea[value=""] - focus
    textarea[value=""] - focusin
    textarea[value=""] - pointerup
    textarea[value=""] - mouseup: Left (0)
    textarea[value=""] - click: Left (0)
    textarea[value=""] - keydown: S (83)
    textarea[value=""] - keypress: S (83)
    textarea[value="S"] - input
      "{CURSOR}" -> "S{CURSOR}"
    textarea[value="S"] - keyup: S (83)
    textarea[value="S"] - keydown: u (117)
    textarea[value="S"] - keypress: u (117)
    textarea[value="Su"] - input
      "S{CURSOR}" -> "Su{CURSOR}"
    textarea[value="Su"] - keyup: u (117)
    textarea[value="Su"] - keydown: p (112)
    textarea[value="Su"] - keypress: p (112)
    textarea[value="Sup"] - input
      "Su{CURSOR}" -> "Sup{CURSOR}"
    textarea[value="Sup"] - keyup: p (112)
  `)
})

test('does not fire input event when keypress calls prevent default', () => {
  const {element, getEventSnapshot} = setup('<input />', {
    eventHandlers: {keyPress: e => e.preventDefault()},
  })

  userEvent.type(element, 'a')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - keydown: a (97)
    input[value=""] - keypress: a (97)
    input[value=""] - keyup: a (97)
  `)
})

test('does not fire keypress or input events when keydown calls prevent default', () => {
  const {element, getEventSnapshot} = setup('<input />', {
    eventHandlers: {keyDown: e => e.preventDefault()},
  })

  userEvent.type(element, 'a')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - keydown: a (97)
    input[value=""] - keyup: a (97)
  `)
})

test('does not fire events when disabled', () => {
  const {element, getEventSnapshot} = setup('<input disabled />')

  userEvent.type(element, 'a')
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: input[value=""]`,
  )
})

test('does not fire input when readonly', () => {
  const {element, getEventSnapshot} = setup('<input readonly />')

  userEvent.type(element, 'a')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - keydown: a (97)
    input[value=""] - keypress: a (97)
    input[value=""] - keyup: a (97)
  `)
})

test('should delay the typing when opts.delay is not 0', async () => {
  const inputValues = [{timestamp: Date.now(), value: ''}]
  const onInput = jest.fn(event => {
    inputValues.push({timestamp: Date.now(), value: event.target.value})
  })

  const {element} = setup('<input />', {eventHandlers: {input: onInput}})

  const text = 'Hello, world!'
  const delay = 10
  await userEvent.type(element, text, {delay})

  expect(onInput).toHaveBeenCalledTimes(text.length)
  for (let index = 1; index < inputValues.length; index++) {
    const {timestamp, value} = inputValues[index]
    expect(timestamp - inputValues[index - 1].timestamp).toBeGreaterThanOrEqual(
      delay,
    )
    expect(value).toBe(text.slice(0, index))
  }
})

test('honors maxlength', () => {
  const {element, getEventSnapshot} = setup('<input maxlength="2" />')
  userEvent.type(element, '123')

  // NOTE: no input event when typing "3"
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="12"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - keydown: 1 (49)
    input[value=""] - keypress: 1 (49)
    input[value="1"] - input
      "{CURSOR}" -> "1{CURSOR}"
    input[value="1"] - keyup: 1 (49)
    input[value="1"] - keydown: 2 (50)
    input[value="1"] - keypress: 2 (50)
    input[value="12"] - input
      "1{CURSOR}" -> "12{CURSOR}"
    input[value="12"] - keyup: 2 (50)
    input[value="12"] - keydown: 3 (51)
    input[value="12"] - keypress: 3 (51)
    input[value="12"] - keyup: 3 (51)
  `)
})

test('honors maxlength with existing text', () => {
  const {element, getEventSnapshot} = setup(
    '<input value="12" maxlength="2" />',
  )
  userEvent.type(element, '3')

  // NOTE: no input event when typing "3"
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="12"]

    input[value="12"] - pointerover
    input[value="12"] - pointerenter
    input[value="12"] - mouseover: Left (0)
    input[value="12"] - mouseenter: Left (0)
    input[value="12"] - pointermove
    input[value="12"] - mousemove: Left (0)
    input[value="12"] - pointerdown
    input[value="12"] - mousedown: Left (0)
    input[value="12"] - focus
    input[value="12"] - focusin
    input[value="12"] - pointerup
    input[value="12"] - mouseup: Left (0)
    input[value="12"] - click: Left (0)
    input[value="12"] - select
    input[value="12"] - keydown: 3 (51)
    input[value="12"] - keypress: 3 (51)
    input[value="12"] - keyup: 3 (51)
  `)
})

test('honors maxlength on textarea', () => {
  const {element, getEventSnapshot} = setup(
    '<textarea maxlength="2">12</textarea>',
  )

  userEvent.type(element, '3')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value="12"]

    textarea[value="12"] - pointerover
    textarea[value="12"] - pointerenter
    textarea[value="12"] - mouseover: Left (0)
    textarea[value="12"] - mouseenter: Left (0)
    textarea[value="12"] - pointermove
    textarea[value="12"] - mousemove: Left (0)
    textarea[value="12"] - pointerdown
    textarea[value="12"] - mousedown: Left (0)
    textarea[value="12"] - focus
    textarea[value="12"] - focusin
    textarea[value="12"] - pointerup
    textarea[value="12"] - mouseup: Left (0)
    textarea[value="12"] - click: Left (0)
    textarea[value="12"] - select
    textarea[value="12"] - keydown: 3 (51)
    textarea[value="12"] - keypress: 3 (51)
    textarea[value="12"] - keyup: 3 (51)
  `)
})

// https://github.com/testing-library/user-event/issues/418
test('ignores maxlength on input[type=number]', () => {
  const {element} = setup(`<input maxlength="2" type="number" value="12" />`)

  userEvent.type(element, '3')

  expect(element).toHaveValue(123)
})

test('should fire events on the currently focused element', () => {
  const {element} = setup(`<div><input /><input /></div>`, {
    eventHandlers: {keyDown: handleKeyDown},
  })

  const input1 = element.children[0]
  const input2 = element.children[1]

  const text = 'Hello, world!'
  const changeFocusLimit = 7
  function handleKeyDown() {
    if (input1.value.length === 7) {
      input2.focus()
    }
  }

  userEvent.type(input1, text)

  expect(input1).toHaveValue(text.slice(0, changeFocusLimit))
  expect(input2).toHaveValue(text.slice(changeFocusLimit))
  expect(input2).toHaveFocus()
})

test('should replace selected text', () => {
  const {element} = setup('<input value="hello world" />')
  const selectionStart = 'hello world'.search('world')
  const selectionEnd = selectionStart + 'world'.length
  element.setSelectionRange(selectionStart, selectionEnd)
  userEvent.type(element, 'friend')
  expect(element).toHaveValue('hello friend')
})

test('does not continue firing events when disabled during typing', () => {
  const {element} = setup('<input />', {
    eventHandlers: {input: e => (e.target.disabled = true)},
  })
  userEvent.type(element, 'hi')
  expect(element).toHaveValue('h')
})

function setupDollarInput({initialValue = ''} = {}) {
  const returnValue = setup(`<input value="${initialValue}" type="text" />`, {
    eventHandlers: {input: handleInput},
  })
  let previousValue = returnValue.element.value
  function handleInput(event) {
    const val = event.target.value
    const withoutDollar = val.replace(/\$/g, '')
    const num = Number(withoutDollar)
    if (Number.isNaN(num)) {
      event.target.value = previousValue
    } else {
      event.target.value = `$${withoutDollar}`
    }
    previousValue = event.target.value
  }
  return returnValue
}

test('typing into a controlled input works', () => {
  const {element, getEventSnapshot} = setupDollarInput()

  userEvent.type(element, '23')

  expect(element.value).toBe('$23')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="$23"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - keydown: 2 (50)
    input[value=""] - keypress: 2 (50)
    input[value="2"] - input
      "{CURSOR}" -> "$2{CURSOR}"
    input[value="$2"] - keyup: 2 (50)
    input[value="$2"] - keydown: 3 (51)
    input[value="$2"] - keypress: 3 (51)
    input[value="$23"] - input
      "$2{CURSOR}" -> "$23{CURSOR}"
    input[value="$23"] - keyup: 3 (51)
  `)
})

test('typing in the middle of a controlled input works', () => {
  const {element, getEventSnapshot} = setupDollarInput({initialValue: '$23'})
  element.setSelectionRange(2, 2)

  userEvent.type(element, '1')

  expect(element.value).toBe('$213')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="$213"]

    input[value="$23"] - select
    input[value="$23"] - pointerover
    input[value="$23"] - pointerenter
    input[value="$23"] - mouseover: Left (0)
    input[value="$23"] - mouseenter: Left (0)
    input[value="$23"] - pointermove
    input[value="$23"] - mousemove: Left (0)
    input[value="$23"] - pointerdown
    input[value="$23"] - mousedown: Left (0)
    input[value="$23"] - focus
    input[value="$23"] - focusin
    input[value="$23"] - pointerup
    input[value="$23"] - mouseup: Left (0)
    input[value="$23"] - click: Left (0)
    input[value="$23"] - keydown: 1 (49)
    input[value="$23"] - keypress: 1 (49)
    input[value="$213"] - input
      "$2{CURSOR}3" -> "$213{CURSOR}"
    input[value="$213"] - select
    input[value="$213"] - keyup: 1 (49)
  `)
})

test('ignored {backspace} in controlled input', () => {
  const {element, getEventSnapshot} = setupDollarInput({initialValue: '$23'})
  element.setSelectionRange(1, 1)

  userEvent.type(element, '{backspace}')
  // this is the same behavior in the browser.
  // in our case, when you try to backspace the "$", our event handler
  // will ignore that change and React resets the value to what it was
  // before. When the value is set programmatically to something different
  // from what was expected based on the input event, the browser sets
  // the selection start and end to the end of the input
  expect(element.selectionStart).toBe(element.value.length)
  expect(element.selectionEnd).toBe(element.value.length)
  userEvent.type(element, '4')

  expect(element.value).toBe('$234')
  // the backslash in the inline snapshot is to escape the $ before {CURSOR}
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="$234"]

    input[value="$23"] - select
    input[value="$23"] - pointerover
    input[value="$23"] - pointerenter
    input[value="$23"] - mouseover: Left (0)
    input[value="$23"] - mouseenter: Left (0)
    input[value="$23"] - pointermove
    input[value="$23"] - mousemove: Left (0)
    input[value="$23"] - pointerdown
    input[value="$23"] - mousedown: Left (0)
    input[value="$23"] - focus
    input[value="$23"] - focusin
    input[value="$23"] - pointerup
    input[value="$23"] - mouseup: Left (0)
    input[value="$23"] - click: Left (0)
    input[value="$23"] - keydown: Backspace (8)
    input[value="23"] - input
      "\${CURSOR}23" -> "$23{CURSOR}"
    input[value="$23"] - keyup: Backspace (8)
    input[value="$23"] - pointerover
    input[value="$23"] - pointerenter
    input[value="$23"] - mouseover: Left (0)
    input[value="$23"] - mouseenter: Left (0)
    input[value="$23"] - pointermove
    input[value="$23"] - mousemove: Left (0)
    input[value="$23"] - pointerdown
    input[value="$23"] - mousedown: Left (0)
    input[value="$23"] - pointerup
    input[value="$23"] - mouseup: Left (0)
    input[value="$23"] - click: Left (0)
    input[value="$23"] - keydown: 4 (52)
    input[value="$23"] - keypress: 4 (52)
    input[value="$234"] - input
      "$23{CURSOR}" -> "$234{CURSOR}"
    input[value="$234"] - keyup: 4 (52)
  `)
})

// https://github.com/testing-library/user-event/issues/346
test('typing in an empty textarea', () => {
  const {element} = setup('<textarea></textarea>')

  userEvent.type(element, '1234')
  expect(element).toHaveValue('1234')
})

// https://github.com/testing-library/user-event/issues/321
test('typing in a textarea with existing text', () => {
  const {element, getEventSnapshot} = setup('<textarea>Hello, </textarea>')

  userEvent.type(element, '12')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value="Hello, 12"]

    textarea[value="Hello, "] - pointerover
    textarea[value="Hello, "] - pointerenter
    textarea[value="Hello, "] - mouseover: Left (0)
    textarea[value="Hello, "] - mouseenter: Left (0)
    textarea[value="Hello, "] - pointermove
    textarea[value="Hello, "] - mousemove: Left (0)
    textarea[value="Hello, "] - pointerdown
    textarea[value="Hello, "] - mousedown: Left (0)
    textarea[value="Hello, "] - focus
    textarea[value="Hello, "] - focusin
    textarea[value="Hello, "] - pointerup
    textarea[value="Hello, "] - mouseup: Left (0)
    textarea[value="Hello, "] - click: Left (0)
    textarea[value="Hello, "] - select
    textarea[value="Hello, "] - keydown: 1 (49)
    textarea[value="Hello, "] - keypress: 1 (49)
    textarea[value="Hello, 1"] - input
      "Hello, {CURSOR}" -> "Hello, 1{CURSOR}"
    textarea[value="Hello, 1"] - keyup: 1 (49)
    textarea[value="Hello, 1"] - keydown: 2 (50)
    textarea[value="Hello, 1"] - keypress: 2 (50)
    textarea[value="Hello, 12"] - input
      "Hello, 1{CURSOR}" -> "Hello, 12{CURSOR}"
    textarea[value="Hello, 12"] - keyup: 2 (50)
  `)
  expect(element).toHaveValue('Hello, 12')
})

// https://github.com/testing-library/user-event/issues/321
test('accepts an initialSelectionStart and initialSelectionEnd', () => {
  const {element, getEventSnapshot} = setup('<textarea>Hello, </textarea>')
  element.setSelectionRange(0, 0)

  userEvent.type(element, '12', {
    initialSelectionStart: element.selectionStart,
    initialSelectionEnd: element.selectionEnd,
  })
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value="12Hello, "]

    textarea[value="Hello, "] - select
    textarea[value="Hello, "] - pointerover
    textarea[value="Hello, "] - pointerenter
    textarea[value="Hello, "] - mouseover: Left (0)
    textarea[value="Hello, "] - mouseenter: Left (0)
    textarea[value="Hello, "] - pointermove
    textarea[value="Hello, "] - mousemove: Left (0)
    textarea[value="Hello, "] - pointerdown
    textarea[value="Hello, "] - mousedown: Left (0)
    textarea[value="Hello, "] - focus
    textarea[value="Hello, "] - focusin
    textarea[value="Hello, "] - pointerup
    textarea[value="Hello, "] - mouseup: Left (0)
    textarea[value="Hello, "] - click: Left (0)
    textarea[value="Hello, "] - keydown: 1 (49)
    textarea[value="Hello, "] - keypress: 1 (49)
    textarea[value="1Hello, "] - input
      "{CURSOR}Hello, " -> "1Hello, {CURSOR}"
    textarea[value="1Hello, "] - select
    textarea[value="1Hello, "] - keyup: 1 (49)
    textarea[value="1Hello, "] - keydown: 2 (50)
    textarea[value="1Hello, "] - keypress: 2 (50)
    textarea[value="12Hello, "] - input
      "1{CURSOR}Hello, " -> "12Hello, {CURSOR}"
    textarea[value="12Hello, "] - select
    textarea[value="12Hello, "] - keyup: 2 (50)
  `)
  expect(element).toHaveValue('12Hello, ')
})

// https://github.com/testing-library/user-event/issues/316#issuecomment-640199908
test('can type into an input with type `email`', () => {
  const {element} = setup('<input type="email" />')
  const email = 'yo@example.com'
  userEvent.type(element, email)
  expect(element).toHaveValue(email)
})

test('can type into an input with type `date`', () => {
  const {element, getEventSnapshot} = setup('<input type="date" />')
  const date = '2020-06-29'
  userEvent.type(element, date)
  expect(element).toHaveValue(date)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="2020-06-29"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - keydown: 2 (50)
    input[value=""] - keypress: 2 (50)
    input[value=""] - keyup: 2 (50)
    input[value=""] - keydown: 0 (48)
    input[value=""] - keypress: 0 (48)
    input[value=""] - keyup: 0 (48)
    input[value=""] - keydown: 2 (50)
    input[value=""] - keypress: 2 (50)
    input[value=""] - keyup: 2 (50)
    input[value=""] - keydown: 0 (48)
    input[value=""] - keypress: 0 (48)
    input[value=""] - keyup: 0 (48)
    input[value=""] - keydown: - (45)
    input[value=""] - keypress: - (45)
    input[value=""] - keyup: - (45)
    input[value=""] - keydown: 0 (48)
    input[value=""] - keypress: 0 (48)
    input[value=""] - keyup: 0 (48)
    input[value=""] - keydown: 6 (54)
    input[value=""] - keypress: 6 (54)
    input[value=""] - keyup: 6 (54)
    input[value=""] - keydown: - (45)
    input[value=""] - keypress: - (45)
    input[value=""] - keyup: - (45)
    input[value=""] - keydown: 2 (50)
    input[value=""] - keypress: 2 (50)
    input[value=""] - keyup: 2 (50)
    input[value=""] - keydown: 9 (57)
    input[value=""] - keypress: 9 (57)
    input[value="2020-06-29"] - input
      "{CURSOR}" -> "{CURSOR}2020-06-29"
    input[value="2020-06-29"] - change
    input[value="2020-06-29"] - keyup: 9 (57)
  `)
})

// https://github.com/testing-library/user-event/issues/336
test('can type "-" into number inputs', () => {
  const {element, getEventSnapshot} = setup('<input type="number" />')
  const negativeNumber = '-3'
  userEvent.type(element, negativeNumber)
  expect(element).toHaveValue(-3)

  // NOTE: the input event here does not actually change the value thanks to
  // weirdness with browsers. Then the second input event inserts both the
  // - and the 3. /me rolls eyes
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="-3"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - keydown: - (45)
    input[value=""] - keypress: - (45)
    input[value=""] - input
    input[value=""] - keyup: - (45)
    input[value=""] - keydown: 3 (51)
    input[value=""] - keypress: 3 (51)
    input[value="-3"] - input
      "{CURSOR}" -> "{CURSOR}-3"
    input[value="-3"] - keyup: 3 (51)
  `)
})

// https://github.com/testing-library/user-event/issues/336
test('can type "." into number inputs', () => {
  const {element, getEventSnapshot} = setup('<input type="number" />')
  userEvent.type(element, '3.3')
  expect(element).toHaveValue(3.3)

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="3.3"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - keydown: 3 (51)
    input[value=""] - keypress: 3 (51)
    input[value="3"] - input
      "{CURSOR}" -> "{CURSOR}3"
    input[value="3"] - keyup: 3 (51)
    input[value="3"] - keydown: . (46)
    input[value="3"] - keypress: . (46)
    input[value=""] - input
      "{CURSOR}3" -> "{CURSOR}"
    input[value=""] - keyup: . (46)
    input[value=""] - keydown: 3 (51)
    input[value=""] - keypress: 3 (51)
    input[value="3.3"] - input
      "{CURSOR}" -> "{CURSOR}3.3"
    input[value="3.3"] - keyup: 3 (51)
  `)
})

test('-{backspace}3', () => {
  const {element} = setup('<input type="number" />')
  const negativeNumber = '-{backspace}3'
  userEvent.type(element, negativeNumber)
  expect(element).toHaveValue(3)
})

test('-a3', () => {
  const {element} = setup('<input type="number" />')
  const negativeNumber = '-a3'
  userEvent.type(element, negativeNumber)
  expect(element).toHaveValue(-3)
})

test('typing an invalid input value', () => {
  const {element} = setup('<input type="number" />')
  userEvent.type(element, '3-3')

  // TODO: fix this bug
  // THIS IS A BUG! It should be expect(element.value).toBe('')
  expect(element).toHaveValue(-3)

  // THIS IS A LIMITATION OF THE BROWSER
  // It is impossible to programmatically set an input
  // value to an invlid value. Not sure how to work around this
  // but the badInput should actually be "true" if the user types "3-3"
  expect(element.validity.badInput).toBe(false)
})

test('should not throw error if we are trying to call type on an element without a value', () => {
  const {element} = setup('<div />')
  expect.assertions(0)
  return userEvent
    .type(element, "I'm only a div :(")
    .catch(e => expect(e).toBeUndefined())
})

test('typing on button should not alter its value', () => {
  const {element} = setup('<button value="foo" />')
  userEvent.type(element, 'bar')
  expect(element).toHaveValue('foo')
})

test('typing on input type button should not alter its value', () => {
  const {element} = setup('<input type="button" value="foo" />')
  userEvent.type(element, 'bar')
  expect(element).toHaveValue('foo')
})

test('typing on input type color should not alter its value', () => {
  const {element} = setup('<input type="color" value="#ffffff" />')
  userEvent.type(element, 'bar')
  expect(element).toHaveValue('#ffffff')
})

test('typing on input type image should not alter its value', () => {
  const {element} = setup('<input type="image" value="foo" />')
  userEvent.type(element, 'bar')
  expect(element).toHaveValue('foo')
})

test('typing on input type reset should not alter its value', () => {
  const {element} = setup('<input type="reset" value="foo" />')
  userEvent.type(element, 'bar')
  expect(element).toHaveValue('foo')
})

test('typing on input type submit should not alter its value', () => {
  const {element} = setup('<input type="submit" value="foo" />')
  userEvent.type(element, 'bar')
  expect(element).toHaveValue('foo')
})

test('typing on input type file should not result in an error', () => {
  const {element} = setup('<input type="file" />')
  expect.assertions(0)
  return userEvent.type(element, 'bar').catch(e => expect(e).toBeUndefined())
})

test('should submit a form containing multiple text inputs and an input of type submit', () => {
  const handleSubmit = jest.fn()
  const {element} = setup(
    `
    <form>
      <input type='text'/>
      <input type='text'/>
      <input type='submit' value="submit" />
    </form>
  `,
    {
      eventHandlers: {submit: handleSubmit},
    },
  )
  userEvent.type(element.querySelector('input'), '{enter}')

  expect(handleSubmit).toHaveBeenCalledTimes(1)
})

test('should submit a form containing multiple text inputs and a submit button', () => {
  const handleSubmit = jest.fn()

  const {element} = setup(
    `
    <form>
      <input type='text'/>
      <input type='text'/>
      <button type='submit' value="submit" />
    </form>
  `,
    {
      eventHandlers: {submit: handleSubmit},
    },
  )
  userEvent.type(element.querySelector('input'), '{enter}')

  expect(handleSubmit).toHaveBeenCalledTimes(1)
})

test('should submit a form with one input element', () => {
  const handleSubmit = jest.fn()

  const {element} = setup(
    `
    <form>
      <input type='text'/>
    </form>
  `,
    {
      eventHandlers: {submit: handleSubmit},
    },
  )
  userEvent.type(element.querySelector('input'), '{enter}')

  expect(handleSubmit).toHaveBeenCalledTimes(1)
})

test('should not submit a form with when keydown calls prevent default', () => {
  const handleSubmit = jest.fn()

  const {element} = setup(
    `
    <form>
      <input type='text'/>
    </form>
  `,
    {
      eventHandlers: {submit: handleSubmit, keyDown: e => e.preventDefault()},
    },
  )
  userEvent.type(element.querySelector('input'), '{enter}')

  expect(handleSubmit).not.toHaveBeenCalled()
})

test('should not submit a form with when keypress calls prevent default', () => {
  const handleSubmit = jest.fn()

  const {element} = setup(
    `
    <form>
      <input type='text'/>
    </form>
  `,
    {
      eventHandlers: {submit: handleSubmit, keyPress: e => e.preventDefault()},
    },
  )
  userEvent.type(element.querySelector('input'), '{enter}')

  expect(handleSubmit).not.toHaveBeenCalled()
})

test('should not submit a form with multiple input when ENTER is pressed on one of it', () => {
  const handleSubmit = jest.fn()
  const {element} = setup(
    `
    <form>
      <input type='text'/>
      <input type='text'/>
    </form>
  `,
    {
      eventHandlers: {submit: handleSubmit},
    },
  )
  userEvent.type(element.querySelector('input'), '{enter}')

  expect(handleSubmit).toHaveBeenCalledTimes(0)
})

test('should type inside a contenteditable div', () => {
  const {element, getEventSnapshot} = setup('<div contenteditable=true></div>')

  userEvent.type(element, 'bar')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover: Left (0)
    div - mouseenter: Left (0)
    div - pointermove
    div - mousemove: Left (0)
    div - pointerdown
    div - mousedown: Left (0)
    div - focus
    div - focusin
    div - pointerup
    div - mouseup: Left (0)
    div - click: Left (0)
    div - keydown: b (98)
    div - keypress: b (98)
    div - input
    div - keyup: b (98)
    div - keydown: a (97)
    div - keypress: a (97)
    div - input
    div - keyup: a (97)
    div - keydown: r (114)
    div - keypress: r (114)
    div - input
    div - keyup: r (114)
  `)
  expect(element).toHaveTextContent('bar')
})

test('should not type inside a contenteditable=false div', () => {
  const {element, getEventSnapshot} = setup('<div contenteditable=false></div>')

  userEvent.type(element, 'bar')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover: Left (0)
    div - mouseenter: Left (0)
    div - pointermove
    div - mousemove: Left (0)
    div - pointerdown
    div - mousedown: Left (0)
    div - pointerup
    div - mouseup: Left (0)
    div - click: Left (0)
  `)
})

test('navigation key: {arrowleft} and {arrowright} moves the cursor', () => {
  const {element, getEventSnapshot} = setup('<input />')
  userEvent.type(element, 'Brea{arrowleft}k{arrowright}fast')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="Brekafast"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - keydown: B (66)
    input[value=""] - keypress: B (66)
    input[value="B"] - input
      "{CURSOR}" -> "B{CURSOR}"
    input[value="B"] - keyup: B (66)
    input[value="B"] - keydown: r (114)
    input[value="B"] - keypress: r (114)
    input[value="Br"] - input
      "B{CURSOR}" -> "Br{CURSOR}"
    input[value="Br"] - keyup: r (114)
    input[value="Br"] - keydown: e (101)
    input[value="Br"] - keypress: e (101)
    input[value="Bre"] - input
      "Br{CURSOR}" -> "Bre{CURSOR}"
    input[value="Bre"] - keyup: e (101)
    input[value="Bre"] - keydown: a (97)
    input[value="Bre"] - keypress: a (97)
    input[value="Brea"] - input
      "Bre{CURSOR}" -> "Brea{CURSOR}"
    input[value="Brea"] - keyup: a (97)
    input[value="Brea"] - keydown: ArrowLeft (37)
    input[value="Brea"] - select
    input[value="Brea"] - keyup: ArrowLeft (37)
    input[value="Brea"] - keydown: k (107)
    input[value="Brea"] - keypress: k (107)
    input[value="Breka"] - input
      "Bre{CURSOR}a" -> "Breka{CURSOR}"
    input[value="Breka"] - select
    input[value="Breka"] - keyup: k (107)
    input[value="Breka"] - keydown: ArrowRight (39)
    input[value="Breka"] - select
    input[value="Breka"] - keyup: ArrowRight (39)
    input[value="Breka"] - keydown: f (102)
    input[value="Breka"] - keypress: f (102)
    input[value="Brekaf"] - input
      "Breka{CURSOR}" -> "Brekaf{CURSOR}"
    input[value="Brekaf"] - keyup: f (102)
    input[value="Brekaf"] - keydown: a (97)
    input[value="Brekaf"] - keypress: a (97)
    input[value="Brekafa"] - input
      "Brekaf{CURSOR}" -> "Brekafa{CURSOR}"
    input[value="Brekafa"] - keyup: a (97)
    input[value="Brekafa"] - keydown: s (115)
    input[value="Brekafa"] - keypress: s (115)
    input[value="Brekafas"] - input
      "Brekafa{CURSOR}" -> "Brekafas{CURSOR}"
    input[value="Brekafas"] - keyup: s (115)
    input[value="Brekafas"] - keydown: t (116)
    input[value="Brekafas"] - keypress: t (116)
    input[value="Brekafast"] - input
      "Brekafas{CURSOR}" -> "Brekafast{CURSOR}"
    input[value="Brekafast"] - keyup: t (116)
  `)
})
