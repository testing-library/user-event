import userEvent from '#src'
import {setup} from '#testHelpers/utils'

test('collapse selection to the left', () => {
  const {element} = setup<HTMLInputElement>(`<input value="foobar"/>`)
  element.focus()
  element.setSelectionRange(2, 4)

  userEvent.keyboard('[ArrowLeft]')

  expect(element.selectionStart).toBe(2)
  expect(element.selectionEnd).toBe(2)
})

test('collapse selection to the right', () => {
  const {element} = setup<HTMLInputElement>(`<input value="foobar"/>`)
  element.focus()
  element.setSelectionRange(2, 4)

  userEvent.keyboard('[ArrowRight]')

  expect(element.selectionStart).toBe(4)
  expect(element.selectionEnd).toBe(4)
})

test('move cursor left', () => {
  const {element} = setup<HTMLInputElement>(`<input value="foobar"/>`)
  element.focus()
  element.setSelectionRange(2, 2)

  userEvent.keyboard('[ArrowLeft]')

  expect(element.selectionStart).toBe(1)
  expect(element.selectionEnd).toBe(1)
})

test('move cursor right', () => {
  const {element} = setup<HTMLInputElement>(`<input value="foobar"/>`)
  element.focus()
  element.setSelectionRange(2, 2)

  userEvent.keyboard('[ArrowRight]')

  expect(element.selectionStart).toBe(3)
  expect(element.selectionEnd).toBe(3)
})
