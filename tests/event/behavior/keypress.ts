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
      config.system.keyboard.modifiers.Shift = true
    }

    dispatchUIEvent(config, element, 'keypress', {
      key: 'Enter',
      shiftKey,
    })

    expect(getEvents('input')).toHaveLength(1)
    expect(getEvents('input')[0]).toHaveProperty('inputType', inputType)
    if (expectedValue !== undefined) {
      expect(element).toHaveValue(expectedValue)
    }
    if (expectedHtml !== undefined) {
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

cases(
  'trigger click for [Enter]',
  ({html, hasClick = true}) => {
    const {element, eventWasFired, getEvents} = render(html)

    dispatchUIEvent(createConfig(), element, 'keypress', {key: 'Enter'})

    expect(eventWasFired('click')).toBe(hasClick)
    if (hasClick) {
      expect(getEvents('click')[0]).toHaveProperty('detail', 0)
    }
  },
  {
    'on link': {
      html: `<a href="example.com" target="__blank"/>`,
    },
    'on button': {
      html: `<button/>`,
    },
    'on color input': {
      html: `<input type="color" />`,
    },
    'omit on radio button': {
      html: `<input type="radio"/>`,
      hasClick: false,
    },
    'omit on checkbox': {
      html: `<input type="checkbox"/>`,
      hasClick: false,
    },
  },
)

cases(
  'submit form on [Enter]',
  async ({html, click, submit}) => {
    const {eventWasFired, xpathNode} = render(html, {focus: 'form/*[2]'})

    dispatchUIEvent(createConfig(), xpathNode('form/*[2]'), 'keypress', {
      key: 'Enter',
    })

    expect(eventWasFired('click')).toBe(click)
    expect(eventWasFired('submit')).toBe(submit)
  },
  {
    'with `<input type="submit"/>`': {
      html: `<form><input/><input/><input type="submit"/></form>`,
      click: true,
      submit: true,
    },
    'with `<button/>`': {
      html: `<form><input/><input/><button/></form>`,
      click: true,
      submit: true,
    },
    'with `<button type="submit"/>`': {
      html: `<form><input/><input/><button type="submit"/></form>`,
      click: true,
      submit: true,
    },
    'with `<button type="button"/>`': {
      html: `<form><input/><input/><button type="button"/></form>`,
      click: false,
      submit: false,
    },
    'on checkbox': {
      html: `<form><input/><input type="checkbox"/><button type="submit"/></form>`,
      click: true,
      submit: true,
    },
    'on radio': {
      html: `<form><input/><input type="radio"/><button type="submit"/></form>`,
      click: true,
      submit: true,
    },
    'with single input': {
      html: `<form><div></div><input/></form>`,
      click: false,
      submit: true,
    },
    'without submit button': {
      html: `<form><input/><input/></form>`,
      click: false,
      submit: false,
    },
    'on radio/checkbox without submit button': {
      html: `<form><input/><input type="radio"/></form>`,
      click: false,
      submit: false,
    },
  },
)
