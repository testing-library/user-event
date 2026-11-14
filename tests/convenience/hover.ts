import {PointerEventsCheckLevel} from '#src'
import {setup} from '#testHelpers'

describe.each([
  ['hover', {events: ['over', 'enter']}],
  ['unhover', {events: ['leave', 'out']}],
] as const)('%s', (method, {events}) => {
  test(`${method} element`, async () => {
    const {element, getEvents, clearEventCalls, user} = setup('<div></div>')
    await user.pointer({target: method === 'hover' ? document.body : element})
    clearEventCalls()

    await user[method](element)

    for (const type of events) {
      expect(getEvents(`pointer${type}`)).toHaveLength(1)
      expect(getEvents(`mouse${type}`)).toHaveLength(1)
    }
  })

  test('throw on pointer-events set to none', async () => {
    const {element, clearEventCalls, user} = setup(
      `<div style="pointer-events: none"></div>`,
    )
    await user
      .setup({
        pointerEventsCheck: PointerEventsCheckLevel.Never,
      })
      .pointer({target: method === 'hover' ? document.body : element})
    clearEventCalls()

    await expect(user[method](element)).rejects.toThrowError(
      /has `pointer-events: none`/i,
    )
  })

  test('skip check for pointer-events', async () => {
    const {element, getEvents, clearEventCalls, user} = setup(
      `<div style="pointer-events: none"></div>`,
      {
        pointerEventsCheck: PointerEventsCheckLevel.Never,
      },
    )
    await user.pointer({target: method === 'hover' ? document.body : element})
    clearEventCalls()

    await user[method](element)

    events.forEach(t => expect(getEvents(`mouse${t}`)).toHaveLength(1))
  })
})
