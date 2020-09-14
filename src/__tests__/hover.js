import userEvent from '../'
import {addEventListener, setup} from './helpers/utils'

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

test('fires non-bubbling events on parents for hover', () => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = '<div><button></button></div>'
  document.body.append(wrapper)

  const calls = []
  function addListeners(el) {
    for (const event of [
      'mouseenter',
      'mouseover',
      'mouseleave',
      'mouseout',
      'pointerenter',
      'pointerover',
      'pointerleave',
      'pointerout',
    ]) {
      addEventListener(el, event, () => {
        calls.push(`${el.tagName}: ${event}`)
      })
    }
  }
  const div = wrapper.firstChild
  const button = div.firstChild

  addListeners(div)
  addListeners(button)

  userEvent.hover(button)

  expect(calls.join('\n')).toMatchInlineSnapshot(`
    "BUTTON: pointerover
    DIV: pointerover
    DIV: pointerenter
    BUTTON: pointerenter
    BUTTON: mouseover
    DIV: mouseover
    DIV: mouseenter
    BUTTON: mouseenter"
  `)
})

test('fires non-bubbling events on parents for unhover', () => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = '<div><button></button></div>'
  document.body.append(wrapper)

  const calls = []
  function addListeners(el) {
    for (const event of [
      'mouseenter',
      'mouseover',
      'mouseleave',
      'mouseout',
      'pointerenter',
      'pointerover',
      'pointerleave',
      'pointerout',
    ]) {
      addEventListener(el, event, () => {
        calls.push(`${el.tagName}: ${event}`)
      })
    }
  }
  const div = wrapper.firstChild
  const button = div.firstChild

  addListeners(div)
  addListeners(button)

  userEvent.unhover(button)

  expect(calls.join('\n')).toMatchInlineSnapshot(`
    "BUTTON: pointerout
    DIV: pointerout
    BUTTON: pointerleave
    DIV: pointerleave
    BUTTON: mouseout
    DIV: mouseout
    BUTTON: mouseleave
    DIV: mouseleave"
  `)
})
