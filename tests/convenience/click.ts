import userEvent, {PointerEventsCheckLevel} from '#src'
import {setup} from '#testHelpers/utils'

describe.each([
  ['click', {clickCount: 1}],
  ['dblClick', {clickCount: 2}],
  ['tripleClick', {clickCount: 3}],
] as const)('%s', (method, {clickCount}) => {
  test('click element', async () => {
    const {element, getEvents} = setup(`<div></div>`)

    await userEvent[method](element)

    expect(getEvents('mouseover')).toHaveLength(1)
    expect(getEvents('mousedown')).toHaveLength(clickCount)
    expect(getEvents('click')).toHaveLength(clickCount)
    expect(getEvents('dblclick')).toHaveLength(clickCount >= 2 ? 1 : 0)
  })

  test('throw when clicking element with pointer-events set to none', async () => {
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

    expect(getEvents('click')).toHaveLength(clickCount)
  })

  if (method === 'click') {
    test('skip hover', async () => {
      const {element, getEvents} = setup(`<div></div>`)

      await userEvent[method](element, {skipHover: true})

      expect(getEvents('mouseover')).toHaveLength(0)
      expect(getEvents('click')).toHaveLength(1)
    })
  }
})
