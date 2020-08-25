import userEvent from '../'
import {setup} from './helpers/utils'

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
    input[value="a"] - input
      "{CURSOR}" -> "a{CURSOR}"
    input[value="a"] - keyup: a (97)
    input[value="a"] - keydown: Backspace (8)
    input[value=""] - input
      "a{CURSOR}" -> "{CURSOR}"
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
    input[value=""] - keydown: Backspace (8)
    input[value=""] - keyup: Backspace (8)
    input[value=""] - keydown: a (97)
    input[value=""] - keypress: a (97)
    input[value="a"] - input
      "{CURSOR}" -> "a{CURSOR}"
    input[value="a"] - keyup: a (97)
  `)
})

test('{backspace} triggers typing the backspace character and deletes the character behind the cursor', () => {
  const {element, getEventSnapshot} = setup('<input value="yo" />')
  element.setSelectionRange(1, 1)

  userEvent.type(element, '{backspace}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="o"]

    input[value="yo"] - select
    input[value="yo"] - pointerover
    input[value="yo"] - pointerenter
    input[value="yo"] - mouseover: Left (0)
    input[value="yo"] - mouseenter: Left (0)
    input[value="yo"] - pointermove
    input[value="yo"] - mousemove: Left (0)
    input[value="yo"] - pointerdown
    input[value="yo"] - mousedown: Left (0)
    input[value="yo"] - focus
    input[value="yo"] - focusin
    input[value="yo"] - pointerup
    input[value="yo"] - mouseup: Left (0)
    input[value="yo"] - click: Left (0)
    input[value="yo"] - keydown: Backspace (8)
    input[value="o"] - input
      "y{CURSOR}o" -> "o{CURSOR}"
    input[value="o"] - select
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
    input[value="yo"] - mouseover: Left (0)
    input[value="yo"] - mouseenter: Left (0)
    input[value="yo"] - pointermove
    input[value="yo"] - mousemove: Left (0)
    input[value="yo"] - pointerdown
    input[value="yo"] - mousedown: Left (0)
    input[value="yo"] - focus
    input[value="yo"] - focusin
    input[value="yo"] - pointerup
    input[value="yo"] - mouseup: Left (0)
    input[value="yo"] - click: Left (0)
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
    input[value="yo"] - mouseover: Left (0)
    input[value="yo"] - mouseenter: Left (0)
    input[value="yo"] - pointermove
    input[value="yo"] - mousemove: Left (0)
    input[value="yo"] - pointerdown
    input[value="yo"] - mousedown: Left (0)
    input[value="yo"] - focus
    input[value="yo"] - focusin
    input[value="yo"] - pointerup
    input[value="yo"] - mouseup: Left (0)
    input[value="yo"] - click: Left (0)
    input[value="yo"] - keydown: Backspace (8)
    input[value="yo"] - keyup: Backspace (8)
  `)
})

test('{backspace} deletes the selected range', () => {
  const {element, getEventSnapshot} = setup('<input value="Hi there" />')
  element.setSelectionRange(1, 5)

  userEvent.type(element, '{backspace}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="Here"]

    input[value="Hi there"] - select
    input[value="Hi there"] - pointerover
    input[value="Hi there"] - pointerenter
    input[value="Hi there"] - mouseover: Left (0)
    input[value="Hi there"] - mouseenter: Left (0)
    input[value="Hi there"] - pointermove
    input[value="Hi there"] - mousemove: Left (0)
    input[value="Hi there"] - pointerdown
    input[value="Hi there"] - mousedown: Left (0)
    input[value="Hi there"] - focus
    input[value="Hi there"] - focusin
    input[value="Hi there"] - pointerup
    input[value="Hi there"] - mouseup: Left (0)
    input[value="Hi there"] - click: Left (0)
    input[value="Hi there"] - keydown: Backspace (8)
    input[value="Here"] - input
      "H{SELECTION}i th{/SELECTION}ere" -> "Here{CURSOR}"
    input[value="Here"] - select
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
    Events fired on: input[value="a"]

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
    input[value=""] - keydown: Alt (18) {alt}
    input[value=""] - keydown: a (97) {alt}
    input[value=""] - keypress: a (97) {alt}
    input[value="a"] - input
      "{CURSOR}" -> "a{CURSOR}"
    input[value="a"] - keyup: a (97) {alt}
    input[value="a"] - keyup: Alt (18)
  `)
})

test('{meta}a{/meta}', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, '{meta}a{/meta}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="a"]

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
    input[value=""] - keydown: Meta (93) {meta}
    input[value=""] - keydown: a (97) {meta}
    input[value=""] - keypress: a (97) {meta}
    input[value="a"] - input
      "{CURSOR}" -> "a{CURSOR}"
    input[value="a"] - keyup: a (97) {meta}
    input[value="a"] - keyup: Meta (93)
  `)
})

