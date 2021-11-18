import userEvent from '#src'
import {setup} from '#testHelpers/utils'

test('no character input if `altKey` or `ctrlKey` is pressed', async () => {
  const {element, eventWasFired} = setup(`<input/>`)
  element.focus()

  await userEvent.keyboard('[ControlLeft>]g')

  expect(eventWasFired('keypress')).toBe(false)
  expect(eventWasFired('input')).toBe(false)

  await userEvent.keyboard('[AltLeft>]g')

  expect(eventWasFired('keypress')).toBe(false)
  expect(eventWasFired('input')).toBe(false)
})

test('do not leak repeatKey in state', async () => {
  const {element} = setup(`<input/>`)
  ;(element as HTMLInputElement).focus()

  const keyboardState = await userEvent.keyboard('{a>2}')
  expect(keyboardState).toHaveProperty('repeatKey', undefined)
})

describe('pressing and releasing keys', () => {
  it('fires event with releasing key twice', async () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)

    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    await userEvent.keyboard('{ArrowLeft>}{ArrowLeft}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value=""]

      input[value=""] - keydown: ArrowLeft
      input[value=""] - keyup: ArrowLeft
      input[value=""] - keydown: ArrowLeft
      input[value=""] - keyup: ArrowLeft
    `)
  })

  it('fires event without releasing key', async () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)

    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    await userEvent.keyboard('{a>}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value="a"]

      input[value=""] - keydown: a
      input[value=""] - keypress: a
      input[value="a"] - input
    `)
  })

  it('fires event multiple times without releasing key', async () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    await userEvent.keyboard('{a>2}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value="aa"]

      input[value=""] - keydown: a
      input[value=""] - keypress: a
      input[value="a"] - input
      input[value="a"] - keydown: a
      input[value="a"] - keypress: a
      input[value="aa"] - input
    `)
  })

  it('fires event multiple times and releases key', async () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    await userEvent.keyboard('{a>2/}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value="aa"]

      input[value=""] - keydown: a
      input[value=""] - keypress: a
      input[value="a"] - input
      input[value="a"] - keydown: a
      input[value="a"] - keypress: a
      input[value="aa"] - input
      input[value="aa"] - keyup: a
    `)
  })

  it('fires event multiple times for multiple keys', async () => {
    const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
    ;(element as HTMLInputElement).focus()
    clearEventCalls()

    await userEvent.keyboard('{a>2}{b>2/}{c>2}{/a}')

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value="aabbcc"]

      input[value=""] - keydown: a
      input[value=""] - keypress: a
      input[value="a"] - input
      input[value="a"] - keydown: a
      input[value="a"] - keypress: a
      input[value="aa"] - input
      input[value="aa"] - keydown: b
      input[value="aa"] - keypress: b
      input[value="aab"] - input
      input[value="aab"] - keydown: b
      input[value="aab"] - keypress: b
      input[value="aabb"] - input
      input[value="aabb"] - keyup: b
      input[value="aabb"] - keydown: c
      input[value="aabb"] - keypress: c
      input[value="aabbc"] - input
      input[value="aabbc"] - keydown: c
      input[value="aabbc"] - keypress: c
      input[value="aabbcc"] - input
      input[value="aabbcc"] - keyup: a
    `)
  })
})
