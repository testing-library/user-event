import {blur} from '#src/utils'
import {setup} from '#testHelpers'

test('blur a button', async () => {
  const {element, getEventSnapshot} = setup(`<button />`)
  blur(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - blur
    button - focusout
  `)
  expect(element).not.toHaveFocus()
})

test('no events fired on an unblurable input', async () => {
  const {element, getEventSnapshot} = setup(`<div />`)
  blur(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: div`,
  )
  expect(element).not.toHaveFocus()
})

test('blur with tabindex', async () => {
  const {element, getEventSnapshot} = setup(`<div tabindex="0" />`)
  blur(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - blur
    div - focusout
  `)
  expect(element).not.toHaveFocus()
})

test('no events fired on a disabled blurable input', async () => {
  const {element, getEventSnapshot} = setup(`<button disabled />`)
  blur(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: button`,
  )
  expect(element).not.toHaveFocus()
})

test('no events fired if the element is not focused', async () => {
  const {element, getEventSnapshot} = setup(`<button />`, {focus: false})
  blur(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: button`,
  )
  expect(element).not.toHaveFocus()
})
