import userEvent from '#src'
import {setup} from '#testHelpers/utils'

describe('clear elements', () => {
  test('clear text input', () => {
    const {element, getEventSnapshot} = setup('<input value="hello" />')
    userEvent.clear(element)
    expect(element).toHaveValue('')
    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value=""]

      input[value="hello"] - focus
      input[value="hello"] - focusin
      input[value="hello"] - select
      input[value=""] - input
    `)
  })

  test('clear textarea', () => {
    const {element, getEventSnapshot} = setup('<textarea>hello</textarea>')
    userEvent.clear(element)
    expect(element).toHaveValue('')
    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: textarea[value=""]

      textarea[value="hello"] - focus
      textarea[value="hello"] - focusin
      textarea[value="hello"] - select
      textarea[value=""] - input
    `)
  })

  test('clear contenteditable', () => {
    const {element, getEventSnapshot} = setup(
      '<div contenteditable>hello</div>',
    )
    userEvent.clear(element)
    expect(element).toBeEmptyDOMElement()
    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: div

      div - focus
      div - focusin
      div - input
    `)
  })

  test('clear inputs that cannot (programmatically) have a selection', () => {
    const {
      elements: [email, password, number],
    } = setup(`
      <input value="a@b.c" type="email" />
      <input value="pswrd" type="password" />
      <input value="12" type="number" />
    `)
    userEvent.clear(email)
    expect(email).toHaveValue('')

    userEvent.clear(password)
    expect(password).toHaveValue('')

    userEvent.clear(number)
    expect(number).toHaveValue(null)
  })
})

describe('throw error when clear is impossible', () => {
  test('only editable elements can be cleared', () => {
    const {
      elements: [disabled, readonly, div],
    } = setup(`
      <input value="hello" disabled/>
      <input value="hello" readonly/>
      <div>hello</div>
    `)

    expect(() => userEvent.clear(disabled)).toThrowErrorMatchingInlineSnapshot(
      `clear()\` is only supported on editable elements.`,
    )
    expect(() => userEvent.clear(readonly)).toThrowErrorMatchingInlineSnapshot(
      `clear()\` is only supported on editable elements.`,
    )
    expect(() => userEvent.clear(div)).toThrowErrorMatchingInlineSnapshot(
      `clear()\` is only supported on editable elements.`,
    )
  })

  test('abort if event handler prevents element being focused', () => {
    const {element} = setup(`<input value="hello"/>`)
    element.addEventListener('focus', () => element.blur())

    expect(() => userEvent.clear(element)).toThrowErrorMatchingInlineSnapshot(
      `The element to be cleared could not be focused.`,
    )
  })

  test('abort if event handler prevents content being selected', () => {
    const {element} = setup<HTMLInputElement>(`<input value="hello"/>`)
    element.addEventListener('select', () => {
      if (element.selectionStart === 0) {
        element.selectionStart = 1
      }
    })

    expect(() => userEvent.clear(element)).toThrowErrorMatchingInlineSnapshot(
      `The element content to be cleared could not be selected.`,
    )
  })
})
