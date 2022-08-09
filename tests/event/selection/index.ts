import {focusElement} from '#src/event'
import {
  getInputRange,
  modifySelection,
  moveSelection,
  setSelection,
  setSelectionRange,
} from '#src/event/selection'
import {setup} from '#testHelpers'

test('range on input', async () => {
  const {element} = setup('<input value="foo"/>')

  expect(getInputRange(element)).toHaveProperty('startOffset', 0)
  expect(getInputRange(element)).toHaveProperty('endOffset', 0)

  setSelection({
    focusNode: element,
    anchorOffset: 1,
    focusOffset: 2,
  })

  expect(element).toHaveProperty('selectionStart', 1)
  expect(element).toHaveProperty('selectionEnd', 2)
  expect(getInputRange(element)).toHaveProperty('startOffset', 1)
  expect(getInputRange(element)).toHaveProperty('endOffset', 2)

  setSelectionRange(element, 2, 3)

  expect(element).toHaveProperty('selectionStart', 2)
  expect(element).toHaveProperty('selectionEnd', 3)
  expect(getInputRange(element)).toHaveProperty('startOffset', 2)
  expect(getInputRange(element)).toHaveProperty('endOffset', 3)
})

test('range on contenteditable', async () => {
  const {element} = setup('<div contenteditable="true">foo</div>')

  expect(getInputRange(element)).toBe(undefined)

  setSelection({
    focusNode: element,
    anchorOffset: 0,
    focusOffset: 1,
  })

  const inputRangeA = getInputRange(element)
  expect(inputRangeA).toHaveProperty('startContainer', element)
  expect(inputRangeA).toHaveProperty('startOffset', 0)
  expect(inputRangeA).toHaveProperty('endContainer', element)
  expect(inputRangeA).toHaveProperty('endOffset', 1)

  setSelectionRange(element, 3, 2)

  const inputRangeB = getInputRange(element)
  expect(inputRangeB).toHaveProperty('startContainer', element.firstChild)
  expect(inputRangeB).toHaveProperty('startOffset', 2)
  expect(inputRangeB).toHaveProperty('endContainer', element.firstChild)
  expect(inputRangeB).toHaveProperty('endOffset', 3)
  expect(document.getSelection()).toHaveProperty('anchorOffset', 3)
  expect(document.getSelection()).toHaveProperty('focusOffset', 2)
})

test('range on input without selection support', async () => {
  const {element} = setup(`<input type="number" value="123"/>`)

  expect(getInputRange(element)).toHaveProperty('startOffset', 0)
  expect(getInputRange(element)).toHaveProperty('endOffset', 0)

  setSelectionRange(element, 1, 2)

  expect(getInputRange(element)).toHaveProperty('startOffset', 1)
  expect(getInputRange(element)).toHaveProperty('endOffset', 2)
})

describe('modify selection', () => {
  test('extend selection on input element', async () => {
    const {element} = setup<HTMLInputElement>(`<input value="foo bar baz"/>`)

    setSelection({focusNode: element, focusOffset: 5})

    modifySelection({focusNode: element, focusOffset: 1})

    expect(element).toHaveProperty('selectionStart', 1)
    expect(element).toHaveProperty('selectionEnd', 5)

    modifySelection({focusNode: element, focusOffset: 9})

    expect(element).toHaveProperty('selectionStart', 5)
    expect(element).toHaveProperty('selectionEnd', 9)
  })

  test('extend selection on other nodes', async () => {
    const {element} = setup(`<div>foo bar baz</div>`)
    const text = element.firstChild as Text

    setSelection({focusNode: text, focusOffset: 5})

    modifySelection({focusNode: text, focusOffset: 1})

    expect(document.getSelection()).toHaveProperty('focusOffset', 1)
    expect(document.getSelection()).toHaveProperty('anchorOffset', 5)
    expect(document.getSelection()?.toString()).toBe('oo b')

    modifySelection({focusNode: text, focusOffset: 9})

    expect(document.getSelection()).toHaveProperty('anchorOffset', 5)
    expect(document.getSelection()).toHaveProperty('focusOffset', 9)
    expect(document.getSelection()?.toString()).toBe('ar b')
  })
})

