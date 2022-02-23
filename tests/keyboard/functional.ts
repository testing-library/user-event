import cases from 'jest-in-case'
import {getUISelection, setUISelection, setUIValue} from '#src/document'
import {setup} from '#testHelpers'

test('produce extra events for the Control key when AltGraph is pressed', async () => {
  const {getEventSnapshot, user} = setup(`<input/>`)

  await user.keyboard('{AltGraph}')

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[value=""]

    input[value=""] - keydown: Control
    input[value=""] - keydown: AltGraph
    input[value=""] - keyup: AltGraph
    input[value=""] - keyup: Control
  `)
})

test('delete content per Backspace', async () => {
  const {element, user} = setup<HTMLInputElement>(`<input value="abcd"/>`, {
    selection: {anchorOffset: 2, focusOffset: 3},
  })

  await user.keyboard('[Backspace]')

  expect(element).toHaveValue('abd')

  await user.keyboard('[Backspace]')

  expect(element).toHaveValue('ad')
})

test('backspace to valid value', async () => {
  const {element, user} = setup<HTMLInputElement>(`<input type="number"/>`)
  setUIValue(element, '5e-')
  setUISelection(element, {focusOffset: 3})

  await user.keyboard('[Backspace][Backspace]')

  expect(element).toHaveValue(5)
})

test('do not fire input events if delete content does nothing', async () => {
  const {element, getEvents, user} =
    setup<HTMLInputElement>(`<input type="foo"/>`)

  await user.keyboard('[Backspace]')

  expect(getEvents('input')).toHaveLength(0)

  element.setSelectionRange(3, 3)
  element.readOnly = true

  await user.keyboard('[Backspace]')

  expect(getEvents('input')).toHaveLength(0)
})

// Should probably not trigger keypress event on HTMLAnchorElement
// see https://github.com/testing-library/user-event/issues/589
test.each([
  [`<a href="example.com" target="__blank"/>`],
  [`<button/>`],
  [`<input type="color" />`],
])('trigger click event on keypress [Enter] on: %s', async html => {
  const {getEvents, user} = setup(html)

  await user.keyboard('[Enter]')

  expect(getEvents('click')).toHaveLength(1)
  expect(getEvents('click')[0]).toHaveProperty('detail', 0)

  const trigger = getEvents().findIndex(e => e.type === 'keypress')
  expect(getEvents()[trigger + 1]).toHaveProperty('type', 'click')
})

cases(
  'submit form on [Enter]',
  async ({html, click, submit}) => {
    const {getEvents, user} = setup(html, {focus: 'form/*[2]'})

    await user.keyboard('[Enter]')

    expect(getEvents('click')).toHaveLength(click ? 1 : 0)
    expect(getEvents('submit')).toHaveLength(submit ? 1 : 0)
  },
  {
    'with `<input type="submit"/>`': {
      html: `<form><input/><input/><input type="submit"/></form>`,
      click: true,
      submit: true,
    },
    'with `<button/>`': {
      html: `<form><input/><input/><button/></form>`,
      click: true,
      submit: true,
    },
    'with `<button type="submit"/>`': {
      html: `<form><input/><input/><button type="submit"/></form>`,
      click: true,
      submit: true,
    },
    'with `<button type="button"/>`': {
      html: `<form><input/><input/><button type="button"/></form>`,
      click: false,
      submit: false,
    },
    'on checkbox': {
      html: `<form><input/><input type="checkbox"/><button type="submit"/></form>`,
      click: true,
      submit: true,
    },
    'on radio': {
      html: `<form><input/><input type="radio"/><button type="submit"/></form>`,
      click: true,
      submit: true,
    },
    'with single input': {
      html: `<form><div></div><input/></form>`,
      click: false,
      submit: true,
    },
    'without submit button': {
      html: `<form><input/><input/></form>`,
      click: false,
      submit: false,
    },
    'on radio/checkbox without submit button': {
      html: `<form><input/><input type="radio"/></form>`,
      click: false,
      submit: false,
    },
  },
)

test.each([
  [`<button/>`],
  [`<input type="button" />`],
  [`<input value="#ffffff" type="color" />`],
])('trigger click event on keyup [Space] on: %s', async html => {
  const {getEvents, user} = setup(html)

  await user.keyboard('[Space]')

  expect(getEvents('click')).toHaveLength(1)
  expect(getEvents('click')[0]).toHaveProperty('detail', 0)

  const trigger = getEvents().findIndex(e => e.type === 'keyup')
  expect(getEvents()[trigger + 1]).toHaveProperty('type', 'click')
})

test('trigger change event on [Space] keyup on HTMLInputElement type=radio', async () => {
  const {getEventSnapshot, getEvents, user} = setup(`<input type="radio" />`)

  await user.keyboard('[Space]')

  expect(getEvents('change')).toHaveLength(1)
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input[checked=true]

    input[checked=false] - keydown: Space
    input[checked=false] - keypress: Space
    input[checked=false] - keyup: Space
    input[checked=true] - click: primary
      unchecked -> checked
    input[checked=true] - input
    input[checked=true] - change
  `)
})

test('tab through elements', async () => {
  const {elements, user} = setup<
    [HTMLInputElement, HTMLInputElement, HTMLButtonElement]
  >(`<input value="abc"/><input type="number" value="1e5"/><button/>`, {
    focus: false,
  })

  await user.keyboard('[Tab]')

  expect(elements[0]).toHaveFocus()
  expect(elements[0]).toHaveProperty('selectionStart', 0)
  expect(elements[0]).toHaveProperty('selectionEnd', 3)

  await user.keyboard('[Tab]')

  expect(elements[1]).toHaveFocus()
  expect(getUISelection(elements[1])).toHaveProperty('startOffset', 0)
  expect(getUISelection(elements[1])).toHaveProperty('endOffset', 3)

  await user.keyboard('[Tab]')

  expect(elements[2]).toHaveFocus()

  await user.keyboard('[Tab]')

  expect(document.body).toHaveFocus()

  await user.keyboard('[ShiftLeft>][Tab]')

  expect(elements[2]).toHaveFocus()

  await user.keyboard('[ShiftRight>][Tab]')

  expect(elements[1]).toHaveFocus()
  expect(getUISelection(elements[1])).toHaveProperty('startOffset', 0)
  expect(getUISelection(elements[1])).toHaveProperty('endOffset', 3)
})

test('delete content in contenteditable', async () => {
  const {element, getEvents, user} = setup(
    `<div><span>---</span><div contenteditable><span id="foo">foo</span><input type="checkbox"/><span id="bar">bar</span></div><span>---</span></div>`,
    {selection: {focusNode: '//span[@id="foo"]/text()', focusOffset: 2}},
  )

  await user.keyboard('[Backspace][Backspace][Backspace][Backspace]')

  expect(getEvents('input')).toHaveLength(2)
  expect(element.innerHTML).toMatchInlineSnapshot(
    `<span>---</span><div contenteditable=""><span id="foo">o</span><input type="checkbox"><span id="bar">bar</span></div><span>---</span>`,
  )

  await user.keyboard('[ArrowRight][Delete]')

  expect(getEvents('input')).toHaveLength(3)
  expect(element.innerHTML).toMatchInlineSnapshot(
    `<span>---</span><div contenteditable=""><span id="foo">o</span><span id="bar">bar</span></div><span>---</span>`,
  )

  await user.keyboard('[Delete]')

  expect(getEvents('input')).toHaveLength(4)
  expect(element.innerHTML).toMatchInlineSnapshot(
    `<span>---</span><div contenteditable=""><span id="foo">o</span><span id="bar">ar</span></div><span>---</span>`,
  )
})