test('{ctrl}a{/ctrl}', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, '{ctrl}a{/ctrl}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="a"]

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
    input[value=""] - keydown: Control (17) {ctrl}
    input[value=""] - keydown: a (97) {ctrl}
    input[value=""] - keypress: a (97) {ctrl}
    input[value="a"] - input
      "{CURSOR}" -> "a{CURSOR}"
    input[value="a"] - keyup: a (97) {ctrl}
    input[value="a"] - keyup: Control (17)
  `)
})

test('{shift}a{/shift}', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, '{shift}a{/shift}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="a"]

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
    input[value=""] - keydown: Shift (16) {shift}
    input[value=""] - keydown: a (97) {shift}
    input[value=""] - keypress: a (97) {shift}
    input[value="a"] - input
      "{CURSOR}" -> "a{CURSOR}"
    input[value="a"] - keyup: a (97) {shift}
    input[value="a"] - keyup: Shift (16)
  `)
})

test('a{enter}', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, 'a{enter}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="a"]

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
    input[value="a"] - input
      "{CURSOR}" -> "a{CURSOR}"
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
    button - mouseover: Left (0)
    button - mouseenter: Left (0)
    button - pointermove
    button - mousemove: Left (0)
    button - pointerdown
    button - mousedown: Left (0)
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: Left (0)
    button - click: Left (0)
    button - keydown: Enter (13)
    button - keypress: Enter (13)
    button - click: Left (0)
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
    button - mouseover: Left (0)
    button - mouseenter: Left (0)
    button - pointermove
    button - mousemove: Left (0)
    button - pointerdown
    button - mousedown: Left (0)
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: Left (0)
    button - click: Left (0)
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
    button - mouseover: Left (0)
    button - mouseenter: Left (0)
    button - pointermove
    button - mousemove: Left (0)
    button - pointerdown
    button - mousedown: Left (0)
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: Left (0)
    button - click: Left (0)
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
    button - mouseover: Left (0)
    button - mouseenter: Left (0)
    button - pointermove
    button - mousemove: Left (0)
    button - pointerdown
    button - mousedown: Left (0)
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: Left (0)
    button - click: Left (0)
    button - keydown: (32)
    button - keypress: (32)
    button - keyup: (32)
    button - click: Left (0)
  `)
})

test(`' ' on a button is the same as '{space}'`, () => {
  const {element, getEventSnapshot} = setup('<button />')

  userEvent.type(element, ' ')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover: Left (0)
    button - mouseenter: Left (0)
    button - pointermove
    button - mousemove: Left (0)
    button - pointerdown
    button - mousedown: Left (0)
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: Left (0)
    button - click: Left (0)
    button - keydown: (32)
    button - keypress: (32)
    button - keyup: (32)
    button - click: Left (0)
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
    button - mouseover: Left (0)
    button - mouseenter: Left (0)
    button - pointermove
    button - mousemove: Left (0)
    button - pointerdown
    button - mousedown: Left (0)
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: Left (0)
    button - click: Left (0)
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
    button - mouseover: Left (0)
    button - mouseenter: Left (0)
    button - pointermove
    button - mousemove: Left (0)
    button - pointerdown
    button - mousedown: Left (0)
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: Left (0)
    button - click: Left (0)
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
    input[value=""] - keydown: (32)
    input[value=""] - keypress: (32)
    input[value=" "] - input
      "{CURSOR}" -> " {CURSOR}"
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
    input[value="#ffffff"] - mouseover: Left (0)
    input[value="#ffffff"] - mouseenter: Left (0)
    input[value="#ffffff"] - pointermove
    input[value="#ffffff"] - mousemove: Left (0)
    input[value="#ffffff"] - pointerdown
    input[value="#ffffff"] - mousedown: Left (0)
    input[value="#ffffff"] - focus
    input[value="#ffffff"] - focusin
    input[value="#ffffff"] - pointerup
    input[value="#ffffff"] - mouseup: Left (0)
    input[value="#ffffff"] - click: Left (0)
    input[value="#ffffff"] - keydown: Enter (13)
    input[value="#ffffff"] - keypress: Enter (13)
    input[value="#ffffff"] - click: Left (0)
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
    input[value="#ffffff"] - mouseover: Left (0)
    input[value="#ffffff"] - mouseenter: Left (0)
    input[value="#ffffff"] - pointermove
    input[value="#ffffff"] - mousemove: Left (0)
    input[value="#ffffff"] - pointerdown
    input[value="#ffffff"] - mousedown: Left (0)
    input[value="#ffffff"] - focus
    input[value="#ffffff"] - focusin
    input[value="#ffffff"] - pointerup
    input[value="#ffffff"] - mouseup: Left (0)
    input[value="#ffffff"] - click: Left (0)
    input[value="#ffffff"] - keydown: (32)
    input[value="#ffffff"] - keypress: (32)
    input[value="#ffffff"] - keyup: (32)
    input[value="#ffffff"] - click: Left (0)
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
    input[value="#ffffff"] - mouseover: Left (0)
    input[value="#ffffff"] - mouseenter: Left (0)
    input[value="#ffffff"] - pointermove
    input[value="#ffffff"] - mousemove: Left (0)
    input[value="#ffffff"] - pointerdown
    input[value="#ffffff"] - mousedown: Left (0)
    input[value="#ffffff"] - focus
    input[value="#ffffff"] - focusin
    input[value="#ffffff"] - pointerup
    input[value="#ffffff"] - mouseup: Left (0)
    input[value="#ffffff"] - click: Left (0)
    input[value="#ffffff"] - keydown: (32)
    input[value="#ffffff"] - keypress: (32)
    input[value="#ffffff"] - keyup: (32)
    input[value="#ffffff"] - click: Left (0)
  `)
})

