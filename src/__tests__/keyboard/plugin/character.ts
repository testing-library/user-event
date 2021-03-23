import userEvent from 'index'
import {setup} from '__tests__/helpers/utils'

test('type [Enter] in textarea', () => {
  const {element, getEvents} = setup(`<textarea>f</textarea>`)

  userEvent.type(element as HTMLTextAreaElement, 'oo[Enter]bar')

  expect(element).toHaveValue('foo\nbar')
  expect(getEvents('input')[2]).toHaveProperty('inputType', 'insertLineBreak')
})

test('type [Enter] in contenteditable', () => {
  const {element, getEvents} = setup(`<div contenteditable="true">f</div>`)

  userEvent.type(
    element as HTMLTextAreaElement,
    'oo[Enter]bar[ShiftLeft>][Enter]baz',
  )

  expect(element).toHaveTextContent('foo bar baz')
  expect(element?.firstChild).toHaveProperty('nodeValue', 'foo\nbar\nbaz')
  expect(getEvents('input')[2]).toHaveProperty('inputType', 'insertParagraph')
  expect(getEvents('input')[6]).toHaveProperty('inputType', 'insertLineBreak')
})
