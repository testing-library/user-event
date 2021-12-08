import userEvent from '#src'
import {setup, addListeners} from '#testHelpers/utils'
import '#testHelpers/custom-element'

test('types text in input', async () => {
  const {element, getEventSnapshot} = setup('<input />')
  await userEvent.type(element, 'Sup')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="Sup"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: S
    input[value=""] - keypress: S
    input[value="S"] - input
    input[value="S"] - keyup: S
    input[value="S"] - keydown: u
    input[value="S"] - keypress: u
    input[value="Su"] - input
    input[value="Su"] - keyup: u
    input[value="Su"] - keydown: p
    input[value="Su"] - keypress: p
    input[value="Sup"] - input
    input[value="Sup"] - keyup: p
  `)
})

test('can skip the initial click', async () => {
  const {element, getEventSnapshot, clearEventCalls} = setup('<input />')
  element.focus() // users MUST focus themselves if they wish to skip the click
  clearEventCalls()
  await userEvent.type(element, 'Sup', {skipClick: true})
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="Sup"]

    input[value=""] - keydown: S
    input[value=""] - keypress: S
    input[value="S"] - input
    input[value="S"] - keyup: S
    input[value="S"] - keydown: u
    input[value="S"] - keypress: u
    input[value="Su"] - input
    input[value="Su"] - keyup: u
    input[value="Su"] - keydown: p
    input[value="Su"] - keypress: p
    input[value="Sup"] - input
    input[value="Sup"] - keyup: p
  `)
})

test('types text inside custom element', async () => {
  const element = document.createElement('custom-el')
  document.body.append(element)
  const inputEl = (element.shadowRoot as ShadowRoot).querySelector(
    'input',
  ) as HTMLInputElement
  const {getEventSnapshot} = addListeners(inputEl)

  await userEvent.type(inputEl, 'Sup')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="Sup"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: S
    input[value=""] - keypress: S
    input[value="S"] - input
    input[value="S"] - keyup: S
    input[value="S"] - keydown: u
    input[value="S"] - keypress: u
    input[value="Su"] - input
    input[value="Su"] - keyup: u
    input[value="Su"] - keydown: p
    input[value="Su"] - keypress: p
    input[value="Sup"] - input
    input[value="Sup"] - keyup: p
  `)
})

test('types text in textarea', async () => {
  const {element, getEventSnapshot} = setup('<textarea></textarea>')
  await userEvent.type(element, 'Sup')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value="Sup"]

    textarea[value=""] - pointerover
    textarea[value=""] - pointerenter
    textarea[value=""] - mouseover
    textarea[value=""] - mouseenter
    textarea[value=""] - pointermove
    textarea[value=""] - mousemove
    textarea[value=""] - pointerdown
    textarea[value=""] - mousedown: primary
    textarea[value=""] - focus
    textarea[value=""] - focusin
    textarea[value=""] - pointerup
    textarea[value=""] - mouseup: primary
    textarea[value=""] - click: primary
    textarea[value=""] - keydown: S
    textarea[value=""] - keypress: S
    textarea[value="S"] - input
    textarea[value="S"] - keyup: S
    textarea[value="S"] - keydown: u
    textarea[value="S"] - keypress: u
    textarea[value="Su"] - input
    textarea[value="Su"] - keyup: u
    textarea[value="Su"] - keydown: p
    textarea[value="Su"] - keypress: p
    textarea[value="Sup"] - input
    textarea[value="Sup"] - keyup: p
  `)
})

test('does not fire input event when keypress calls prevent default', async () => {
  const {element, getEventSnapshot} = setup('<input />', {
    eventHandlers: {keyPress: e => e.preventDefault()},
  })

  await userEvent.type(element, 'a')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: a
    input[value=""] - keypress: a
    input[value=""] - keyup: a
  `)
})

test('does not fire keypress or input events when keydown calls prevent default', async () => {
  const {element, getEventSnapshot} = setup('<input />', {
    eventHandlers: {keyDown: e => e.preventDefault()},
  })

  await userEvent.type(element, 'a')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: a
    input[value=""] - keyup: a
  `)
})

