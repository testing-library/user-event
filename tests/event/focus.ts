import {focusElement, blurElement} from '#src/event'
import {addListeners, setup} from '#testHelpers'

test('move focus', async () => {
  const {elements, clearEventCalls, getEvents, getEventSnapshot} = setup(
    `<input id="a"><input id="b"/>`,
  )
  const [elA, elB] = elements

  focusElement(elA)
  expect(elA).toHaveFocus()

  clearEventCalls()

  focusElement(elB)
  expect(elB).toHaveFocus()

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input#a[value=""] - focusout
    input#b[value=""] - focusin
  `)
  expect(getEvents('focusout')[0]).toHaveProperty('target', elA)
  expect(getEvents('focusin')[0]).toHaveProperty('target', elB)
})

test('no events fired on an unfocusable input', async () => {
  const {element, getEventSnapshot} = setup(`<div />`)
  focusElement(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: div`,
  )
  expect(element).not.toHaveFocus()
})

test('focus with tabindex', async () => {
  const {element, getEventSnapshot} = setup(`<div tabindex="0" />`, {
    focus: false,
  })
  focusElement(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - focus
    div - focusin
  `)
  expect(element).toHaveFocus()
})

test('no events fired on a disabled focusable input', async () => {
  const {element, getEventSnapshot} = setup(`<button disabled />`)
  focusElement(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: button`,
  )
  expect(element).not.toHaveFocus()
})

test('no events fired on a hidden input', async () => {
  const {element, getEventSnapshot} = setup(`<input type="hidden" />`)
  focusElement(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: input[value=""]`,
  )
  expect(element).not.toHaveFocus()
})

test('no events fired if the element is already focused', async () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(`<button />`)
  focusElement(element)

  clearEventCalls()

  focusElement(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: button`,
  )
  expect(element).toHaveFocus()
})

test('calls FocusEvents with relatedTarget', async () => {
  const {
    elements: [element0, element1],
  } = setup('<input/><input/>')

  const events0 = addListeners(element0)
  const events1 = addListeners(element1)

  expect(element0).toHaveFocus()
  focusElement(element1)

  expect(
    events0.getEvents().find((e): e is FocusEvent => e.type === 'blur')
      ?.relatedTarget,
  ).toBe(element1)
  expect(
    events1.getEvents().find((e): e is FocusEvent => e.type === 'focus')
      ?.relatedTarget,
  ).toBe(element0)
})

test('blur a button', async () => {
  const {element, getEventSnapshot} = setup(`<button />`)
  blurElement(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - blur
    button - focusout
  `)
  expect(element).not.toHaveFocus()
})

test('no events fired on an unblurable input', async () => {
  const {element, getEventSnapshot} = setup(`<div />`)
  blurElement(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: div`,
  )
  expect(element).not.toHaveFocus()
})

test('blur with tabindex', async () => {
  const {element, getEventSnapshot} = setup(`<div tabindex="0" />`)
  blurElement(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - blur
    div - focusout
  `)
  expect(element).not.toHaveFocus()
})

test('no events fired on a disabled blurable input', async () => {
  const {element, getEventSnapshot} = setup(`<button disabled />`)
  blurElement(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: button`,
  )
  expect(element).not.toHaveFocus()
})

test('no events fired if the element is not focused', async () => {
  const {element, getEventSnapshot} = setup(`<button />`, {focus: false})
  blurElement(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: button`,
  )
  expect(element).not.toHaveFocus()
})
