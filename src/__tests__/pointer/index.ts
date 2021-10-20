import userEvent from '../../index'
import {wait} from '../../utils'
import {setup} from '../helpers/utils'

test('double click', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  userEvent.pointer({keys: '[MouseLeft][MouseLeft]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=0; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=0; detail=2
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=2
    click - button=0; buttons=0; detail=2
    dblclick
  `)
})

test('two clicks', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  const pointerState = userEvent.pointer({keys: '[MouseLeft]', target: element})
  userEvent.pointer({keys: '[MouseLeft]', target: element}, {pointerState})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=0; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=0; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})

test('drag sequence', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  userEvent.pointer([
    {keys: '[MouseLeft>]', target: element},
    {coords: {x: 20, y: 20}},
    '[/MouseLeft]',
  ])

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=0; detail=1
    pointermove - pointerId=1; pointerType=mouse; isPrimary=undefined
    mousemove - button=0; buttons=0; detail=0
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})

test('hover to other element', () => {
  const {elements, getEventSnapshot} = setup(`<div></div><div></div>`)

  userEvent.pointer([
    {target: elements[0], coords: {x: 20, y: 20}},
    {target: elements[1], coords: {x: 40, y: 40}},
  ])

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerenter
    div - mouseenter
    div - pointermove
    div - mousemove
    div - pointermove
    div - mousemove
    div - pointerleave
    div - mouseleave
    div - pointerenter
    div - mouseenter
    div - pointermove
    div - mousemove
  `)
})

test('hover inside element', () => {
  const {element, getEventSnapshot} = setup(`<div><a></a><p></p></div>`)

  userEvent.pointer([
    {target: element},
    {target: element.firstChild as Element},
    {target: element.lastChild as Element},
    {target: element},
  ])

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover
    div - mouseenter
    div - pointermove
    div - mousemove
    div - pointermove
    div - mousemove
    a - pointerenter
    a - mouseenter
    a - pointermove
    a - mousemove
    a - pointermove
    a - mousemove
    a - pointerleave
    a - mouseleave
    p - pointerenter
    p - mouseenter
    p - pointermove
    p - mousemove
    p - pointermove
    p - mousemove
    p - pointerleave
    p - mouseleave
    div - pointermove
    div - mousemove
  `)
})

test('continue previous target', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  const pointerState = userEvent.pointer({keys: '[MouseLeft]', target: element})
  userEvent.pointer('[MouseLeft]', {pointerState})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=0; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=0; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})

test('other keys reset click counter, but keyup/click still uses the old count', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  userEvent.pointer({
    keys: '[MouseLeft][MouseLeft>][MouseRight][MouseLeft]',
    target: element,
  })

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=0; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=0; detail=2
    mousedown - button=1; buttons=0; detail=1
    mouseup - button=1; buttons=0; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=2
    click - button=0; buttons=0; detail=2
    dblclick
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=0; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})

test('click per touch device', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  userEvent.pointer({keys: '[TouchA]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerenter - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerdown - pointerId=2; pointerType=touch; isPrimary=true
    pointerup - pointerId=2; pointerType=touch; isPrimary=true
    pointerout - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerleave - pointerId=2; pointerType=touch; isPrimary=undefined
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    mousemove - button=0; buttons=0; detail=0
    mousedown - button=0; buttons=0; detail=1
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})

test('double click per touch device', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  userEvent.pointer({keys: '[TouchA][TouchA]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerenter - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerdown - pointerId=2; pointerType=touch; isPrimary=true
    pointerup - pointerId=2; pointerType=touch; isPrimary=true
    pointerout - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerleave - pointerId=2; pointerType=touch; isPrimary=undefined
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    mousemove - button=0; buttons=0; detail=0
    mousedown - button=0; buttons=0; detail=1
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerover - pointerId=3; pointerType=touch; isPrimary=undefined
    pointerenter - pointerId=3; pointerType=touch; isPrimary=undefined
    pointerdown - pointerId=3; pointerType=touch; isPrimary=true
    pointerup - pointerId=3; pointerType=touch; isPrimary=true
    pointerout - pointerId=3; pointerType=touch; isPrimary=undefined
    pointerleave - pointerId=3; pointerType=touch; isPrimary=undefined
    mousemove - button=0; buttons=0; detail=0
    mousedown - button=0; buttons=0; detail=2
    mouseup - button=0; buttons=0; detail=2
    click - button=0; buttons=0; detail=2
    dblclick
  `)
})

