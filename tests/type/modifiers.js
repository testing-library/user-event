import userEvent from '#src'
import {setup} from '#testHelpers/utils'

// Note, use the setup function at the bottom of the file...
// but don't hurt yourself trying to read it 😅

// keep in mind that we do not handle modifier interactions. This is primarily
// because modifiers behave differently on different operating systems.
// For example: {alt}{backspace}{/alt} will remove everything from the current
// cursor position to the beginning of the word on Mac, but you need to use
// {ctrl}{backspace}{/ctrl} to do that on Windows. And that doesn't appear to
// be consistent within an OS either 🙃
// So we're not going to even try.

// This also means that '{shift}a' will fire an input event with the shiftKey,
// but will not capitalize "a".

test('{esc} triggers typing the escape character', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, '{esc}')

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
    input[value=""] - keydown: Escape (27)
    input[value=""] - keyup: Escape (27)
  `)
})

test('a{backspace}', () => {
  const {element, getEventSnapshot} = setup('<input />')
  userEvent.type(element, 'a{backspace}')
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
    input[value=""] - keydown: a (97)
    input[value=""] - keypress: a (97)
    input[value="a"] - input
    input[value="a"] - keyup: a (97)
    input[value="a"] - keydown: Backspace (8)
    input[value=""] - input
    input[value=""] - keyup: Backspace (8)
  `)
})

test('{backspace}a', () => {
  const {element, getEventSnapshot} = setup('<input />')
  userEvent.type(element, '{backspace}a')
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
    input[value=""] - keydown: Backspace (8)
    input[value=""] - keyup: Backspace (8)
    input[value=""] - keydown: a (97)
    input[value=""] - keypress: a (97)
    input[value="a"] - input
    input[value="a"] - keyup: a (97)
  `)
})

test('{backspace} triggers typing the backspace character and deletes the character behind the cursor', () => {
  const {element, getEventSnapshot} = setup('<input value="yo" />')
  element.setSelectionRange(1, 1)

  userEvent.type(element, '{backspace}', {initialSelectionStart: 1})

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
    input[value="yo"] - keydown: Backspace (8)
    input[value="o"] - select
    input[value="o"] - input
    input[value="o"] - keyup: Backspace (8)
  `)
})

test('{backspace} on a readOnly input', () => {
  const {element, getEventSnapshot} = setup('<input readonly value="yo" />')
  element.setSelectionRange(1, 1)

  userEvent.type(element, '{backspace}')

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
    input[value="yo"] - keydown: Backspace (8)
    input[value="yo"] - keyup: Backspace (8)
  `)
})

test('{backspace} does not fire input if keydown prevents default', () => {
  const {element, getEventSnapshot} = setup('<input value="yo" />', {
    eventHandlers: {keyDown: e => e.preventDefault()},
  })
  element.setSelectionRange(1, 1)

  userEvent.type(element, '{backspace}')

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
    input[value="yo"] - keydown: Backspace (8)
    input[value="yo"] - keyup: Backspace (8)
  `)
})

test('{backspace} deletes the selected range', () => {
  const {element, getEventSnapshot} = setup('<input value="Hi there" />')

  userEvent.type(element, '{backspace}', {
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
    input[value="Hi there"] - keydown: Backspace (8)
    input[value="Here"] - select
    input[value="Here"] - input
    input[value="Here"] - keyup: Backspace (8)
  `)
})

test('{backspace} on an input type that does not support selection ranges', () => {
  const {element} = setup('<input type="email" value="yo@example.com" />')
  // note: you cannot even call setSelectionRange on these kinds of elements...
  userEvent.type(element, '{backspace}{backspace}a')
  // removed "m" then "o" then add "a"
  expect(element).toHaveValue('yo@example.ca')
})

test('{alt}a{/alt}', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, '{alt}a{/alt}')

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
    input[value=""] - keydown: Alt (18) {alt}
    input[value=""] - keydown: a (97) {alt}
    input[value=""] - keyup: a (97) {alt}
    input[value=""] - keyup: Alt (18)
  `)
})

test('{meta}a{/meta}', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, '{meta}a{/meta}')

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
    input[value=""] - keydown: Meta (93) {meta}
    input[value=""] - keydown: a (97) {meta}
    input[value=""] - keypress: a (97) {meta}
    input[value="a"] - input
    input[value="a"] - keyup: a (97) {meta}
    input[value="a"] - keyup: Meta (93)
  `)
})

test('{ctrl}a{/ctrl}', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, '{ctrl}a{/ctrl}')

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
    input[value=""] - keydown: Control (17) {ctrl}
    input[value=""] - keydown: a (97) {ctrl}
    input[value=""] - keyup: a (97) {ctrl}
    input[value=""] - keyup: Control (17)
  `)
})

