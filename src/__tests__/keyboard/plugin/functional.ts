import userEvent from 'index'
import {setup} from '__tests__/helpers/utils'

test('produce extra events for the Control key when AltGraph is pressed', () => {
  const {element, getEventSnapshot} = setup(`<input/>`)

  userEvent.type(element as Element, '{AltGraph}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - keydown: Control (17)
    input[value=""] - keydown: AltGraph (0)
    input[value=""] - keyup: AltGraph (0)
    input[value=""] - keyup: Control (17)
  `)
})

test('backspace to valid value', () => {
  const {element, getEventSnapshot} = setup(`<input type="number"/>`)

  userEvent.type(element, '5e-[Backspace][Backspace]')

  expect(element).toHaveValue(5)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="5"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover: Left (0)
    input[value=""] - mouseenter: Left (0)
    input[value=""] - pointermove
    input[value=""] - mousemove: Left (0)
    input[value=""] - pointerdown
    input[value=""] - mousedown: Left (0)
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: Left (0)
    input[value=""] - click: Left (0)
    input[value=""] - keydown: 5 (53)
    input[value=""] - keypress: 5 (53)
    input[value="5"] - input
    input[value="5"] - keyup: 5 (53)
    input[value="5"] - keydown: e (101)
    input[value="5"] - keypress: e (101)
    input[value=""] - input
    input[value=""] - keyup: e (101)
    input[value=""] - keydown: - (45)
    input[value=""] - keypress: - (45)
    input[value=""] - input
    input[value=""] - keyup: - (45)
    input[value=""] - keydown: Backspace (8)
    input[value=""] - input
    input[value=""] - keyup: Backspace (8)
    input[value=""] - keydown: Backspace (8)
    input[value="5"] - input
    input[value="5"] - keyup: Backspace (8)
  `)
})

test('trigger click event on [Enter] keydown on HTMLAnchorElement', () => {
  const {element, getEventSnapshot, getEvents} = setup(
    `<a href="example.com" target="_blank"/>`,
  )
  element.focus()

  userEvent.keyboard('[Enter]')

  expect(getEvents('click')).toHaveLength(1)
  expect(getEvents('click')[0]).toHaveProperty('detail', 0)

  // this snapshot should probably not contain a keypress event
  // see https://github.com/testing-library/user-event/issues/589
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: a

    a - focus
    a - focusin
    a - keydown: Enter (13)
    a - keypress: Enter (13)
    a - click: Left (0)
    a - keyup: Enter (13)
  `)
})

test('trigger click event on [Enter] keypress on HTMLButtonElement', () => {
  const {element, getEventSnapshot, getEvents} = setup(`<button/>`)
  element.focus()

  userEvent.keyboard('[Enter]')

  expect(getEvents('click')).toHaveLength(1)
  expect(getEvents('click')[0]).toHaveProperty('detail', 0)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - focus
    button - focusin
    button - keydown: Enter (13)
    button - keypress: Enter (13)
    button - click: Left (0)
    button - keyup: Enter (13)
  `)
})

test('trigger click event on [Space] keyup on HTMLButtonElement', () => {
  const {element, getEventSnapshot, getEvents} = setup(`<button/>`)
  element.focus()

  userEvent.keyboard('[Space]')

  expect(getEvents('click')).toHaveLength(1)
  expect(getEvents('click')[0]).toHaveProperty('detail', 0)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: button

    button - focus
    button - focusin
    button - keydown: (32)
    button - keypress: (32)
    button - keyup: (32)
    button - click: Left (0)
  `)
})

test('trigger click event on [Space] keyup on HTMLInputElement type=button', () => {
  const {element, getEventSnapshot, getEvents} = setup(
    `<input type="button" />`,
  )
  element.focus()

  userEvent.keyboard('[Space]')

  expect(getEvents('click')).toHaveLength(1)
  expect(getEvents('click')[0]).toHaveProperty('detail', 0)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - keydown: (32)
    input[value=""] - keypress: (32)
    input[value=""] - keyup: (32)
    input[value=""] - click: Left (0)
  `)
})

test('trigger change event on [Space] keyup on HTMLInputElement type=radio', () => {
  const {element, getEventSnapshot, getEvents} = setup(`<input type="radio" />`)
  element.focus()

  userEvent.keyboard('[Space]')

  expect(getEvents('change')).toHaveLength(1)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[checked=true]

    input[checked=false] - focus
    input[checked=false] - focusin
    input[checked=false] - keydown: (32)
    input[checked=false] - keypress: (32)
    input[checked=false] - keyup: (32)
    input[checked=true] - click: Left (0)
      unchecked -> checked
    input[checked=true] - input
    input[checked=true] - change
  `)
})
