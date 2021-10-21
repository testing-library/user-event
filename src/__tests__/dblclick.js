import userEvent from '../'
import {setup, addEventListener, addListeners} from './helpers/utils'

test('fires the correct events on buttons', () => {
  const {element, getEventSnapshot} = setup('<button />')
  userEvent.dblClick(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover
    button - mouseenter
    button - pointermove
    button - mousemove
    button - pointerdown
    button - mousedown
    button - focus
    button - focusin
    button - pointerup
    button - mouseup
    button - click
    button - pointerdown
    button - mousedown
    button - pointerup
    button - mouseup
    button - click
    button - dblclick
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
    input[checked=false] - mouseover
    input[checked=false] - mouseenter
    input[checked=false] - pointermove
    input[checked=false] - mousemove
    input[checked=false] - pointerdown
    input[checked=false] - mousedown
    input[checked=false] - focus
    input[checked=false] - focusin
    input[checked=false] - pointerup
    input[checked=false] - mouseup
    input[checked=true] - click
      unchecked -> checked
    input[checked=true] - input
    input[checked=true] - change
    input[checked=true] - pointerdown
    input[checked=true] - mousedown
    input[checked=true] - pointerup
    input[checked=true] - mouseup
    input[checked=false] - click
      checked -> unchecked
    input[checked=false] - input
    input[checked=false] - change
    input[checked=false] - dblclick
  `)
})

test('fires the correct events on regular inputs', () => {
  const {element, getEventSnapshot} = setup('<input />')
  userEvent.dblClick(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup
    input[value=""] - click
    input[value=""] - pointerdown
    input[value=""] - mousedown
    input[value=""] - pointerup
    input[value=""] - mouseup
    input[value=""] - click
    input[value=""] - dblclick
  `)
})

test('fires the correct events on divs', () => {
  const {element, getEventSnapshot} = setup('<div></div>')
  userEvent.dblClick(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover
    div - mouseenter
    div - pointermove
    div - mousemove
    div - pointerdown
    div - mousedown
    div - pointerup
    div - mouseup
    div - click
    div - pointerdown
    div - mousedown
    div - pointerup
    div - mouseup
    div - click
    div - dblclick
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
    dblclick
  `)
})

test('fires mouse events with custom button property', () => {
  const {element, getClickEventsSnapshot} = setup('<div></div>')
  userEvent.dblClick(element, {
    button: 1,
    altKey: true,
  })
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
    dblclick
  `)
})

test('fires mouse events with custom buttons property', () => {
  const {element, getClickEventsSnapshot} = setup('<div></div>')

  userEvent.dblClick(element, {buttons: 4})

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
    dblclick
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
