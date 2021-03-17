import userEvent from 'index'
import {setup} from '__tests__/helpers/utils'

const setupInput = () =>
  setup(`<input value="foobar"/>`).element as HTMLInputElement

test('collapse selection to the left', () => {
  const el = setupInput()
  el.setSelectionRange(2, 4)

  userEvent.type(el, '[ArrowLeft]')

  expect(el.selectionStart).toBe(2)
  expect(el.selectionEnd).toBe(2)
})

test('collapse selection to the right', () => {
  const el = setupInput()
  el.setSelectionRange(2, 4)

  userEvent.type(el, '[ArrowRight]')

  expect(el.selectionStart).toBe(4)
  expect(el.selectionEnd).toBe(4)
})

test('move cursor left', () => {
  const el = setupInput()
  el.setSelectionRange(2, 2)

  userEvent.type(el, '[ArrowLeft]')

  expect(el.selectionStart).toBe(1)
  expect(el.selectionEnd).toBe(1)
})

test('move cursor right', () => {
  const el = setupInput()
  el.setSelectionRange(2, 2)

  userEvent.type(el, '[ArrowRight]')

  expect(el.selectionStart).toBe(3)
  expect(el.selectionEnd).toBe(3)
})