test('does not fire events when disabled', async () => {
  const {element, getEventSnapshot} = setup('<input disabled />')

  await userEvent.type(element, 'a')
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: input[value=""]`,
  )
})

test('does not fire input when readonly', async () => {
  const {element, getEventSnapshot} = setup('<input readonly />')

  await userEvent.type(element, 'a')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: a
    input[value=""] - keypress: a
    input[value=""] - keyup: a
  `)
})

test('should delay the typing when opts.delay is not 0', async () => {
  const inputValues = [{timestamp: Date.now(), value: ''}]
  const onInput = jest.fn(event => {
    inputValues.push({
      timestamp: Date.now(),
      value: ((event as InputEvent).target as HTMLInputElement).value,
    })
  })

  const {element} = setup('<input />', {eventHandlers: {input: onInput}})

  const text = 'Hello, world!'
  const delay = 10
  await userEvent.type(element, text, {delay})

  expect(onInput).toHaveBeenCalledTimes(text.length)
  for (let index = 2; index < inputValues.length; index++) {
    const {timestamp, value} = inputValues[index]
    expect(timestamp - inputValues[index - 1].timestamp).toBeGreaterThanOrEqual(
      delay,
    )
    expect(value).toBe(text.slice(0, index))
  }
})

test('should fire events on the currently focused element', async () => {
  const {element} = setup(`<div><input /><input /></div>`, {
    eventHandlers: {keyDown: handleKeyDown},
  })

  const input1 = element.children[0] as HTMLInputElement
  const input2 = element.children[1] as HTMLInputElement

  const text = 'Hello, world!'
  const changeFocusLimit = 7
  function handleKeyDown() {
    if (input1.value.length === 7) {
      input2.focus()
    }
  }

  await userEvent.type(input1, text)

  expect(input1).toHaveValue(text.slice(0, changeFocusLimit))
  expect(input2).toHaveValue(text.slice(changeFocusLimit))
  expect(input2).toHaveFocus()
})

test('should replace selected text', async () => {
  const {element} = setup('<input value="hello world" />')
  await userEvent.type(element, 'friend', {
    initialSelectionStart: 6,
    initialSelectionEnd: 11,
  })
  expect(element).toHaveValue('hello friend')
})

test('does not continue firing events when disabled during typing', async () => {
  const {element} = setup('<input />', {
    eventHandlers: {
      input: e => ((e.target as HTMLInputElement).disabled = true),
    },
  })
  await userEvent.type(element, 'hi')
  expect(element).toHaveValue('h')
})

// https://github.com/testing-library/user-event/issues/346
test('typing in an empty textarea', async () => {
  const {element} = setup('<textarea></textarea>')

  await userEvent.type(element, '1234')
  expect(element).toHaveValue('1234')
})

