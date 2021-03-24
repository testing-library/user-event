import {getSelectionRange, setSelectionRange} from 'utils'
import {setup} from '__tests__/helpers/utils'

test('range on input', () => {
  const {element} = setup('<input value="foo"/>')

  expect(getSelectionRange(element as HTMLInputElement)).toEqual({
    selectionStart: 0,
    selectionEnd: 0,
  })

  setSelectionRange(element as HTMLInputElement, 0, 0)

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 0)
  expect(getSelectionRange(element as HTMLInputElement)).toEqual({
    selectionStart: 0,
    selectionEnd: 0,
  })

  setSelectionRange(element as HTMLInputElement, 2, 3)

  expect(element).toHaveProperty('selectionStart', 2)
  expect(element).toHaveProperty('selectionEnd', 3)
  expect(getSelectionRange(element as HTMLInputElement)).toEqual({
    selectionStart: 2,
    selectionEnd: 3,
  })
})

test('range on contenteditable', () => {
  const {element} = setup('<div contenteditable="true">foo</div>')

  expect(getSelectionRange(element as HTMLInputElement)).toEqual({
    selectionStart: null,
    selectionEnd: null,
  })

  setSelectionRange(element as HTMLDivElement, 0, 0)

  expect(getSelectionRange(element as HTMLInputElement)).toEqual({
    selectionStart: 0,
    selectionEnd: 0,
  })

  setSelectionRange(element as HTMLDivElement, 2, 3)

  expect(document.getSelection()?.anchorNode).toBe(element?.firstChild)
  expect(document.getSelection()?.focusNode).toBe(element?.firstChild)
  expect(document.getSelection()?.anchorOffset).toBe(2)
  expect(document.getSelection()?.focusOffset).toBe(3)
  expect(getSelectionRange(element as HTMLInputElement)).toEqual({
    selectionStart: 2,
    selectionEnd: 3,
  })
})

test('range on input without selection support', () => {
  const {element} = setup(`<input type="number" value="123"/>`)

  expect(getSelectionRange(element as HTMLInputElement)).toEqual({
    selectionStart: null,
    selectionEnd: null,
  })

  setSelectionRange(element as HTMLInputElement, 1, 2)

  expect(getSelectionRange(element as HTMLInputElement)).toEqual({
    selectionStart: 1,
    selectionEnd: 2,
  })
})
