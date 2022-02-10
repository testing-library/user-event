import userEvent from '#src'
import {addListeners, setup} from '#testHelpers'

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
    input[value=""] - beforeinput
    input[value="f"] - input
    input[value="f"] - keyup: f
    input[value="f"] - keydown: o
    input[value="f"] - keypress: o
    input[value="f"] - beforeinput
    input[value="fo"] - input
    input[value="fo"] - keyup: o
    input[value="fo"] - keydown: o
    input[value="fo"] - keypress: o
    input[value="fo"] - beforeinput
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
    input[value=""] - beforeinput
    input[value="f"] - input
    input[value="f"] - keyup: f
    input[value="f"] - keydown: o
    input[value="f"] - keypress: o
    input[value="f"] - beforeinput
    input[value="fo"] - input
    input[value="fo"] - keyup: o
    input[value="fo"] - keydown: o
    input[value="fo"] - keypress: o
    input[value="fo"] - beforeinput
    input[value="foo"] - input
    input[value="foo"] - keyup: o
  `)
})

it('error in async', async () => {
  await expect(userEvent.keyboard('[!', {delay: 1})).rejects.toThrowError(
    'Expected key descriptor but found "!" in "[!"',
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
    input[value=""] - beforeinput
    input[value="F"] - input
    input[value="F"] - keyup: F {shift}
    input[value="F"] - keyup: Shift
  `)
})

describe('delay', () => {
  const spy = jest.spyOn(global, 'setTimeout')

  beforeEach(() => {
    spy.mockClear()
  })

  test('delay keyboard per setTimeout', async () => {
    const time0 = performance.now()
    await userEvent.keyboard('foo', {delay: 10})

    // we don't call delay after the last action
    // TODO: Should we call it?
    expect(spy).toBeCalledTimes(2)
    expect(time0).toBeLessThan(performance.now() - 20)
  })

  test('do not call setTimeout with delay `null`', async () => {
    await userEvent.keyboard('foo', {delay: null})
    expect(spy).toBeCalledTimes(0)
  })
})

test('disabling activeElement moves action to HTMLBodyElement', async () => {
  const {element} = setup<HTMLInputElement>(`<input/>`)
  element.addEventListener('keyup', e => {
    if (e.key === 'b') {
      element.disabled = true
    }
  })
  element.focus()

  const {getEventSnapshot} = addListeners(document.body)
  await userEvent.keyboard('abc')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: body

    input[value=""] - keydown: a
    input[value=""] - keypress: a
    input[value=""] - beforeinput
    input[value="a"] - input
    input[value="a"] - keyup: a
    input[value="a"] - keydown: b
    input[value="a"] - keypress: b
    input[value="a"] - beforeinput
    input[value="ab"] - input
    input[value="ab"] - keyup: b
    body - keydown: c
    body - keypress: c
    body - keyup: c
  `)
})