// https://github.com/testing-library/user-event/issues/321
test('typing in a textarea with existing text', async () => {
  const {element, getEventSnapshot} = setup('<textarea>Hello, </textarea>')

  await userEvent.type(element, '12')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value="Hello, 12"]

    textarea[value="Hello, "] - pointerover
    textarea[value="Hello, "] - pointerenter
    textarea[value="Hello, "] - mouseover
    textarea[value="Hello, "] - mouseenter
    textarea[value="Hello, "] - pointermove
    textarea[value="Hello, "] - mousemove
    textarea[value="Hello, "] - pointerdown
    textarea[value="Hello, "] - mousedown: primary
    textarea[value="Hello, "] - focus
    textarea[value="Hello, "] - focusin
    textarea[value="Hello, "] - select
    textarea[value="Hello, "] - pointerup
    textarea[value="Hello, "] - mouseup: primary
    textarea[value="Hello, "] - click: primary
    textarea[value="Hello, "] - keydown: 1
    textarea[value="Hello, "] - keypress: 1
    textarea[value="Hello, 1"] - input
    textarea[value="Hello, 1"] - keyup: 1
    textarea[value="Hello, 1"] - keydown: 2
    textarea[value="Hello, 1"] - keypress: 2
    textarea[value="Hello, 12"] - input
    textarea[value="Hello, 12"] - keyup: 2
  `)
  expect(element).toHaveValue('Hello, 12')
})

// https://github.com/testing-library/user-event/issues/321
test('accepts an initialSelectionStart and initialSelectionEnd', async () => {
  const {element, getEventSnapshot} = setup<HTMLTextAreaElement>(
    '<textarea>Hello, </textarea>',
  )
  element.setSelectionRange(0, 0)

  await userEvent.type(element, '12', {
    initialSelectionStart: element.selectionStart,
    initialSelectionEnd: element.selectionEnd,
  })
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value="12Hello, "]

    textarea[value="Hello, "] - select
    textarea[value="Hello, "] - pointerover
    textarea[value="Hello, "] - pointerenter
    textarea[value="Hello, "] - mouseover
    textarea[value="Hello, "] - mouseenter
    textarea[value="Hello, "] - pointermove
    textarea[value="Hello, "] - mousemove
    textarea[value="Hello, "] - pointerdown
    textarea[value="Hello, "] - mousedown: primary
    textarea[value="Hello, "] - focus
    textarea[value="Hello, "] - focusin
    textarea[value="Hello, "] - select
    textarea[value="Hello, "] - pointerup
    textarea[value="Hello, "] - mouseup: primary
    textarea[value="Hello, "] - click: primary
    textarea[value="Hello, "] - select
    textarea[value="Hello, "] - keydown: 1
    textarea[value="Hello, "] - keypress: 1
    textarea[value="1Hello, "] - select
    textarea[value="1Hello, "] - input
    textarea[value="1Hello, "] - keyup: 1
    textarea[value="1Hello, "] - keydown: 2
    textarea[value="1Hello, "] - keypress: 2
    textarea[value="12Hello, "] - select
    textarea[value="12Hello, "] - input
    textarea[value="12Hello, "] - keyup: 2
  `)
  expect(element).toHaveValue('12Hello, ')
})

// https://github.com/testing-library/user-event/issues/316#issuecomment-640199908
test('can type into an input with type `email`', async () => {
  const {element} = setup('<input type="email" />')
  const email = 'yo@example.com'
  await userEvent.type(element, email)
  expect(element).toHaveValue(email)
})

test('can type into an input with type `date`', async () => {
  const {element, getEventSnapshot} = setup('<input type="date" />')
  const date = '2020-06-29'
  await userEvent.type(element, date)
  expect(element).toHaveValue(date)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="2020-06-29"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: 2
    input[value=""] - keypress: 2
    input[value=""] - keyup: 2
    input[value=""] - keydown: 0
    input[value=""] - keypress: 0
    input[value=""] - keyup: 0
    input[value=""] - keydown: 2
    input[value=""] - keypress: 2
    input[value=""] - keyup: 2
    input[value=""] - keydown: 0
    input[value=""] - keypress: 0
    input[value=""] - keyup: 0
    input[value=""] - keydown: -
    input[value=""] - keypress: -
    input[value=""] - keyup: -
    input[value=""] - keydown: 0
    input[value=""] - keypress: 0
    input[value=""] - keyup: 0
    input[value=""] - keydown: 6
    input[value=""] - keypress: 6
    input[value=""] - keyup: 6
    input[value=""] - keydown: -
    input[value=""] - keypress: -
    input[value=""] - keyup: -
    input[value=""] - keydown: 2
    input[value=""] - keypress: 2
    input[value=""] - keyup: 2
    input[value=""] - keydown: 9
    input[value=""] - keypress: 9
    input[value="2020-06-29"] - input
    input[value="2020-06-29"] - change
    input[value="2020-06-29"] - keyup: 9
  `)
})

// https://github.com/testing-library/user-event/issues/336
test('can type "-" into number inputs', async () => {
  const {element, getEventSnapshot} = setup('<input type="number" />')
  const negativeNumber = '-3'
  await userEvent.type(element, negativeNumber)
  expect(element).toHaveValue(-3)

  // NOTE: the input event here does not actually change the value thanks to
  // weirdness with browsers. Then the second input event inserts both the
  // - and the 3. /me rolls eyes
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="-3"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: -
    input[value=""] - keypress: -
    input[value=""] - input
    input[value=""] - keyup: -
    input[value=""] - keydown: 3
    input[value=""] - keypress: 3
    input[value="-3"] - input
    input[value="-3"] - keyup: 3
  `)
})

