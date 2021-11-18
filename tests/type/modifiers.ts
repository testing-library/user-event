import userEvent from '#src'
import {setup} from '#testHelpers/utils'

// This test suite contains a lot of legacy code.
// A lot of tests performed here could be skipped
// as the current keyboard implementation merged different previous implementations
// that needed to be tested seperately.
// What will be left should be moved into keyboard/plugins.
// Keeping these for now to demonstrate changes.
// TODO: clean up this test suite

test('{escape} triggers typing the escape character', async () => {
  const {element, getEventSnapshot} = setup('<input />')

  await userEvent.type(element, '{escape}')

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
    input[value=""] - keydown: Escape
    input[value=""] - keyup: Escape
  `)
})

test('a{backspace}', async () => {
  const {element, getEventSnapshot} = setup('<input />')
  await userEvent.type(element, 'a{backspace}')
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
    input[value="a"] - input
    input[value="a"] - keyup: a
    input[value="a"] - keydown: Backspace
    input[value=""] - input
    input[value=""] - keyup: Backspace
  `)
})

test('{backspace}a', async () => {
  const {element, getEventSnapshot} = setup('<input />')
  await userEvent.type(element, '{backspace}a')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="a"]

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
    input[value=""] - keydown: Backspace
    input[value=""] - keyup: Backspace
    input[value=""] - keydown: a
    input[value=""] - keypress: a
    input[value="a"] - input
    input[value="a"] - keyup: a
  `)
})

test('{backspace} triggers typing the backspace character and deletes the character behind the cursor', async () => {
  const {element, getEventSnapshot} = setup<HTMLInputElement>(
    '<input value="yo" />',
  )
  element.setSelectionRange(1, 1)

  await userEvent.type(element, '{backspace}', {initialSelectionStart: 1})

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="o"]

    input[value="yo"] - select
    input[value="yo"] - pointerover
    input[value="yo"] - pointerenter
    input[value="yo"] - mouseover
    input[value="yo"] - mouseenter
    input[value="yo"] - pointermove
    input[value="yo"] - mousemove
    input[value="yo"] - pointerdown
    input[value="yo"] - mousedown: primary
    input[value="yo"] - focus
    input[value="yo"] - focusin
    input[value="yo"] - select
    input[value="yo"] - pointerup
    input[value="yo"] - mouseup: primary
    input[value="yo"] - click: primary
    input[value="yo"] - select
    input[value="yo"] - keydown: Backspace
    input[value="o"] - select
    input[value="o"] - input
    input[value="o"] - keyup: Backspace
  `)
})

test('{backspace} on a readOnly input', async () => {
  const {element, getEventSnapshot} = setup<HTMLInputElement>(
    '<input readonly value="yo" />',
  )
  element.setSelectionRange(1, 1)

  await userEvent.type(element, '{backspace}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="yo"]

    input[value="yo"] - select
    input[value="yo"] - pointerover
    input[value="yo"] - pointerenter
    input[value="yo"] - mouseover
    input[value="yo"] - mouseenter
    input[value="yo"] - pointermove
    input[value="yo"] - mousemove
    input[value="yo"] - pointerdown
    input[value="yo"] - mousedown: primary
    input[value="yo"] - focus
    input[value="yo"] - focusin
    input[value="yo"] - select
    input[value="yo"] - pointerup
    input[value="yo"] - mouseup: primary
    input[value="yo"] - click: primary
    input[value="yo"] - keydown: Backspace
    input[value="yo"] - keyup: Backspace
  `)
})

test('{backspace} does not fire input if keydown prevents default', async () => {
  const {element, getEventSnapshot} = setup<HTMLInputElement>(
    '<input value="yo" />',
    {
      eventHandlers: {keyDown: e => e.preventDefault()},
    },
  )
  element.setSelectionRange(1, 1)

  await userEvent.type(element, '{backspace}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="yo"]

    input[value="yo"] - select
    input[value="yo"] - pointerover
    input[value="yo"] - pointerenter
    input[value="yo"] - mouseover
    input[value="yo"] - mouseenter
    input[value="yo"] - pointermove
    input[value="yo"] - mousemove
    input[value="yo"] - pointerdown
    input[value="yo"] - mousedown: primary
    input[value="yo"] - focus
    input[value="yo"] - focusin
    input[value="yo"] - select
    input[value="yo"] - pointerup
    input[value="yo"] - mouseup: primary
    input[value="yo"] - click: primary
    input[value="yo"] - keydown: Backspace
    input[value="yo"] - keyup: Backspace
  `)
})

