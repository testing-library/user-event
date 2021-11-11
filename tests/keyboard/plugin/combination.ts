import userEvent from '#src'
import {setup} from '#testHelpers/utils'

test('select input per `Control+A`', () => {
  const {element} = setup<HTMLInputElement>(`<input value="foo bar baz"/>`)
  element.focus()
  element.selectionStart = 5

  userEvent.keyboard('{Control>}a')

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 11)
})
