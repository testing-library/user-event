import userEvent from '#src'
import {addListeners, render, resetWrappers, setup} from '#testHelpers'

test('type without focus', async () => {
  const {element, user} = setup('<input/>', {focus: false})
  const {getEventSnapshot} = addListeners(document.body)

  await user.keyboard('foo')

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

test('type with focus', async () => {
  const {element, user, getEventSnapshot} = setup('<input/>')

  await user.keyboard('foo')

  expect(element).toHaveValue('foo')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="foo"]

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

test('type asynchronous', async () => {
  const {element, user, getEventSnapshot} = setup('<input/>', {delay: 1})

  await user.keyboard('foo')

  expect(element).toHaveValue('foo')
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="foo"]

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

test('error in async', async () => {
  const {user} = setup('')
  await expect(user.keyboard('[!')).rejects.toThrowError(
    'Expected key descriptor but found "!" in "[!"',
  )
})

test('continue typing with state', async () => {
  const {getEventSnapshot, clearEventCalls} = render('<input/>')

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
  const spy = mocks.spyOn(global, 'setTimeout')

  beforeAll(() => resetWrappers())

  beforeEach(() => {
    spy.mockClear()
  })

  test('delay keyboard per setTimeout', async () => {
    const {user} = setup('', {delay: 10})

    const time0 = performance.now()
    await user.keyboard('foo')

    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(time0).toBeLessThan(performance.now() - 20)
  })

  test('do not call setTimeout with delay `null`', async () => {
    const {user} = setup('', {delay: null})
    await user.keyboard('foo')
    expect(spy).toBeCalledTimes(0)
  })
})

test('disabling activeElement moves action to HTMLBodyElement', async () => {
  const {element, user} = setup<HTMLInputElement>(`<input/>`)
  element.addEventListener('keyup', e => {
    if (e.key === 'b') {
      element.disabled = true
    }
  })

  const {getEventSnapshot} = addListeners(document.body)
  await user.keyboard('abc')

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
