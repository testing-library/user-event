import userEvent from '#src'
import {setup} from '#testHelpers/utils'

test('drag sequence', async () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  await userEvent.pointer([
    {keys: '[MouseLeft>]', target: element},
    {coords: {x: 20, y: 20}},
    '[/MouseLeft]',
  ])

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointermove - pointerId=1; pointerType=mouse; isPrimary=undefined
    mousemove - button=0; buttons=1; detail=0
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})

test('drag touch', async () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  await userEvent.pointer([
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