test('{shift}a{/shift}', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, '{shift}a{/shift}')

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
    input[value=""] - keydown: Shift (16) {shift}
    input[value=""] - keydown: a (97) {shift}
    input[value=""] - keypress: a (97) {shift}
    input[value="a"] - input
    input[value="a"] - keyup: a (97) {shift}
    input[value="a"] - keyup: Shift (16)
  `)
})

test('{capslock}a{capslock}', () => {
  const {element, getEventSnapshot} = setup('<input />')

  // The old behavior to treat {/capslock} like {capslock} makes no sense
  userEvent.type(element, '{capslock}a{capslock}')

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
    input[value=""] - keydown: CapsLock (20)
    input[value=""] - keyup: CapsLock (20)
    input[value=""] - keydown: a (97)
    input[value=""] - keypress: a (97)
    input[value="a"] - input
    input[value="a"] - keyup: a (97)
    input[value="a"] - keydown: CapsLock (20)
    input[value="a"] - keyup: CapsLock (20)
  `)
})

test('a{enter}', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, 'a{enter}')

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
    input[value=""] - keydown: a (97)
    input[value=""] - keypress: a (97)
    input[value="a"] - input
    input[value="a"] - keyup: a (97)
    input[value="a"] - keydown: Enter (13)
    input[value="a"] - keypress: Enter (13)
    input[value="a"] - keyup: Enter (13)
  `)
})

test('{enter} with preventDefault keydown', () => {
  const {element, getEventSnapshot} = setup('<input />', {
    eventHandlers: {
      keyDown: e => e.preventDefault(),
    },
  })

  userEvent.type(element, '{enter}')

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
    input[value=""] - keydown: Enter (13)
    input[value=""] - keyup: Enter (13)
  `)
})

test('{enter} on a button', () => {
  const {element, getEventSnapshot} = setup('<button />')

  userEvent.type(element, '{enter}')

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
    button - keydown: Enter (13)
    button - keypress: Enter (13)
    button - click: primary
    button - keyup: Enter (13)
  `)
})

test('{enter} on a button when keydown calls prevent default', () => {
  const {element, getEventSnapshot} = setup('<button />', {
    eventHandlers: {
      keyDown: e => e.preventDefault(),
    },
  })

  userEvent.type(element, '{enter}')

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
    button - keydown: Enter (13)
    button - keyup: Enter (13)
  `)
})

test('{enter} on a button when keypress calls prevent default', () => {
  const {element, getEventSnapshot} = setup('<button />', {
    eventHandlers: {
      keyPress: e => e.preventDefault(),
    },
  })

  userEvent.type(element, '{enter}')

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
    button - keydown: Enter (13)
    button - keypress: Enter (13)
    button - keyup: Enter (13)
  `)
})

test('{space} on a button', () => {
  const {element, getEventSnapshot} = setup('<button />')

  userEvent.type(element, '{space}')

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
    button - keydown: (32)
    button - keypress: (32)
    button - keyup: (32)
    button - click: primary
  `)
})

