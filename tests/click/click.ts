import userEvent from '#src'
import {setup, addEventListener, addListeners} from '#testHelpers/utils'

test('click in button', async () => {
  const {element, getEventSnapshot} = setup('<button />')
  await userEvent.click(element)
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
  `)
})

test('only fires pointer events when clicking a disabled button', async () => {
  const {element, getEventSnapshot} = setup('<button disabled />')
  await userEvent.click(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - pointermove
  `)
})

test('clicking a checkbox', async () => {
  const {element, getEventSnapshot} = setup('<input type="checkbox" />')
  expect(element).not.toBeChecked()
  await userEvent.click(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[checked=true]

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
  `)
})

test('clicking a disabled checkbox only fires pointer events', async () => {
  const {element, getEventSnapshot} = setup(
    '<input type="checkbox" disabled />',
  )
  await userEvent.click(element)
  expect(element).toBeDisabled()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[checked=false]

    input[checked=false] - pointerover
    input[checked=false] - pointerenter
    input[checked=false] - pointermove
  `)
  expect(element).toBeDisabled()
  expect(element).not.toBeChecked()
})

test('clicking a radio button', async () => {
  const {element, getEventSnapshot} = setup('<input type="radio" />')
  expect(element).not.toBeChecked()
  await userEvent.click(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[checked=true]

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
  `)

  expect(element).toBeChecked()
})

test('clicking a disabled radio button only fires pointer events', async () => {
  const {element, getEventSnapshot} = setup('<input type="radio" disabled />')
  await userEvent.click(element)
  expect(element).toBeDisabled()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[checked=false]

    input[checked=false] - pointerover
    input[checked=false] - pointerenter
    input[checked=false] - pointermove
  `)
  expect(element).toBeDisabled()

  expect(element).not.toBeChecked()
})

test('should fire the correct events for <div>', async () => {
  const {element, getEventSnapshot} = setup('<div></div>')
  await userEvent.click(element)
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
  `)
})

test('toggles the focus', async () => {
  const {element} = setup(`<div><input name="a" /><input name="b" /></div>`)

  const a = element.children[0]
  const b = element.children[1]

  expect(a).not.toHaveFocus()
  expect(b).not.toHaveFocus()

  await userEvent.click(a)
  expect(a).toHaveFocus()
  expect(b).not.toHaveFocus()

  await userEvent.click(b)
  expect(a).not.toHaveFocus()
  expect(b).toHaveFocus()
})

test('should blur the previous element', async () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(
    `<div><input name="a" /><input name="b" /></div>`,
  )

  const a = element.children[0]
  const b = element.children[1]

  const aListeners = addListeners(a)
  const bListeners = addListeners(b)

  await userEvent.click(a)
  clearEventCalls()
  await userEvent.click(b)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input[name="b"][value=""] - pointerover
    input[name="b"][value=""] - mouseover
    input[name="b"][value=""] - pointermove
    input[name="b"][value=""] - mousemove
    input[name="b"][value=""] - pointerdown
    input[name="b"][value=""] - mousedown: primary
    input[name="a"][value=""] - focusout
    input[name="b"][value=""] - focusin
    input[name="b"][value=""] - pointerup
    input[name="b"][value=""] - mouseup: primary
    input[name="b"][value=""] - click: primary
  `)
  // focus/blur events don't bubble (but the focusout/focusin do!)
  // we just want to make sure the blur was fired on a
  // and the focus was fired on b
  expect(aListeners.eventWasFired('blur')).toBe(true)
  expect(bListeners.eventWasFired('focus')).toBe(true)
})

test('should not blur the previous element when mousedown prevents default', async () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(
    `<div><input name="a" /><input name="b" /></div>`,
  )

  const a = element.children[0]
  const b = element.children[1]

  const aListeners = addListeners(a)
  const bListeners = addListeners(b, {
    eventHandlers: {mouseDown: e => e.preventDefault()},
  })

  await userEvent.click(a)
  clearEventCalls()
  await userEvent.click(b)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input[name="b"][value=""] - pointerover
    input[name="b"][value=""] - mouseover
    input[name="b"][value=""] - pointermove
    input[name="b"][value=""] - mousemove
    input[name="b"][value=""] - pointerdown
    input[name="b"][value=""] - mousedown: primary
    input[name="b"][value=""] - pointerup
    input[name="b"][value=""] - mouseup: primary
    input[name="b"][value=""] - click: primary
  `)
  // focus/blur events don't bubble (but the focusout do!)
  // we just want to make sure the blur was fired on a
  // and the focus was fired on b
  expect(aListeners.eventWasFired('blur')).toBe(false)
  expect(bListeners.eventWasFired('focus')).toBe(false)
})

test('does not lose focus when click updates focus', async () => {
  const {element} = setup(`<div><input /><button>focus</button></div>`)
  const input = element.children[0] as HTMLInputElement
  const button = element.children[1] as HTMLButtonElement

  addEventListener(button, 'click', async () => input.focus())

  expect(input).not.toHaveFocus()

  await userEvent.click(button)
  expect(input).toHaveFocus()

  await userEvent.click(button)
  expect(input).toHaveFocus()
})

test('gives focus to the form control when clicking the label', async () => {
  const {element} = setup(`
    <div>
      <label for="input">label</label>
      <input id="input" />
    </div>
  `)
  const label = element.children[0]
  const input = element.children[1]

  await userEvent.click(label)
  expect(input).toHaveFocus()
})

test('gives focus to the form control when clicking within a label', async () => {
  const {element} = setup(`
    <div>
      <label for="input"><span>label</span></label>
      <input id="input" />
    </div>
  `)
  const label = element.children[0]
  const span = label.children[0]
  const input = element.children[1]

  await userEvent.click(span)
  expect(input).toHaveFocus()
})

test('fires no events when clicking a label with a nested control that is disabled', async () => {
  const {element, getEventSnapshot} = setup(`<label><input disabled /></label>`)
  await userEvent.click(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: label

    label - pointerover
    label - pointerenter
    label - mouseover
    label - mouseenter
    label - pointermove
    label - mousemove
    label - pointerdown
    label - mousedown: primary
    label - pointerup
    label - mouseup: primary
    label - click: primary
  `)
})

