import {setUISelectionClean} from '#src/document/UI'
import {setup} from '#testHelpers'

describe('clear elements', () => {
  test('clear text input', async () => {
    const {element, getEventSnapshot, user} = setup('<input value="hello" />', {
      focus: false,
    })
    await user.clear(element)
    expect(element).toHaveValue('')
    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value=""]

      input[value="hello"] - focus
      input[value="hello"] - focusin
      input[value="hello"] - select
      input[value="hello"] - beforeinput
      input[value=""] - input
    `)
  })

  test('clear textarea', async () => {
    const {element, getEventSnapshot, user} = setup(
      '<textarea>hello</textarea>',
      {focus: false},
    )
    await user.clear(element)
    expect(element).toHaveValue('')
    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: textarea[value=""]

      textarea[value="hello"] - focus
      textarea[value="hello"] - focusin
      textarea[value="hello"] - select
      textarea[value="hello"] - beforeinput
      textarea[value=""] - input
    `)
  })

  test('clear contenteditable', async () => {
    const {element, getEventSnapshot, user} = setup(
      '<div contenteditable>hello</div>',
      {focus: false},
    )
    await user.clear(element)
    expect(element).toBeEmptyDOMElement()
    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: div

      div - focus
      div - focusin
      div - beforeinput
      div - input
    `)
  })

  test('clear inputs that cannot (programmatically) have a selection', async () => {
    const {
      elements: [email, password, number],
      user,
    } = setup(`
      <input value="a@b.c" type="email" />
      <input value="pswrd" type="password" />
      <input value="12" type="number" />
    `)
    await user.clear(email)
    expect(email).toHaveValue('')

    await user.clear(password)
    expect(password).toHaveValue('')

    await user.clear(number)
    expect(number).toHaveValue(null)
  })
})

describe('throw error when clear is impossible', () => {
  test('only editable elements can be cleared', async () => {
    const {
      elements: [disabled, readonly, div],
      user,
    } = setup(`
      <input value="hello" disabled/>
      <input value="hello" readonly/>
      <div>hello</div>
    `)

    await expect(
      user.clear(disabled),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `clear()\` is only supported on editable elements.`,
    )
    await expect(
      user.clear(readonly),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `clear()\` is only supported on editable elements.`,
    )
    await expect(user.clear(div)).rejects.toThrowErrorMatchingInlineSnapshot(
      `clear()\` is only supported on editable elements.`,
    )
  })

  test('abort if event handler prevents element being focused', async () => {
    const {element, user} = setup(`<input value="hello"/>`, {focus: false})
    element.addEventListener('focus', async () => element.blur())

    await expect(
      user.clear(element),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `The element to be cleared could not be focused.`,
    )
  })

  test('abort if selecting content is prevented', async () => {
    const {element, user} = setup<HTMLInputElement>(`<input value="hello"/>`)
    // In some environments a `select` event handler can reset the selection before we can clear the input.
    // In browser the `.clear()` API is done before the event is dispatched.
    Object.defineProperty(element, 'setSelectionRange', {
      configurable: true,
      value(start: number, end: number) {
        ;(
          Object.getPrototypeOf(element) as HTMLInputElement
        ).setSelectionRange.call(this, 1, end)
        setUISelectionClean(element)
      },
    })

    await expect(
      user.clear(element),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `The element content to be cleared could not be selected.`,
    )
  })
})
