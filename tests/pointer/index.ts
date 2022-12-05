import type { SpyInstance } from 'jest-mock'
import {PointerEventsCheckLevel} from '#src'
import {setup} from '#testHelpers'

test('continue previous target', async () => {
  const {element, getEvents, user} = setup(`<div></div>`)

  await user.pointer({
    keys: '[MouseLeft]',
    target: element,
  })
  await user.pointer('[MouseLeft]')

  expect(getEvents('click')).toHaveLength(2)
})

test('unknown button does nothing', async () => {
  const {element, getEvents, user} = setup(`<div></div>`)

  await user.pointer({keys: '[foo]', target: element})

  expect(getEvents()).toEqual([])
})

test('pointer without previous target results in error', async () => {
  const {user} = setup('')
  await expect(user.pointer({keys: '[TouchA]'})).rejects.toThrowError(
    'no previous position',
  )
})

test('unknown pointer results in error', async () => {
  const {element, user} = setup(`<div></div>`)

  await expect(
    user.pointer({pointerName: 'foo', target: element}),
  ).rejects.toThrowError('does not exist')
})

test('apply modifiers from keyboardstate', async () => {
  const {element, getEvents, user} = setup(`<input/>`)

  await user.keyboard('[ShiftLeft>]')
  await user.pointer({keys: '[MouseLeft]', target: element})
  await user.keyboard('[/ShiftLeft][ControlRight>]')
  await user.pointer({keys: '[MouseLeft]', target: element})
  await user.keyboard('[/ControlRight][AltLeft>]')
  await user.pointer({keys: '[MouseLeft]', target: element})
  await user.keyboard('[/AltLeft][MetaLeft>]')
  await user.pointer({keys: '[MouseLeft]', target: element})

  expect(getEvents('click')).toEqual([
    expect.objectContaining({shiftKey: true}),
    expect.objectContaining({ctrlKey: true}),
    expect.objectContaining({altKey: true}),
    expect.objectContaining({metaKey: true}),
  ])
})

describe('delay', () => {
  const spy = mocks.spyOn(global, 'setTimeout')

  beforeEach(() => {
    spy.mockClear()
  })

  test('delay pointer actions per setTimeout', async () => {
    const {element, user} = setup(`<div></div>`, {delay: 10})

    const time0 = performance.now()
    await user.pointer([
      {keys: '[MouseLeft]', target: element},
      {coords: {x: 20, y: 20}},
      '[/MouseLeft]',
    ])

    expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(time0).toBeLessThan(performance.now() - 20)
  })

  test('do not call setTimeout with delay `null`', async () => {
    const {user} = setup(`<div></div>`, {delay: null})

    await user.pointer(['[MouseLeft]', '[MouseLeft]'])
    expect(spy).toBeCalledTimes(0)
  })
})

