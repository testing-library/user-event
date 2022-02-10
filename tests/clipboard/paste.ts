import userEvent from '#src'
import {setup} from '#testHelpers'

test('should paste text in input', async () => {
  const {element, getEventSnapshot} = setup('<input />')
  element.focus()

  const text = 'Hello, world!'
  await userEvent.paste(text)
  expect(element).toHaveValue(text)
  expect(element).toHaveProperty('selectionStart', 13)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="Hello, world!"]

    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - paste
    input[value=""] - beforeinput
    input[value="Hello, world!"] - input
  `)
})

test('should paste text in textarea', async () => {
  const {element, getEventSnapshot} = setup('<textarea />')
  element.focus()

  const text = 'Hello, world!'
  await userEvent.paste(text)
  expect(element).toHaveValue(text)
  expect(element).toHaveProperty('selectionStart', 13)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value="Hello, world!"]

    textarea[value=""] - focus
    textarea[value=""] - focusin
    textarea[value=""] - paste
    textarea[value=""] - beforeinput
    textarea[value="Hello, world!"] - input
  `)
})

test('does not paste when readOnly', async () => {
  const {element, getEventSnapshot} = setup('<input readonly />')
  element.focus()

  await userEvent.paste('hi')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - paste
  `)
})

test('does not paste when disabled', async () => {
  const {element, getEventSnapshot} = setup('<input disabled />')
  element.focus()

  await userEvent.paste('hi')
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: input[value=""]`,
  )
})

test.each(['input', 'textarea'])(
  'should paste text in <%s> up to maxLength if provided',
  async type => {
    const {element} = setup<HTMLInputElement | HTMLTextAreaElement>(
      `<${type} maxlength="10" />`,
    )

    await userEvent.type(element, 'superlongtext')
    expect(element).toHaveValue('superlongt')

    element.value = ''
    await userEvent.paste('superlongtext')
    expect(element).toHaveValue('superlongt')
  },
)

test.each(['input', 'textarea'])(
  'should append text in <%s> up to maxLength if provided',
  async type => {
    const {element} = setup<HTMLInputElement | HTMLTextAreaElement>(
      `<${type} maxlength="10" />`,
    )

    await userEvent.type(element, 'superlong')
    await userEvent.type(element, 'text')
    expect(element).toHaveValue('superlongt')

    element.value = ''
    await userEvent.paste('superlongtext')
    expect(element).toHaveValue('superlongt')
  },
)

test('should replace selected text all at once', async () => {
  const {element} = setup<HTMLInputElement>('<input value="hello world" />')

  const selectionStart = 'hello world'.search('world')
  const selectionEnd = selectionStart + 'world'.length
  element.focus()
  element.setSelectionRange(selectionStart, selectionEnd)
  await userEvent.paste('friend')
  expect(element).toHaveValue('hello friend')
})

describe('paste from clipboard', () => {
  test('without clipboard API', async () => {
    const {element, getEvents} = setup(`<input/>`)
    element.focus()

    await expect(userEvent.paste()).rejects.toMatchInlineSnapshot(
      `[Error: \`userEvent.paste()\` without \`clipboardData\` requires the \`ClipboardAPI\` to be available.]`,
    )
    expect(getEvents('paste')).toHaveLength(0)
  })

  test('with empty clipboard', async () => {
    const {element, getEvents} = setup(`<input/>`)
    element.focus()

    await userEvent.setup().paste()
    expect(getEvents('paste')).toHaveLength(1)
    expect(getEvents('input')).toHaveLength(0)
  })

  test('with text in clipboard', async () => {
    const {element, getEvents} = setup(`<input/>`)
    element.focus()

    userEvent.setup()

    element.ownerDocument.defaultView?.navigator.clipboard.writeText('foo')
    await userEvent.paste()
    expect(getEvents('paste')).toHaveLength(1)
    expect(getEvents('input')).toHaveLength(1)
    expect(element).toHaveValue('foo')
  })
})
