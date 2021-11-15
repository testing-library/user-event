import userEvent from '#src'
import {setup} from '#testHelpers/utils'

// TODO: focus the maxlength tests on the tested aspects

test('honors maxlength', () => {
  const {element, getEventSnapshot} = setup('<input maxlength="2" />')
  userEvent.type(element, '123')

  // NOTE: no input event when typing "3"
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="12"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: 1 (49)
    input[value=""] - keypress: 1 (49)
    input[value="1"] - input
    input[value="1"] - keyup: 1 (49)
    input[value="1"] - keydown: 2 (50)
    input[value="1"] - keypress: 2 (50)
    input[value="12"] - input
    input[value="12"] - keyup: 2 (50)
    input[value="12"] - keydown: 3 (51)
    input[value="12"] - keypress: 3 (51)
    input[value="12"] - keyup: 3 (51)
  `)
})

test('honors maxlength="" as if there was no maxlength', () => {
  const {element, getEventSnapshot} = setup('<input maxlength="" />')
  userEvent.type(element, '123')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="123"]

    input[value=""] - pointerover
    input[value=""] - pointerenter
    input[value=""] - mouseover
    input[value=""] - mouseenter
    input[value=""] - pointermove
    input[value=""] - mousemove
    input[value=""] - pointerdown
    input[value=""] - mousedown: primary
    input[value=""] - focus
    input[value=""] - focusin
    input[value=""] - pointerup
    input[value=""] - mouseup: primary
    input[value=""] - click: primary
    input[value=""] - keydown: 1 (49)
    input[value=""] - keypress: 1 (49)
    input[value="1"] - input
    input[value="1"] - keyup: 1 (49)
    input[value="1"] - keydown: 2 (50)
    input[value="1"] - keypress: 2 (50)
    input[value="12"] - input
    input[value="12"] - keyup: 2 (50)
    input[value="12"] - keydown: 3 (51)
    input[value="12"] - keypress: 3 (51)
    input[value="123"] - input
    input[value="123"] - keyup: 3 (51)
  `)
})

test('honors maxlength with existing text', () => {
  const {element, getEventSnapshot} = setup(
    '<input value="12" maxlength="2" />',
  )
  userEvent.type(element, '3')

  // NOTE: no input event when typing "3"
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="12"]

    input[value="12"] - pointerover
    input[value="12"] - pointerenter
    input[value="12"] - mouseover
    input[value="12"] - mouseenter
    input[value="12"] - pointermove
    input[value="12"] - mousemove
    input[value="12"] - pointerdown
    input[value="12"] - mousedown: primary
    input[value="12"] - focus
    input[value="12"] - focusin
    input[value="12"] - select
    input[value="12"] - pointerup
    input[value="12"] - mouseup: primary
    input[value="12"] - click: primary
    input[value="12"] - keydown: 3 (51)
    input[value="12"] - keypress: 3 (51)
    input[value="12"] - keyup: 3 (51)
  `)
})

test('honors maxlength on textarea', () => {
  const {element, getEventSnapshot} = setup(
    '<textarea maxlength="2">12</textarea>',
  )

  userEvent.type(element, '3')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value="12"]

    textarea[value="12"] - pointerover
    textarea[value="12"] - pointerenter
    textarea[value="12"] - mouseover
    textarea[value="12"] - mouseenter
    textarea[value="12"] - pointermove
    textarea[value="12"] - mousemove
    textarea[value="12"] - pointerdown
    textarea[value="12"] - mousedown: primary
    textarea[value="12"] - focus
    textarea[value="12"] - focusin
    textarea[value="12"] - select
    textarea[value="12"] - pointerup
    textarea[value="12"] - mouseup: primary
    textarea[value="12"] - click: primary
    textarea[value="12"] - keydown: 3 (51)
    textarea[value="12"] - keypress: 3 (51)
    textarea[value="12"] - keyup: 3 (51)
  `)
})

// https://github.com/testing-library/user-event/issues/418
test('ignores maxlength on input[type=number]', () => {
  const {element} = setup(`<input maxlength="2" type="number" value="12" />`)

  userEvent.type(element, '3')

  expect(element).toHaveValue(123)
})
