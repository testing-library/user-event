import userEvent from 'index'
import {setup} from '__tests__/helpers/utils'

test('type [Enter] in textarea', () => {
  const {element} = setup(`<textarea>f</textarea>`)

  userEvent.type(element as HTMLTextAreaElement, 'oo[Enter]bar')

  expect(element).toHaveValue('foo\nbar')
})

test('type [Enter] in contenteditable', () => {
  const {element} = setup(`<div contenteditable="true">f</div>`)

  userEvent.type(element as HTMLTextAreaElement, 'oo[Enter]bar')

  expect(element).toHaveTextContent('foo bar')
  expect(element?.firstChild).toHaveProperty('nodeValue', 'foo\nbar')
})