test(`' ' on a button is the same as '{space}'`, () => {
  const {element, getEventSnapshot} = setup('<button />')

  userEvent.type(element, ' ')

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
    button - keydown: (32)
    button - keypress: (32)
    button - keyup: (32)
    button - click: primary
  `)
})

test('{space} with preventDefault keydown on button', () => {
  const {element, getEventSnapshot} = setup('<button />', {
    eventHandlers: {
      keyDown: e => e.preventDefault(),
    },
  })

  userEvent.type(element, '{space}')

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
    button - keydown: (32)
    button - keyup: (32)
  `)
})

test('{space} with preventDefault keyup on button', () => {
  const {element, getEventSnapshot} = setup('<button />', {
    eventHandlers: {
      keyUp: e => e.preventDefault(),
    },
  })

  userEvent.type(element, '{space}')

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
    button - keydown: (32)
    button - keypress: (32)
    button - keyup: (32)
  `)
})

test('{space} on an input', () => {
  const {element, getEventSnapshot} = setup(`<input value="" />`)

  userEvent.type(element, '{space}')

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
    input[value=""] - keydown: (32)
    input[value=""] - keypress: (32)
    input[value=" "] - input
    input[value=" "] - keyup: (32)
  `)
})

test('{enter} on an input type="color" fires same events as a button', () => {
  const {element, getEventSnapshot} = setup(
    `<input value="#ffffff" type="color" />`,
  )

  userEvent.type(element, '{enter}')

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
    input[value="#ffffff"] - keydown: Enter (13)
    input[value="#ffffff"] - keypress: Enter (13)
    input[value="#ffffff"] - click: primary
    input[value="#ffffff"] - keyup: Enter (13)
  `)
})

test('{space} on an input type="color" fires same events as a button', () => {
  const {element, getEventSnapshot} = setup(
    `<input value="#ffffff" type="color" />`,
  )

  userEvent.type(element, '{space}')

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
    input[value="#ffffff"] - keydown: (32)
    input[value="#ffffff"] - keypress: (32)
    input[value="#ffffff"] - keyup: (32)
    input[value="#ffffff"] - click: primary
  `)
})

test(`' ' on input type="color" is the same as '{space}'`, () => {
  const {element, getEventSnapshot} = setup(
    `<input value="#ffffff" type="color" />`,
  )

  userEvent.type(element, ' ')

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
    input[value="#ffffff"] - keydown: (32)
    input[value="#ffffff"] - keypress: (32)
    input[value="#ffffff"] - keyup: (32)
    input[value="#ffffff"] - click: primary
  `)
})

test('{enter} on a textarea', () => {
  const {element, getEventSnapshot} = setup('<textarea></textarea>')

  userEvent.type(element, '{enter}')

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
    textarea[value=""] - keydown: Enter (13)
    textarea[value=""] - keypress: Enter (13)
    textarea[value="\\n"] - input
    textarea[value="\\n"] - keyup: Enter (13)
  `)
})

test('{enter} on a textarea when keydown calls prevent default', () => {
  const {element, getEventSnapshot} = setup('<textarea></textarea>', {
    eventHandlers: {keyDown: e => e.preventDefault()},
  })

  userEvent.type(element, '{enter}')

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
    textarea[value=""] - keydown: Enter (13)
    textarea[value=""] - keyup: Enter (13)
  `)
})

test('{enter} on a textarea when keypress calls prevent default', () => {
  const {element, getEventSnapshot} = setup('<textarea></textarea>', {
    eventHandlers: {keyPress: e => e.preventDefault()},
  })

  userEvent.type(element, '{enter}')

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
    textarea[value=""] - keydown: Enter (13)
    textarea[value=""] - keypress: Enter (13)
    textarea[value=""] - keyup: Enter (13)
  `)
})