test('{backspace} deletes the selected range', async () => {
  const {element, getEventSnapshot} = setup('<input value="Hi there" />')

  await userEvent.type(element, '{backspace}', {
    initialSelectionStart: 1,
    initialSelectionEnd: 5,
  })

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="Here"]

    input[value="Hi there"] - pointerover
    input[value="Hi there"] - pointerenter
    input[value="Hi there"] - mouseover
    input[value="Hi there"] - mouseenter
    input[value="Hi there"] - pointermove
    input[value="Hi there"] - mousemove
    input[value="Hi there"] - pointerdown
    input[value="Hi there"] - mousedown: primary
    input[value="Hi there"] - focus
    input[value="Hi there"] - focusin
    input[value="Hi there"] - select
    input[value="Hi there"] - pointerup
    input[value="Hi there"] - mouseup: primary
    input[value="Hi there"] - click: primary
    input[value="Hi there"] - select
    input[value="Hi there"] - keydown: Backspace
    input[value="Here"] - select
    input[value="Here"] - input
    input[value="Here"] - keyup: Backspace
  `)
})

test('{backspace} on an input type that does not support selection ranges', async () => {
  const {element} = setup('<input type="email" value="yo@example.com" />')
  // note: you cannot even call setSelectionRange on these kinds of elements...
  await userEvent.type(element, '{backspace}{backspace}a')
  // removed "m" then "o" then add "a"
  expect(element).toHaveValue('yo@example.ca')
})

test('{alt>}a{/alt}', async () => {
  const {element, getEventSnapshot} = setup('<input />')

  await userEvent.type(element, '{alt>}a{/alt}')

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
    input[value=""] - keydown: Alt {alt}
    input[value=""] - keydown: a {alt}
    input[value=""] - keyup: a {alt}
    input[value=""] - keyup: Alt
  `)
})

test('{meta>}a{/meta}', async () => {
  const {element, getEventSnapshot} = setup<HTMLInputElement>('<input />')

  await userEvent.type(element, '{meta>}a{/meta}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="a"]

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
    input[value=""] - keydown: Meta {meta}
    input[value=""] - keydown: a {meta}
    input[value=""] - keypress: a {meta}
    input[value="a"] - input
    input[value="a"] - keyup: a {meta}
    input[value="a"] - keyup: Meta
  `)
})

test('{control>}a{/control}', async () => {
  const {element, getEventSnapshot} = setup('<input />')

  await userEvent.type(element, '{control>}a{/control}')

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
    input[value=""] - keydown: Control {ctrl}
    input[value=""] - keydown: a {ctrl}
    input[value=""] - keyup: a {ctrl}
    input[value=""] - keyup: Control
  `)
})

test('{shift>}a{/shift}', async () => {
  const {element, getEventSnapshot} = setup('<input />')

  await userEvent.type(element, '{shift>}a{/shift}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="a"]

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
    input[value=""] - keydown: Shift {shift}
    input[value=""] - keydown: a {shift}
    input[value=""] - keypress: a {shift}
    input[value="a"] - input
    input[value="a"] - keyup: a {shift}
    input[value="a"] - keyup: Shift
  `)
})

test('{capslock}a{capslock}', async () => {
  const {element, getEventSnapshot} = setup('<input />')

  // The old behavior to treat {/capslock} like {capslock} makes no sense
  await userEvent.type(element, '{capslock}a{capslock}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="a"]

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
    input[value=""] - keydown: CapsLock
    input[value=""] - keyup: CapsLock
    input[value=""] - keydown: a
    input[value=""] - keypress: a
    input[value="a"] - input
    input[value="a"] - keyup: a
    input[value="a"] - keydown: CapsLock
    input[value="a"] - keyup: CapsLock
  `)
})

