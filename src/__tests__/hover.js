import userEvent from '../'
import {setup} from './helpers/utils'

test('hover', () => {
  const {element, getEventSnapshot} = setup('<button />')

  userEvent.hover(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - mouseover: Left (0)
    button - mouseenter: Left (0)
    button - pointermove
    button - mousemove: Left (0)
  `)
})

test('hover on disabled element', () => {
  const {element, getEventSnapshot} = setup('<button disabled />')

  userEvent.hover(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - pointerover
    button - pointerenter
    button - pointermove
  `)
})

test('no events fired on labels that contain disabled controls', () => {
  const {element, getEventSnapshot} = setup('<label><input disabled /></label>')

  userEvent.hover(element)
  expect(getEventSnapshot()).toMatchInlineSnapshot(
    `No events were fired on: label`,
  )
})