test('{enter} on a textarea', () => {
  const {element, getEventSnapshot} = setup('<textarea></textarea>')

  userEvent.type(element, '{enter}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value="\\n"]

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
    textarea[value=""] - keydown: Enter (13)
    textarea[value=""] - keypress: Enter (13)
    textarea[value="\\n"] - input
      "{CURSOR}" -> "\\n{CURSOR}"
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
    button - mouseover: Left (0)
    button - mouseenter: Left (0)
    button - pointermove
    button - mousemove: Left (0)
    button - pointerdown
    button - mousedown: Left (0)
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: Left (0)
    button - click: Left (0)
    button - keydown: Meta (93) {meta}
    button - keydown: Enter (13) {meta}
    button - keypress: Enter (13) {meta}
    button - click: Left (0) {meta}
    button - keyup: Enter (13) {meta}
    button - keyup: Meta (93)
  `)
})

test('{meta}{alt}{ctrl}a{/ctrl}{/alt}{/meta}', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, '{meta}{alt}{ctrl}a{/ctrl}{/alt}{/meta}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="a"]

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
    input[value=""] - keydown: Meta (93) {meta}
    input[value=""] - keydown: Alt (18) {alt}{meta}
    input[value=""] - keydown: Control (17) {alt}{meta}{ctrl}
    input[value=""] - keydown: a (97) {alt}{meta}{ctrl}
    input[value=""] - keypress: a (97) {alt}{meta}{ctrl}
    input[value="a"] - input
      "{CURSOR}" -> "a{CURSOR}"
    input[value="a"] - keyup: a (97) {alt}{meta}{ctrl}
    input[value="a"] - keyup: Control (17) {alt}{meta}
    input[value="a"] - keyup: Alt (18) {meta}
    input[value="a"] - keyup: Meta (93)
  `)
})

