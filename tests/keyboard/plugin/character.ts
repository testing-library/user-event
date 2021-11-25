import {getUIValue} from '#src/document/value'
import userEvent from '#src'
import {setup} from '#testHelpers/utils'

test('type [Enter] in textarea', async () => {
  const {element, getEvents} = setup(`<textarea>f</textarea>`)

  await userEvent.type(element, 'oo[Enter]bar[ShiftLeft>][Enter]baz')

  expect(element).toHaveValue('foo\nbar\nbaz')
  expect(getEvents('input')[2]).toHaveProperty('inputType', 'insertLineBreak')
  expect(getEvents('input')[6]).toHaveProperty('inputType', 'insertLineBreak')
})

test('type [Enter] in contenteditable', async () => {
  const {element, getEvents} = setup(`<div contenteditable="true">f</div>`)

  await userEvent.type(element, 'oo[Enter]bar[ShiftLeft>][Enter]baz')

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
])(
  'type invalid values into <input type="number"/>',
  async (text, expectedValue, expectedUiValue, expectedInputEvents) => {
    const {element, getEvents} = setup<HTMLInputElement>(
      `<input type="number"/>`,
    )
    element.focus()

    await userEvent.keyboard(text)

    expect(element).toHaveValue(expectedValue)
    expect(getUIValue(element)).toBe(expectedUiValue)
    expect(getEvents('input')).toHaveLength(expectedInputEvents)
  },
)
