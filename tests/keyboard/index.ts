import userEvent from '#src'
import {addListeners, setup} from '#testHelpers/utils'

it('type without focus', async () => {
  const {element} = setup('<input/>')
  const {getEventSnapshot} = addListeners(document.body)

  await userEvent.keyboard('foo')

  expect(element).toHaveValue('')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: body

    body - keydown: f
    body - keypress: f
    body - keyup: f
    body - keydown: o
    body - keypress: o
    body - keyup: o
    body - keydown: o
    body - keypress: o
    body - keyup: o
  `)
})

it('type with focus', async () => {
  const {element} = setup('<input/>')
  const {getEventSnapshot} = addListeners(document.body)
  element.focus()

  await userEvent.keyboard('foo')

  expect(element).toHaveValue('foo')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: body

    input[value=""] - focusin
    input[value=""] - keydown: f
    input[value=""] - keypress: f
    input[value="f"] - input
    input[value="f"] - keyup: f
    input[value="f"] - keydown: o
    input[value="f"] - keypress: o
    input[value="fo"] - input
    input[value="fo"] - keyup: o
    input[value="fo"] - keydown: o
    input[value="fo"] - keypress: o
    input[value="foo"] - input
    input[value="foo"] - keyup: o
  `)
})

it('type asynchronous', async () => {
  const {element} = setup('<input/>')
  const {getEventSnapshot} = addListeners(document.body)
  element.focus()

  await userEvent.keyboard('foo', {delay: 1})

  expect(element).toHaveValue('foo')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: body

    input[value=""] - focusin
    input[value=""] - keydown: f
    input[value=""] - keypress: f
    input[value="f"] - input
    input[value="f"] - keyup: f
    input[value="f"] - keydown: o
    input[value="f"] - keypress: o
    input[value="fo"] - input
    input[value="fo"] - keyup: o
    input[value="fo"] - keydown: o
    input[value="fo"] - keypress: o
    input[value="foo"] - input
    input[value="foo"] - keyup: o
  `)
})

it('error in async', async () => {
  await expect(userEvent.keyboard('{!', {delay: 1})).rejects.toThrowError(
    'Expected key descriptor but found "!" in "{!"',
  )
})

it('continue typing with state', async () => {
  const {element, getEventSnapshot, clearEventCalls} = setup('<input/>')
  element.focus()
  clearEventCalls()

  const state = await userEvent.keyboard('[ShiftRight>]')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - keydown: Shift {shift}
  `)
  clearEventCalls()

  await userEvent.keyboard('F[/ShiftRight]', {keyboardState: state})

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="F"]

    input[value=""] - keydown: F {shift}
    input[value=""] - keypress: F {shift}
    input[value="F"] - input
    input[value="F"] - keyup: F {shift}
    input[value="F"] - keyup: Shift
  `)
})
