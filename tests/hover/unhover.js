import userEvent from '#src'
import {setup} from '#testHelpers/utils'

test('unhover', () => {
  const {element, getEventSnapshot} = setup('<button />')

  userEvent.unhover(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointermove
    button - mousemove
    button - pointerout
    button - pointerleave
    button - mouseout
    button - mouseleave
  `)
})

test('unhover on disabled element', () => {
  const {element, getEventSnapshot} = setup('<button disabled />')

  userEvent.unhover(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointermove
    button - pointerout
    button - pointerleave
  `)
})

test('no events fired on labels that contain disabled controls', () => {
  const {element, getEventSnapshot} = setup('<label><input disabled /></label>')

  userEvent.unhover(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: label

    label - pointermove
    label - mousemove
    label - pointerout
    label - pointerleave
    label - mouseout
    label - mouseleave
  `)
})

test('throws when unhover element with pointer-events set to none', () => {
  const {element} = setup(`<div style="pointer-events: none"></div>`)
  expect(() => userEvent.unhover(element)).toThrowError(/unable to unhover/i)
})

test('does not throws when hover element with pointer-events set to none and skipPointerEventsCheck is set', () => {
  const {element, getEventSnapshot} = setup(
    `<div style="pointer-events: none"></div>`,
  )
  userEvent.unhover(element, undefined, {skipPointerEventsCheck: true})
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointermove
    div - mousemove
    div - pointerout
    div - pointerleave
    div - mouseout
    div - mouseleave
  `)
})
