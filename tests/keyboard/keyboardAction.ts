import cases from 'jest-in-case'
import userEvent from '#src'
import {render, resetWrappers, setup} from '#testHelpers'

// Maybe this should not trigger keypress event on HTMLAnchorElement
// see https://github.com/testing-library/user-event/issues/589
cases(
  'trigger `keypress` event',
  async ({code, hasKeyPress}) => {
    const {eventWasFired, user} = setup(`<input/>`)

    await user.keyboard(`[${code}]`)

    expect(eventWasFired('keypress')).toBe(hasKeyPress)
  },
  {
    characters: {
      code: 'KeyX',
      hasKeyPress: true,
    },
    '[Enter]': {
      code: 'Enter',
      hasKeyPress: true,
    },
    'skip for other keys': {
      code: 'Escape',
      hasKeyPress: false,
    },
  },
)

test('no character input if `altKey` or `ctrlKey` is pressed', async () => {
  const {eventWasFired} = render(`<input/>`)

  await userEvent.keyboard('[ControlLeft>]g')

  expect(eventWasFired('keypress')).toBe(false)
  expect(eventWasFired('input')).toBe(false)

  await userEvent.keyboard('[AltLeft>]g')

  expect(eventWasFired('keypress')).toBe(false)
  expect(eventWasFired('input')).toBe(false)
})

test('do not leak repeatKey in state', async () => {
  render(`<input/>`)

  const keyboardState = await userEvent.keyboard('{a>2}')
  expect(keyboardState).not.toHaveProperty('repeatKey')
})

describe('pressing and releasing keys', () => {
  test('fires event with releasing key twice', async () => {
    const {getEventSnapshot, user} = setup(`<input/>`)

    await user.keyboard('{ArrowLeft>}{ArrowLeft}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value=""]

      input[value=""] - keydown: ArrowLeft
      input[value=""] - keyup: ArrowLeft
      input[value=""] - keydown: ArrowLeft
      input[value=""] - keyup: ArrowLeft
    `)
  })

  test('fires event without releasing key', async () => {
    const {getEventSnapshot, user} = setup(`<input/>`)

    await user.keyboard('{a>}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value="a"]

      input[value=""] - keydown: a
      input[value=""] - keypress: a
      input[value=""] - beforeinput
      input[value="a"] - input
    `)
  })

  test('fires event multiple times without releasing key', async () => {
    const {getEventSnapshot, user} = setup(`<input/>`)

    await user.keyboard('{a>2}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value="aa"]

      input[value=""] - keydown: a
      input[value=""] - keypress: a
      input[value=""] - beforeinput
      input[value="a"] - input
      input[value="a"] - keydown: a
      input[value="a"] - keypress: a
      input[value="a"] - beforeinput
      input[value="aa"] - input
    `)
  })

  test('fires event multiple times and releases key', async () => {
    const {getEventSnapshot, user} = setup(`<input/>`)

    await user.keyboard('{a>2/}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value="aa"]

      input[value=""] - keydown: a
      input[value=""] - keypress: a
      input[value=""] - beforeinput
      input[value="a"] - input
      input[value="a"] - keydown: a
      input[value="a"] - keypress: a
      input[value="a"] - beforeinput
      input[value="aa"] - input
      input[value="aa"] - keyup: a
    `)
  })

  test('fires event multiple times for multiple keys', async () => {
    const {getEventSnapshot, user} = setup(`<input/>`)

    await user.keyboard('{a>2}{b>2/}{c>2}{/a}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value="aabbcc"]

      input[value=""] - keydown: a
      input[value=""] - keypress: a
      input[value=""] - beforeinput
      input[value="a"] - input
      input[value="a"] - keydown: a
      input[value="a"] - keypress: a
      input[value="a"] - beforeinput
      input[value="aa"] - input
      input[value="aa"] - keydown: b
      input[value="aa"] - keypress: b
      input[value="aa"] - beforeinput
      input[value="aab"] - input
      input[value="aab"] - keydown: b
      input[value="aab"] - keypress: b
      input[value="aab"] - beforeinput
      input[value="aabb"] - input
      input[value="aabb"] - keyup: b
      input[value="aabb"] - keydown: c
      input[value="aabb"] - keypress: c
      input[value="aabb"] - beforeinput
      input[value="aabbc"] - input
      input[value="aabbc"] - keydown: c
      input[value="aabbc"] - keypress: c
      input[value="aabbc"] - beforeinput
      input[value="aabbcc"] - input
      input[value="aabbcc"] - keyup: a
    `)
  })
})

describe('prevent default behavior', () => {
  test('per keydown handler', async () => {
    const {element, getEvents, user} = setup(`<input/>`)
    element.addEventListener('keydown', e => e.preventDefault())

    await user.keyboard('x')

    expect(getEvents('input')).toHaveLength(0)
    expect(element).toHaveValue('')
  })

  test('per keypress handler', async () => {
    const {element, getEvents, user} = setup(`<input/>`)
    element.addEventListener('keypress', e => e.preventDefault())

    await user.keyboard('x')

    expect(getEvents('input')).toHaveLength(0)
    expect(element).toHaveValue('')
  })
})

describe('delay', () => {
  beforeAll(() => resetWrappers())

  test('do not call setTimeout with delay `null`', async () => {
    const {user} = setup(`<div></div>`)
    const spy = mocks.spyOn(global, 'setTimeout')
    await user.keyboard('ab')
    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(1)
  
    spy.mockClear()
    await user.setup({delay: null}).keyboard('cd')
    expect(spy).not.toBeCalled()
  })
})
