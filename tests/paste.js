import userEvent from '#src'
import {setup} from '#testHelpers/utils'

test('should paste text in input', () => {
  const {element, getEventSnapshot} = setup('<input />')

  const text = 'Hello, world!'
  userEvent.paste(element, text)
  expect(element).toHaveValue(text)
  expect(element).toHaveProperty('selectionStart', 13)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="Hello, world!"]

    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - paste
    input[value="Hello, world!"] - input
  `)
})

test('should paste text in textarea', () => {
  const {element, getEventSnapshot} = setup('<textarea />')

  const text = 'Hello, world!'
  userEvent.paste(element, text)
  expect(element).toHaveValue(text)
  expect(element).toHaveProperty('selectionStart', 13)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value="Hello, world!"]

    textarea[value=""] - focus
    textarea[value=""] - focusin
    textarea[value=""] - paste
    textarea[value="Hello, world!"] - input
  `)
})

test('does not paste when readOnly', () => {
  const {element, getEventSnapshot} = setup('<input readonly />')

  userEvent.paste(element, 'hi')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - paste
  `)
})

test('does not paste when disabled', () => {
  const {element, getEventSnapshot} = setup('<input disabled />')

  userEvent.paste(element, 'hi')
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: input[value=""]`,
  )
})

test.each(['input', 'textarea'])(
  'should paste text in <%s> up to maxLength if provided',
  type => {
    const {element} = setup(`<${type} maxlength="10" />`)

    userEvent.type(element, 'superlongtext')
    expect(element).toHaveValue('superlongt')

    element.value = ''
    userEvent.paste(element, 'superlongtext')
    expect(element).toHaveValue('superlongt')
  },
)

test.each(['input', 'textarea'])(
  'should append text in <%s> up to maxLength if provided',
  type => {
    const {element} = setup(`<${type} maxlength="10" />`)

    userEvent.type(element, 'superlong')
    userEvent.type(element, 'text')
    expect(element).toHaveValue('superlongt')

    element.value = ''
    userEvent.paste(element, 'superlongtext')
    expect(element).toHaveValue('superlongt')
  },
)

test('should replace selected text all at once', () => {
  const {element} = setup('<input value="hello world" />')

  const selectionStart = 'hello world'.search('world')
  const selectionEnd = selectionStart + 'world'.length
  element.setSelectionRange(selectionStart, selectionEnd)
  userEvent.paste(element, 'friend')
  expect(element).toHaveValue('hello friend')
})

test('should give error if we are trying to call paste on an invalid element', () => {
  const {element} = setup('<div  />')
  expect(() => userEvent.paste(element, "I'm only a div :("))
    .toThrowErrorMatchingInlineSnapshot(`
    The given DIV element is currently unsupported.
          A PR extending this implementation would be very much welcome at https://github.com/testing-library/user-event
  `)
})
