import {focus} from '#src/utils'
import {addListeners, setup} from '#testHelpers/utils'

test('move focus', async () => {
  const {elements, clearEventCalls, getEvents, getEventSnapshot} = setup(
    `<input id="a"><input id="b"/>`,
  )
  const [elA, elB] = elements

  focus(elA)
  expect(elA).toHaveFocus()

  clearEventCalls()

  focus(elB)
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
  focus(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: div`,
  )
  expect(element).not.toHaveFocus()
})

test('focus with tabindex', async () => {
  const {element, getEventSnapshot} = setup(`<div tabindex="0" />`)
  focus(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - focus
    div - focusin
  `)
  expect(element).toHaveFocus()
})

test('no events fired on a disabled focusable input', async () => {
  const {element, getEventSnapshot} = setup(`<button disabled />`)
  focus(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: button`,
  )
  expect(element).not.toHaveFocus()
})

test('no events fired on a hidden input', async () => {
  const {element, getEventSnapshot} = setup(`<input type="hidden" />`)
  focus(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: input[value=""]`,
  )
  expect(element).not.toHaveFocus()
})

test('no events fired if the element is already focused', async () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(`<button />`)
  focus(element)

  clearEventCalls()

  focus(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: button`,
  )
  expect(element).toHaveFocus()
})

test('calls FocusEvents with relatedTarget', async () => {
  const {element} = setup('<div><input/><input/></div>')

  const element0 = element.children[0] as HTMLInputElement
  const element1 = element.children[1] as HTMLInputElement
  element0.focus()
  const events0 = addListeners(element0)
  const events1 = addListeners(element1)

  focus(element1)

  expect(
    events0.getEvents().find((e): e is FocusEvent => e.type === 'blur')
      ?.relatedTarget,
  ).toBe(element1)
  expect(
    events1.getEvents().find((e): e is FocusEvent => e.type === 'focus')
      ?.relatedTarget,
  ).toBe(element0)
})
