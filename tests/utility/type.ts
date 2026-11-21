import {setup} from '#testHelpers'

test('type into input', async () => {
  const {element, getEventSnapshot, user} = setup('<input value="foo"/>', {
    focus: false,
  })

  await user.type(element, 'bar')

  expect(element).toHaveValue('foobar')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="foobar"]

    input[value="foo"] - pointerover
    input[value="foo"] - pointerenter
    input[value="foo"] - mouseover
    input[value="foo"] - mouseenter
    input[value="foo"] - pointermove
    input[value="foo"] - mousemove
    input[value="foo"] - pointerdown
    input[value="foo"] - mousedown: primary
    input[value="foo"] - focus: ← null
    input[value="foo"] - focusin: ← null
    input[value="foo"] - pointerup
    input[value="foo"] - mouseup: primary
    input[value="foo"] - click: primary
    input[value="foo"] - keydown: b
    input[value="foo"] - keypress: b
    input[value="foo"] - beforeinput
    input[value="foob"] - input
    input[value="foob"] - keyup: b
    input[value="foob"] - keydown: a
    input[value="foob"] - keypress: a
    input[value="foob"] - beforeinput
    input[value="fooba"] - input
    input[value="fooba"] - keyup: a
    input[value="fooba"] - keydown: r
    input[value="fooba"] - keypress: r
    input[value="fooba"] - beforeinput
    input[value="foobar"] - input
    input[value="foobar"] - keyup: r
  `)
})

test('can skip the initial click', async () => {
  const {element, getEvents, user} = setup('<input value="foo"/>')

  await user.type(element, 'bar', {skipClick: true})

  expect(getEvents('click')).toHaveLength(0)
  expect(element).toHaveValue('barfoo')
})

test('type with initialSelection', async () => {
  const {element, user} = setup<HTMLTextAreaElement>(
    '<textarea>Hello World</textarea>',
  )

  await user.type(element, 'Frien', {
    initialSelectionStart: 6,
    initialSelectionEnd: 10,
  })

  expect(element).toHaveValue('Hello Friend')
})

describe('automatically release pressed keys', () => {
  test('release keys', async () => {
    const {element, getEvents, user} = setup('<input />')

    await user.type(element, '{meta>}{alt>}{control>}a{/alt}')

    expect(getEvents('keyup')).toHaveLength(4)
  })

  test('skipAutoClose', async () => {
    const {element, getEvents, user} = setup('<input />')

    await user.type(element, '{meta>}a', {skipAutoClose: true})

    expect(getEvents('keyup')).toHaveLength(1)
  })
})

test('do nothing on disabled element', async () => {
  const {element, getEvents, user} = setup('<input disabled/>')

  await user.type(element, 'foo')

  expect(getEvents()).toHaveLength(0)
})

test('type into textarea in shadow DOM after value is reset', async () => {
  const {element: host, user} = setup('<div></div>')
  const element = host
    .attachShadow({mode: 'open'})
    .appendChild(document.createElement('textarea'))

  await user.type(element, 'hello')
  expect(element).toHaveValue('hello')

  element.value = ''

  await user.type(element, 'world')
  expect(element).toHaveValue('world')
})

test.each(['{Backspace}', '{Delete}'])(
  'does not edit siblings when pressing %s in an empty contenteditable',
  async key => {
    const {element, getEvents, user} = setup(
      '<div><span>before</span><div contenteditable></div><span>after</span></div>',
      {focus: false},
    )
    const editor = element.querySelector('[contenteditable]')!

    await user.type(editor, key)

    expect(editor).toHaveFocus()
    expect({
      html: element.innerHTML,
      inputCount: getEvents('input').length,
    }).toEqual({
      html: '<span>before</span><div contenteditable=""></div><span>after</span>',
      inputCount: 0,
    })
  },
)

test.each([
  ['Backspace', 'true', '', 'befor', 'after', 1],
  ['Delete', 'true', '', 'before', 'fter', 1],
  ['Backspace', 'true', 'false', 'before', 'after', 0],
  ['Delete', 'true', 'FALSE', 'before', 'after', 0],
  ['Backspace', 'plaintext-only', '', 'befor', 'after', 1],
  ['Delete', 'plaintext-only', '', 'before', 'fter', 1],
] as const)(
  'keeps %s in the editing region of a nested editor (outer=%s, boundary=%s)',
  async (
    key,
    outerMode,
    boundaryMode,
    expectedLeft,
    expectedRight,
    inputCount,
  ) => {
    const boundary = boundaryMode ? ` contenteditable="${boundaryMode}"` : ''
    const {element, getEvents, user} = setup(
      `<div contenteditable="${outerMode}"><div${boundary}><span>before</span><span id="editor" contenteditable tabindex="0"></span><span>after</span></div></div>`,
      {focus: './/span[@id="editor"]', selection: {focusOffset: 0}},
    )
    const [left, editor, right] = Array.from(
      element.firstElementChild!.children,
    )

    await user.type(editor, `{${key}}`, {skipClick: true})

    expect(editor).toHaveFocus()
    expect({
      left: left.textContent,
      inner: editor.textContent,
      right: right.textContent,
      inputs: getEvents('input').length,
    }).toEqual({
      left: expectedLeft,
      inner: '',
      right: expectedRight,
      inputs: inputCount,
    })
  },
)

test.each([
  ['.80', ['', '.8', '.80']],
  ['1.50', ['1', '1', '1.5', '1.50']],
  ['007', ['0', '00', '007']],
  ['-0', ['', '-0']],
  ['-.5', ['', '', '-.5']],
  ['1e3', ['1', '', '1e3']],
] as const)(
  'keep the typed string in `<input type="number"/>`: %s',
  async (text, expectedValues) => {
    const values: string[] = []
    const {element, user} = setup<HTMLInputElement>(`<input type="number"/>`, {
      eventHandlers: {
        input: e => {
          values.push((e.target as HTMLInputElement).value)
        },
      },
    })

    await user.type(element, text)

    // `value` at each `input` event
    expect(values).toEqual(expectedValues)
    expect(element.value).toBe(text)
  },
)