test('{selectall} selects all the text', () => {
  const value = 'abcdefg'
  const {element, clearEventCalls, getEventSnapshot} = setup(
    `<input value="${value}" />`,
  )
  element.setSelectionRange(2, 6)

  clearEventCalls()

  userEvent.type(element, '{selectall}')

  expect(element.selectionStart).toBe(0)
  expect(element.selectionEnd).toBe(value.length)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="abcdefg"]

    input[value="abcdefg"] - pointerover
    input[value="abcdefg"] - pointerenter
    input[value="abcdefg"] - mouseover: Left (0)
    input[value="abcdefg"] - mouseenter: Left (0)
    input[value="abcdefg"] - pointermove
    input[value="abcdefg"] - mousemove: Left (0)
    input[value="abcdefg"] - pointerdown
    input[value="abcdefg"] - mousedown: Left (0)
    input[value="abcdefg"] - focus
    input[value="abcdefg"] - focusin
    input[value="abcdefg"] - pointerup
    input[value="abcdefg"] - mouseup: Left (0)
    input[value="abcdefg"] - click: Left (0)
    input[value="abcdefg"] - select
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
    input[value="hello"] - mouseover: Left (0)
    input[value="hello"] - mouseenter: Left (0)
    input[value="hello"] - pointermove
    input[value="hello"] - mousemove: Left (0)
    input[value="hello"] - pointerdown
    input[value="hello"] - mousedown: Left (0)
    input[value="hello"] - focus
    input[value="hello"] - focusin
    input[value="hello"] - pointerup
    input[value="hello"] - mouseup: Left (0)
    input[value="hello"] - click: Left (0)
    input[value="hello"] - keydown: Delete (46)
    input[value="ello"] - input
      "{CURSOR}hello" -> "ello{CURSOR}"
    input[value="ello"] - select
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
    input[value="hello"] - mouseover: Left (0)
    input[value="hello"] - mouseenter: Left (0)
    input[value="hello"] - pointermove
    input[value="hello"] - mousemove: Left (0)
    input[value="hello"] - pointerdown
    input[value="hello"] - mousedown: Left (0)
    input[value="hello"] - focus
    input[value="hello"] - focusin
    input[value="hello"] - pointerup
    input[value="hello"] - mouseup: Left (0)
    input[value="hello"] - click: Left (0)
    input[value="hello"] - select
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
    input[value="hello"] - mouseover: Left (0)
    input[value="hello"] - mouseenter: Left (0)
    input[value="hello"] - pointermove
    input[value="hello"] - mousemove: Left (0)
    input[value="hello"] - pointerdown
    input[value="hello"] - mousedown: Left (0)
    input[value="hello"] - focus
    input[value="hello"] - focusin
    input[value="hello"] - pointerup
    input[value="hello"] - mouseup: Left (0)
    input[value="hello"] - click: Left (0)
    input[value="hello"] - select
    input[value="hello"] - keydown: Delete (46)
    input[value="helo"] - input
      "he{CURSOR}llo" -> "helo{CURSOR}"
    input[value="helo"] - select
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
    input[value="hello"] - mouseover: Left (0)
    input[value="hello"] - mouseenter: Left (0)
    input[value="hello"] - pointermove
    input[value="hello"] - mousemove: Left (0)
    input[value="hello"] - pointerdown
    input[value="hello"] - mousedown: Left (0)
    input[value="hello"] - focus
    input[value="hello"] - focusin
    input[value="hello"] - pointerup
    input[value="hello"] - mouseup: Left (0)
    input[value="hello"] - click: Left (0)
    input[value="hello"] - select
    input[value="hello"] - keydown: Delete (46)
    input[value="hlo"] - input
      "h{SELECTION}el{/SELECTION}lo" -> "hlo{CURSOR}"
    input[value="hlo"] - select
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
    Events fired on: input[value="a"]

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
    input[value=""] - keydown: Meta (93) {meta}
    input[value=""] - keydown: Alt (18) {alt}{meta}
    input[value=""] - keydown: Control (17) {alt}{meta}{ctrl}
    input[value=""] - keydown: a (97) {alt}{meta}{ctrl}
    input[value=""] - keypress: a (97) {alt}{meta}{ctrl}
    input[value="a"] - input
      "{CURSOR}" -> "a{CURSOR}"
    input[value="a"] - keyup: a (97) {alt}{meta}{ctrl}
    input[value="a"] - keyup: Alt (18) {meta}{ctrl}
    input[value="a"] - keyup: Meta (93) {ctrl}
    input[value="a"] - keyup: Control (17)
  `)
})

test('modifiers will not be closed if skipAutoClose is enabled', () => {
  const {element, getEventSnapshot} = setup('<input />')

  userEvent.type(element, '{meta}a', {skipAutoClose: true})

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="a"]

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
    input[value=""] - keydown: Meta (93) {meta}
    input[value=""] - keydown: a (97) {meta}
    input[value=""] - keypress: a (97) {meta}
    input[value="a"] - input
      "{CURSOR}" -> "a{CURSOR}"
    input[value="a"] - keyup: a (97) {meta}
  `)
})
