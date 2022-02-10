import userEvent from '#src'
import {setup} from '#testHelpers'

test('select input per `Control+A`', async () => {
  const {element} = setup<HTMLInputElement>(`<input value="foo bar baz"/>`)
  element.focus()
  element.selectionStart = 5

  await userEvent.keyboard('{Control>}a')

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 11)
})
