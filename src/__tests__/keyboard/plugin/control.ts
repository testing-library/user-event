import userEvent from 'index'
import {setup} from '__tests__/helpers/utils'

test('press [Home] in textarea', () => {
  const {element} = setup(`<textarea>foo\nbar\baz</textarea>`)
  ;(element as HTMLTextAreaElement).setSelectionRange(2, 4)

  userEvent.type(element as HTMLTextAreaElement, '[Home]')

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 0)
})

test('press [Home] in contenteditable', () => {
  const {element} = setup(`<div contenteditable="true">foo\nbar\baz</div>`)
  document
    .getSelection()
    ?.setPosition((element as HTMLDivElement).firstChild, 2)

  userEvent.type(element as HTMLTextAreaElement, '[Home]')

  const selection = document.getSelection()
  expect(selection).toHaveProperty('focusNode', element?.firstChild)
  expect(selection).toHaveProperty('focusOffset', 0)
})

test('press [End] in textarea', () => {
  const {element} = setup(`<textarea>foo\nbar\baz</textarea>`)
  ;(element as HTMLTextAreaElement).setSelectionRange(2, 4)

  userEvent.type(element as HTMLTextAreaElement, '[End]')

  expect(element).toHaveProperty('selectionStart', 10)
  expect(element).toHaveProperty('selectionEnd', 10)
})

test('press [End] in contenteditable', () => {
  const {element} = setup(`<div contenteditable="true">foo\nbar\baz</div>`)
  document
    .getSelection()
    ?.setPosition((element as HTMLDivElement).firstChild, 2)

  userEvent.type(element as HTMLTextAreaElement, '[End]')

  const selection = document.getSelection()
  expect(selection).toHaveProperty('focusNode', element?.firstChild)
  expect(selection).toHaveProperty('focusOffset', 10)
})

test('use [Delete] on number input', () => {
  const {element} = setup(`<input type="number"/>`)

  userEvent.type(
    element as HTMLInputElement,
    '1e-5[ArrowLeft][Delete]6[ArrowLeft][ArrowLeft][ArrowLeft][Delete][Delete]',
  )

  expect(element).toHaveValue(16)
})
