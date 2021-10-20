import userEvent from '../'
import {setup, addEventListener, addListeners} from './helpers/utils'

test('click in button', () => {
  const {element, getEventSnapshot} = setup('<button />')
  userEvent.click(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover
    button - mouseenter
    button - pointermove
    button - mousemove
    button - pointerdown
    button - mousedown: Left (0)
    button - focus
    button - focusin
    button - pointerup
    button - mouseup: Left (0)
    button - click: Left (0)
  `)
})

test('only fires pointer events when clicking a disabled button', () => {
  const {element, getEventSnapshot} = setup('<button disabled />')
  userEvent.click(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - pointermove
    button - pointerdown
    button - pointerup
  `)
})

test('clicking a checkbox', () => {
  const {element, getEventSnapshot} = setup('<input type="checkbox" />')
  expect(element).not.toBeChecked()
  userEvent.click(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[checked=true]

    input[checked=false] - pointerover
    input[checked=false] - pointerenter
    input[checked=false] - mouseover
    input[checked=false] - mouseenter
    input[checked=false] - pointermove
    input[checked=false] - mousemove
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
  `)
})

test('clicking a disabled checkbox only fires pointer events', () => {
  const {element, getEventSnapshot} = setup(
    '<input type="checkbox" disabled />',
  )
  userEvent.click(element)
  expect(element).toBeDisabled()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[checked=false]

    input[checked=false] - pointerover
    input[checked=false] - pointerenter
    input[checked=false] - pointermove
    input[checked=false] - pointerdown
    input[checked=false] - pointerup
  `)
  expect(element).toBeDisabled()
  expect(element).not.toBeChecked()
})

test('clicking a radio button', () => {
  const {element, getEventSnapshot} = setup('<input type="radio" />')
  expect(element).not.toBeChecked()
  userEvent.click(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[checked=true]

    input[checked=false] - pointerover
    input[checked=false] - pointerenter
    input[checked=false] - mouseover
    input[checked=false] - mouseenter
    input[checked=false] - pointermove
    input[checked=false] - mousemove
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
  `)

  expect(element).toBeChecked()
})

test('clicking a disabled radio button only fires pointer events', () => {
  const {element, getEventSnapshot} = setup('<input type="radio" disabled />')
  userEvent.click(element)
  expect(element).toBeDisabled()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[checked=false]

    input[checked=false] - pointerover
    input[checked=false] - pointerenter
    input[checked=false] - pointermove
    input[checked=false] - pointerdown
    input[checked=false] - pointerup
  `)
  expect(element).toBeDisabled()

  expect(element).not.toBeChecked()
})

test('should fire the correct events for <div>', () => {
  const {element, getEventSnapshot} = setup('<div></div>')
  userEvent.click(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover
    div - mouseenter
    div - pointermove
    div - mousemove
    div - pointerdown
    div - mousedown: Left (0)
    div - pointerup
    div - mouseup: Left (0)
    div - click: Left (0)
  `)
})

test('toggles the focus', () => {
  const {element} = setup(`<div><input name="a" /><input name="b" /></div>`)

  const a = element.children[0]
  const b = element.children[1]

  expect(a).not.toHaveFocus()
  expect(b).not.toHaveFocus()

  userEvent.click(a)
  expect(a).toHaveFocus()
  expect(b).not.toHaveFocus()

  userEvent.click(b)
  expect(a).not.toHaveFocus()
  expect(b).toHaveFocus()
})

test('should blur the previous element', () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(
    `<div><input name="a" /><input name="b" /></div>`,
  )

  const a = element.children[0]
  const b = element.children[1]

  const aListeners = addListeners(a)
  const bListeners = addListeners(b)

  userEvent.click(a)
  clearEventCalls()
  userEvent.click(b)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input[name="b"][value=""] - pointerover
    input[name="b"][value=""] - mouseover
    input[name="b"][value=""] - pointermove
    input[name="b"][value=""] - mousemove
    input[name="b"][value=""] - pointerdown
    input[name="b"][value=""] - mousedown: Left (0)
    input[name="a"][value=""] - focusout
    input[name="b"][value=""] - focusin
    input[name="b"][value=""] - pointerup
    input[name="b"][value=""] - mouseup: Left (0)
    input[name="b"][value=""] - click: Left (0)
  `)
  // focus/blur events don't bubble (but the focusout/focusin do!)
  // we just want to make sure the blur was fired on a
  // and the focus was fired on b
  expect(aListeners.eventWasFired('blur')).toBe(true)
  expect(bListeners.eventWasFired('focus')).toBe(true)
})

