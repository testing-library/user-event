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