test('a{enter}', async () => {
  const {element, getEventSnapshot} = setup('<input />')

  await userEvent.type(element, 'a{enter}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="a"]

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
    input[value="a"] - input
    input[value="a"] - keyup: a
    input[value="a"] - keydown: Enter
    input[value="a"] - keypress: Enter
    input[value="a"] - keyup: Enter
  `)
})

test('{enter} with preventDefault keydown', async () => {
  const {element, getEventSnapshot} = setup('<input />', {
    eventHandlers: {
      keyDown: e => e.preventDefault(),
    },
  })

  await userEvent.type(element, '{enter}')

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
    input[value=""] - keydown: Enter
    input[value=""] - keyup: Enter
  `)
})

test('{enter} on a button', async () => {
  const {element, getEventSnapshot} = setup('<button />')

  await userEvent.type(element, '{enter}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover
    button - mouseenter
    button - pointermove
    button - mousemove
    button - pointerdown
    button - mousedown: primary
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: primary
    button - click: primary
    button - keydown: Enter
    button - keypress: Enter
    button - click: primary
    button - keyup: Enter
  `)
})

test('{enter} on a button when keydown calls prevent default', async () => {
  const {element, getEventSnapshot} = setup('<button />', {
    eventHandlers: {
      keyDown: e => e.preventDefault(),
    },
  })

  await userEvent.type(element, '{enter}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover
    button - mouseenter
    button - pointermove
    button - mousemove
    button - pointerdown
    button - mousedown: primary
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: primary
    button - click: primary
    button - keydown: Enter
    button - keyup: Enter
  `)
})

test('{enter} on a button when keypress calls prevent default', async () => {
  const {element, getEventSnapshot} = setup('<button />', {
    eventHandlers: {
      keyPress: e => e.preventDefault(),
    },
  })

  await userEvent.type(element, '{enter}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover
    button - mouseenter
    button - pointermove
    button - mousemove
    button - pointerdown
    button - mousedown: primary
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: primary
    button - click: primary
    button - keydown: Enter
    button - keypress: Enter
    button - keyup: Enter
  `)
})

test('[space] on a button', async () => {
  const {element, getEventSnapshot} = setup('<button />')

  await userEvent.type(element, '[space]')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover
    button - mouseenter
    button - pointermove
    button - mousemove
    button - pointerdown
    button - mousedown: primary
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: primary
    button - click: primary
    button - keydown
    button - keypress
    button - keyup
    button - click: primary
  `)
})

test(`' ' on a button is the same as '[space]'`, async () => {
  const {element, getEventSnapshot} = setup('<button />')

  await userEvent.type(element, ' ')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover
    button - mouseenter
    button - pointermove
    button - mousemove
    button - pointerdown
    button - mousedown: primary
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: primary
    button - click: primary
    button - keydown
    button - keypress
    button - keyup
    button - click: primary
  `)
})

test('[space] with preventDefault keydown on button', async () => {
  const {element, getEventSnapshot} = setup('<button />', {
    eventHandlers: {
      keyDown: e => e.preventDefault(),
    },
  })

  await userEvent.type(element, '[space]')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover
    button - mouseenter
    button - pointermove
    button - mousemove
    button - pointerdown
    button - mousedown: primary
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: primary
    button - click: primary
    button - keydown
    button - keyup
  `)
})

test('[space] with preventDefault keyup on button', async () => {
  const {element, getEventSnapshot} = setup('<button />', {
    eventHandlers: {
      keyUp: e => e.preventDefault(),
    },
  })

  await userEvent.type(element, '[space]')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover
    button - mouseenter
    button - pointermove
    button - mousemove
    button - pointerdown
    button - mousedown: primary
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: primary
    button - click: primary
    button - keydown
    button - keypress
    button - keyup
  `)
})

test('[space] on an input', async () => {
  const {element, getEventSnapshot} = setup(`<input value="" />`)

  await userEvent.type(element, '[space]')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=" "]

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
    input[value=""] - keydown
    input[value=""] - keypress
    input[value=" "] - input
    input[value=" "] - keyup
  `)
})

