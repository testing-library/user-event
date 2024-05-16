import {setup} from '#testHelpers'

test('drag sequence', async () => {
  const {element, getClickEventsSnapshot, user} = setup(`<div></div>`)

  await user.pointer([
    {keys: '[MouseLeft>]', target: element},
    {coords: {x: 20, y: 20}},
    '[/MouseLeft]',
  ])

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true; button=0; buttons=1
    mousedown - button=0; buttons=1; detail=1
    pointermove - pointerId=1; pointerType=mouse; isPrimary=true; button=-1; buttons=1
    mousemove - button=0; buttons=1; detail=0
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true; button=0; buttons=0
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})

test('drag touch', async () => {
  const {element, getClickEventsSnapshot, user} = setup(`<div></div>`)

  await user.pointer([
    {keys: '[TouchA>]', target: element},
    {pointerName: 'TouchA', coords: {x: 20, y: 20}},
    '[/TouchA]',
  ])

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover - pointerId=2; pointerType=touch; isPrimary=true; button=0; buttons=1
    pointerenter - pointerId=2; pointerType=touch; isPrimary=true; button=0; buttons=1
    pointerdown - pointerId=2; pointerType=touch; isPrimary=true; button=0; buttons=1
    pointermove - pointerId=2; pointerType=touch; isPrimary=true; button=-1; buttons=1
    pointerup - pointerId=2; pointerType=touch; isPrimary=true; button=0; buttons=0
    pointerout - pointerId=2; pointerType=touch; isPrimary=true; button=0; buttons=0
    pointerleave - pointerId=2; pointerType=touch; isPrimary=true; button=0; buttons=0
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    mousemove - button=0; buttons=0; detail=0
    mousedown - button=0; buttons=1; detail=1
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})
