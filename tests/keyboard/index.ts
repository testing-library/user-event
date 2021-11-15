import userEvent from '#src'
import {addListeners, setup} from '#testHelpers/utils'

it('type without focus', () => {
  const {element} = setup('<input/>')
  const {getEventSnapshot} = addListeners(document.body)

  userEvent.keyboard('foo')

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

it('type with focus', () => {
  const {element} = setup('<input/>')
  const {getEventSnapshot} = addListeners(document.body)
  element.focus()

  userEvent.keyboard('foo')

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

  // eslint-disable-next-line testing-library/no-await-sync-events
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

    expect(err).toHaveBeenCalledWith(expect.any(Error) as unknown)
    expect(err.mock.calls[0][0]).toHaveProperty(
      'message',
      expect.stringContaining('Expected key descriptor but found "!" in "{!"'),
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
  element.focus()
  clearEventCalls()

  const state = userEvent.keyboard('[ShiftRight>]')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - keydown: Shift {shift}
  `)
  clearEventCalls()

  userEvent.keyboard('F[/ShiftRight]', {keyboardState: state})

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="F"]

    input[value=""] - keydown: F {shift}
    input[value=""] - keypress: F {shift}
    input[value="F"] - input
    input[value="F"] - keyup: F {shift}
    input[value="F"] - keyup: Shift
  `)
})