test('{enter} on an input type="color" fires same events as a button', async () => {
  const {element, getEventSnapshot} = setup(
    `<input value="#ffffff" type="color" />`,
  )

  await userEvent.type(element, '{enter}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="#ffffff"]

    input[value="#ffffff"] - pointerover
    input[value="#ffffff"] - pointerenter
    input[value="#ffffff"] - mouseover
    input[value="#ffffff"] - mouseenter
    input[value="#ffffff"] - pointermove
    input[value="#ffffff"] - mousemove
    input[value="#ffffff"] - pointerdown
    input[value="#ffffff"] - mousedown: primary
    input[value="#ffffff"] - focus
    input[value="#ffffff"] - focusin
    input[value="#ffffff"] - pointerup
    input[value="#ffffff"] - mouseup: primary
    input[value="#ffffff"] - click: primary
    input[value="#ffffff"] - keydown: Enter
    input[value="#ffffff"] - keypress: Enter
    input[value="#ffffff"] - click: primary
    input[value="#ffffff"] - keyup: Enter
  `)
})

test('[space] on an input type="color" fires same events as a button', async () => {
  const {element, getEventSnapshot} = setup(
    `<input value="#ffffff" type="color" />`,
  )

  await userEvent.type(element, '[space]')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="#ffffff"]

    input[value="#ffffff"] - pointerover
    input[value="#ffffff"] - pointerenter
    input[value="#ffffff"] - mouseover
    input[value="#ffffff"] - mouseenter
    input[value="#ffffff"] - pointermove
    input[value="#ffffff"] - mousemove
    input[value="#ffffff"] - pointerdown
    input[value="#ffffff"] - mousedown: primary
    input[value="#ffffff"] - focus
    input[value="#ffffff"] - focusin
    input[value="#ffffff"] - pointerup
    input[value="#ffffff"] - mouseup: primary
    input[value="#ffffff"] - click: primary
    input[value="#ffffff"] - keydown
    input[value="#ffffff"] - keypress
    input[value="#ffffff"] - keyup
    input[value="#ffffff"] - click: primary
  `)
})

test(`' ' on input type="color" is the same as '[space]'`, async () => {
  const {element, getEventSnapshot} = setup(
    `<input value="#ffffff" type="color" />`,
  )

  await userEvent.type(element, ' ')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="#ffffff"]

    input[value="#ffffff"] - pointerover
    input[value="#ffffff"] - pointerenter
    input[value="#ffffff"] - mouseover
    input[value="#ffffff"] - mouseenter
    input[value="#ffffff"] - pointermove
    input[value="#ffffff"] - mousemove
    input[value="#ffffff"] - pointerdown
    input[value="#ffffff"] - mousedown: primary
    input[value="#ffffff"] - focus
    input[value="#ffffff"] - focusin
    input[value="#ffffff"] - pointerup
    input[value="#ffffff"] - mouseup: primary
    input[value="#ffffff"] - click: primary
    input[value="#ffffff"] - keydown
    input[value="#ffffff"] - keypress
    input[value="#ffffff"] - keyup
    input[value="#ffffff"] - click: primary
  `)
})

test('{enter} on a textarea', async () => {
  const {element, getEventSnapshot} = setup('<textarea></textarea>')

  await userEvent.type(element, '{enter}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value="\\n"]

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
    textarea[value=""] - keydown: Enter
    textarea[value=""] - keypress: Enter
    textarea[value="\\n"] - input
    textarea[value="\\n"] - keyup: Enter
  `)
})

test('{enter} on a textarea when keydown calls prevent default', async () => {
  const {element, getEventSnapshot} = setup('<textarea></textarea>', {
    eventHandlers: {keyDown: e => e.preventDefault()},
  })

  await userEvent.type(element, '{enter}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value=""]

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
    textarea[value=""] - keydown: Enter
    textarea[value=""] - keyup: Enter
  `)
})

test('{enter} on a textarea when keypress calls prevent default', async () => {
  const {element, getEventSnapshot} = setup('<textarea></textarea>', {
    eventHandlers: {keyPress: e => e.preventDefault()},
  })

  await userEvent.type(element, '{enter}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value=""]

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
    textarea[value=""] - keydown: Enter
    textarea[value=""] - keypress: Enter
    textarea[value=""] - keyup: Enter
  `)
})

