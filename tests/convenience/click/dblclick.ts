import userEvent from '#src'
import {setup, addEventListener, addListeners} from '#testHelpers/utils'

test('fires the correct events on buttons', async () => {
  const {element, getEventSnapshot} = setup('<button />')
  await userEvent.dblClick(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover
    button - mouseenter
    button - pointermove
    button - mousemove
    button - pointerdown
    button - mousedown: primary
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: primary
    button - click: primary
    button - pointerdown
    button - mousedown: primary
    button - pointerup
    button - mouseup: primary
    button - click: primary
    button - dblclick: primary
  `)
})

/*
input[checked=false] - pointerdown
input[checked=false] - mousedown
input[checked=false] - focus
input[checked=false] - focusin
input[checked=false] - pointerup
input[checked=false] - mouseup
input[checked=true] - click
input[checked=true] - input
input[checked=true] - change
input[checked=true] - pointerdown
input[checked=true] - mousedown
input[checked=true] - pointerup
input[checked=true] - mouseup
input[checked=false] - click
input[checked=false] - input
input[checked=false] - change
input[checked=false] - dblclick
*/
test('fires the correct events on checkboxes', async () => {
  const {element, getEventSnapshot} = setup('<input type="checkbox" />')
  await userEvent.dblClick(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[checked=false]

    input[checked=false] - pointerover
    input[checked=false] - pointerenter
    input[checked=false] - mouseover
    input[checked=false] - mouseenter
    input[checked=false] - pointermove
    input[checked=false] - mousemove
    input[checked=false] - pointerdown
    input[checked=false] - mousedown: primary
    input[checked=false] - focus
    input[checked=false] - focusin
    input[checked=false] - pointerup
    input[checked=false] - mouseup: primary
    input[checked=true] - click: primary
      unchecked -> checked
    input[checked=true] - input
    input[checked=true] - change
    input[checked=true] - pointerdown
    input[checked=true] - mousedown: primary
    input[checked=true] - pointerup
    input[checked=true] - mouseup: primary
    input[checked=false] - click: primary
      checked -> unchecked
    input[checked=false] - input
    input[checked=false] - change
    input[checked=false] - dblclick: primary
  `)
})

test('fires the correct events on regular inputs', async () => {
  const {element, getEventSnapshot} = setup('<input />')
  await userEvent.dblClick(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - dblclick: primary
  `)
})

test('fires the correct events on divs', async () => {
  const {element, getEventSnapshot} = setup('<div></div>')
  await userEvent.dblClick(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover
    div - mouseenter
    div - pointermove
    div - mousemove
    div - pointerdown
    div - mousedown: primary
    div - pointerup
    div - mouseup: primary
    div - click: primary
    div - pointerdown
    div - mousedown: primary
    div - pointerup
    div - mouseup: primary
    div - click: primary
    div - dblclick: primary
  `)
})

test('blurs the previous element', async () => {
  const {element} = setup(`
    <div>
      <button id="button-a" />
      <button id="button-b" />
    </div>
  `)

  const a = element.children[0]
  const b = element.children[1]

  const {getEventSnapshot, clearEventCalls} = addListeners(a)

  await userEvent.dblClick(a)
  clearEventCalls()
  await userEvent.dblClick(b)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button#button-a

    button#button-a - blur
    button#button-a - focusout
  `)
})

test('does not fire focus event if the element is already focused', async () => {
  const {element, clearEventCalls, eventWasFired} = setup(`<button />`)
  element.focus()
  clearEventCalls()
  await userEvent.dblClick(element)
  expect(eventWasFired('focus')).toBe(false)
})

test('clicking an element in a label gives the control focus', async () => {
  const {element} = setup(`
    <div>
      <label for="nested-input">
        <span>nested</span>
      </label>
      <input id="nested-input" />
    </div>
  `)
  await userEvent.dblClick(element.querySelector('span') as HTMLSpanElement)
  expect(element.querySelector('input')).toHaveFocus()
})

test('does not blur the previous element when mousedown prevents default', async () => {
  const {element} = setup(`
    <div>
      <button id="button-a" />
      <button id="button-b" />
    </div>
  `)

  const a = element.children[0]
  const b = element.children[1]

  addEventListener(b, 'mousedown', e => e.preventDefault())

  const {getEventSnapshot, clearEventCalls} = addListeners(a)

  await userEvent.dblClick(a)
  clearEventCalls()
  await userEvent.dblClick(b)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: button#button-a`,
  )
})

test('fires mouse events with the correct properties', async () => {
  const {element, getClickEventsSnapshot} = setup('<div></div>')
  await userEvent.dblClick(element)
  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover - pointerId=1; pointerType=mouse; isPrimary=undefined
    pointerenter - pointerId=1; pointerType=mouse; isPrimary=undefined
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    pointermove - pointerId=1; pointerType=mouse; isPrimary=undefined
    mousemove - button=0; buttons=0; detail=0
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
})

test('throws an error when dblClick element with pointer-events set to none', async () => {
  const {element} = setup(`<div style="pointer-events: none"></div>`)
  await expect(userEvent.dblClick(element)).rejects.toThrowError(
    /unable to double-click/i,
  )
})

test('does not throws when clicking element with pointer-events set to none and skipPointerEventsCheck is set', async () => {
  const {element, getEvents} = setup(`<div style="pointer-events: none"></div>`)
  await userEvent.dblClick(element, {skipPointerEventsCheck: true})
  expect(getEvents('click')).toHaveLength(2)
})
