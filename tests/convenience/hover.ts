import userEvent, {PointerEventsCheckLevel} from '#src'
import {setup} from '#testHelpers'

describe.each([
  ['hover', {events: ['over', 'enter', 'move']}],
  ['unhover', {events: ['move', 'leave', 'out']}],
] as const)('%s', (method, {events}) => {
  test(`${method} element`, async () => {
    const {element, getEvents} = setup('<div></div>')

    await userEvent[method](element)

    for (const type of events) {
      expect(getEvents(`pointer${type}`)).toHaveLength(1)
      expect(getEvents(`mouse${type}`)).toHaveLength(1)
    }

    expect(getEvents('pointermove')).toHaveLength(1)
    expect(getEvents('mousemove')).toHaveLength(1)
  })

  test('throw on pointer-events set to none', async () => {
    const {element} = setup(`<div style="pointer-events: none"></div>`)

    await expect(userEvent[method](element)).rejects.toThrowError(
      /has or inherits pointer-events/i,
    )
  })

  test('skip check for pointer-events', async () => {
    const {element, getEvents} = setup(
      `<div style="pointer-events: none"></div>`,
    )

    await userEvent[method](element, {
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    })

    expect(getEvents('mousemove')).toHaveLength(1)
  })
})
