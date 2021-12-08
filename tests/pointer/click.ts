import userEvent from '#src'
import {setup} from '#testHelpers/utils'

test('click element', async () => {
  const {element, getClickEventsSnapshot, getEvents} = setup('<div />')
  await userEvent.pointer({keys: '[MouseLeft]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
  expect(getEvents('click')).toHaveLength(1)
})

test('double click', async () => {
  const {element, getClickEventsSnapshot, getEvents} = setup(`<div></div>`)

  await userEvent.pointer({keys: '[MouseLeft][MouseLeft]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=2
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=2
    click - button=0; buttons=0; detail=2
    dblclick - button=0; buttons=0; detail=2
  `)

  expect(getEvents('dblclick')).toHaveLength(1)
  expect(getEvents('click')).toHaveLength(2)

  // detail reflects the click count
  expect(getEvents('mousedown')[1]).toHaveProperty('detail', 2)
  expect(getEvents('dblclick')[0]).toHaveProperty('detail', 2)
})

test('two clicks', async () => {
  const {element, getClickEventsSnapshot, getEvents} = setup(`<div></div>`)

  const pointerState = await userEvent.pointer({
    keys: '[MouseLeft]',
    target: element,
  })
  await userEvent.pointer(
    {keys: '[MouseLeft]', target: element},
    {pointerState},
  )

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)

  expect(getEvents('dblclick')).toHaveLength(0)
  expect(getEvents('click')).toHaveLength(2)

  expect(getEvents('mousedown')[1]).toHaveProperty('detail', 1)
})

test('other keys reset click counter, but keyup/click still uses the old count', async () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  await userEvent.pointer({
    keys: '[MouseLeft][MouseLeft>][MouseRight][MouseLeft]',
    target: element,
  })

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=2
    mousedown - button=2; buttons=3; detail=1
    mouseup - button=2; buttons=1; detail=1
    contextmenu - button=0; buttons=0; detail=0
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=2
    click - button=0; buttons=0; detail=2
    dblclick - button=0; buttons=0; detail=2
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)

  // TODO: no click events after other button
  // TODO: no multiple pointerdown events while another button is still pressed
  // expect(getEvents('dblclick')).toHaveLength(0)
  // expect(getEvents('click')).toHaveLength(1)
  //   expect(getEvents('mousedown')).toHaveLength(3)
  //   expect(getEvents('mousedown')[1]).toHaveProperty('detail', 2)
  //   expect(getEvents('mousedown')[3]).toHaveProperty('detail', 1)
  //   expect(getEvents('mouseup')).toHaveLength(3)
  //   expect(getEvents('mouseup')[1]).toHaveProperty('detail', 2)
})

test('click per touch device', async () => {
  const {element, getClickEventsSnapshot, getEvents} = setup(`<div></div>`)

  await userEvent.pointer({keys: '[TouchA]', target: element})

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

  // mouse is pointerId=1, every other pointer gets a new id
  expect(getEvents('click')).toHaveLength(1)
  expect(getEvents('click')[0]).toHaveProperty('pointerId', 2)
})

test('double click per touch device', async () => {
  const {element, getClickEventsSnapshot, getEvents} = setup(`<div></div>`)

  await userEvent.pointer({keys: '[TouchA][TouchA]', target: element})

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
    dblclick - button=0; buttons=0; detail=2
  `)

  // mouse is pointerId=1, every other pointer gets a new id
  expect(getEvents('click')).toHaveLength(2)
  expect(getEvents('click')[0]).toHaveProperty('pointerId', 2)
  expect(getEvents('click')[1]).toHaveProperty('pointerId', 3)
  expect(getEvents('dblclick')).toHaveLength(1)
  expect(getEvents('dblclick')[0]).toHaveProperty('pointerId', undefined)
})

test('multi touch does not click', async () => {
  const {element, getEvents} = setup(`<div></div>`)

  await userEvent.pointer({keys: '[TouchA>][TouchB][/TouchA]', target: element})

  expect(getEvents('click')).toHaveLength(0)
})