// https://github.com/testing-library/user-event/issues/336
test('can type "." into number inputs', async () => {
  const {element, getEventSnapshot} = setup('<input type="number" />')
  await userEvent.type(element, '3.3')
  expect(element).toHaveValue(3.3)

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="3.3"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: 3
    input[value=""] - keypress: 3
    input[value="3"] - input
    input[value="3"] - keyup: 3
    input[value="3"] - keydown: .
    input[value="3"] - keypress: .
    input[value=""] - input
    input[value=""] - keyup: .
    input[value=""] - keydown: 3
    input[value=""] - keypress: 3
    input[value="3.3"] - input
    input[value="3.3"] - keyup: 3
  `)
})

test('-{backspace}3', async () => {
  const {element} = setup('<input type="number" />')
  const negativeNumber = '-{backspace}3'
  await userEvent.type(element, negativeNumber)
  expect(element).toHaveValue(3)
})

test('-a3', async () => {
  const {element} = setup('<input type="number" />')
  const negativeNumber = '-a3'
  await userEvent.type(element, negativeNumber)
  expect(element).toHaveValue(-3)
})

test('typing an invalid input value', async () => {
  const {element} = setup<HTMLInputElement>('<input type="number" />')
  await userEvent.type(element, '3-3')

  expect(element).toHaveValue(null)

  // THIS IS A LIMITATION OF THE BROWSER
  // It is impossible to programmatically set an input
  // value to an invlid value. Not sure how to work around this
  // but the badInput should actually be "true" if the user types "3-3"
  expect(element.validity.badInput).toBe(false)
})

test('should not throw error if we are trying to call type on an element without a value', async () => {
  const {element} = setup('<div />')

  await expect(userEvent.type(element, ':(', {delay: 1})).resolves.toBe(
    undefined,
  )
})

test('typing on button should not alter its value', async () => {
  const {element} = setup('<button value="foo" />')
  await userEvent.type(element, 'bar')
  expect(element).toHaveValue('foo')
})

test('typing on input type button should not alter its value', async () => {
  const {element} = setup('<input type="button" value="foo" />')
  await userEvent.type(element, 'bar')
  expect(element).toHaveValue('foo')
})

test('typing on input type color should not alter its value', async () => {
  const {element} = setup('<input type="color" value="#ffffff" />')
  await userEvent.type(element, 'bar')
  expect(element).toHaveValue('#ffffff')
})

test('typing on input type image should not alter its value', async () => {
  const {element} = setup('<input type="image" value="foo" />')
  await userEvent.type(element, 'bar')
  expect(element).toHaveValue('foo')
})

test('typing on input type reset should not alter its value', async () => {
  const {element} = setup('<input type="reset" value="foo" />')
  await userEvent.type(element, 'bar')
  expect(element).toHaveValue('foo')
})

test('typing on input type submit should not alter its value', async () => {
  const {element} = setup('<input type="submit" value="foo" />')
  await userEvent.type(element, 'bar')
  expect(element).toHaveValue('foo')
})

test('typing on input type file should not result in an error', async () => {
  const {element} = setup('<input type="file" />')

  await expect(userEvent.type(element, 'bar', {delay: 1})).resolves.toBe(
    undefined,
  )
})

test('should submit a form containing multiple text inputs and an input of type submit', async () => {
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
  await userEvent.type(
    element.querySelector('input') as HTMLInputElement,
    '{enter}',
  )

  expect(handleSubmit).toHaveBeenCalledTimes(1)
})

test('should submit a form containing multiple text inputs and a submit button', async () => {
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
  await userEvent.type(
    element.querySelector('input') as HTMLInputElement,
    '{enter}',
  )

  expect(handleSubmit).toHaveBeenCalledTimes(1)
})

test('should submit a form with one input element', async () => {
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
  await userEvent.type(
    element.querySelector('input') as HTMLInputElement,
    '{enter}',
  )

  expect(handleSubmit).toHaveBeenCalledTimes(1)
})

test('should not submit a form with when keydown calls prevent default', async () => {
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
  await userEvent.type(
    element.querySelector('input') as HTMLInputElement,
    '{enter}',
  )

  expect(handleSubmit).not.toHaveBeenCalled()
})

test('should not submit a form with when keypress calls prevent default', async () => {
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
  await userEvent.type(
    element.querySelector('input') as HTMLInputElement,
    '{enter}',
  )

  expect(handleSubmit).not.toHaveBeenCalled()
})

test('should not submit a form with multiple input when ENTER is pressed on one of it', async () => {
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
  await userEvent.type(
    element.querySelector('input') as HTMLInputElement,
    '{enter}',
  )

  expect(handleSubmit).toHaveBeenCalledTimes(0)
})

test('should type inside a contenteditable div', async () => {
  const {element, getEventSnapshot} = setup('<div contenteditable=true></div>')

  await userEvent.type(element, 'bar')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover
    div - mouseenter
    div - pointermove
    div - mousemove
    div - pointerdown
    div - mousedown: primary
    div - focus
    div - focusin
    div - pointerup
    div - mouseup: primary
    div - click: primary
    div - keydown: b
    div - keypress: b
    div - input
    div - keyup: b
    div - keydown: a
    div - keypress: a
    div - input
    div - keyup: a
    div - keydown: r
    div - keypress: r
    div - input
    div - keyup: r
  `)
  expect(element).toHaveTextContent('bar')
})

