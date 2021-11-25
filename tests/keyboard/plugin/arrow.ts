import userEvent from '#src'
import {setup} from '#testHelpers/utils'

test('collapse selection to the left', async () => {
  const {element} = setup<HTMLInputElement>(`<input value="foobar"/>`)
  element.focus()
  element.setSelectionRange(2, 4)

  await userEvent.keyboard('[ArrowLeft]')

  expect(element.selectionStart).toBe(2)
  expect(element.selectionEnd).toBe(2)
})

test('collapse selection to the right', async () => {
  const {element} = setup<HTMLInputElement>(`<input value="foobar"/>`)
  element.focus()
  element.setSelectionRange(2, 4)

  await userEvent.keyboard('[ArrowRight]')

  expect(element.selectionStart).toBe(4)
  expect(element.selectionEnd).toBe(4)
})

test('move cursor left', async () => {
  const {element} = setup<HTMLInputElement>(`<input value="foobar"/>`)
  element.focus()
  element.setSelectionRange(2, 2)

  await userEvent.keyboard('[ArrowLeft]')

  expect(element.selectionStart).toBe(1)
  expect(element.selectionEnd).toBe(1)
})

test('move cursor right', async () => {
  const {element} = setup<HTMLInputElement>(`<input value="foobar"/>`)
  element.focus()
  element.setSelectionRange(2, 2)

  await userEvent.keyboard('[ArrowRight]')

  expect(element.selectionStart).toBe(3)
  expect(element.selectionEnd).toBe(3)
})
