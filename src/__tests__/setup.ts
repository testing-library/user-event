import userEvent from 'index'
import {setup} from './helpers/utils'

test('setup clear', () => {
  const {element} = setup<HTMLInputElement>(`<input value="abc">`)

  userEvent.setup().clear(element)

  expect(element).toHaveValue('')
})

test('setup click', () => {
  const {element, getEvents} = setup(`<div style="pointer-events:none"></div>`)

  userEvent
    .setup({
      skipHover: true,
      skipPointerEventsCheck: true,
    })
    .click(element)

  expect(getEvents('pointerenter')).toHaveLength(0)
  expect(getEvents('click')).toHaveLength(1)
})

test('setup dblclick', () => {
  const {element, getEvents} = setup(`<div style="pointer-events:none"></div>`)

  userEvent
    .setup({
      skipPointerEventsCheck: true,
    })
    .dblClick(element)

  expect(getEvents('click')).toHaveLength(2)
})

test('setup deselectoption', () => {
  const {element, getEvents} =
    setup(`<select multiple style="pointer-events:none">
        <option selected>a</option>
        <option selected>b</option>
    </select>`)

  userEvent
    .setup({
      skipPointerEventsCheck: true,
    })
    .deselectOptions(element, ['a'])

  expect(getEvents('pointerenter')).toHaveLength(1)
  expect(getEvents('click')).toHaveLength(1)

  expect(element).toHaveValue(['b'])
})

test('setup hover', () => {
  const {element, getEvents} = setup(`<div style="pointer-events:none"></div>`)

  userEvent
    .setup({
      skipPointerEventsCheck: true,
    })
    .hover(element)

  expect(getEvents('pointerenter')).toHaveLength(1)
})

test('setup keyboard', () => {
  const {element} = setup(`<input/>`)
  element.focus()

  userEvent
    .setup({
      keyboardMap: [{key: 'x', code: 'SpecialKey'}],
    })
    .keyboard('[SpecialKey]')

  expect(element).toHaveValue('x')
})

test('setup tab', () => {
  const {elements} = setup(`
        <input/>
        <div><input/><input/></div>
    `)

  const user = userEvent.setup({
    focusTrap: elements[1],
  })

  user.tab()
  expect(elements[1].children[0]).toHaveFocus()
  user.tab()
  expect(elements[1].children[1]).toHaveFocus()
  user.tab()
  expect(elements[1].children[0]).toHaveFocus()
})

test('setup type', () => {
  const {element, getEvents} = setup(`<input/>`)
  element.focus()

  userEvent
    .setup({
      skipClick: true,
      skipAutoClose: true,
    })
    .type(element, '{a>}b')

  expect(element).toHaveValue('ab')
  expect(getEvents('click')).toHaveLength(0)
  expect(getEvents('keyup')).toHaveLength(1)
})

test('setup unhover', () => {
  const {element, getEvents} = setup(`<div style="pointer-events:none"></div>`)

  userEvent
    .setup({
      skipPointerEventsCheck: true,
    })
    .unhover(element)

  expect(getEvents('pointerleave')).toHaveLength(1)
})

test('setup upload', () => {
  const {element} = setup<HTMLInputElement>(
    `<input type="file" accept="text/plain"/>`,
  )

  userEvent
    .setup({
      applyAccept: true,
    })
    .upload(element, new File([], 'foo', {type: 'image/png'}))

  expect(element.files).toHaveLength(0)
})
