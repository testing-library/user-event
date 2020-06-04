import userEvent from '..'
import {setup, addEventListener} from './helpers/utils'

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

test('{esc} triggers typing the escape character', async () => {
  const {element: input, getEventCalls} = setup('input')

  await userEvent.type(input, '{esc}')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Escape (27)
    keyup: Escape (27)
  `)
})

test('{backspace} triggers typing the backspace character and deletes the character behind the cursor', async () => {
  const {element: input, getEventCalls} = setup('input')
  input.value = 'yo'
  input.setSelectionRange(1, 1)

  await userEvent.type(input, '{backspace}')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Backspace (8)
    input: "y{CURSOR}o" -> "o"
    keyup: Backspace (8)
  `)
})

test('{backspace} on a readOnly input', async () => {
  const {element: input, getEventCalls} = setup('input')
  input.readOnly = true
  input.value = 'yo'
  input.setSelectionRange(1, 1)

  await userEvent.type(input, '{backspace}')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Backspace (8)
    keyup: Backspace (8)
  `)
})

test('{backspace} deletes the selected range', async () => {
  const {element: input, getEventCalls} = setup('input')
  input.value = 'Hi there'
  input.setSelectionRange(1, 5)

  await userEvent.type(input, '{backspace}')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Backspace (8)
    input: "H{SELECTION}i th{/SELECTION}ere" -> "Here"
    keyup: Backspace (8)
  `)
})

test('{alt}a{/alt}', async () => {
  const {element: input, getEventCalls} = setup('input')

  await userEvent.type(input, '{alt}a{/alt}')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Alt (18) {alt}
    keydown: a (97) {alt}
    keypress: a (97) {alt}
    input: "{CURSOR}" -> "a"
    keyup: a (97) {alt}
    keyup: Alt (18)
  `)
})

test('{meta}a{/meta}', async () => {
  const {element: input, getEventCalls} = setup('input')

  await userEvent.type(input, '{meta}a{/meta}')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Meta (93) {meta}
    keydown: a (97) {meta}
    keypress: a (97) {meta}
    input: "{CURSOR}" -> "a"
    keyup: a (97) {meta}
    keyup: Meta (93)
  `)
})

test('{ctrl}a{/ctrl}', async () => {
  const {element: input, getEventCalls} = setup('input')

  await userEvent.type(input, '{ctrl}a{/ctrl}')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Control (17) {ctrl}
    keydown: a (97) {ctrl}
    keypress: a (97) {ctrl}
    input: "{CURSOR}" -> "a"
    keyup: a (97) {ctrl}
    keyup: Control (17)
  `)
})

test('{shift}a{/shift}', async () => {
  const {element: input, getEventCalls} = setup('input')

  await userEvent.type(input, '{shift}a{/shift}')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Shift (16) {shift}
    keydown: a (97) {shift}
    keypress: a (97) {shift}
    input: "{CURSOR}" -> "a"
    keyup: a (97) {shift}
    keyup: Shift (16)
  `)
})

test('a{enter}', async () => {
  const {element: input, getEventCalls} = setup('input')

  await userEvent.type(input, 'a{enter}')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: a (97)
    keypress: a (97)
    input: "{CURSOR}" -> "a"
    keyup: a (97)
    keydown: Enter (13)
    keypress: Enter (13)
    keyup: Enter (13)
  `)
})

test('{enter} with preventDefault keydown', async () => {
  const {element: input, getEventCalls} = setup('input')
  addEventListener(input, 'keydown', e => e.preventDefault())

  await userEvent.type(input, '{enter}')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Enter (13)
    keyup: Enter (13)
  `)
})

test('{enter} on a button', async () => {
  const {element: button, getEventCalls} = setup('button')

  await userEvent.type(button, '{enter}')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Enter (13)
    keypress: Enter (13)
    click: Left (0)
    keyup: Enter (13)
  `)
})

test('{enter} on a textarea', async () => {
  const {element: textarea, getEventCalls} = setup('textarea')

  await userEvent.type(textarea, '{enter}')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Enter (13)
    keypress: Enter (13)
    input: "{CURSOR}" -> "
    "
    keyup: Enter (13)
  `)
})

test('{meta}{enter}{/meta} on a button', async () => {
  const {element: button, getEventCalls} = setup('button')

  await userEvent.type(button, '{meta}{enter}{/meta}')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Meta (93) {meta}
    keydown: Enter (13) {meta}
    keypress: Enter (13) {meta}
    click: Left (0) {meta}
    keyup: Enter (13) {meta}
    keyup: Meta (93)
  `)
})

test('{meta}{alt}{ctrl}a{/ctrl}{/alt}{/meta}', async () => {
  const {element: input, getEventCalls} = setup('input')

  await userEvent.type(input, '{meta}{alt}{ctrl}a{/ctrl}{/alt}{/meta}')

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Meta (93) {meta}
    keydown: Alt (18) {alt}{meta}
    keydown: Control (17) {alt}{meta}{ctrl}
    keydown: a (97) {alt}{meta}{ctrl}
    keypress: a (97) {alt}{meta}{ctrl}
    input: "{CURSOR}" -> "a"
    keyup: a (97) {alt}{meta}{ctrl}
    keyup: Control (17) {alt}{meta}
    keyup: Alt (18) {meta}
    keyup: Meta (93)
  `)
})
