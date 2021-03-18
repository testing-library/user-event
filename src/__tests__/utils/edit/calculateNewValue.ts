import userEvent from 'index'
import {setup} from '__tests__/helpers/utils'

// TODO: focus the maxlength tests on the tested aspects

test('honors maxlength', () => {
  const {element, getEventSnapshot} = setup('<input maxlength="2" />')
  userEvent.type(element as Element, '123')

  // NOTE: no input event when typing "3"
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="12"]

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
    input[value=""] - keydown: 1 (49)
    input[value=""] - keypress: 1 (49)
    input[value="1"] - input
      "{CURSOR}" -> "1{CURSOR}"
    input[value="1"] - keyup: 1 (49)
    input[value="1"] - keydown: 2 (50)
    input[value="1"] - keypress: 2 (50)
    input[value="12"] - input
      "1{CURSOR}" -> "12{CURSOR}"
    input[value="12"] - keyup: 2 (50)
    input[value="12"] - keydown: 3 (51)
    input[value="12"] - keypress: 3 (51)
    input[value="12"] - keyup: 3 (51)
  `)
})

test('honors maxlength="" as if there was no maxlength', () => {
  const {element, getEventSnapshot} = setup('<input maxlength="" />')
  userEvent.type(element as Element, '123')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="123"]

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
    input[value=""] - keydown: 1 (49)
    input[value=""] - keypress: 1 (49)
    input[value="1"] - input
      "{CURSOR}" -> "1{CURSOR}"
    input[value="1"] - keyup: 1 (49)
    input[value="1"] - keydown: 2 (50)
    input[value="1"] - keypress: 2 (50)
    input[value="12"] - input
      "1{CURSOR}" -> "12{CURSOR}"
    input[value="12"] - keyup: 2 (50)
    input[value="12"] - keydown: 3 (51)
    input[value="12"] - keypress: 3 (51)
    input[value="123"] - input
      "12{CURSOR}" -> "123{CURSOR}"
    input[value="123"] - keyup: 3 (51)
  `)
})

test('honors maxlength with existing text', () => {
  const {element, getEventSnapshot} = setup(
    '<input value="12" maxlength="2" />',
  )
  userEvent.type(element as Element, '3')

  // NOTE: no input event when typing "3"
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="12"]

    input[value="12"] - pointerover
    input[value="12"] - pointerenter
    input[value="12"] - mouseover: Left (0)
    input[value="12"] - mouseenter: Left (0)
    input[value="12"] - pointermove
    input[value="12"] - mousemove: Left (0)
    input[value="12"] - pointerdown
    input[value="12"] - mousedown: Left (0)
    input[value="12"] - focus
    input[value="12"] - focusin
    input[value="12"] - pointerup
    input[value="12"] - mouseup: Left (0)
    input[value="12"] - click: Left (0)
    input[value="12"] - select
    input[value="12"] - keydown: 3 (51)
    input[value="12"] - keypress: 3 (51)
    input[value="12"] - keyup: 3 (51)
  `)
})

test('honors maxlength on textarea', () => {
  const {element, getEventSnapshot} = setup(
    '<textarea maxlength="2">12</textarea>',
  )

  userEvent.type(element as Element, '3')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: textarea[value="12"]

    textarea[value="12"] - pointerover
    textarea[value="12"] - pointerenter
    textarea[value="12"] - mouseover: Left (0)
    textarea[value="12"] - mouseenter: Left (0)
    textarea[value="12"] - pointermove
    textarea[value="12"] - mousemove: Left (0)
    textarea[value="12"] - pointerdown
    textarea[value="12"] - mousedown: Left (0)
    textarea[value="12"] - focus
    textarea[value="12"] - focusin
    textarea[value="12"] - pointerup
    textarea[value="12"] - mouseup: Left (0)
    textarea[value="12"] - click: Left (0)
    textarea[value="12"] - select
    textarea[value="12"] - keydown: 3 (51)
    textarea[value="12"] - keypress: 3 (51)
    textarea[value="12"] - keyup: 3 (51)
  `)
})

// https://github.com/testing-library/user-event/issues/418
test('ignores maxlength on input[type=number]', () => {
  const {element} = setup(`<input maxlength="2" type="number" value="12" />`)

  userEvent.type(element as Element, '3')

  expect(element).toHaveValue(123)
})
