import cases from 'jest-in-case'
import userEvent from '#src'
import {getUISelection, setUISelection, setUIValue} from '#src/document'
import {setup} from '#testHelpers/utils'

test('produce extra events for the Control key when AltGraph is pressed', async () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(`<input/>`)
  element.focus()
  clearEventCalls()

  await userEvent.keyboard('{AltGraph}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - keydown: Control
    input[value=""] - keydown: AltGraph
    input[value=""] - keyup: AltGraph
    input[value=""] - keyup: Control
  `)
})

test('delete content per Backspace', async () => {
  const {element} = setup<HTMLInputElement>(`<input value="abcd"/>`)
  element.focus()
  element.setSelectionRange(2, 3)

  await userEvent.keyboard('[Backspace]')

  expect(element).toHaveValue('abd')

  await userEvent.keyboard('[Backspace]')

  expect(element).toHaveValue('ad')
})

test('backspace to valid value', async () => {
  const {element} = setup<HTMLInputElement>(`<input type="number"/>`)
  element.focus()
  setUIValue(element, '5e-')
  setUISelection(element, {focusOffset: 3})

  await userEvent.keyboard('[Backspace][Backspace]')

  expect(element).toHaveValue(5)
})

test('do not fire input events if delete content does nothing', async () => {
  const {element, getEvents} = setup<HTMLInputElement>(`<input type="foo"/>`)
  element.focus()

  await userEvent.keyboard('[Backspace]')

  expect(getEvents('input')).toHaveLength(0)

  element.setSelectionRange(3, 3)
  element.readOnly = true

  await userEvent.keyboard('[Backspace]')

  expect(getEvents('input')).toHaveLength(0)
})

// Should probably not trigger keypress event on HTMLAnchorElement
// see https://github.com/testing-library/user-event/issues/589
test.each([
  [`<a href="example.com" target="__blank"/>`],
  [`<button/>`],
  [`<input type="color" />`],
])('trigger click event on keypress [Enter] on: %s', async html => {
  const {element, getEvents} = setup(html)
  element.focus()

  await userEvent.keyboard('[Enter]')

  expect(getEvents('click')).toHaveLength(1)
  expect(getEvents('click')[0]).toHaveProperty('detail', 0)

  const trigger = getEvents().findIndex(e => e.type === 'keypress')
  expect(getEvents()[trigger + 1]).toHaveProperty('type', 'click')
})

cases(
  'submit form on [Enter]',
  async ({html, submit}) => {
    const {element, getEvents} = setup(html)
    ;(element.children[1] as HTMLInputElement).focus()

    await userEvent.keyboard('[Enter]')

    expect(getEvents('click')).toHaveLength(0)
    expect(getEvents('submit')).toHaveLength(submit ? 1 : 0)
  },
  {
    'with `<input type="submit"/>`': {
      html: `<form><input/><input/><input type="submit"/></form>`,
      submit: true,
    },
    // TODO: submit with button without type attribute
    // 'with `<button/>`': {
    //   html: `<form><input/><input/><button/></form>`,
    //   submit: true,
    // },
    'with `<button type="submit"/>`': {
      html: `<form><input/><input/><button type="submit"/></form>`,
      submit: true,
    },
    'with `<button type="button"/>`': {
      html: `<form><input/><input/><button type="button"/></form>`,
      submit: false,
    },
    'on checkbox': {
      html: `<form><input/><input type="checkbox"/><button type="submit"/></form>`,
      submit: true,
    },
    'on radio': {
      html: `<form><input/><input type="radio"/><button type="submit"/></form>`,
      submit: true,
    },
    'with single input': {
      html: `<form><div></div><input/></form>`,
      submit: true,
    },
    'without submit button': {
      html: `<form><input/><input/></form>`,
      submit: false,
    },
    'on radio/checkbox without submit button': {
      html: `<form><input/><input type="radio"/></form>`,
      submit: false,
    },
  },
)

test.each([
  [`<button/>`],
  [`<input type="button" />`],
  [`<input value="#ffffff" type="color" />`],
])('trigger click event on keyup [Space] on: %s', async html => {
  const {element, getEvents} = setup(html)
  element.focus()

  await userEvent.keyboard('[Space]')

  expect(getEvents('click')).toHaveLength(1)
  expect(getEvents('click')[0]).toHaveProperty('detail', 0)

  const trigger = getEvents().findIndex(e => e.type === 'keyup')
  expect(getEvents()[trigger + 1]).toHaveProperty('type', 'click')
})

test('trigger change event on [Space] keyup on HTMLInputElement type=radio', async () => {
  const {element, getEventSnapshot, getEvents} = setup(`<input type="radio" />`)
  element.focus()

  await userEvent.keyboard('[Space]')

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

test('tab through elements', async () => {
  const {elements} = setup<
    [HTMLInputElement, HTMLInputElement, HTMLButtonElement]
  >(`<input value="abc"/><input type="number" value="1e5"/><button/>`)

  await userEvent.keyboard('[Tab]')

  expect(elements[0]).toHaveFocus()
  expect(elements[0]).toHaveProperty('selectionStart', 0)
  expect(elements[0]).toHaveProperty('selectionEnd', 3)

  await userEvent.keyboard('[Tab]')

  expect(elements[1]).toHaveFocus()
  expect(getUISelection(elements[1])).toHaveProperty('startOffset', 0)
  expect(getUISelection(elements[1])).toHaveProperty('endOffset', 3)

  await userEvent.keyboard('[Tab]')

  expect(elements[2]).toHaveFocus()

  await userEvent.keyboard('[Tab]')

  expect(document.body).toHaveFocus()

  await userEvent.keyboard('[ShiftLeft>][Tab]')

  expect(elements[2]).toHaveFocus()

  await userEvent.keyboard('[ShiftRight>][Tab]')

  expect(elements[1]).toHaveFocus()
  expect(getUISelection(elements[1])).toHaveProperty('startOffset', 0)
  expect(getUISelection(elements[1])).toHaveProperty('endOffset', 3)
})

test.each([
  ['Shift', 'shiftKey'],
  ['Control', 'ctrlKey'],
  ['Alt', 'altKey'],
  ['Meta', 'metaKey'],
])('Trigger modifier: %s', async (key, modifier) => {
  const {element, getEvents} = setup(`<div tabIndex="-1"></div>`)
  const user = userEvent.setup()
  element.focus()

  await user.keyboard(`{${key}>}`)
  const modifierDown = getEvents('keydown')[0]
  expect(modifierDown).toHaveProperty('key', key)
  expect(modifierDown).toHaveProperty(modifier, true)

  await user.keyboard('a')
  expect(getEvents('keydown')[1]).toHaveProperty(modifier, true)
  expect(getEvents('keyup')[0]).toHaveProperty(modifier, true)

  await user.keyboard(`{/${key}}`)
  const modifierUp = getEvents('keyup')[1]
  expect(modifierUp).toHaveProperty('key', key)
  expect(modifierUp).toHaveProperty(modifier, false)
})

test('switch CapsLock modifier', async () => {
  // This is currently an implementation detail,
  // but will be required for `autoModify`.
  const keyboardState = await userEvent.keyboard('[CapsLock]')
  expect(keyboardState.modifiers).toHaveProperty('caps', true)
  await userEvent.keyboard('[CapsLock]', {keyboardState})
  expect(keyboardState.modifiers).toHaveProperty('caps', false)
})
