import {setup} from '#testHelpers'

test('select input per `Control+A`', async () => {
  const {element, user} = setup<HTMLInputElement>(
    `<input value="foo bar baz"/>`,
  )
  element.focus()
  element.selectionStart = 5

  await user.keyboard('{Control>}a')

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 11)
})
