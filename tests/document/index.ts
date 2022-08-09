import {render} from '#testHelpers'
import {
  getUIValue,
  setUIValue,
  getUISelection,
  setUISelection,
} from '#src/document'
import {prepareDocument} from '#src/document/prepareDocument'

function prepare(element: Element) {
  prepareDocument(element.ownerDocument)
  // safe to call multiple times
  prepareDocument(element.ownerDocument)
  prepareDocument(element.ownerDocument)
}

test('keep track of value in UI', async () => {
  // JSDOM implements the `value` property differently than the browser.
  // In the browser it is always a `string`.
  // In JSDOM it is `null` or `number` for `<input type="number"/>`
  const {element} = render<HTMLInputElement>(`<input type="number"/>`)

  prepare(element)

  setUIValue(element, '2')
  expect(element).toHaveValue(2)

  setUIValue(element, '2e')
  expect(element).toHaveValue(null)
  expect(getUIValue(element)).toBe('2e')

  setUIValue(element, '2e-')
  expect(element).toHaveValue(null)
  expect(getUIValue(element)).toBe('2e-')

  setUIValue(element, '2e-5')
  expect(element).toHaveValue(2e-5)
  expect(getUIValue(element)).toBe('2e-5')

  element.value = '3'
  expect(element).toHaveValue(3)
  expect(getUIValue(element)).toBe('3')

  setUIValue(element, '3.')
  expect(element).toHaveValue(3)
  expect(getUIValue(element)).toBe('3.')

  setUIValue(element, '3.5')
  expect(element).toHaveValue(3.5)
  expect(getUIValue(element)).toBe('3.5')
})

test('trigger `change` event if value changed per user input', async () => {
  const {element, getEvents} = render<HTMLInputElement>(
    `<input type="number"/>`,
    {focus: false},
  )

  prepare(element)

  element.focus()
  // Invalid value is equal to empty
  setUIValue(element, '2e-')
  element.blur()

  expect(getEvents('change')).toHaveLength(0)

  element.focus()
  // Programmatically changing value is ignored
  element.value = '3'
  // Value doesn't change
  setUIValue(element, '3')
  element.blur()

  expect(getEvents('change')).toHaveLength(0)

  element.focus()
  setUIValue(element, '2')
  // value is reset so there is no change in the end
  element.value = '3'
  element.blur()

  expect(getEvents('change')).toHaveLength(0)

  element.focus()
  setUIValue(element, '2')
  element.value = '2'
  element.blur()

  expect(getEvents('change')).toHaveLength(1)
})

test('maintain selection range like UI', async () => {
  const {element} = render<HTMLInputElement>(
    `<input type="text" value="abc"/>`,
    {
      selection: {focusOffset: 1},
    },
  )

  prepare(element)

  setUIValue(element, 'adbc')
  setUISelection(element, {focusOffset: 2})

  expect(getUISelection(element)).toHaveProperty('startOffset', 2)
  expect(getUISelection(element)).toHaveProperty('endOffset', 2)
  expect(element.selectionStart).toBe(2)
})

test('maintain selection range on elements without support for selection range', async () => {
  const {element} = render<HTMLInputElement>(`<input type="number"/>`)

  prepare(element)

  setUIValue(element, '2e-')
  setUISelection(element, {focusOffset: 2})

  expect(getUISelection(element)).toHaveProperty('startOffset', 2)
  expect(getUISelection(element)).toHaveProperty('endOffset', 2)
  expect(element.selectionStart).toBe(null)
})

test('reset UI selection if value is programmatically set', async () => {
  const {element} = render<HTMLInputElement>(`<input/>`)

  prepare(element)

  setUIValue(element, 'abc')
  setUISelection(element, {anchorOffset: 1, focusOffset: 2})

  element.value = 'abcdef'
  expect(element.selectionStart).toBe(6)
  expect(getUISelection(element)).toHaveProperty('focusOffset', 6)
  expect(getUISelection(element)).toHaveProperty('startOffset', 6)
})

test('clear UI selection if selection is programmatically set', async () => {
  const {element} = render<HTMLInputElement>(`<input/>`)

  prepare(element)

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

  setUISelection(element, {anchorOffset: 1, focusOffset: 2})
  element.select()
  expect(getUISelection(element)).toHaveProperty('startOffset', 0)
  expect(getUISelection(element)).toHaveProperty('endOffset', 3)
})

test('select input without selectionRange support', () => {
  const {element} = render<HTMLInputElement>(
    `<input type="number" value="123"/>`,
  )

  prepare(element)

  setUISelection(element, {focusOffset: 1})
  element.select()

  expect(getUISelection(element)).toHaveProperty('startOffset', 0)
  expect(getUISelection(element)).toHaveProperty('endOffset', 3)
})

test('track changes to value and selection per setRangeText', () => {
  const {element} = render<HTMLInputElement>(`<input/>`)
  prepare(element)
  setUIValue(element, 'abcd')
  setUISelection(element, {focusOffset: 3})

  element.setRangeText('X', 1, 2)
  expect(element).toHaveValue('aXcd')
  expect(element).toHaveProperty('selectionStart', 3)
  expect(getUIValue(element)).toBe('aXcd')
  expect(getUISelection(element)).toHaveProperty('focusOffset', 3)

  element.setRangeText('Y', 1, 2, 'start')
  expect(element).toHaveValue('aYcd')
  expect(element).toHaveProperty('selectionEnd', 1)
  expect(getUIValue(element)).toBe('aYcd')
  expect(getUISelection(element)).toHaveProperty('focusOffset', 1)
})

test('circumvent setters/methods for UI changes', () => {
  const {element} = render<HTMLInputElement>(`<input/>`, {focus: false})

  const prototypeDescr = Object.getOwnPropertyDescriptors<HTMLInputElement>(
    Object.getPrototypeOf(element) as HTMLInputElement,
  )
  const valueSpy = jest.fn(prototypeDescr.value.set)
  const setSelectionRangeSpy = jest.fn(prototypeDescr.setSelectionRange.value)

  Object.defineProperties(element, {
    value: {
      get: () => {
        throw new Error()
      },
      ...prototypeDescr.value,
      set: valueSpy,
    },
    setSelectionRange: {
      ...prototypeDescr.setSelectionRange,
      value: setSelectionRangeSpy,
    },
  })

  prepare(element)
  element.focus()

  setUIValue(element, 'abcd')
  setUISelection(element, {focusOffset: 3})

  expect(element).toHaveValue('abcd')
  expect(element).toHaveProperty('selectionStart', 3)
  expect(valueSpy).not.toBeCalled()
  expect(setSelectionRangeSpy).not.toBeCalled()

  element.value = 'efgh'
  element.setSelectionRange(1, 2)
  expect(element).toHaveValue('efgh')
  expect(element).toHaveProperty('selectionStart', 1)
  expect(valueSpy).toBeCalledWith('efgh')
  expect(setSelectionRangeSpy).toBeCalledWith(1, 2)
})
