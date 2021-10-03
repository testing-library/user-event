import userEvent from '../'
import {setup, addEventListener, addListeners} from './helpers/utils'

test('fires the correct events on buttons', () => {
  const {element, getEventSnapshot} = setup('<button />')
  userEvent.dblClick(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover: Left (0)
    button - mouseenter: Left (0)
    button - pointermove
    button - mousemove: Left (0)
    button - pointerdown
    button - mousedown: Left (0)
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: Left (0)
    button - click: Left (0)
    button - pointerdown
    button - mousedown: Left (0)
    button - pointerup
    button - mouseup: Left (0)
    button - click: Left (0)
    button - dblclick: Left (0)
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
test('fires the correct events on checkboxes', () => {
  const {element, getEventSnapshot} = setup('<input type="checkbox" />')
  userEvent.dblClick(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[checked=false]

    input[checked=false] - pointerover
    input[checked=false] - pointerenter
    input[checked=false] - mouseover: Left (0)
    input[checked=false] - mouseenter: Left (0)
    input[checked=false] - pointermove
    input[checked=false] - mousemove: Left (0)
    input[checked=false] - pointerdown
    input[checked=false] - mousedown: Left (0)
    input[checked=false] - focus
    input[checked=false] - focusin
    input[checked=false] - pointerup
    input[checked=false] - mouseup: Left (0)
    input[checked=true] - click: Left (0)
      unchecked -> checked
    input[checked=true] - input
    input[checked=true] - change
    input[checked=true] - pointerdown
    input[checked=true] - mousedown: Left (0)
    input[checked=true] - pointerup
    input[checked=true] - mouseup: Left (0)
    input[checked=false] - click: Left (0)
      checked -> unchecked
    input[checked=false] - input
    input[checked=false] - change
    input[checked=false] - dblclick: Left (0)
  `)
})

test('fires the correct events on regular inputs', () => {
  const {element, getEventSnapshot} = setup('<input />')
  userEvent.dblClick(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - dblclick: Left (0)
  `)
})

test('fires the correct events on divs', () => {
  const {element, getEventSnapshot} = setup('<div></div>')
  userEvent.dblClick(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover: Left (0)
    div - mouseenter: Left (0)
    div - pointermove
    div - mousemove: Left (0)
    div - pointerdown
    div - mousedown: Left (0)
    div - pointerup
    div - mouseup: Left (0)
    div - click: Left (0)
    div - pointerdown
    div - mousedown: Left (0)
    div - pointerup
    div - mouseup: Left (0)
    div - click: Left (0)
    div - dblclick: Left (0)
  `)
})

test('blurs the previous element', () => {
  const {element} = setup(`
    <div>
      <button id="button-a" />
      <button id="button-b" />
    </div>
  `)

  const a = element.children[0]
  const b = element.children[1]

  const {getEventSnapshot, clearEventCalls} = addListeners(a)

  userEvent.dblClick(a)
  clearEventCalls()
  userEvent.dblClick(b)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button#button-a

    button#button-a - blur
    button#button-a - focusout
  `)
})

test('does not fire focus event if the element is already focused', () => {
  const {element, clearEventCalls, eventWasFired} = setup(`<button />`)
  element.focus()
  clearEventCalls()
  userEvent.dblClick(element)
  expect(eventWasFired('focus')).toBe(false)
})

test('clicking an element in a label gives the control focus', () => {
  const {element} = setup(`
    <div>
      <label for="nested-input">
        <span>nested</span>
      </label>
      <input id="nested-input" />
    </div>
  `)
  userEvent.dblClick(element.querySelector('span'))
  expect(element.querySelector('input')).toHaveFocus()
})

test('does not blur the previous element when mousedown prevents default', () => {
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

  userEvent.dblClick(a)
  clearEventCalls()
  userEvent.dblClick(b)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: button#button-a`,
  )
})

test('fires mouse events with the correct properties', () => {
  const {element, getClickEventsSnapshot} = setup('<div></div>')
  userEvent.dblClick(element)
  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover
    pointerenter
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    pointermove
    mousemove - button=0; buttons=0; detail=0
    pointerdown
    mousedown - button=0; buttons=1; detail=1
    pointerup
    mouseup - button=0; buttons=1; detail=1
    click - button=0; buttons=1; detail=1
    pointerdown
    mousedown - button=0; buttons=1; detail=2
    pointerup
    mouseup - button=0; buttons=1; detail=2
    click - button=0; buttons=1; detail=2
    dblclick - button=0; buttons=1; detail=2
  `)
})

test('fires mouse events with custom button property', () => {
  const {element, getClickEventsSnapshot} = setup('<div></div>')
  userEvent.dblClick(element, {
    button: 1,
    altKey: true,
  })
  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover
    pointerenter
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    pointermove
    mousemove - button=0; buttons=0; detail=0
    pointerdown
    mousedown - button=1; buttons=4; detail=1
    pointerup
    mouseup - button=1; buttons=4; detail=1
    click - button=1; buttons=4; detail=1
    pointerdown
    mousedown - button=1; buttons=4; detail=2
    pointerup
    mouseup - button=1; buttons=4; detail=2
    click - button=1; buttons=4; detail=2
    dblclick - button=1; buttons=4; detail=2
  `)
})

test('fires mouse events with custom buttons property', () => {
  const {element, getClickEventsSnapshot} = setup('<div></div>')

  userEvent.dblClick(element, {buttons: 4})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover
    pointerenter
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    pointermove
    mousemove - button=0; buttons=0; detail=0
    pointerdown
    mousedown - button=1; buttons=4; detail=1
    pointerup
    mouseup - button=1; buttons=4; detail=1
    click - button=1; buttons=4; detail=1
    pointerdown
    mousedown - button=1; buttons=4; detail=2
    pointerup
    mouseup - button=1; buttons=4; detail=2
    click - button=1; buttons=4; detail=2
    dblclick - button=1; buttons=4; detail=2
  `)
})

test('throws an error when dblClick element with pointer-events set to none', () => {
  const {element} = setup(`<div style="pointer-events: none"></div>`)
  expect(() => userEvent.dblClick(element)).toThrowError(
    /unable to double-click/i,
  )
})

test('does not throws when clicking element with pointer-events set to none and skipPointerEventsCheck is set', () => {
  const {element, getEvents} = setup(`<div style="pointer-events: none"></div>`)
  userEvent.dblClick(element, undefined, {skipPointerEventsCheck: true})
  expect(getEvents('click')).toHaveLength(2)
})