test('{meta}{enter}{/meta} on a button', () => {
  const {element, getEventSnapshot} = setup('<button />')

  userEvent.type(element, '{meta}{enter}{/meta}')

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
    button - keydown: Meta (93) {meta}
    button - keydown: Enter (13) {meta}
    button - keypress: Enter (13) {meta}
    button - click: primary {meta}
    button - keyup: Enter (13) {meta}
    button - keyup: Meta (93)
  `)
})

test('{meta}{alt}{ctrl}a{/ctrl}{/alt}{/meta}', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, '{meta}{alt}{ctrl}a{/ctrl}{/alt}{/meta}')

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
    input[value=""] - keydown: Meta (93) {meta}
    input[value=""] - keydown: Alt (18) {alt}{meta}
    input[value=""] - keydown: Control (17) {alt}{meta}{ctrl}
    input[value=""] - keydown: a (97) {alt}{meta}{ctrl}
    input[value=""] - keyup: a (97) {alt}{meta}{ctrl}
    input[value=""] - keyup: Control (17) {alt}{meta}
    input[value=""] - keyup: Alt (18) {meta}
    input[value=""] - keyup: Meta (93)
  `)
})

test('{del} at the start of the input', () => {
  const {element, getEventSnapshot} = setup(`<input value="hello" />`)

  userEvent.type(element, '{del}', {
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
    input[value="hello"] - keydown: Delete (46)
    input[value="ello"] - select
    input[value="ello"] - input
    input[value="ello"] - keyup: Delete (46)
  `)
})

test('{del} at end of the input', () => {
  const {element, getEventSnapshot} = setup(`<input value="hello" />`)

  userEvent.type(element, '{del}')

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
    input[value="hello"] - keydown: Delete (46)
    input[value="hello"] - keyup: Delete (46)
  `)
})

test('{del} in the middle of the input', () => {
  const {element, getEventSnapshot} = setup(`<input value="hello" />`)

  userEvent.type(element, '{del}', {
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
    input[value="hello"] - keydown: Delete (46)
    input[value="helo"] - select
    input[value="helo"] - input
    input[value="helo"] - keyup: Delete (46)
  `)
})

test('{del} with a selection range', () => {
  const {element, getEventSnapshot} = setup(`<input value="hello" />`)

  userEvent.type(element, '{del}', {
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
    input[value="hello"] - keydown: Delete (46)
    input[value="hlo"] - select
    input[value="hlo"] - input
    input[value="hlo"] - keyup: Delete (46)
  `)
})

// TODO: eventually we'll want to support this, but currently we cannot
// because selection ranges are (intentially) unsupported in certain input types
// per the spec.
test('{del} on an input that does not support selection range does not change the value', () => {
  const {element, eventWasFired} = setup(`<input type="email" value="a@b.c" />`)

  userEvent.type(element, '{del}')
  expect(element).toHaveValue('a@b.c')
  expect(eventWasFired('input')).not.toBe(true)
})

test('{del} does not delete if keydown is prevented', () => {
  const {element, eventWasFired} = setup(`<input value="hello" />`, {
    eventHandlers: {keyDown: e => e.preventDefault()},
  })

  userEvent.type(element, '{del}', {
    initialSelectionStart: 2,
    initialSelectionEnd: 2,
  })
  expect(element).toHaveValue('hello')
  expect(element.selectionStart).toBe(2)
  expect(element.selectionEnd).toBe(2)
  expect(eventWasFired('input')).not.toBe(true)
})

test('any remaining type modifiers are automatically released at the end', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, '{meta}{alt}{ctrl}a{/alt}')

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
    input[value=""] - keydown: Meta (93) {meta}
    input[value=""] - keydown: Alt (18) {alt}{meta}
    input[value=""] - keydown: Control (17) {alt}{meta}{ctrl}
    input[value=""] - keydown: a (97) {alt}{meta}{ctrl}
    input[value=""] - keyup: a (97) {alt}{meta}{ctrl}
    input[value=""] - keyup: Alt (18) {meta}{ctrl}
    input[value=""] - keyup: Meta (93) {ctrl}
    input[value=""] - keyup: Control (17)
  `)
})

test('modifiers will not be closed if skipAutoClose is enabled', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, '{meta}a', {skipAutoClose: true})

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
    input[value=""] - keydown: Meta (93) {meta}
    input[value=""] - keydown: a (97) {meta}
    input[value=""] - keypress: a (97) {meta}
    input[value="a"] - input
    input[value="a"] - keyup: a (97) {meta}
  `)
})
