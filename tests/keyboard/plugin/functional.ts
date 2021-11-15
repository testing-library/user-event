import userEvent from '#src'
import {getUISelection} from '#src/document'
import {setup} from '#testHelpers/utils'

test('produce extra events for the Control key when AltGraph is pressed', () => {
  const {element, getEventSnapshot} = setup(`<input/>`)

  userEvent.type(element as Element, '{AltGraph}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

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
    input[value=""] - keydown: Control
    input[value=""] - keydown: AltGraph
    input[value=""] - keyup: AltGraph
    input[value=""] - keyup: Control
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
    input[value=""] - keydown: 5
    input[value=""] - keypress: 5
    input[value="5"] - input
    input[value="5"] - keyup: 5
    input[value="5"] - keydown: e
    input[value="5"] - keypress: e
    input[value=""] - input
    input[value=""] - keyup: e
    input[value=""] - keydown: -
    input[value=""] - keypress: -
    input[value=""] - input
    input[value=""] - keyup: -
    input[value=""] - keydown: Backspace
    input[value=""] - input
    input[value=""] - keyup: Backspace
    input[value=""] - keydown: Backspace
    input[value="5"] - input
    input[value="5"] - keyup: Backspace
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
    a - keydown: Enter
    a - keypress: Enter
    a - click: primary
    a - keyup: Enter
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
    button - keydown: Enter
    button - keypress: Enter
    button - click: primary
    button - keyup: Enter
  `)
})

test.each`
  elementType   | submit      | hasForm
  ${'checkbox'} | ${'input'}  | ${true}
  ${'checkbox'} | ${'button'} | ${true}
  ${'radio'}    | ${'input'}  | ${true}
  ${'radio'}    | ${'button'} | ${true}
  ${'checkbox'} | ${'input'}  | ${false}
  ${'checkbox'} | ${'button'} | ${false}
  ${'radio'}    | ${'input'}  | ${false}
  ${'radio'}    | ${'button'} | ${false}
`(
  'trigger submit event on [Enter] keypress on HTMLInputElement type=$elementType with submit $submit and hasForm=$hasForm',
  ({elementType, submit, hasForm}) => {
    const {element, getEvents} = setup(
      `<${hasForm ? 'form' : 'div'}>
            <input type="${elementType}" />
            ${submit === 'button' && '<button type="submit">submit</button>'}
            ${submit === 'input' && '<input type="submit" />'}
          </${hasForm ? 'form' : ''}>`,
    )

    element.querySelector('input')?.focus()

    userEvent.keyboard('[Enter]')

    expect(getEvents('click')).toHaveLength(0)
    expect(getEvents('submit')).toHaveLength(hasForm ? 1 : 0)
  },
)

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
    button - keydown
    button - keypress
    button - keyup
    button - click: primary
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
    input[value=""] - keydown
    input[value=""] - keypress
    input[value=""] - keyup
    input[value=""] - click: primary
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
    input[checked=false] - keydown
    input[checked=false] - keypress
    input[checked=false] - keyup
    input[checked=true] - click: primary
      unchecked -> checked
    input[checked=true] - input
    input[checked=true] - change
  `)
})

test('tab through elements', () => {
  const {elements} = setup<
    [HTMLInputElement, HTMLInputElement, HTMLButtonElement]
  >(`<input value="abc"/><input type="number" value="1e5"/><button/>`)

  userEvent.keyboard('[Tab]')

  expect(elements[0]).toHaveFocus()
  expect(elements[0]).toHaveProperty('selectionStart', 0)
  expect(elements[0]).toHaveProperty('selectionEnd', 3)

  userEvent.keyboard('[Tab]')

  expect(elements[1]).toHaveFocus()
  expect(getUISelection(elements[1])).toHaveProperty('startOffset', 0)
  expect(getUISelection(elements[1])).toHaveProperty('endOffset', 3)

  userEvent.keyboard('[Tab]')

  expect(elements[2]).toHaveFocus()

  userEvent.keyboard('[Tab]')

  expect(document.body).toHaveFocus()

  userEvent.keyboard('[ShiftLeft>][Tab]')

  expect(elements[2]).toHaveFocus()

  userEvent.keyboard('[ShiftRight>][Tab]')

  expect(elements[1]).toHaveFocus()
  expect(getUISelection(elements[1])).toHaveProperty('startOffset', 0)
  expect(getUISelection(elements[1])).toHaveProperty('endOffset', 3)
})