test('{meta>}{enter}{/meta} on a button', async () => {
  const {element, getEventSnapshot} = setup('<button />')

  await userEvent.type(element, '{meta>}{enter}{/meta}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover
    button - mouseenter
    button - pointermove
    button - mousemove
    button - pointerdown
    button - mousedown: primary
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: primary
    button - click: primary
    button - keydown: Meta {meta}
    button - keydown: Enter {meta}
    button - keypress: Enter {meta}
    button - click: primary {meta}
    button - keyup: Enter {meta}
    button - keyup: Meta
  `)
})

test('{meta>}{alt>}{control>}a{/control}{/alt}{/meta}', async () => {
  const {element, getEventSnapshot} = setup('<input />')

  await userEvent.type(
    element,
    '{meta>}{alt>}{control>}a{/control}{/alt}{/meta}',
  )

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
    input[value=""] - keydown: Meta {meta}
    input[value=""] - keydown: Alt {alt}{meta}
    input[value=""] - keydown: Control {alt}{meta}{ctrl}
    input[value=""] - keydown: a {alt}{meta}{ctrl}
    input[value=""] - keyup: a {alt}{meta}{ctrl}
    input[value=""] - keyup: Control {alt}{meta}
    input[value=""] - keyup: Alt {meta}
    input[value=""] - keyup: Meta
  `)
})

test('{delete} at the start of the input', async () => {
  const {element, getEventSnapshot} = setup<HTMLInputElement>(
    `<input value="hello" />`,
  )

  await userEvent.type(element, '{delete}', {
    initialSelectionStart: 0,
    initialSelectionEnd: 0,
  })

  expect(element.selectionStart).toBe(0)
  expect(element.selectionEnd).toBe(0)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="ello"]

    input[value="hello"] - pointerover
    input[value="hello"] - pointerenter
    input[value="hello"] - mouseover
    input[value="hello"] - mouseenter
    input[value="hello"] - pointermove
    input[value="hello"] - mousemove
    input[value="hello"] - pointerdown
    input[value="hello"] - mousedown: primary
    input[value="hello"] - focus
    input[value="hello"] - focusin
    input[value="hello"] - select
    input[value="hello"] - pointerup
    input[value="hello"] - mouseup: primary
    input[value="hello"] - click: primary
    input[value="hello"] - select
    input[value="hello"] - keydown: Delete
    input[value="ello"] - select
    input[value="ello"] - input
    input[value="ello"] - keyup: Delete
  `)
})

test('{delete} at end of the input', async () => {
  const {element, getEventSnapshot} = setup<HTMLInputElement>(
    `<input value="hello" />`,
  )

  await userEvent.type(element, '{delete}')

  expect(element.selectionStart).toBe(element.value.length)
  expect(element.selectionEnd).toBe(element.value.length)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="hello"]

    input[value="hello"] - pointerover
    input[value="hello"] - pointerenter
    input[value="hello"] - mouseover
    input[value="hello"] - mouseenter
    input[value="hello"] - pointermove
    input[value="hello"] - mousemove
    input[value="hello"] - pointerdown
    input[value="hello"] - mousedown: primary
    input[value="hello"] - focus
    input[value="hello"] - focusin
    input[value="hello"] - select
    input[value="hello"] - pointerup
    input[value="hello"] - mouseup: primary
    input[value="hello"] - click: primary
    input[value="hello"] - keydown: Delete
    input[value="hello"] - keyup: Delete
  `)
})

