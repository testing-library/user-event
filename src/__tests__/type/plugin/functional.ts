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

  userEvent.type(element as Element, '5e-[Backspace][Backspace]')

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
      "{CURSOR}" -> "{CURSOR}5"
    input[value="5"] - keyup: 5 (53)
    input[value="5"] - keydown: e (101)
    input[value="5"] - keypress: e (101)
    input[value=""] - input
      "{CURSOR}5" -> "{CURSOR}"
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
      "{CURSOR}" -> "{CURSOR}5"
    input[value="5"] - keyup: Backspace (8)
  `)
})