test('key event which does not change the contenteditable does not fire input event', async () => {
  const {element, getEventSnapshot, getEvents} = setup(
    '<div contenteditable>foo</div>',
  )

  await userEvent.type(element, '[Home][Backspace]')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover
    div - mouseenter
    div - pointermove
    div - mousemove
    div - pointerdown
    div - mousedown: primary
    div - focus
    div - focusin
    div - pointerup
    div - mouseup: primary
    div - click: primary
    div - keydown: Home
    div - keyup: Home
    div - keydown: Backspace
    div - keyup: Backspace
  `)
  expect(getEvents('input')).toHaveLength(0)
})

test('should not type inside a contenteditable=false div', async () => {
  const {element, getEventSnapshot} = setup('<div contenteditable=false></div>')

  await userEvent.type(element, 'bar')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover
    div - mouseenter
    div - pointermove
    div - mousemove
    div - pointerdown
    div - mousedown: primary
    div - pointerup
    div - mouseup: primary
    div - click: primary
  `)
})

test('navigation key: {arrowleft} and {arrowright} moves the cursor for <input>', async () => {
  const {element, getEventSnapshot} = setup('<input />')
  await userEvent.type(element, 'b{arrowleft}a{arrowright}c')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="abc"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: b
    input[value=""] - keypress: b
    input[value="b"] - input
    input[value="b"] - keyup: b
    input[value="b"] - keydown: ArrowLeft
    input[value="b"] - select
    input[value="b"] - keyup: ArrowLeft
    input[value="b"] - keydown: a
    input[value="b"] - keypress: a
    input[value="ab"] - select
    input[value="ab"] - input
    input[value="ab"] - keyup: a
    input[value="ab"] - keydown: ArrowRight
    input[value="ab"] - select
    input[value="ab"] - keyup: ArrowRight
    input[value="ab"] - keydown: c
    input[value="ab"] - keypress: c
    input[value="abc"] - input
    input[value="abc"] - keyup: c
  `)
})

test('navigation key: {arrowleft} and {arrowright} moves the cursor for <textarea>', async () => {
  const {element, getEventSnapshot} = setup('<textarea></textarea>')
  await userEvent.type(element, 'b{arrowleft}a{arrowright}c')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value="abc"]

    textarea[value=""] - pointerover
    textarea[value=""] - pointerenter
    textarea[value=""] - mouseover
    textarea[value=""] - mouseenter
    textarea[value=""] - pointermove
    textarea[value=""] - mousemove
    textarea[value=""] - pointerdown
    textarea[value=""] - mousedown: primary
    textarea[value=""] - focus
    textarea[value=""] - focusin
    textarea[value=""] - pointerup
    textarea[value=""] - mouseup: primary
    textarea[value=""] - click: primary
    textarea[value=""] - keydown: b
    textarea[value=""] - keypress: b
    textarea[value="b"] - input
    textarea[value="b"] - keyup: b
    textarea[value="b"] - keydown: ArrowLeft
    textarea[value="b"] - select
    textarea[value="b"] - keyup: ArrowLeft
    textarea[value="b"] - keydown: a
    textarea[value="b"] - keypress: a
    textarea[value="ab"] - select
    textarea[value="ab"] - input
    textarea[value="ab"] - keyup: a
    textarea[value="ab"] - keydown: ArrowRight
    textarea[value="ab"] - select
    textarea[value="ab"] - keyup: ArrowRight
    textarea[value="ab"] - keydown: c
    textarea[value="ab"] - keypress: c
    textarea[value="abc"] - input
    textarea[value="abc"] - keyup: c
  `)
})

