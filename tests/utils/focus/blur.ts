import {blur, focus} from '#src/utils'
import {setup} from '#testHelpers/utils'

test('blur a button', async () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(`<button />`)
  focus(element)
  clearEventCalls()
  blur(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - blur
    button - focusout
  `)
  expect(element).not.toHaveFocus()
})

test('no events fired on an unblurable input', async () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(`<div />`)
  focus(element)
  clearEventCalls()
  blur(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: div`,
  )
  expect(element).not.toHaveFocus()
})

test('blur with tabindex', async () => {
  const {element, getEventSnapshot, clearEventCalls} =
    setup(`<div tabindex="0" />`)
  focus(element)
  clearEventCalls()
  blur(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - blur
    div - focusout
  `)
  expect(element).not.toHaveFocus()
})

test('no events fired on a disabled blurable input', async () => {
  const {element, getEventSnapshot, clearEventCalls} =
    setup(`<button disabled />`)
  focus(element)
  clearEventCalls()
  blur(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: button`,
  )
  expect(element).not.toHaveFocus()
})

test('no events fired if the element is not focused', async () => {
  const {element, getEventSnapshot} = setup(`<button />`)
  blur(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: button`,
  )
  expect(element).not.toHaveFocus()
})