test('should not blur the previous element when mousedown prevents default', () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(
    `<div><input name="a" /><input name="b" /></div>`,
  )

  const a = element.children[0]
  const b = element.children[1]

  const aListeners = addListeners(a)
  const bListeners = addListeners(b, {
    eventHandlers: {mouseDown: e => e.preventDefault()},
  })

  userEvent.click(a)
  clearEventCalls()
  userEvent.click(b)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input[name="b"][value=""] - pointerover
    input[name="b"][value=""] - mouseover
    input[name="b"][value=""] - pointermove
    input[name="b"][value=""] - mousemove
    input[name="b"][value=""] - pointerdown
    input[name="b"][value=""] - mousedown: Left (0)
    input[name="b"][value=""] - pointerup
    input[name="b"][value=""] - mouseup: Left (0)
    input[name="b"][value=""] - click: Left (0)
  `)
  // focus/blur events don't bubble (but the focusout do!)
  // we just want to make sure the blur was fired on a
  // and the focus was fired on b
  expect(aListeners.eventWasFired('blur')).toBe(false)
  expect(bListeners.eventWasFired('focus')).toBe(false)
})

test('does not lose focus when click updates focus', () => {
  const {element} = setup(`<div><input /><button>focus</button></div>`)
  const input = element.children[0]
  const button = element.children[1]

  addEventListener(button, 'click', () => input.focus())

  expect(input).not.toHaveFocus()

  userEvent.click(button)
  expect(input).toHaveFocus()

  userEvent.click(button)
  expect(input).toHaveFocus()
})

test('gives focus to the form control when clicking the label', () => {
  const {element} = setup(`
    <div>
      <label for="input">label</label>
      <input id="input" />
    </div>
  `)
  const label = element.children[0]
  const input = element.children[1]

  userEvent.click(label)
  expect(input).toHaveFocus()
})

test('gives focus to the form control when clicking within a label', () => {
  const {element} = setup(`
    <div>
      <label for="input"><span>label</span></label>
      <input id="input" />
    </div>
  `)
  const label = element.children[0]
  const span = label.firstChild
  const input = element.children[1]

  userEvent.click(span)
  expect(input).toHaveFocus()
})

test('fires no events when clicking a label with a nested control that is disabled', () => {
  const {element, getEventSnapshot} = setup(`<label><input disabled /></label>`)
  userEvent.click(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: label`,
  )
})

test('does not crash if the label has no control', () => {
  const {element} = setup(`<label for="input">label</label>`)
  userEvent.click(element)
})

test('clicking a label checks the checkbox', () => {
  const {element} = setup(`
    <div>
      <label for="input">label</label>
      <input id="input" type="checkbox" />
    </div>
  `)
  const label = element.children[0]
  const input = element.children[1]

  userEvent.click(label)
  expect(input).toHaveFocus()
  expect(input).toBeChecked()
})

test('clicking a label checks the radio', () => {
  const {element} = setup(`
    <div>
      <label for="input">label</label>
      <input id="input" name="radio" type="radio" />
    </div>
  `)
  const label = element.children[0]
  const input = element.children[1]

  userEvent.click(label)
  expect(input).toHaveFocus()
  expect(input).toBeChecked()
})

test('submits a form when clicking on a <button>', () => {
  const {element, eventWasFired} = setup(`<form><button>Submit</button></form>`)
  userEvent.click(element.children[0])
  expect(eventWasFired('submit')).toBe(true)
})

test('does not submit a form when clicking on a <button type="button">', () => {
  const {element, getEventSnapshot} = setup(`
    <form>
      <button type="button">Submit</button>
    </form>
  `)
  userEvent.click(element.children[0])
  expect(getEventSnapshot()).not.toContain('submit')
})

test('does not fire blur on current element if is the same as previous', () => {
  const {element, getEventSnapshot, clearEventCalls} = setup('<button />')

  userEvent.click(element)
  expect(getEventSnapshot()).not.toContain('blur')

  clearEventCalls()

  userEvent.click(element)
  expect(getEventSnapshot()).not.toContain('blur')
})