test('multi touch does not click', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  userEvent.pointer({keys: '[TouchA>][TouchB][/TouchA]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerenter - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerdown - pointerId=2; pointerType=touch; isPrimary=true
    pointerover - pointerId=3; pointerType=touch; isPrimary=undefined
    pointerenter - pointerId=3; pointerType=touch; isPrimary=undefined
    pointerdown - pointerId=3; pointerType=touch; isPrimary=false
    pointerup - pointerId=3; pointerType=touch; isPrimary=false
    pointerout - pointerId=3; pointerType=touch; isPrimary=undefined
    pointerleave - pointerId=3; pointerType=touch; isPrimary=undefined
    pointerup - pointerId=2; pointerType=touch; isPrimary=true
    pointerout - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerleave - pointerId=2; pointerType=touch; isPrimary=undefined
  `)
})

test('drag touch', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  userEvent.pointer([
    {keys: '[TouchA>]', target: element},
    {pointerName: 'TouchA', coords: {x: 20, y: 20}},
    '[/TouchA]',
  ])

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerenter - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerdown - pointerId=2; pointerType=touch; isPrimary=true
    pointermove - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerup - pointerId=2; pointerType=touch; isPrimary=true
    pointerout - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerleave - pointerId=2; pointerType=touch; isPrimary=undefined
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    mousemove - button=0; buttons=0; detail=0
    mousedown - button=0; buttons=0; detail=1
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})

test('move touch over elements', () => {
  const {element, getEventSnapshot} = setup(`<div><a></a><p></p></div>`)

  userEvent.pointer([
    {keys: '[TouchA>]', target: element},
    {pointerName: 'TouchA', target: element.firstChild as Element},
    {pointerName: 'TouchA', target: element.lastChild as Element},
    {pointerName: 'TouchA', target: element},
    {keys: '[/TouchA]', target: element},
  ])

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - pointerdown
    div - pointermove
    a - pointerenter
    a - pointermove
    a - pointermove
    a - pointerleave
    p - pointerenter
    p - pointermove
    p - pointermove
    p - pointerleave
    div - pointermove
    div - pointerup
    div - pointerout
    div - pointerleave
    div - mouseover
    div - mouseenter
    div - mousemove
    div - mousedown
    div - mouseup
    div - click
  `)
})

test('unknown button does nothing', () => {
  const {element, getEvents} = setup(`<div></div>`)

  userEvent.pointer({keys: '[foo]', target: element})

  expect(getEvents()).toEqual([])
})

test('pointer without previous target results in error', async () => {
  await expect(
    userEvent.pointer({keys: '[MouseLeft]'}, {delay: 1}),
  ).rejects.toThrowError('no previous position')
})

describe('error', () => {
  afterEach(() => {
    ;(console.error as jest.MockedFunction<typeof console.error>).mockClear()
  })

  it('error for unknown pointer in sync', async () => {
    const err = jest.spyOn(console, 'error')
    err.mockImplementation(() => {})

    const {element} = setup(`<div></div>`)
    userEvent.pointer({pointerName: 'foo', target: element})

    // the catch will be asynchronous
    await wait(10)

    expect(err).toHaveBeenCalledWith(expect.any(Error) as unknown)
    expect(err.mock.calls[0][0]).toHaveProperty(
      'message',
      expect.stringContaining('does not exist'),
    )
  })

  it('error for unknown pointer in async', async () => {
    const {element} = setup(`<div></div>`)
    const promise = userEvent.pointer(
      {pointerName: 'foo', target: element},
      {delay: 1},
    )

    return expect(promise).rejects.toThrowError('does not exist')
  })
})

test('asynchronous pointer', async () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  // eslint-disable-next-line testing-library/no-await-sync-events
  const pointerState = await userEvent.pointer(
    {keys: '[MouseLeft]', target: element},
    {delay: 1},
  )
  // eslint-disable-next-line testing-library/no-await-sync-events
  await userEvent.pointer([{coords: {x: 20, y: 20}}, '[/MouseLeft]'], {
    delay: 1,
    pointerState,
  })

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=0; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointermove - pointerId=1; pointerType=mouse; isPrimary=undefined
    mousemove - button=0; buttons=0; detail=0
  `)
})

test('apply modifiers from keyboardstate', async () => {
  const {element, getEvents} = setup(`<input/>`)

  element.focus()
  let keyboardState = userEvent.keyboard('[ShiftLeft>]')
  userEvent.pointer({keys: '[MouseLeft]', target: element}, {keyboardState})
  keyboardState = userEvent.keyboard('[/ShiftLeft][ControlRight>]', {
    keyboardState,
  })
  userEvent.pointer({keys: '[MouseLeft]', target: element}, {keyboardState})
  keyboardState = userEvent.keyboard('[/ControlRight][AltLeft>]', {
    keyboardState,
  })
  userEvent.pointer({keys: '[MouseLeft]', target: element}, {keyboardState})
  keyboardState = userEvent.keyboard('[/AltLeft][MetaLeft>]', {keyboardState})
  userEvent.pointer({keys: '[MouseLeft]', target: element}, {keyboardState})

  expect(getEvents('click')).toEqual([
    expect.objectContaining({shiftKey: true}),
    expect.objectContaining({ctrlKey: true}),
    expect.objectContaining({altKey: true}),
    expect.objectContaining({metaKey: true}),
  ])
})
