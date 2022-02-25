import {setup} from '#testHelpers'

test('edit number input', async () => {
  const {element, user} = setup(`<input type="number" value="1"/>`)

  await user.type(
    element,
    'e-5[ArrowLeft][Delete]6[ArrowLeft][Backspace][Backspace]',
  )

  expect(element).toHaveValue(16)
})
