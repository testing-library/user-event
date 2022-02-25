import {setup} from '#testHelpers'

test.each([
  ['Shift', 'shiftKey'],
  ['Control', 'ctrlKey'],
  ['Alt', 'altKey'],
  ['Meta', 'metaKey'],
])('Trigger modifier: %s', async (key, modifier) => {
  const {getEvents, user} = setup(`<div tabIndex="-1"></div>`)

  await user.keyboard(`{${key}>}`)
  const modifierDown = getEvents('keydown')[0]
  expect(modifierDown).toHaveProperty('key', key)
  expect(modifierDown).toHaveProperty(modifier, true)

  await user.keyboard('a')
  expect(getEvents('keydown')[1]).toHaveProperty(modifier, true)
  expect(getEvents('keyup')[0]).toHaveProperty(modifier, true)

  await user.keyboard(`{/${key}}`)
  const modifierUp = getEvents('keyup')[1]
  expect(modifierUp).toHaveProperty('key', key)
  expect(modifierUp).toHaveProperty(modifier, false)
})

test.each([['AltGraph'], ['Fn'], ['Symbol']])(
  'Trigger modifier: %s',
  async key => {
    const {getEvents, user} = setup(`<div tabIndex="-1"></div>`)

    await user.keyboard(`{${key}>}`)
    const modifierDown = getEvents('keydown')[key === 'AltGraph' ? 1 : 0]
    expect(modifierDown).toHaveProperty('key', key)
    expect(modifierDown.getModifierState(key)).toBe(true)

    await user.keyboard('a')
    expect(
      getEvents('keydown')[key === 'AltGraph' ? 2 : 1].getModifierState(key),
    ).toBe(true)

    await user.keyboard(`{/${key}}`)
    const modifierUp = getEvents('keyup')[1]
    expect(modifierUp.getModifierState(key)).toBe(false)
  },
)

test.each([
  ['CapsLock'],
  ['FnLock'],
  ['NumLock'],
  ['ScrollLock'],
  ['SymbolLock'],
])('Switch lock modifier: %s', async key => {
  const {getEvents, user} = setup(`<div tabIndex="-1"></div>`)

  await user.keyboard(`{${key}}`)
  const modifierOn = getEvents('keydown')[0]
  expect(modifierOn.getModifierState(key)).toBe(true)

  await user.keyboard(`a`)
  expect(getEvents('keydown')[1].getModifierState(key)).toBe(true)

  await user.keyboard(`{${key}}`)
  const modifierOff = getEvents('keyup')[2]
  expect(modifierOff.getModifierState(key)).toBe(false)
})

test('produce extra events for the Control key when AltGraph is pressed', async () => {
  const {getEventSnapshot, user} = setup(`<input/>`)

  await user.keyboard('{AltGraph}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - keydown: Control
    input[value=""] - keydown: AltGraph
    input[value=""] - keyup: AltGraph
    input[value=""] - keyup: Control
  `)
})
