import React from 'react'
import {render} from '@testing-library/react'
import userEvent from '../../src'

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
  const text = '{esc}'
  await userEvent.type(input, text)

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

  const text = '{backspace}'
  await userEvent.type(input, text)

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

  const text = '{backspace}'
  await userEvent.type(input, text)

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

  const text = '{backspace}'
  await userEvent.type(input, text)

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Backspace (8)
    input: "H{SELECTION}i th{/SELECTION}ere" -> "Here"
    keyup: Backspace (8)
  `)
})

test('{alt}a{/alt}', async () => {
  const {element: input, getEventCalls} = setup('input')

  const text = '{alt}a{/alt}'
  await userEvent.type(input, text)

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Alt (18) {alt}
    keydown: a (97) {alt}
    keypress: a (97) {alt}
    input: "{CURSOR}" -> "a"
    keyup: a (97)
    keyup: Alt (18)
  `)
})

test('{meta}a{/meta}', async () => {
  const {element: input, getEventCalls} = setup('input')

  const text = '{meta}a{/meta}'
  await userEvent.type(input, text)

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Meta (93) {meta}
    keydown: a (97) {meta}
    keypress: a (97) {meta}
    input: "{CURSOR}" -> "a"
    keyup: a (97)
    keyup: Meta (93)
  `)
})

test('{ctrl}a{/ctrl}', async () => {
  const {element: input, getEventCalls} = setup('input')

  const text = '{ctrl}a{/ctrl}'
  await userEvent.type(input, text)

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Control (17) {ctrl}
    keydown: a (97) {ctrl}
    keypress: a (97) {ctrl}
    input: "{CURSOR}" -> "a"
    keyup: a (97)
    keyup: Control (17)
  `)
})

test('{shift}a{/shift}', async () => {
  const {element: input, getEventCalls} = setup('input')

  const text = '{shift}a{/shift}'
  await userEvent.type(input, text)

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Shift (16) {shift}
    keydown: a (97) {shift}
    keypress: a (97) {shift}
    input: "{CURSOR}" -> "a"
    keyup: a (97)
    keyup: Shift (16)
  `)
})

test('a{enter}', async () => {
  const {element: input, getEventCalls} = setup('input')

  const text = 'a{enter}'
  await userEvent.type(input, text)

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

  const text = '{enter}'
  await userEvent.type(input, text)

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Enter (13)
    keyup: Enter (13)
  `)
})

test('{enter} on a button', async () => {
  const {element: button, getEventCalls} = setup('button')

  const text = '{enter}'
  await userEvent.type(button, text)

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Enter (13)
    keypress: Enter (13)
    click
    keyup: Enter (13)
  `)
})

test('{enter} on a textarea', async () => {
  const {element: textarea, getEventCalls} = setup('textarea')

  const text = '{enter}'
  await userEvent.type(textarea, text)

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

  const text = '{meta}{enter}{/meta}'
  await userEvent.type(button, text)

  expect(getEventCalls()).toMatchInlineSnapshot(`
    focus
    keydown: Meta (93) {meta}
    keydown: Enter (13) {meta}
    keypress: Enter (13) {meta}
    click {meta}
    keyup: Enter (13) {meta}
    keyup: Meta (93)
  `)
})

// all of the stuff below is complex magic that makes the simpler tests above work
// sorrynotsorry...

const unstringSnapshotSerializer = {
  test: val => typeof val === 'string',
  print: val => val,
}

expect.addSnapshotSerializer(unstringSnapshotSerializer)

let eventListeners = []

function addEventListener(el, type, listener, options) {
  const hijackedListener = e => {
    e.testData = {
      previousValue: e.target.previousValue,
      nextValue: e.target.value,
      selectionStart: e.target.previousSelectionStart,
      selectionEnd: e.target.previousSelectionEnd,
    }
    e.target.previousValue = e.target.value
    e.target.previousSelectionStart = e.target.selectionStart
    e.target.previousSelectionEnd = e.target.selectionEnd
    return listener(e)
  }
  eventListeners.push({el, type, listener: hijackedListener})
  el.addEventListener(type, hijackedListener, options)
}

function setup(elementType) {
  const {
    container: {firstChild: element},
  } = render(React.createElement(elementType))
  const getEventCalls = addListeners(element)
  return {element, getEventCalls}
}

function addListeners(element) {
  const generalListener = jest.fn().mockName('eventListener')
  const listeners = [
    'keydown',
    'keyup',
    'keypress',
    'input',
    'change',
    'blur',
    'focus',
    'click',
  ]

  for (const name of listeners) {
    addEventListener(element, name, generalListener)
  }
  function getEventCalls() {
    return generalListener.mock.calls
      .map(([event]) => {
        const modifiers = ['altKey', 'shiftKey', 'metaKey', 'ctrlKey']
          .filter(key => event[key])
          .map(k => `{${k.replace('Key', '')}}`)
          .join('')
        if (event.type === 'input' && event.hasOwnProperty('testData')) {
          const {
            previousValue,
            nextValue,
            selectionStart,
            selectionEnd,
          } = event.testData
          const prevVal = [
            previousValue.slice(0, selectionStart),
            ...(selectionStart === selectionEnd
              ? ['{CURSOR}']
              : [
                  '{SELECTION}',
                  previousValue.slice(selectionStart, selectionEnd),
                  '{/SELECTION}',
                ]),
            previousValue.slice(selectionEnd),
          ].join('')
          return `input: "${prevVal}" -> "${nextValue}"`
        }
        if (
          event instanceof event.target.ownerDocument.defaultView.KeyboardEvent
        ) {
          return [
            `${event.type}:`,
            event.key,
            typeof event.keyCode === 'undefined' ? null : `(${event.keyCode})`,
            modifiers,
          ]
            .join(' ')
            .trim()
        } else {
          return [event.type, modifiers].join(' ').trim()
        }
      })
      .join('\n')
  }
  return getEventCalls
}

// eslint-disable-next-line jest/prefer-hooks-on-top
afterEach(() => {
  for (const {el, type, listener} of eventListeners) {
    el.removeEventListener(type, listener)
  }
  eventListeners = []
})
