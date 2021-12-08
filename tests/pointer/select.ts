import userEvent from '#src'
import {setup} from '#testHelpers/utils'

// On an unprevented mousedown the browser moves the cursor to the closest character.
// As we have no layout, we are not able to determine the correct character.
// So we try an approximation:
// We treat any mousedown as if it happened on the space after the last character.

test('single click moves cursor to the end', async () => {
  const {element} = setup<HTMLInputElement>(`<input value="foo bar baz"/>`)

  await userEvent.pointer({keys: '[MouseLeft]', target: element})

  expect(element).toHaveProperty('selectionStart', 11)
})

test('single click moves cursor to the last text', async () => {
  const {element} = setup<HTMLInputElement>(
    `<div contenteditable>foo bar baz</div>`,
  )

  await userEvent.pointer({keys: '[MouseLeft]', target: element})

  expect(document.getSelection()).toHaveProperty(
    'focusNode',
    element.firstChild,
  )
  expect(document.getSelection()).toHaveProperty('focusOffset', 11)
})

test('double click selects a word or a sequence of whitespace', async () => {
  const {element} = setup<HTMLInputElement>(`<input value="foo bar baz"/>`)

  await userEvent.pointer({keys: '[MouseLeft][MouseLeft]', target: element})

  expect(element).toHaveProperty('selectionStart', 8)
  expect(element).toHaveProperty('selectionEnd', 11)

  await userEvent.pointer({
    keys: '[MouseLeft][MouseLeft]',
    target: element,
    offset: 0,
  })

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 3)

  await userEvent.pointer({
    keys: '[MouseLeft][MouseLeft]',
    target: element,
    offset: 11,
  })

  expect(element).toHaveProperty('selectionStart', 8)
  expect(element).toHaveProperty('selectionEnd', 11)

  element.value = 'foo bar  '

  await userEvent.pointer({keys: '[MouseLeft][MouseLeft]', target: element})

  expect(element).toHaveProperty('selectionStart', 7)
  expect(element).toHaveProperty('selectionEnd', 9)
})

test('triple click selects whole line', async () => {
  const {element} = setup<HTMLInputElement>(`<input value="foo bar baz"/>`)

  await userEvent.pointer({
    keys: '[MouseLeft][MouseLeft][MouseLeft]',
    target: element,
  })

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 11)

  await userEvent.pointer({
    keys: '[MouseLeft][MouseLeft][MouseLeft]',
    target: element,
    offset: 0,
  })

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 11)

  await userEvent.pointer({
    keys: '[MouseLeft][MouseLeft][MouseLeft]',
    target: element,
    offset: 11,
  })

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 11)
})

test('mousemove with pressed button extends selection', async () => {
  const {element} = setup<HTMLInputElement>(`<input value="foo bar baz"/>`)

  const pointerState = await userEvent.pointer({
    keys: '[MouseLeft][MouseLeft>]',
    target: element,
    offset: 6,
  })

  expect(element).toHaveProperty('selectionStart', 4)
  expect(element).toHaveProperty('selectionEnd', 7)

  await userEvent.pointer({offset: 2}, {pointerState})

  expect(element).toHaveProperty('selectionStart', 2)
  expect(element).toHaveProperty('selectionEnd', 7)

  await userEvent.pointer({offset: 10}, {pointerState})

  expect(element).toHaveProperty('selectionStart', 4)
  expect(element).toHaveProperty('selectionEnd', 10)

  await userEvent.pointer({}, {pointerState})

  expect(element).toHaveProperty('selectionStart', 4)
  expect(element).toHaveProperty('selectionEnd', 11)

  await userEvent.pointer({offset: 5}, {pointerState})

  expect(element).toHaveProperty('selectionStart', 4)
  expect(element).toHaveProperty('selectionEnd', 7)
})

test('selection is moved on non-input elements', async () => {
  const {element} = setup(
    `<section><a></a><span>foo</span> <span>bar</span> <span>baz</span></section>`,
  )
  const span = element.querySelectorAll('span')

  const pointerState = await userEvent.pointer({
    keys: '[MouseLeft][MouseLeft>]',
    target: element,
    offset: 6,
  })

  expect(document.getSelection()?.toString()).toBe('bar')
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'startContainer',
    span[1].previousSibling,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'startOffset',
    1,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'endContainer',
    span[1].firstChild,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty('endOffset', 3)

  await userEvent.pointer({offset: 2}, {pointerState})

  expect(document.getSelection()?.toString()).toBe('o bar')
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'startContainer',
    span[0].firstChild,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'startOffset',
    2,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'endContainer',
    span[1].firstChild,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty('endOffset', 3)

  await userEvent.pointer({offset: 10}, {pointerState})

  expect(document.getSelection()?.toString()).toBe('bar ba')
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'startContainer',
    span[1].previousSibling,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'startOffset',
    1,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'endContainer',
    span[2].firstChild,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty('endOffset', 2)

  await userEvent.pointer({}, {pointerState})

  expect(document.getSelection()?.toString()).toBe('bar baz')
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'startContainer',
    span[1].previousSibling,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'startOffset',
    1,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'endContainer',
    span[2].firstChild,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty('endOffset', 3)
})

test('`node` overrides the text offset approximation', async () => {
  const {element} = setup(
    `<section><div><span>foo</span> <span>bar</span></div> <span>baz</span></section>`,
  )
  const div = element.firstChild as HTMLDivElement
  const span = element.querySelectorAll('span')

  const pointerState = await userEvent.pointer({
    keys: '[MouseLeft>]',
    target: element,
    node: span[0].firstChild as Node,
    offset: 1,
  })
  await userEvent.pointer({node: div, offset: 3}, {pointerState})

  expect(document.getSelection()?.toString()).toBe('oo bar')
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'startContainer',
    span[0].firstChild,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'startOffset',
    1,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'endContainer',
    div,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty('endOffset', 3)

  await userEvent.pointer({
    keys: '[MouseLeft]',
    target: element,
    node: span[0].firstChild as Node,
  })
  expect(document.getSelection()?.toString()).toBe('')
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'startContainer',
    span[0].firstChild,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'startOffset',
    3,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'endContainer',
    span[0].firstChild,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty('endOffset', 3)

  await userEvent.pointer({
    keys: '[MouseLeft]',
    target: element,
    node: span[0] as Node,
  })
  expect(document.getSelection()?.toString()).toBe('')
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'startContainer',
    span[0],
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'startOffset',
    1,
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
    'endContainer',
    span[0],
  )
  expect(document.getSelection()?.getRangeAt(0)).toHaveProperty('endOffset', 1)
})
