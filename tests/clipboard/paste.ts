import type {ShadowInput} from '../_helpers/shadow-input'
import {defineShadowInputCustomElementIfNotDefined} from '../_helpers/shadow-input'
import userEvent from '#src'
import {render, setup} from '#testHelpers'
import {createDataTransfer} from '#src/utils'

test('paste with empty clipboard', async () => {
  const {element, getEvents, user} = setup(`<input/>`)
  await element.ownerDocument.defaultView?.navigator.clipboard.write([])

  await user.paste()

  expect(getEvents('paste')).toHaveLength(1)
  expect(getEvents('input')).toHaveLength(0)
})

test('do not trigger input for paste with file data', async () => {
  const {getEvents, user} = setup(`<input/>`)

  const f0 = new File(['bar'], 'bar0.txt', {type: 'text/plain'})
  const dt = createDataTransfer(window, [f0])
  await user.paste(dt)

  expect(getEvents('paste')).toHaveLength(1)
  expect(getEvents('input')).toHaveLength(0)
})

test.each([
  [
    `<input/>`,
    `
    Events fired on: input[value="Hello, world!"]

    input[value=""] - paste
    input[value=""] - beforeinput
    input[value="Hello, world!"] - input
  `,
  ],
  [
    `<textarea/>`,
    `
    Events fired on: textarea[value="Hello, world!"]

    textarea[value=""] - paste
    textarea[value=""] - beforeinput
    textarea[value="Hello, world!"] - input
  `,
  ],
])('should paste text in %s', async (html, events) => {
  const {element, getEventSnapshot, user} = setup(html)

  const text = 'Hello, world!'
  await element.ownerDocument.defaultView?.navigator.clipboard.writeText(text)

  await user.paste()

  expect(element).toHaveValue(text)
  expect(element).toHaveProperty('selectionStart', 13)
  expect(getEventSnapshot()).toMatchInlineSnapshot(events)
})

test('does not paste when readOnly', async () => {
  const {getEventSnapshot, user} = setup('<input readonly />')

  await user.paste('hi')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - paste
  `)
})

test('does not paste when disabled', async () => {
  const {getEventSnapshot, user} = setup('<input disabled />')

  await user.paste('hi')
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: input[value=""]`,
  )
})

test('prevent input per paste event handler', async () => {
  const {element, eventWasFired, user} = setup(`<input />`)
  element.addEventListener('paste', e => e.preventDefault())

  await user.paste('hi')
  expect(eventWasFired('paste')).toBe(true)
  expect(eventWasFired('input')).toBe(false)
})

test.each(['input', 'textarea'])(
  'should paste text in <%s> up to maxLength if provided',
  async type => {
    const {element, user} = setup<HTMLInputElement | HTMLTextAreaElement>(
      `<${type} maxlength="10" />`,
    )

    await user.type(element, 'superlongtext')
    expect(element).toHaveValue('superlongt')

    element.value = ''
    await user.paste('superlongtext')
    expect(element).toHaveValue('superlongt')
  },
)

test.each(['input', 'textarea'])(
  'should append text in <%s> up to maxLength if provided',
  async type => {
    const {element, user} = setup<HTMLInputElement | HTMLTextAreaElement>(
      `<${type} maxlength="10" />`,
    )

    await user.type(element, 'superlong')
    await user.type(element, 'text')
    expect(element).toHaveValue('superlongt')

    element.value = ''
    await user.paste('superlongtext')
    expect(element).toHaveValue('superlongt')
  },
)

test('should replace selected text all at once', async () => {
  const {element, user} = setup<HTMLInputElement>(
    '<input value="hello world" />',
    {
      selection: {anchorOffset: 6, focusOffset: 11},
    },
  )

  await user.paste('friend')

  expect(element).toHaveValue('hello friend')
})

describe('without Clipboard API', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    })
  })

  test('reject if trying to use missing API', async () => {
    const {getEvents} = render(`<input/>`)

    await expect(userEvent.paste()).rejects.toThrowErrorMatchingInlineSnapshot(
      `\`userEvent.paste()\` without \`clipboardData\` requires the \`ClipboardAPI\` to be available.`,
    )
    expect(getEvents()).toHaveLength(0)
  })
})

describe('on shadow DOM', () => {
  test('paste into an input element', async () => {
    defineShadowInputCustomElementIfNotDefined()
    const {element, user} = setup<ShadowInput>('<shadow-input></shadow-input>')

    await user.paste('test')

    expect(element.value).toEqual('test')
  })
})