test('{delete} in the middle of the input', async () => {
  const {element, getEventSnapshot} = setup<HTMLInputElement>(
    `<input value="hello" />`,
  )

  await userEvent.type(element, '{delete}', {
    initialSelectionStart: 2,
    initialSelectionEnd: 2,
  })

  expect(element.selectionStart).toBe(2)
  expect(element.selectionEnd).toBe(2)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="helo"]

    input[value="hello"] - pointerover
    input[value="hello"] - pointerenter
    input[value="hello"] - mouseover
    input[value="hello"] - mouseenter
    input[value="hello"] - pointermove
    input[value="hello"] - mousemove
    input[value="hello"] - pointerdown
    input[value="hello"] - mousedown: primary
    input[value="hello"] - focus
    input[value="hello"] - focusin
    input[value="hello"] - select
    input[value="hello"] - pointerup
    input[value="hello"] - mouseup: primary
    input[value="hello"] - click: primary
    input[value="hello"] - select
    input[value="hello"] - keydown: Delete
    input[value="helo"] - select
    input[value="helo"] - input
    input[value="helo"] - keyup: Delete
  `)
})

test('{delete} with a selection range', async () => {
  const {element, getEventSnapshot} = setup<HTMLInputElement>(
    `<input value="hello" />`,
  )

  await userEvent.type(element, '{delete}', {
    initialSelectionStart: 1,
    initialSelectionEnd: 3,
  })

  expect(element.selectionStart).toBe(1)
  expect(element.selectionEnd).toBe(1)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="hlo"]

    input[value="hello"] - pointerover
    input[value="hello"] - pointerenter
    input[value="hello"] - mouseover
    input[value="hello"] - mouseenter
    input[value="hello"] - pointermove
    input[value="hello"] - mousemove
    input[value="hello"] - pointerdown
    input[value="hello"] - mousedown: primary
    input[value="hello"] - focus
    input[value="hello"] - focusin
    input[value="hello"] - select
    input[value="hello"] - pointerup
    input[value="hello"] - mouseup: primary
    input[value="hello"] - click: primary
    input[value="hello"] - select
    input[value="hello"] - keydown: Delete
    input[value="hlo"] - select
    input[value="hlo"] - input
    input[value="hlo"] - keyup: Delete
  `)
})

// TODO: eventually we'll want to support this, but currently we cannot
// because selection ranges are (intentially) unsupported in certain input types
// per the spec.
test('{delete} on an input that does not support selection range does not change the value', async () => {
  const {element, eventWasFired} = setup(`<input type="email" value="a@b.c" />`)

  await userEvent.type(element, '{delete}')
  expect(element).toHaveValue('a@b.c')
  expect(eventWasFired('input')).not.toBe(true)
})

test('{delete} does not delete if keydown is prevented', async () => {
  const {element, eventWasFired} = setup<HTMLInputElement>(
    `<input value="hello" />`,
    {
      eventHandlers: {keyDown: e => e.preventDefault()},
    },
  )

  await userEvent.type(element, '{delete}', {
    initialSelectionStart: 2,
    initialSelectionEnd: 2,
  })
  expect(element).toHaveValue('hello')
  expect(element.selectionStart).toBe(2)
  expect(element.selectionEnd).toBe(2)
  expect(eventWasFired('input')).not.toBe(true)
})

test('any remaining type modifiers are automatically released at the end', async () => {
  const {element, getEventSnapshot} = setup('<input />')

  await userEvent.type(element, '{meta>}{alt>}{control>}a{/alt}')

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
    input[value=""] - keydown: Meta {meta}
    input[value=""] - keydown: Alt {alt}{meta}
    input[value=""] - keydown: Control {alt}{meta}{ctrl}
    input[value=""] - keydown: a {alt}{meta}{ctrl}
    input[value=""] - keyup: a {alt}{meta}{ctrl}
    input[value=""] - keyup: Alt {meta}{ctrl}
    input[value=""] - keyup: Meta {ctrl}
    input[value=""] - keyup: Control
  `)
})

test('modifiers will not be closed if skipAutoClose is enabled', async () => {
  const {element, getEventSnapshot} = setup('<input />')

  await userEvent.type(element, '{meta>}a', {skipAutoClose: true})

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="a"]

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
    input[value=""] - keydown: Meta {meta}
    input[value=""] - keydown: a {meta}
    input[value=""] - keypress: a {meta}
    input[value="a"] - input
    input[value="a"] - keyup: a {meta}
  `)
})
