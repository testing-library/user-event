import userEvent from '#src'
import {getUISelection} from '#src/document'
import {setup} from '#testHelpers/utils'

test('select input per triple click', () => {
  const {element, getEventSnapshot} = setup<HTMLInputElement>(
    `<input value="foo bar"/>`,
  )

  userEvent.tripleClick(element)

  expect(element).toHaveFocus()
  expect(getUISelection(element)).toEqual({selectionStart: 0, selectionEnd: 7})

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value="foo bar"]

    input[value="foo bar"] - pointerover
    input[value="foo bar"] - pointerenter
    input[value="foo bar"] - mouseover
    input[value="foo bar"] - mouseenter
    input[value="foo bar"] - pointermove
    input[value="foo bar"] - mousemove
    input[value="foo bar"] - pointerdown
    input[value="foo bar"] - mousedown
    input[value="foo bar"] - focus
    input[value="foo bar"] - focusin
    input[value="foo bar"] - select
    input[value="foo bar"] - pointerup
    input[value="foo bar"] - mouseup
    input[value="foo bar"] - click
    input[value="foo bar"] - pointerdown
    input[value="foo bar"] - mousedown
    input[value="foo bar"] - select
    input[value="foo bar"] - pointerup
    input[value="foo bar"] - mouseup
    input[value="foo bar"] - click
    input[value="foo bar"] - dblclick
    input[value="foo bar"] - pointerdown
    input[value="foo bar"] - mousedown
    input[value="foo bar"] - select
    input[value="foo bar"] - pointerup
    input[value="foo bar"] - mouseup
    input[value="foo bar"] - click
  `)
})

test('check for pointer-events', () => {
  const {element} = setup<HTMLInputElement>(
    `<input value="foo bar" style="pointer-events: none"/>`,
  )

  expect(() => userEvent.tripleClick(element)).toThrow()
})