test('no mousedown/mouseup on disabled elements', async () => {
  const {element, getEventSnapshot, eventWasFired, user} = setup(
    '<button disabled />',
  )

  await user.pointer([
    {target: element},
    {keys: '[MouseLeft]'},
    {target: element, keys: '[TouchA]'},
  ])

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover
    button - mouseenter
    button - pointermove
    button - mousemove
    button - pointerdown
    button - pointerup
    button - pointerover
    button - pointerenter
    button - pointerdown
    button - pointerup
    button - pointerout
    button - pointerleave
  `)

  expect(eventWasFired('pointerdown')).toBe(true)
  expect(eventWasFired('pointerup')).toBe(true)
  expect(eventWasFired('mousedown')).toBe(false)
  expect(eventWasFired('mouseup')).toBe(false)
  expect(eventWasFired('click')).toBe(false)
})

describe('check for pointer-events', () => {
  let getComputedStyle: SpyInstance<Window['getComputedStyle']>
  beforeAll(() => {
    getComputedStyle = mocks.spyOn(window, 'getComputedStyle')
      .mockImplementation(
        () =>
          ({
            pointerEvents: 'foo',
          } as CSSStyleDeclaration),
      )
  })
  beforeEach(() => {
    getComputedStyle.mockClear()
    document.body.parentElement?.replaceChild(
      document.createElement('body'),
      document.body,
    )
  })
  afterAll(() => {
    mocks.restoreAllMocks()
  })

  test('skip check', async () => {
    const {element, user} = setup(`<input>`, {
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    })

    await user.pointer([
      {target: element},
      '[MouseLeft]',
      {target: document.body},
    ])

    expect(getComputedStyle).not.toBeCalled()
  })

  test('once per target', async () => {
    const {element, user} = setup(`<input>`, {
      pointerEventsCheck: PointerEventsCheckLevel.EachTarget,
    })

    await user.pointer([
      {target: element},
      '[MouseLeft]',
      {target: document.body},
    ])
    await user.pointer([
      {target: element},
      '[MouseLeft]',
      {target: document.body},
    ])

    expect(getComputedStyle).toBeCalledTimes(2)
    expect(getComputedStyle).toHaveBeenNthCalledWith(1, document.body)
    expect(getComputedStyle).toHaveBeenNthCalledWith(2, element)
  })

  test('once per api call', async () => {
    const {element, user} = setup(`<input>`, {
      pointerEventsCheck: PointerEventsCheckLevel.EachApiCall,
    })

    await user.pointer([
      {target: element},
      '[MouseLeft]',
      {target: document.body},
    ])
    await user.pointer([
      {target: element},
      '[MouseLeft]',
      {target: document.body},
    ])

    expect(getComputedStyle).toBeCalledTimes(4)
    expect(getComputedStyle).toHaveBeenNthCalledWith(1, document.body)
    expect(getComputedStyle).toHaveBeenNthCalledWith(2, element)
    expect(getComputedStyle).toHaveBeenNthCalledWith(3, document.body)
    expect(getComputedStyle).toHaveBeenNthCalledWith(4, element)
  })

  test('once per trigger', async () => {
    const {element, user} = setup(`<input>`, {
      pointerEventsCheck: PointerEventsCheckLevel.EachTrigger,
    })

    await user.pointer([
      {target: element},
      '[MouseLeft]',
      {target: document.body},
    ])

    expect(getComputedStyle).toBeCalledTimes(6)
    expect(getComputedStyle).toHaveBeenNthCalledWith(1, document.body) // leave
    expect(getComputedStyle).toHaveBeenNthCalledWith(2, element) // enter
    expect(getComputedStyle).toHaveBeenNthCalledWith(3, element) // down
    expect(getComputedStyle).toHaveBeenNthCalledWith(4, element) // up
    expect(getComputedStyle).toHaveBeenNthCalledWith(5, element) // leave
    expect(getComputedStyle).toHaveBeenNthCalledWith(6, document.body) // enter
  })
})

test('reject if target has `pointer-events: none`', async () => {
  const {element, user} = setup(`<input style="pointer-events: none"/>`)

  await expect(user.pointer({target: element})).rejects.toThrowError(
    'pointer-events',
  )
  await expect(
    user.pointer({target: element, keys: '[MouseLeft]'}),
  ).rejects.toThrowError('pointer-events')
})

test('omit pointer events on previous target if it has `pointer-events: none`', async () => {
  const {element, user} = setup(`<input/>`)
  const onPointerLeave = mocks.fn()
  element.addEventListener('pointerleave', onPointerLeave)

  await user.pointer({target: element})
  element.style.pointerEvents = 'none'
  await user.pointer({target: document.body})

  expect(onPointerLeave).not.toBeCalled()
})

test('suppress mouse events per preventDefault on pointerdown', async () => {
  const {element, user, clearEventCalls, eventWasFired} =
    setup(`<div>Drag here</div>`)
  await user.pointer({target: element, offset: 2})
  clearEventCalls()
  element.addEventListener('pointerdown', e => e.preventDefault())

  await user.pointer([
    {keys: '[MouseLeft>]'},
    {offset: 5},
    {keys: '[/MouseLeft]'},
  ])

  expect(eventWasFired('mousedown')).toBe(false)
  expect(eventWasFired('mousemove')).toBe(false)
  expect(eventWasFired('mouseup')).toBe(false)
})
