import userEvent from '#src'
import {setup} from '#testHelpers/utils'

test('continue previous target', async () => {
  const {element, getEvents} = setup(`<div></div>`)

  const pointerState = await userEvent.pointer({
    keys: '[MouseLeft]',
    target: element,
  })
  await userEvent.pointer('[MouseLeft]', {pointerState})

  expect(getEvents('click')).toHaveLength(2)
})

test('unknown button does nothing', async () => {
  const {element, getEvents} = setup(`<div></div>`)

  await userEvent.pointer({keys: '[foo]', target: element})

  expect(getEvents()).toEqual([])
})

test('pointer without previous target results in error', async () => {
  await expect(userEvent.pointer({keys: '[TouchA]'})).rejects.toThrowError(
    'no previous position',
  )
})

test('unknown pointer results in error', async () => {
  const {element} = setup(`<div></div>`)

  await expect(
    userEvent.pointer({pointerName: 'foo', target: element}, {delay: 1}),
  ).rejects.toThrowError('does not exist')
})

test('apply modifiers from keyboardstate', async () => {
  const {element, getEvents} = setup(`<input/>`)

  element.focus()
  let keyboardState = await userEvent.keyboard('[ShiftLeft>]')
  await userEvent.pointer(
    {keys: '[MouseLeft]', target: element},
    {keyboardState},
  )
  keyboardState = await userEvent.keyboard('[/ShiftLeft][ControlRight>]', {
    keyboardState,
  })
  await userEvent.pointer(
    {keys: '[MouseLeft]', target: element},
    {keyboardState},
  )
  keyboardState = await userEvent.keyboard('[/ControlRight][AltLeft>]', {
    keyboardState,
  })
  await userEvent.pointer(
    {keys: '[MouseLeft]', target: element},
    {keyboardState},
  )
  keyboardState = await userEvent.keyboard('[/AltLeft][MetaLeft>]', {
    keyboardState,
  })
  await userEvent.pointer(
    {keys: '[MouseLeft]', target: element},
    {keyboardState},
  )

  expect(getEvents('click')).toEqual([
    expect.objectContaining({shiftKey: true}),
    expect.objectContaining({ctrlKey: true}),
    expect.objectContaining({altKey: true}),
    expect.objectContaining({metaKey: true}),
  ])
})

describe('delay', () => {
  const spy = jest.spyOn(global, 'setTimeout')

  beforeEach(() => {
    spy.mockClear()
  })

  test('delay pointer actions per setTimeout', async () => {
    const {element} = setup(`<div></div>`)

    const time0 = performance.now()
    await userEvent.pointer(
      [
        {keys: '[MouseLeft]', target: element},
        {coords: {x: 20, y: 20}},
        '[/MouseLeft]',
      ],
      {delay: 10},
    )

    // we don't call delay after the last action
    // TODO: Should we call it?
    expect(spy).toBeCalledTimes(2)
    expect(time0).toBeLessThan(performance.now() - 20)
  })

  test('do not call setTimeout with delay `null`', async () => {
    setup(`<div></div>`)

    await userEvent.pointer(['[MouseLeft]', '[MouseLeft]'], {delay: null})
    expect(spy).toBeCalledTimes(0)
  })
})

test('only pointer events on disabled elements', async () => {
  const {element, getEventSnapshot, getEvents} = setup('<button disabled />')

  await userEvent.pointer([{target: element}, {keys: '[MouseLeft]'}])

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - pointermove
  `)

  expect(getEvents('pointerover')).toHaveLength(1)
  // TODO: pointer down/up also happen on disabled elements
  // expect(getEvents('pointerdown')).toHaveLength(1)
  expect(getEvents('mouseover')).toHaveLength(0)
  expect(getEvents('mousedown')).toHaveLength(0)
  expect(getEvents('click')).toHaveLength(0)
})