test('does not give focus when mouseDown is prevented', () => {
  const {element} = setup('<input />', {
    eventHandlers: {mouseDown: e => e.preventDefault()},
  })
  userEvent.click(element)
  expect(element).not.toHaveFocus()
})

test('fires mouse events with the correct properties', () => {
  const {element, getClickEventsSnapshot} = setup('<div></div>')
  userEvent.click(element)
  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover - pointerId=1; pointerType=mouse; isPrimary=undefined
    pointerenter - pointerId=1; pointerType=mouse; isPrimary=undefined
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    pointermove - pointerId=1; pointerType=mouse; isPrimary=undefined
    mousemove - button=0; buttons=0; detail=0
    pointerdown - pointerId=undefined; pointerType=undefined; isPrimary=undefined
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=undefined; pointerType=undefined; isPrimary=undefined
    mouseup - button=0; buttons=1; detail=1
    click - button=0; buttons=1; detail=1
  `)
})

test('fires mouse events with custom button property', () => {
  const {element, getClickEventsSnapshot} = setup('<div></div>')
  userEvent.click(element, {
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
    pointerdown - pointerId=undefined; pointerType=undefined; isPrimary=undefined
    mousedown - button=1; buttons=4; detail=1
    pointerup - pointerId=undefined; pointerType=undefined; isPrimary=undefined
    mouseup - button=1; buttons=4; detail=1
    click - button=1; buttons=4; detail=1
  `)
})

test('fires mouse events with custom buttons property', () => {
  const {element, getClickEventsSnapshot} = setup('<div></div>')

  userEvent.click(element, {buttons: 4})
  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover - pointerId=1; pointerType=mouse; isPrimary=undefined
    pointerenter - pointerId=1; pointerType=mouse; isPrimary=undefined
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    pointermove - pointerId=1; pointerType=mouse; isPrimary=undefined
    mousemove - button=0; buttons=0; detail=0
    pointerdown - pointerId=undefined; pointerType=undefined; isPrimary=undefined
    mousedown - button=1; buttons=4; detail=1
    pointerup - pointerId=undefined; pointerType=undefined; isPrimary=undefined
    mouseup - button=1; buttons=4; detail=1
    click - button=1; buttons=4; detail=1
  `)
})

test('calls FocusEvents with relatedTarget', () => {
  const {element} = setup('<div><input/><input/></div>')

  const element0 = element.children[0]
  const element1 = element.children[1]
  element0.focus()
  const events0 = addListeners(element0)
  const events1 = addListeners(element1)

  userEvent.click(element1)

  expect(events0.getEvents().find(e => e.type === 'blur').relatedTarget).toBe(
    element1,
  )
  expect(events1.getEvents().find(e => e.type === 'focus').relatedTarget).toBe(
    element0,
  )
})

test('move focus to closest focusable element', () => {
  const {element} = setup(`
    <div tabIndex="0">
      <div>this is not focusable</div>
      <button>this is focusable</button>
    </div>
  `)

  document.body.focus()
  userEvent.click(element.children[1])
  expect(element.children[1]).toHaveFocus()

  document.body.focus()
  userEvent.click(element.children[0])
  expect(element).toHaveFocus()
})

test('right click fires `contextmenu` instead of `click', () => {
  const {element, getEvents, clearEventCalls} = setup(`<button/>`)

  userEvent.click(element)
  expect(getEvents('click')).toHaveLength(1)
  expect(getEvents('contextmenu')).toHaveLength(0)

  clearEventCalls()

  userEvent.click(element, {buttons: 2})
  expect(getEvents('contextmenu')).toHaveLength(1)
  expect(getEvents('click')).toHaveLength(0)
})

test('throws when clicking element with pointer-events set to none', () => {
  const {element} = setup(`<div style="pointer-events: none"></div>`)
  expect(() => userEvent.click(element)).toThrowError(/unable to click/i)
})

test('does not throws when clicking element with pointer-events set to none and skipPointerEventsCheck is set', () => {
  const {element, getEvents} = setup(`<div style="pointer-events: none"></div>`)
  userEvent.click(element, undefined, {skipPointerEventsCheck: true})
  expect(getEvents('click')).toHaveLength(1)
})
