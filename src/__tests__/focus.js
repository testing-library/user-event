import {focus} from '../focus'
import {setup} from './helpers/utils'

test('focus a button', () => {
  const {element, getEventSnapshot} = setup(`<button />`)
  focus(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - focus
    button - focusin
  `)
  expect(element).toHaveFocus()
})

test('no events fired on an unfocusable input', () => {
  const {element, getEventSnapshot} = setup(`<div />`)
  focus(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: div`,
  )
  expect(element).not.toHaveFocus()
})

test('focus with tabindex', () => {
  const {element, getEventSnapshot} = setup(`<div tabindex="0" />`)
  focus(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - focus
    div - focusin
  `)
  expect(element).toHaveFocus()
})

test('no events fired on a disabled focusable input', () => {
  const {element, getEventSnapshot} = setup(`<button disabled />`)
  focus(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: button`,
  )
  expect(element).not.toHaveFocus()
})

test('no events fired on a hidden input', () => {
  const {element, getEventSnapshot} = setup(`<input type="hidden" />`)
  focus(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: input[value=""]`,
  )
  expect(element).not.toHaveFocus()
})

test('no events fired if the element is already focused', () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(`<button />`)
  focus(element)

  clearEventCalls()

  focus(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: button`,
  )
  expect(element).toHaveFocus()
})