test('navigation key: {home} and {end} moves the cursor', async () => {
  const {element, getEventSnapshot} = setup('<input />')
  await userEvent.type(element, 'c{home}ab{end}d')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="abcd"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: c
    input[value=""] - keypress: c
    input[value="c"] - input
    input[value="c"] - keyup: c
    input[value="c"] - keydown: Home
    input[value="c"] - select
    input[value="c"] - keyup: Home
    input[value="c"] - keydown: a
    input[value="c"] - keypress: a
    input[value="ac"] - select
    input[value="ac"] - input
    input[value="ac"] - keyup: a
    input[value="ac"] - keydown: b
    input[value="ac"] - keypress: b
    input[value="abc"] - select
    input[value="abc"] - input
    input[value="abc"] - keyup: b
    input[value="abc"] - keydown: End
    input[value="abc"] - select
    input[value="abc"] - keyup: End
    input[value="abc"] - keydown: d
    input[value="abc"] - keypress: d
    input[value="abcd"] - input
    input[value="abcd"] - keyup: d
  `)
})

test('navigation key: {pageUp} and {pageDown} moves the cursor for <input>', async () => {
  const {element, getEventSnapshot} = setup('<input />')
  await userEvent.type(element, 'c{pageUp}ab{pageDown}d')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="abcd"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: c
    input[value=""] - keypress: c
    input[value="c"] - input
    input[value="c"] - keyup: c
    input[value="c"] - keydown: PageUp
    input[value="c"] - select
    input[value="c"] - keyup: PageUp
    input[value="c"] - keydown: a
    input[value="c"] - keypress: a
    input[value="ac"] - select
    input[value="ac"] - input
    input[value="ac"] - keyup: a
    input[value="ac"] - keydown: b
    input[value="ac"] - keypress: b
    input[value="abc"] - select
    input[value="abc"] - input
    input[value="abc"] - keyup: b
    input[value="abc"] - keydown: PageDown
    input[value="abc"] - select
    input[value="abc"] - keyup: PageDown
    input[value="abc"] - keydown: d
    input[value="abc"] - keypress: d
    input[value="abcd"] - input
    input[value="abcd"] - keyup: d
  `)
})

