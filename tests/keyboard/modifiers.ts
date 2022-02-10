import userEvent from '#src'
import {setup} from '#testHelpers'

test.each([
  ['Shift', 'shiftKey'],
  ['Control', 'ctrlKey'],
  ['Alt', 'altKey'],
  ['Meta', 'metaKey'],
])('Trigger modifier: %s', async (key, modifier) => {
  const {element, getEvents} = setup(`<div tabIndex="-1"></div>`)
  const user = userEvent.setup()
  element.focus()

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
    const {element, getEvents} = setup(`<div tabIndex="-1"></div>`)
    const user = userEvent.setup()
    element.focus()

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
  const {element, getEvents} = setup(`<div tabIndex="-1"></div>`)
  const user = userEvent.setup()
  element.focus()

  await user.keyboard(`{${key}}`)
  const modifierOn = getEvents('keydown')[0]
  expect(modifierOn.getModifierState(key)).toBe(true)

  await user.keyboard(`a`)
  expect(getEvents('keydown')[1].getModifierState(key)).toBe(true)

  await user.keyboard(`{${key}}`)
  const modifierOff = getEvents('keyup')[2]
  expect(modifierOff.getModifierState(key)).toBe(false)
})
