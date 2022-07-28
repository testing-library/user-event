import {setup} from '#testHelpers'

test('hover to other element', async () => {
  const {elements, getEventSnapshot, user} = setup(`<div></div><div></div>`)

  await user.pointer([
    {target: elements[0], coords: {x: 20, y: 20}},
    {target: elements[1], coords: {x: 40, y: 40}},
  ])

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover
    div - mouseenter
    div - pointermove
    div - mousemove
    div - pointerout
    div - mouseout
    div - pointerover
    div - mouseover
    div - pointermove
    div - mousemove
  `)
})

test('hover inside element', async () => {
  const {element, getEventSnapshot, user} = setup(`<div><a></a><p></p></div>`)

  await user.pointer([
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
    div - pointerout
    div - mouseout
    a - pointerover
    a - mouseover
    a - pointermove
    a - mousemove
    a - pointerout
    a - mouseout
    p - pointerover
    p - mouseover
    p - pointermove
    p - mousemove
    p - pointerout
    p - mouseout
    div - pointerover
    div - mouseover
    div - pointermove
    div - mousemove
  `)
})

test('move touch over elements', async () => {
  const {element, getEventSnapshot, user} = setup(`<div><a></a><p></p></div>`)

  await user.pointer([
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
    div - pointerout
    a - pointerover
    a - pointermove
    a - pointerout
    p - pointerover
    p - pointermove
    p - pointerout
    div - pointerover
    div - pointermove
    div - pointerup
    div - pointerout
    div - pointerleave
    div - mouseover
    div - mouseenter
    div - mousemove
    div - mousedown: primary
    div - mouseup: primary
    div - click: primary
  `)
})
