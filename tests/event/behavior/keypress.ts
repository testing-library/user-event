import cases from 'jest-in-case'
import {dispatchUIEvent} from '#src/event'
import {createConfig} from '#src/setup/setup'
import {render} from '#testHelpers'

test('trigger input event for character key', () => {
  const {element, getEvents} = render<HTMLInputElement>(`<input/>`)

  dispatchUIEvent(createConfig(), element, 'keypress', {key: 'x'})

  expect(getEvents('input')).toHaveLength(1)
  expect(getEvents('input')[0]).toHaveProperty('data', 'x')
  expect(getEvents('input')[0]).toHaveProperty('inputType', 'insertText')
  expect(element).toHaveValue('x')
})

test('do not trigger input event outside of editable context', () => {
  const {element, eventWasFired} = render(`<div></div>`)

  dispatchUIEvent(createConfig(), element, 'keypress', {key: 'x'})

  expect(eventWasFired('beforeinput')).toBe(false)
  expect(eventWasFired('input')).toBe(false)
})

cases(
  'for [Enter]',
  ({html, shiftKey, inputType, expectedValue, expectedHtml}) => {
    const {element, getEvents} = render<HTMLTextAreaElement>(html, {
      selection: {focusOffset: 0},
    })

    const config = createConfig()
    if (shiftKey) {
      config.keyboardState.modifiers.Shift = true
    }

    dispatchUIEvent(config, element, 'keypress', {
      key: 'Enter',
      shiftKey,
    })

    expect(getEvents('input')).toHaveLength(1)
    expect(getEvents('input')[0]).toHaveProperty('inputType', inputType)
    if (expectedValue !== undefined) {
      expect(element).toHaveValue(expectedValue)
    } else if (expectedHtml !== undefined) {
      expect(element).toHaveProperty('innerHTML', expectedHtml)
    }
  },
  {
    'trigger insertLineBreak on textarea': {
      html: `<textarea></textarea>`,
      inputType: 'insertLineBreak',
      expectedValue: '\n',
    },
    'trigger insertLineBreak with shiftKey=true on textarea': {
      html: `<textarea></textarea>`,
      shiftKey: true,
      inputType: 'insertLineBreak',
      expectedValue: '\n',
    },
    'trigger insertParagraph on contenteditable': {
      html: `<div contenteditable></div>`,
      inputType: 'insertParagraph',
      expectedHtml: '\n',
    },
    'with shiftKey=true trigger insertLineBreak on contenteditable': {
      html: `<div contenteditable></div>`,
      shiftKey: true,
      inputType: 'insertLineBreak',
      expectedHtml: '\n',
    },
  },
)

test('trigger input event for [Enter] on textarea', () => {
  const {element, getEvents} = render<HTMLTextAreaElement>(
    `<textarea></textarea>`,
  )

  dispatchUIEvent(createConfig(), element, 'keypress', {key: 'x'})

  expect(getEvents('input')).toHaveLength(1)
  expect(getEvents('input')[0]).toHaveProperty('data', 'x')
  expect(getEvents('input')[0]).toHaveProperty('inputType', 'insertText')
  expect(element).toHaveValue('x')
})
