import {setup} from '#testHelpers/utils'
import {selectAll} from '#src/utils/focus/selectAll'
import {getUISelection} from '#src/document'

test('select all in input', () => {
  const {element} = setup<HTMLInputElement>(`<input value="foo bar baz"/>`)

  selectAll(element)

  expect(getUISelection(element)).toHaveProperty('startOffset', 0)
  expect(getUISelection(element)).toHaveProperty('endOffset', 11)
  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 11)
})

test('select all in textarea', () => {
  const {element} = setup<HTMLTextAreaElement>(
    `<textarea>foo\nbar\nbaz</textarea>`,
  )

  selectAll(element)

  expect(getUISelection(element)).toHaveProperty('startOffset', 0)
  expect(getUISelection(element)).toHaveProperty('endOffset', 11)
  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 11)
})

test('select all in contenteditable', () => {
  const {element} = setup(`
        <div contenteditable><div>foo</div><div>bar</div></div>
        <div>baz</div>
    `)

  selectAll(element)

  const selection = document.getSelection()
  expect(selection).toHaveProperty('anchorNode', element)
  expect(selection).toHaveProperty('anchorOffset', 0)
  expect(selection).toHaveProperty('focusNode', element)
  expect(selection).toHaveProperty('focusOffset', 2)
})

test('select all outside of editable', () => {
  const {element} = setup(`
        <input type="checkbox"/>
        <div>foo</div>
    `)

  selectAll(element)

  const selection = document.getSelection()
  expect(selection).toHaveProperty('anchorNode', element.ownerDocument.body)
  expect(selection).toHaveProperty('anchorOffset', 0)
  expect(selection).toHaveProperty('focusNode', element.ownerDocument.body)
  expect(selection).toHaveProperty(
    'focusOffset',
    element.ownerDocument.body.childNodes.length,
  )
})
