import {setup} from '#testHelpers'
import {
  prepareDocument,
  getUIValue,
  setUIValue,
  getUISelection,
  setUISelection,
} from '#src/document'

function prepare(element: Element) {
  prepareDocument(element.ownerDocument)
  // safe to call multiple times
  prepareDocument(element.ownerDocument)
  prepareDocument(element.ownerDocument)
}

test('keep track of value in UI', async () => {
  const {element} = setup<HTMLInputElement>(`<input type="number"/>`)
  // The element has to either receive focus or be already focused when preparing.
  element.focus()

  prepare(element)

  setUIValue(element, '2e-')

  expect(element).toHaveValue(null)
  expect(getUIValue(element)).toBe('2e-')

  element.value = '3'

  expect(element).toHaveValue(3)
  expect(getUIValue(element)).toBe('3')
})

test('trigger `change` event if value changed since focus/set', async () => {
  const {element, getEvents} = setup<HTMLInputElement>(`<input type="number"/>`)

  prepare(element)

  element.focus()
  // Invalid value is equal to empty
  setUIValue(element, '2e-')
  element.blur()

  expect(getEvents('change')).toHaveLength(0)

  element.focus()
  // Programmatically changing value sets initial value
  element.value = '3'
  setUIValue(element, '3')
  element.blur()

  expect(getEvents('change')).toHaveLength(0)

  element.focus()
  element.value = '2'
  setUIValue(element, '3')
  element.blur()

  expect(getEvents('change')).toHaveLength(1)
})

test('maintain selection range like UI', async () => {
  const {element} = setup<HTMLInputElement>(`<input type="text" value="abc"/>`)

  prepare(element)

  element.setSelectionRange(1, 1)
  element.focus()
  setUIValue(element, 'adbc')
  setUISelection(element, {focusOffset: 2})

  expect(getUISelection(element)).toHaveProperty('startOffset', 2)
  expect(getUISelection(element)).toHaveProperty('endOffset', 2)
  expect(element.selectionStart).toBe(2)
})

test('maintain selection range on elements without support for selection range', async () => {
  const {element} = setup<HTMLInputElement>(`<input type="number"/>`)

  prepare(element)

  element.focus()
  setUIValue(element, '2e-')
  setUISelection(element, {focusOffset: 2})

  expect(getUISelection(element)).toHaveProperty('startOffset', 2)
  expect(getUISelection(element)).toHaveProperty('endOffset', 2)
  expect(element.selectionStart).toBe(null)
})

test('clear UI selection if selection is programmatically set', async () => {
  const {element} = setup<HTMLInputElement>(`<input/>`)

  prepare(element)

  element.focus()
  setUIValue(element, 'abc')
  setUISelection(element, {anchorOffset: 1, focusOffset: 2})
  expect(element.selectionStart).toBe(1)

  element.setSelectionRange(0, 1)
  expect(getUISelection(element)).toHaveProperty('startOffset', 0)
  expect(getUISelection(element)).toHaveProperty('endOffset', 1)

  setUISelection(element, {anchorOffset: 2, focusOffset: 3})
  expect(getUISelection(element)).toHaveProperty('startOffset', 2)
  expect(getUISelection(element)).toHaveProperty('endOffset', 3)

  element.selectionEnd = 1
  expect(getUISelection(element)).toHaveProperty('startOffset', 1)
  expect(getUISelection(element)).toHaveProperty('endOffset', 1)

  setUISelection(element, {anchorOffset: 1, focusOffset: 0})
  expect(getUISelection(element)).toHaveProperty('startOffset', 0)
  expect(getUISelection(element)).toHaveProperty('endOffset', 1)

  element.selectionStart = 2
  expect(getUISelection(element)).toHaveProperty('startOffset', 2)
  expect(getUISelection(element)).toHaveProperty('endOffset', 2)
})
