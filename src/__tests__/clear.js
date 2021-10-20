import userEvent from '../'
import {setup} from './helpers/utils'

test('clears text', () => {
  const {element, getEventSnapshot} = setup('<input value="hello" />')
  userEvent.clear(element)
  expect(element).toHaveValue('')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value="hello"] - pointerover
    input[value="hello"] - pointerenter
    input[value="hello"] - mouseover
    input[value="hello"] - mouseenter
    input[value="hello"] - pointermove
    input[value="hello"] - mousemove
    input[value="hello"] - pointerdown
    input[value="hello"] - mousedown: Left (0)
    input[value="hello"] - focus
    input[value="hello"] - focusin
    input[value="hello"] - pointerup
    input[value="hello"] - mouseup: Left (0)
    input[value="hello"] - click: Left (0)
    input[value="hello"] - select
    input[value="hello"] - keydown: Delete (46)
    input[value=""] - input
    input[value=""] - keyup: Delete (46)
  `)
})

test('works with textarea', () => {
  const {element} = setup('<textarea>hello</textarea>')
  userEvent.clear(element)
  expect(element).toHaveValue('')
})

test('does not clear text on disabled inputs', () => {
  const {element, getEventSnapshot} = setup('<input value="hello" disabled />')
  userEvent.clear(element)
  expect(element).toHaveValue('hello')
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: input[value="hello"]`,
  )
})

test('does not clear text on readonly inputs', () => {
  const {element, getEventSnapshot} = setup('<input value="hello" readonly />')
  userEvent.clear(element)
  expect(element).toHaveValue('hello')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="hello"]

    input[value="hello"] - pointerover
    input[value="hello"] - pointerenter
    input[value="hello"] - mouseover
    input[value="hello"] - mouseenter
    input[value="hello"] - pointermove
    input[value="hello"] - mousemove
    input[value="hello"] - pointerdown
    input[value="hello"] - mousedown: Left (0)
    input[value="hello"] - focus
    input[value="hello"] - focusin
    input[value="hello"] - pointerup
    input[value="hello"] - mouseup: Left (0)
    input[value="hello"] - click: Left (0)
    input[value="hello"] - select
    input[value="hello"] - keydown: Delete (46)
    input[value="hello"] - keyup: Delete (46)
  `)
})

test('clears even on inputs that cannot (programmatically) have a selection', () => {
  const {element: email} = setup('<input value="a@b.c" type="email" />')
  userEvent.clear(email)
  expect(email).toHaveValue('')

  const {element: password} = setup('<input value="pswrd" type="password" />')
  userEvent.clear(password)
  expect(password).toHaveValue('')

  const {element: number} = setup('<input value="12" type="number" />')
  userEvent.clear(number)
  // jest-dom does funny stuff with toHaveValue on number inputs
  // eslint-disable-next-line jest-dom/prefer-to-have-value
  expect(number.value).toBe('')
})

test('non-inputs/textareas are currently unsupported', () => {
  const {element} = setup('<div />')

  expect(() => userEvent.clear(element)).toThrowErrorMatchingInlineSnapshot(
    `clear currently only supports input and textarea elements.`,
  )
})
