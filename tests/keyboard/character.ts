import cases from 'jest-in-case'
import {getUIValue} from '#src/document/value'
import {setup} from '#testHelpers'

test('type character into input', async () => {
  const {element, user} = setup<HTMLInputElement>(`<input value="aXd"/>`)
  element.focus()
  element.selectionStart = 1
  element.selectionEnd = 2

  await user.keyboard('bc')

  expect(element).toHaveValue('abcd')
})

test('overwrite input with same value', async () => {
  const {element, user} = setup<HTMLInputElement>(`<input value="1"/>`)
  element.select()
  element.focus()

  await user.keyboard('11123')

  expect(element).toHaveValue('11123')
})

test('edit `<input type="date"/>`', async () => {
  const {element, user} = setup('<input type="date" />')
  element.focus()

  await user.keyboard('2020-06-29')

  expect(element).toHaveValue('2020-06-29')
})

cases(
  'edit `<input type="time"/>`',
  async ({input, value}) => {
    const {element, user} = setup('<input type="time" />')
    element.focus()

    await user.keyboard(input)

    expect(element).toHaveValue(value)
  },
  {
    'type time': {input: '01:05', value: '01:05'},
    'type time without `:`': {input: '0105', value: '01:05'},
    'correct values out of range': {input: '23:90', value: '23:59'},
    'overflow digit': {input: '9:25', value: '09:25'},
    'overflow hours': {input: '24:52', value: '23:52'},
    'ignore invalid characters': {input: '1a6bc36abd', value: '16:36'},
  },
)

test('type character into textarea', async () => {
  const {element, user} = setup<HTMLInputElement>(`<textarea>aXd</textarea>`)
  element.focus()
  element.selectionStart = 1
  element.selectionEnd = 2

  await user.keyboard('bc')

  expect(element).toHaveValue('abcd')
})

test('type characters into contenteditable', async () => {
  const {element, user} = setup('<div contenteditable=true>aXd</div>')
  element.focus()
  element.ownerDocument
    .getSelection()
    ?.setBaseAndExtent(
      element.firstChild as ChildNode,
      1,
      element.firstChild as ChildNode,
      2,
    )

  await user.keyboard('bc')

  expect(element).toHaveTextContent('abcd')
})

test.each([
  [`<input readonly value="foo"/>`],
  [`<input type="color" value="#ffffff" />`],
  [`<input type="image" value="foo" />`],
  [`<input type="button" value="foo"/>`],
  [`<input type="reset" value="foo" />`],
  [`<input type="submit" value="foo" />`],
  [`<input type="file" />`],
  [`<button value="foo" />`],
  [`<div tabIndex="-1"/>`],
  [`<div tabIndex="-1" contenteditable="false"/>`],
])('do not change non-editable element: %s', async html => {
  const {element, getEvents, user} = setup(html)
  element.focus()

  const value = (element as HTMLInputElement).value

  await user.keyboard('x')

  expect(getEvents('input')).toHaveLength(0)
  expect(element).toHaveProperty('value', value)
})

test('type [Enter] in textarea', async () => {
  const {element, getEvents, user} = setup(`<textarea>f</textarea>`)

  await user.type(element, 'oo[Enter]bar[ShiftLeft>][Enter]baz')

  expect(element).toHaveValue('foo\nbar\nbaz')
  expect(getEvents('input')[2]).toHaveProperty('inputType', 'insertLineBreak')
  expect(getEvents('input')[6]).toHaveProperty('inputType', 'insertLineBreak')
})

test('type [Enter] in contenteditable', async () => {
  const {element, getEvents, user} = setup(
    `<div contenteditable="true">f</div>`,
  )

  await user.type(element, 'oo[Enter]bar[ShiftLeft>][Enter]baz')

  expect(element).toHaveTextContent('foo bar baz')
  expect(element.firstChild).toHaveProperty('nodeValue', 'foo\nbar\nbaz')
  expect(getEvents('input')[2]).toHaveProperty('inputType', 'insertParagraph')
  expect(getEvents('input')[6]).toHaveProperty('inputType', 'insertLineBreak')
})

test.each([
  ['1e--5', 1e-5, '1e-5', 4],
  ['1--e--5', null, '1--e5', 5],
  ['.-1.-e--5', null, '.-1-e5', 6],
  ['1.5e--5', 1.5e-5, '1.5e-5', 6],
  ['1e5-', 1e5, '1e5', 3],
  ['-a3', -3, '-3', 2],
  ['3-3', null, '3-3', 3],
])(
  'type invalid values into <input type="number"/>',
  async (text, expectedValue, expectedUiValue, expectedInputEvents) => {
    const {element, getEvents, user} = setup<HTMLInputElement>(
      `<input type="number"/>`,
    )
    element.focus()

    await user.keyboard(text)

    expect(element).toHaveValue(expectedValue)
    expect(getUIValue(element)).toBe(expectedUiValue)
    expect(getEvents('input')).toHaveLength(expectedInputEvents)

    // TODO: implement ValidityState
    // expect(element.validity).toHaveProperty('badInput', expectedValue === null)
  },
)