test('does not crash if the label has no control', async () => {
  const {element} = setup(`<label for="input">label</label>`)
  await userEvent.click(element)
})

test('clicking a label checks the checkbox', async () => {
  const {element} = setup(`
    <div>
      <label for="input">label</label>
      <input id="input" type="checkbox" />
    </div>
  `)
  const label = element.children[0]
  const input = element.children[1]

  await userEvent.click(label)
  expect(input).toHaveFocus()
  expect(input).toBeChecked()
})

test('clicking a label checks the radio', async () => {
  const {element} = setup(`
    <div>
      <label for="input">label</label>
      <input id="input" name="radio" type="radio" />
    </div>
  `)
  const label = element.children[0]
  const input = element.children[1]

  await userEvent.click(label)
  expect(input).toHaveFocus()
  expect(input).toBeChecked()
})

test('submits a form when clicking on a <button>', async () => {
  const {element, eventWasFired} = setup(`<form><button>Submit</button></form>`)
  await userEvent.click(element.children[0])
  expect(eventWasFired('submit')).toBe(true)
})

test('does not submit a form when clicking on a <button type="button">', async () => {
  const {element, getEventSnapshot} = setup(`
    <form>
      <button type="button">Submit</button>
    </form>
  `)
  await userEvent.click(element.children[0])
  expect(getEventSnapshot()).not.toContain('submit')
})

test('does not fire blur on current element if is the same as previous', async () => {
  const {element, getEventSnapshot, clearEventCalls} = setup('<button />')

  await userEvent.click(element)
  expect(getEventSnapshot()).not.toContain('blur')

  clearEventCalls()

  await userEvent.click(element)
  expect(getEventSnapshot()).not.toContain('blur')
})

test('does not give focus when mouseDown is prevented', async () => {
  const {element} = setup('<input />', {
    eventHandlers: {mouseDown: e => e.preventDefault()},
  })
  await userEvent.click(element)
  expect(element).not.toHaveFocus()
})

test('fires mouse events with the correct properties', async () => {
  const {element, getClickEventsSnapshot} = setup('<div></div>')
  await userEvent.click(element)
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
  `)
})

test('calls FocusEvents with relatedTarget', async () => {
  const {element} = setup('<div><input/><input/></div>')

  const element0 = element.children[0] as HTMLInputElement
  const element1 = element.children[1] as HTMLInputElement
  element0.focus()
  const events0 = addListeners(element0)
  const events1 = addListeners(element1)

  await userEvent.click(element1)

  expect(
    events0.getEvents().find((e): e is FocusEvent => e.type === 'blur')
      ?.relatedTarget,
  ).toBe(element1)
  expect(
    events1.getEvents().find((e): e is FocusEvent => e.type === 'focus')
      ?.relatedTarget,
  ).toBe(element0)
})

test('move focus to closest focusable element', async () => {
  const {element} = setup(`
    <div tabIndex="0">
      <div>this is not focusable</div>
      <button>this is focusable</button>
    </div>
  `)

  document.body.focus()
  await userEvent.click(element.children[1])
  expect(element.children[1]).toHaveFocus()

  document.body.focus()
  await userEvent.click(element.children[0])
  expect(element).toHaveFocus()
})

test('right click fires `contextmenu` instead of `click', async () => {
  const {element, getEvents, clearEventCalls} = setup(`<button/>`)

  await userEvent.click(element)
  expect(getEvents('click')).toHaveLength(1)
  expect(getEvents('contextmenu')).toHaveLength(0)

  clearEventCalls()

  await userEvent.pointer({keys: '[MouseRight]', target: element})
  expect(getEvents('contextmenu')).toHaveLength(1)
  expect(getEvents('click')).toHaveLength(0)
})

test('throws when clicking element with pointer-events set to none', async () => {
  const {element} = setup(`<div style="pointer-events: none"></div>`)
  await expect(userEvent.click(element)).rejects.toThrowError(
    /unable to click/i,
  )
})

test('does not throws when clicking element with pointer-events set to none and skipPointerEventsCheck is set', async () => {
  const {element, getEvents} = setup(`<div style="pointer-events: none"></div>`)
  await userEvent.click(element, {skipPointerEventsCheck: true})
  expect(getEvents('click')).toHaveLength(1)
})

test('skip hover', async () => {
  const {element, getEvents} = setup(`<div></div>`)
  await userEvent.click(element, {skipHover: true})
  expect(getEvents('click')).toHaveLength(1)
  expect(getEvents('mouseover')).toHaveLength(0)
})
