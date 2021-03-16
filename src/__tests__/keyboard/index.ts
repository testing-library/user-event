import userEvent from '../../index'
import {addListeners, setup} from '../helpers/utils'

it('type without focus', () => {
  const {element} = setup('<input/>')
  const {getEventSnapshot} = addListeners(document.body)

  userEvent.keyboard('foo')

  expect(element).toHaveValue('')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: body

    body - keydown: f (102)
    body - keypress: f (102)
    body - keyup: f (102)
    body - keydown: o (111)
    body - keypress: o (111)
    body - keyup: o (111)
    body - keydown: o (111)
    body - keypress: o (111)
    body - keyup: o (111)
  `)
})

it('type with focus', () => {
  const {element} = setup('<input/>')
  const {getEventSnapshot} = addListeners(document.body)
  ;(element as HTMLInputElement).focus()

  userEvent.keyboard('foo')

  expect(element).toHaveValue('foo')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: body

    input[value=""] - focusin
    input[value=""] - keydown: f (102)
    input[value=""] - keypress: f (102)
    input[value="f"] - input
    input[value="f"] - keyup: f (102)
    input[value="f"] - keydown: o (111)
    input[value="f"] - keypress: o (111)
    input[value="fo"] - input
    input[value="fo"] - keyup: o (111)
    input[value="fo"] - keydown: o (111)
    input[value="fo"] - keypress: o (111)
    input[value="foo"] - input
    input[value="foo"] - keyup: o (111)
  `)
})

it('type asynchronous', async () => {
  const {element} = setup('<input/>')
  const {getEventSnapshot} = addListeners(document.body)
  ;(element as HTMLInputElement).focus()

  // eslint-disable-next-line testing-library/no-await-sync-events
  await userEvent.keyboard('foo', {delay: 1})

  expect(element).toHaveValue('foo')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: body

    input[value=""] - focusin
    input[value=""] - keydown: f (102)
    input[value=""] - keypress: f (102)
    input[value="f"] - input
    input[value="f"] - keyup: f (102)
    input[value="f"] - keydown: o (111)
    input[value="f"] - keypress: o (111)
    input[value="fo"] - input
    input[value="fo"] - keyup: o (111)
    input[value="fo"] - keydown: o (111)
    input[value="fo"] - keypress: o (111)
    input[value="foo"] - input
    input[value="foo"] - keyup: o (111)
  `)
})

describe('error', () => {
  afterEach(() => {
    ;(console.error as jest.MockedFunction<typeof console.error>).mockClear()
  })

  it('error in sync', async () => {
    const err = jest.spyOn(console, 'error')
    err.mockImplementation(() => {})

    userEvent.keyboard('{!')

    // the catch will be asynchronous
    await Promise.resolve()

    expect(err).toHaveBeenCalledWith(expect.any(Error))
    expect(err.mock.calls[0][0]).toHaveProperty(
      'message',
      'Expected key descriptor but found "!" in "{!"',
    )
  })

  it('error in async', async () => {
    const promise = userEvent.keyboard('{!', {delay: 1})

    return expect(promise).rejects.toThrowError(
      'Expected key descriptor but found "!" in "{!"',
    )
  })
})

it('continue typing with state', () => {
  const {element, getEventSnapshot, clearEventCalls} = setup('<input/>')
  ;(element as HTMLInputElement).focus()
  clearEventCalls()

  const state = userEvent.keyboard('[ShiftRight>]')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - keydown: Shift (16) {shift}
  `)
  clearEventCalls()

  userEvent.keyboard('F[/ShiftRight]', {keyboardState: state})

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="F"]

    input[value=""] - keydown: F (70) {shift}
    input[value=""] - keypress: F (70) {shift}
    input[value="F"] - input
      "{CURSOR}" -> "F{CURSOR}"
    input[value="F"] - keyup: F (70) {shift}
    input[value="F"] - keyup: Shift (16)
  `)
})
