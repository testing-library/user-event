import userEvent from '#src'
import {setup} from '#testHelpers/utils'

test('press [Home] in textarea', async () => {
  const {element} = setup<HTMLTextAreaElement>(
    `<textarea>foo\nbar\baz</textarea>`,
  )
  element.setSelectionRange(2, 4)

  await userEvent.type(element, '[Home]')

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 0)
})

test('press [Home] in contenteditable', async () => {
  const {element} = setup(`<div contenteditable="true">foo\nbar\baz</div>`)
  document.getSelection()?.setPosition(element.firstChild, 2)

  await userEvent.type(element, '[Home]')

  const selection = document.getSelection()
  expect(selection).toHaveProperty('focusNode', element.firstChild)
  expect(selection).toHaveProperty('focusOffset', 0)
})

test('press [End] in textarea', async () => {
  const {element} = setup<HTMLTextAreaElement>(
    `<textarea>foo\nbar\baz</textarea>`,
  )
  element.setSelectionRange(2, 4)

  await userEvent.type(element, '[End]')

  expect(element).toHaveProperty('selectionStart', 10)
  expect(element).toHaveProperty('selectionEnd', 10)
})

test('press [End] in contenteditable', async () => {
  const {element} = setup(`<div contenteditable="true">foo\nbar\baz</div>`)
  document.getSelection()?.setPosition(element.firstChild, 2)

  await userEvent.type(element, '[End]')

  const selection = document.getSelection()
  expect(selection).toHaveProperty('focusNode', element.firstChild)
  expect(selection).toHaveProperty('focusOffset', 10)
})

test('use [Delete] on number input', async () => {
  const {element} = setup(`<input type="number"/>`)

  await userEvent.type(
    element,
    '1e-5[ArrowLeft][Delete]6[ArrowLeft][ArrowLeft][ArrowLeft][Delete][Delete]',
  )

  expect(element).toHaveValue(16)
})

test('use [Delete] on contenteditable', async () => {
  const {element} = setup(`<div contenteditable>foo bar baz</div>`)
  const text = element.firstChild as Text
  element.focus()
  document.getSelection()?.setBaseAndExtent(text, 1, text, 9)

  await userEvent.keyboard('[Delete]')

  expect(element).toHaveTextContent('faz')
})