test('can type into an input with type `time`', async () => {
  const {element, getEventSnapshot} = setup('<input type="time" />')
  await userEvent.type(element, '01:05')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="01:05"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: 0
    input[value=""] - keypress: 0
    input[value=""] - keyup: 0
    input[value=""] - keydown: 1
    input[value=""] - keypress: 1
    input[value=""] - keyup: 1
    input[value=""] - keydown: :
    input[value=""] - keypress: :
    input[value=""] - keyup: :
    input[value=""] - keydown: 0
    input[value=""] - keypress: 0
    input[value="01:00"] - input
    input[value="01:00"] - change
    input[value="01:00"] - keyup: 0
    input[value="01:00"] - keydown: 5
    input[value="01:00"] - keypress: 5
    input[value="01:05"] - input
    input[value="01:05"] - change
    input[value="01:05"] - keyup: 5
  `)
  expect(element).toHaveValue('01:05')
})

test('can type into an input with type `time` without ":"', async () => {
  const {element, getEventSnapshot} = setup('<input type="time" />')
  await userEvent.type(element, '0105')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="01:05"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: 0
    input[value=""] - keypress: 0
    input[value=""] - keyup: 0
    input[value=""] - keydown: 1
    input[value=""] - keypress: 1
    input[value=""] - keyup: 1
    input[value=""] - keydown: 0
    input[value=""] - keypress: 0
    input[value="01:00"] - input
    input[value="01:00"] - change
    input[value="01:00"] - keyup: 0
    input[value="01:00"] - keydown: 5
    input[value="01:00"] - keypress: 5
    input[value="01:05"] - input
    input[value="01:05"] - change
    input[value="01:05"] - keyup: 5
  `)
  expect(element).toHaveValue('01:05')
})

test('can type more a number higher than 60 minutes into an input `time` and they are converted into 59 minutes', async () => {
  const {element, getEventSnapshot} = setup('<input type="time" />')
  await userEvent.type(element, '23:90')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="23:59"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: 2
    input[value=""] - keypress: 2
    input[value=""] - keyup: 2
    input[value=""] - keydown: 3
    input[value=""] - keypress: 3
    input[value=""] - keyup: 3
    input[value=""] - keydown: :
    input[value=""] - keypress: :
    input[value=""] - keyup: :
    input[value=""] - keydown: 9
    input[value=""] - keypress: 9
    input[value="23:09"] - input
    input[value="23:09"] - change
    input[value="23:09"] - keyup: 9
    input[value="23:09"] - keydown: 0
    input[value="23:09"] - keypress: 0
    input[value="23:59"] - input
    input[value="23:59"] - change
    input[value="23:59"] - keyup: 0
  `)

  expect(element).toHaveValue('23:59')
})

test('can type letters into an input `time` and they are ignored', async () => {
  const {element, getEventSnapshot} = setup('<input type="time" />')
  await userEvent.type(element, '1a6bc36abd')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="16:36"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: 1
    input[value=""] - keypress: 1
    input[value=""] - keyup: 1
    input[value=""] - keydown: a
    input[value=""] - keypress: a
    input[value=""] - keyup: a
    input[value=""] - keydown: 6
    input[value=""] - keypress: 6
    input[value=""] - keyup: 6
    input[value=""] - keydown: b
    input[value=""] - keypress: b
    input[value=""] - keyup: b
    input[value=""] - keydown: c
    input[value=""] - keypress: c
    input[value=""] - keyup: c
    input[value=""] - keydown: 3
    input[value=""] - keypress: 3
    input[value="16:03"] - input
    input[value="16:03"] - change
    input[value="16:03"] - keyup: 3
    input[value="16:03"] - keydown: 6
    input[value="16:03"] - keypress: 6
    input[value="16:36"] - input
    input[value="16:36"] - change
    input[value="16:36"] - keyup: 6
    input[value="16:36"] - keydown: a
    input[value="16:36"] - keypress: a
    input[value="16:36"] - keyup: a
    input[value="16:36"] - keydown: b
    input[value="16:36"] - keypress: b
    input[value="16:36"] - keyup: b
    input[value="16:36"] - keydown: d
    input[value="16:36"] - keypress: d
    input[value="16:36"] - keyup: d
  `)

  expect(element).toHaveValue('16:36')
})

