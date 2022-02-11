import {setup} from '#testHelpers'

// TODO: focus the maxlength tests on the tested aspects

test('honors maxlength', async () => {
  const {element, getEventSnapshot, user} = setup('<input maxlength="2" />')
  await user.type(element, '123')

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
    input[value=""] - keydown: 1
    input[value=""] - keypress: 1
    input[value=""] - beforeinput
    input[value="1"] - input
    input[value="1"] - keyup: 1
    input[value="1"] - keydown: 2
    input[value="1"] - keypress: 2
    input[value="1"] - beforeinput
    input[value="12"] - input
    input[value="12"] - keyup: 2
    input[value="12"] - keydown: 3
    input[value="12"] - keypress: 3
    input[value="12"] - beforeinput
    input[value="12"] - keyup: 3
  `)
})

test('honors maxlength="" as if there was no maxlength', async () => {
  const {element, getEventSnapshot, user} = setup('<input maxlength="" />')
  await user.type(element, '123')

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
    input[value=""] - keydown: 1
    input[value=""] - keypress: 1
    input[value=""] - beforeinput
    input[value="1"] - input
    input[value="1"] - keyup: 1
    input[value="1"] - keydown: 2
    input[value="1"] - keypress: 2
    input[value="1"] - beforeinput
    input[value="12"] - input
    input[value="12"] - keyup: 2
    input[value="12"] - keydown: 3
    input[value="12"] - keypress: 3
    input[value="12"] - beforeinput
    input[value="123"] - input
    input[value="123"] - keyup: 3
  `)
})

test('honors maxlength with existing text', async () => {
  const {element, getEventSnapshot, user} = setup(
    '<input value="12" maxlength="2" />',
  )
  await user.type(element, '3')

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
    input[value="12"] - keydown: 3
    input[value="12"] - keypress: 3
    input[value="12"] - beforeinput
    input[value="12"] - keyup: 3
  `)
})

test('honors maxlength on textarea', async () => {
  const {element, getEventSnapshot, user} = setup(
    '<textarea maxlength="2">12</textarea>',
  )

  await user.type(element, '3')

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
    textarea[value="12"] - keydown: 3
    textarea[value="12"] - keypress: 3
    textarea[value="12"] - beforeinput
    textarea[value="12"] - keyup: 3
  `)
})

// https://github.com/testing-library/user-event/issues/418
test('ignores maxlength on input[type=number]', async () => {
  const {element, user} = setup(
    `<input maxlength="2" type="number" value="12" />`,
  )

  await user.type(element, '3')

  expect(element).toHaveValue(123)
})
