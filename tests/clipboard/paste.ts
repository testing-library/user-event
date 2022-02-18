import userEvent from '#src'
import {render, setup} from '#testHelpers'

test('paste with empty clipboard', async () => {
  const {element, getEvents, user} = setup(`<input/>`)
  element.focus()

  await element.ownerDocument.defaultView?.navigator.clipboard.write([])

  await user.paste()

  expect(getEvents('paste')).toHaveLength(1)
  expect(getEvents('input')).toHaveLength(0)
})

test.each([
  [
    `<input/>`,
    `
    Events fired on: input[value="Hello, world!"]

    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - paste
    input[value=""] - beforeinput
    input[value="Hello, world!"] - input
  `,
  ],
  [
    `<textarea/>`,
    `
    Events fired on: textarea[value="Hello, world!"]

    textarea[value=""] - focus
    textarea[value=""] - focusin
    textarea[value=""] - paste
    textarea[value=""] - beforeinput
    textarea[value="Hello, world!"] - input
  `,
  ],
])('should paste text in %s', async (html, events) => {
  const {element, getEventSnapshot, user} = setup(html)
  element.focus()

  const text = 'Hello, world!'
  await element.ownerDocument.defaultView?.navigator.clipboard.writeText(text)

  await user.paste()

  expect(element).toHaveValue(text)
  expect(element).toHaveProperty('selectionStart', 13)
  expect(getEventSnapshot()).toMatchInlineSnapshot(events)
})

test('does not paste when readOnly', async () => {
  const {element, getEventSnapshot, user} = setup('<input readonly />')
  element.focus()

  await user.paste('hi')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - paste
  `)
})

test('does not paste when disabled', async () => {
  const {element, getEventSnapshot, user} = setup('<input disabled />')
  element.focus()

  await user.paste('hi')
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: input[value=""]`,
  )
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
  )

  const selectionStart = 'hello world'.search('world')
  const selectionEnd = selectionStart + 'world'.length
  element.focus()
  element.setSelectionRange(selectionStart, selectionEnd)
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
    const {element, getEvents} = render(`<input/>`)
    element.focus()

    await expect(userEvent.paste()).rejects.toMatchInlineSnapshot(
      `[Error: \`userEvent.paste()\` without \`clipboardData\` requires the \`ClipboardAPI\` to be available.]`,
    )
    expect(getEvents('paste')).toHaveLength(0)
  })
})
