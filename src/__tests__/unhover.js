import userEvent from '../'
import {setup} from './helpers/utils'

test('unhover', () => {
  const {element, getEventSnapshot} = setup('<button />')

  userEvent.unhover(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointermove
    button - mousemove: Left (0)
    button - pointerout
    button - pointerleave
    button - mouseout: Left (0)
    button - mouseleave: Left (0)
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
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: label`,
  )
})

test.skip('fires no events when unhover element with pointer-events set to none', () => {
  const {element, getEventSnapshot} = setup(
    `<div style="pointer-events: none"></div>`,
  )
  userEvent.unhover(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: div`,
  )
})
