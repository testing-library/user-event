import {getInputRange, focus, setSelection, setSelectionRange} from '#src/utils'
import {setup} from '#testHelpers/utils'

test('range on input', () => {
  const {element} = setup('<input value="foo"/>')

  expect(getInputRange(element)).toEqual({
    startOffset: 0,
    endOffset: 0,
  })

  setSelection({
    focusNode: element,
    anchorOffset: 1,
    focusOffset: 2,
  })

  expect(element).toHaveProperty('selectionStart', 1)
  expect(element).toHaveProperty('selectionEnd', 2)
  expect(getInputRange(element)).toEqual({
    startOffset: 1,
    endOffset: 2,
  })

  setSelectionRange(element, 2, 3)

  expect(element).toHaveProperty('selectionStart', 2)
  expect(element).toHaveProperty('selectionEnd', 3)
  expect(getInputRange(element)).toEqual({
    startOffset: 2,
    endOffset: 3,
  })
})

test('range on contenteditable', () => {
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

test('range on input without selection support', () => {
  const {element} = setup(`<input type="number" value="123"/>`)

  expect(getInputRange(element)).toEqual({
    startOffset: 0,
    endOffset: 0,
  })

  setSelectionRange(element, 1, 2)

  expect(getInputRange(element)).toEqual({
    startOffset: 1,
    endOffset: 2,
  })
})

describe('update selection when moving focus into element with own selection implementation', () => {
  test('replace selection', () => {
    const {element} = setup(`<div>foo<input/></div>`)
    const text = element.childNodes.item(0) as Text
    const input = element.childNodes.item(1) as HTMLInputElement

    setSelection({focusNode: text, focusOffset: 1})
    expect(document.getSelection()).toHaveProperty('focusNode', text)

    focus(input)
    expect(document.getSelection()).toHaveProperty('anchorNode', input)
    expect(document.getSelection()).toHaveProperty('anchorOffset', 0)
    expect(document.getSelection()).toHaveProperty('focusNode', input)
    expect(document.getSelection()).toHaveProperty('focusOffset', 0)
  })

  test('retain cursor position in contenteditable', () => {
    const {element} = setup(`<div contenteditable>foo<input/></div>`)
    const text = element.childNodes.item(0) as Text
    const input = element.childNodes.item(1) as HTMLInputElement

    setSelection({focusNode: text, focusOffset: 1})
    expect(document.getSelection()).toHaveProperty('focusNode', text)
    expect(document.getSelection()).toHaveProperty('focusOffset', 1)

    focus(input)
    expect(document.getSelection()).toHaveProperty('anchorNode', text)
    expect(document.getSelection()).toHaveProperty('anchorOffset', 1)
    expect(document.getSelection()).toHaveProperty('focusNode', text)
    expect(document.getSelection()).toHaveProperty('focusOffset', 1)
  })

  test('replace extended selection in contenteditable with cursor in first text', () => {
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

    focus(input)
    expect(document.getSelection()).toHaveProperty('anchorNode', text)
    expect(document.getSelection()).toHaveProperty('anchorOffset', 0)
    expect(document.getSelection()).toHaveProperty('focusNode', text)
    expect(document.getSelection()).toHaveProperty('focusOffset', 0)
  })

  test('replace extended selection in contenteditable with cursor at start', () => {
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

    focus(input)
    expect(document.getSelection()).toHaveProperty('anchorNode', element)
    expect(document.getSelection()).toHaveProperty('anchorOffset', 0)
    expect(document.getSelection()).toHaveProperty('focusNode', element)
    expect(document.getSelection()).toHaveProperty('focusOffset', 0)
  })
})