test('can type a digit bigger in the hours section, bigger than 2 and it shows the time correctly', async () => {
  const {element, getEventSnapshot} = setup('<input type="time" />')
  await userEvent.type(element, '9:25')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="09:25"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: 9
    input[value=""] - keypress: 9
    input[value=""] - keyup: 9
    input[value=""] - keydown: :
    input[value=""] - keypress: :
    input[value=""] - keyup: :
    input[value=""] - keydown: 2
    input[value=""] - keypress: 2
    input[value="09:02"] - input
    input[value="09:02"] - change
    input[value="09:02"] - keyup: 2
    input[value="09:02"] - keydown: 5
    input[value="09:02"] - keypress: 5
    input[value="09:25"] - input
    input[value="09:25"] - change
    input[value="09:25"] - keyup: 5
  `)

  expect(element).toHaveValue('09:25')
})

test('can type two digits in the hours section, equals to 24 and it shows the hours as 23', async () => {
  const {element, getEventSnapshot} = setup('<input type="time" />')
  await userEvent.type(element, '24:52')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="23:52"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: 2
    input[value=""] - keypress: 2
    input[value=""] - keyup: 2
    input[value=""] - keydown: 4
    input[value=""] - keypress: 4
    input[value=""] - keyup: 4
    input[value=""] - keydown: :
    input[value=""] - keypress: :
    input[value=""] - keyup: :
    input[value=""] - keydown: 5
    input[value=""] - keypress: 5
    input[value="23:05"] - input
    input[value="23:05"] - change
    input[value="23:05"] - keyup: 5
    input[value="23:05"] - keydown: 2
    input[value="23:05"] - keypress: 2
    input[value="23:52"] - input
    input[value="23:52"] - change
    input[value="23:52"] - keyup: 2
  `)

  expect(element).toHaveValue('23:52')
})

test('can type two digits in the hours section, bigger than 24 and less than 30, and it shows the hours as 23', async () => {
  const {element, getEventSnapshot} = setup('<input type="time" />')
  await userEvent.type(element, '27:52')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="23:52"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: 2
    input[value=""] - keypress: 2
    input[value=""] - keyup: 2
    input[value=""] - keydown: 7
    input[value=""] - keypress: 7
    input[value=""] - keyup: 7
    input[value=""] - keydown: :
    input[value=""] - keypress: :
    input[value=""] - keyup: :
    input[value=""] - keydown: 5
    input[value=""] - keypress: 5
    input[value="23:05"] - input
    input[value="23:05"] - change
    input[value="23:05"] - keyup: 5
    input[value="23:05"] - keydown: 2
    input[value="23:05"] - keypress: 2
    input[value="23:52"] - input
    input[value="23:52"] - change
    input[value="23:52"] - keyup: 2
  `)

  expect(element).toHaveValue('23:52')
})

test('{arrowdown} fires keyup/keydown events', async () => {
  const {element, getEventSnapshot} = setup('<input />')

  await userEvent.type(element, '{arrowdown}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: ArrowDown
    input[value=""] - keyup: ArrowDown
  `)
})

test('{arrowup} fires keyup/keydown events', async () => {
  const {element, getEventSnapshot} = setup('<input />')

  await userEvent.type(element, '{arrowup}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: ArrowUp
    input[value=""] - keyup: ArrowUp
  `)
})

test('{enter} fires click on links', async () => {
  const {element, getEventSnapshot} = setup('<a href="#">link</a>')

  element.focus()

  await userEvent.type(element, '{enter}', {skipClick: true})

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: a

    a - focus
    a - focusin
    a - keydown: Enter
    a - keypress: Enter
    a - click: primary
    a - keyup: Enter
  `)
})

test('type non-alphanumeric characters', async () => {
  const {element} = setup(`<input/>`)

  await userEvent.type(element, 'https://test.local')

  expect(element).toHaveValue('https://test.local')
})

test('move selection with arrows', async () => {
  const {element} = setup<HTMLInputElement>(`<input/>`)

  await userEvent.type(
    element,
    'abc{ArrowLeft}{ArrowLeft}{ArrowRight}{Backspace}',
  )

  expect(element).toHaveValue('ac')
  expect(element).toHaveProperty('selectionStart', 1)
})

test('overwrite selection with same value', async () => {
  const {element} = setup<HTMLInputElement>(`<input value="1"/>`)
  element.select()
  element.focus()

  await userEvent.type(element, '11123', {skipClick: true})

  expect(element).toHaveValue('11123')
})
