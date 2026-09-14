import {PointerEventsCheckLevel} from '#src'
import {setup} from '#testHelpers'

describe.each([
  ['click', {clickCount: 1}],
  ['dblClick', {clickCount: 2}],
  ['tripleClick', {clickCount: 3}],
] as const)('%s', (method, {clickCount}) => {
  test('click element', async () => {
    const {element, getEvents, user} = setup(`<div></div>`)

    await user[method](element)

    expect(getEvents('mouseover')).toHaveLength(1)
    expect(getEvents('mousedown')).toHaveLength(clickCount)
    expect(getEvents('pointerdown')).toHaveLength(clickCount)
    expect(getEvents('click')).toHaveLength(clickCount)
    expect(getEvents('dblclick')).toHaveLength(clickCount >= 2 ? 1 : 0)
  })

  test('preventDefault on pointer down prevents compatibility events', async () => {
    const {element, getEvents, user} = setup(`<div></div>`, {
      eventHandlers: {pointerdown: e => e.preventDefault()},
    })

    await user[method](element)

    expect(getEvents('mouseover')).toHaveLength(1)
    expect(getEvents('mousedown')).toHaveLength(0)
    expect(getEvents('mouseup')).toHaveLength(0)
    expect(getEvents('pointerdown')).toHaveLength(clickCount)
    expect(getEvents('pointerup')).toHaveLength(clickCount)
    expect(getEvents('click')).toHaveLength(clickCount)
    expect(getEvents('dblclick')).toHaveLength(clickCount >= 2 ? 1 : 0)
  })

  test('throw when clicking element with pointer-events set to none', async () => {
    const {element, user} = setup(`<div style="pointer-events: none"></div>`)

    await expect(user[method](element)).rejects.toThrowError(
      /has `pointer-events: none`/i,
    )
  })

  test('skip check for pointer-events', async () => {
    const {element, getEvents, user} = setup(
      `<div style="pointer-events: none"></div>`,
      {
        pointerEventsCheck: PointerEventsCheckLevel.Never,
      },
    )

    await user[method](element)

    expect(getEvents('click')).toHaveLength(clickCount)
  })

  if (method === 'click') {
    test('skip hover', async () => {
      const {element, getEvents, user} = setup(`<div></div>`, {
        skipHover: true,
      })

      await user[method](element)

      expect(getEvents('mouseover')).toHaveLength(0)
      expect(getEvents('click')).toHaveLength(1)
    })
  }
})
