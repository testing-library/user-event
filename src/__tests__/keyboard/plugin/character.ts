import userEvent from 'index'
import {setup} from '__tests__/helpers/utils'

test('type [Enter] in textarea', () => {
  const {element, getEvents} = setup(`<textarea>f</textarea>`)

  userEvent.type(element, 'oo[Enter]bar[ShiftLeft>][Enter]baz')

  expect(element).toHaveValue('foo\nbar\nbaz')
  expect(getEvents('input')[2]).toHaveProperty('inputType', 'insertLineBreak')
  expect(getEvents('input')[6]).toHaveProperty('inputType', 'insertLineBreak')
})

test('type [Enter] in contenteditable', () => {
  const {element, getEvents} = setup(`<div contenteditable="true">f</div>`)
  element.focus()

  userEvent.keyboard('oo[Enter]bar[ShiftLeft>][Enter]baz')

  expect(element).toHaveTextContent('foo bar baz')
  expect(element.firstChild).toHaveProperty('nodeValue', 'foo\nbar\nbaz')
  expect(getEvents('input')[2]).toHaveProperty('inputType', 'insertParagraph')
  expect(getEvents('input')[6]).toHaveProperty('inputType', 'insertLineBreak')
})

test.each([
  ['1e--5', 1e-5, undefined, 4],
  ['1--e--5', null, '1--e5', 5],
  ['.-1.-e--5', null, '.-1-e5', 6],
  ['1.5e--5', 1.5e-5, undefined, 6],
  ['1e5-', 1e5, undefined, 3],
])(
  'type invalid values into <input type="number"/>',
  (text, expectedValue, expectedCarryValue, expectedInputEvents) => {
    const {element, getEvents} = setup(`<input type="number"/>`)
    element.focus()

    const state = userEvent.keyboard(text)

    expect(element).toHaveValue(expectedValue)
    expect(state).toHaveProperty('carryValue', expectedCarryValue)
    expect(getEvents('input')).toHaveLength(expectedInputEvents)
  },
)