describe('update selection when moving focus into element with own selection implementation', () => {
  test('replace selection', async () => {
    const {element} = setup(`<div>foo<input/></div>`, {focus: false})
    const text = element.childNodes.item(0) as Text
    const input = element.childNodes.item(1) as HTMLInputElement

    setSelection({focusNode: text, focusOffset: 1})
    expect(document.getSelection()).toHaveProperty('focusNode', text)

    focusElement(input)
    expect(document.getSelection()).toHaveProperty('anchorNode', input)
    expect(document.getSelection()).toHaveProperty('anchorOffset', 0)
    expect(document.getSelection()).toHaveProperty('focusNode', input)
    expect(document.getSelection()).toHaveProperty('focusOffset', 0)
  })

  test('retain cursor position in contenteditable', async () => {
    const {element} = setup(`<div contenteditable>foo<input/></div>`)
    const text = element.childNodes.item(0) as Text
    const input = element.childNodes.item(1) as HTMLInputElement

    setSelection({focusNode: text, focusOffset: 1})
    expect(document.getSelection()).toHaveProperty('focusNode', text)
    expect(document.getSelection()).toHaveProperty('focusOffset', 1)

    focusElement(input)
    expect(document.getSelection()).toHaveProperty('anchorNode', text)
    expect(document.getSelection()).toHaveProperty('anchorOffset', 1)
    expect(document.getSelection()).toHaveProperty('focusNode', text)
    expect(document.getSelection()).toHaveProperty('focusOffset', 1)
  })

  test('replace extended selection in contenteditable with cursor in first text', async () => {
    const {element} = setup(`<div contenteditable>foo<input/></div>`)
    const text = element.childNodes.item(0) as Text
    const input = element.childNodes.item(1) as HTMLInputElement

    setSelection({
      anchorNode: text,
      anchorOffset: 1,
      focusNode: text,
      focusOffset: 2,
    })
    expect(document.getSelection()).toHaveProperty('focusNode', text)
    expect(document.getSelection()).toHaveProperty('focusOffset', 2)

    focusElement(input)
    expect(document.getSelection()).toHaveProperty('anchorNode', text)
    expect(document.getSelection()).toHaveProperty('anchorOffset', 0)
    expect(document.getSelection()).toHaveProperty('focusNode', text)
    expect(document.getSelection()).toHaveProperty('focusOffset', 0)
  })

  test('replace extended selection in contenteditable with cursor at start', async () => {
    const {element} = setup(`<div contenteditable><input/>foo<input/></div>`)
    const text = element.childNodes.item(1) as Text
    const input = element.childNodes.item(2) as HTMLInputElement

    setSelection({
      anchorNode: text,
      anchorOffset: 1,
      focusNode: text,
      focusOffset: 2,
    })
    expect(document.getSelection()).toHaveProperty('focusNode', text)
    expect(document.getSelection()).toHaveProperty('focusOffset', 2)

    focusElement(input)
    expect(document.getSelection()).toHaveProperty('anchorNode', element)
    expect(document.getSelection()).toHaveProperty('anchorOffset', 0)
    expect(document.getSelection()).toHaveProperty('focusNode', element)
    expect(document.getSelection()).toHaveProperty('focusOffset', 0)
  })
})

describe('move selection', () => {
  test('do nothing without a selection range', () => {
    const {element} = setup(`<div tabindex="0"></div>`)
    document.getSelection()?.removeAllRanges()

    moveSelection(element, 1)

    expect(document.getSelection()).toHaveProperty('rangeCount', 0)
  })

  test('move to next cursor position', () => {
    const {element} = setup(`<div tabindex="0">foo</div>`, {
      selection: {focusNode: 'div/text()', focusOffset: 1},
    })

    moveSelection(element, 1)

    expect(document.getSelection()).toHaveProperty(
      'focusNode',
      element.firstChild,
    )
    expect(document.getSelection()).toHaveProperty('focusOffset', 2)
  })

  test('move to next cursor position', () => {
    const {element} = setup(`<div tabindex="0">foo</div>`, {
      selection: {focusNode: 'div/text()', focusOffset: 1},
    })

    moveSelection(element, 1)

    expect(document.getSelection()).toHaveProperty(
      'focusNode',
      element.firstChild,
    )
    expect(document.getSelection()).toHaveProperty('focusOffset', 2)
    expect(document.getSelection()).toHaveProperty('isCollapsed', true)
  })

  test('collapse range', () => {
    const {element} = setup(`<div tabindex="0">foo</div>`, {
      selection: {focusNode: 'div/text()', anchorOffset: 1, focusOffset: 2},
    })

    moveSelection(element, 1)

    expect(document.getSelection()).toHaveProperty(
      'focusNode',
      element.firstChild,
    )
    expect(document.getSelection()).toHaveProperty('focusOffset', 2)
    expect(document.getSelection()).toHaveProperty('isCollapsed', true)
  })

  test('move cursor in input', () => {
    const {element} = setup(`<input value="foo"/>`)

    moveSelection(element, 1)

    expect(element).toHaveProperty('selectionStart', 1)
    expect(element).toHaveProperty('selectionEnd', 1)
  })

  test('collapse range in input', () => {
    const {element} = setup(`<input value="foo"/>`, {
      selection: {anchorOffset: 1, focusOffset: 2},
    })

    moveSelection(element, 1)

    expect(element).toHaveProperty('selectionStart', 2)
    expect(element).toHaveProperty('selectionEnd', 2)
  })
})
