import {setup} from '#testHelpers'

// On an unprevented mousedown the browser moves the cursor to the closest character.
// As we have no layout, we are not able to determine the correct character.
// So we try an approximation:
// We treat any mousedown as if it happened on the space after the last character.

test('single mousedown moves cursor to the end', async () => {
  const {element, user} = setup<HTMLInputElement>(
    `<input value="foo bar baz"/>`,
  )

  await user.pointer({keys: '[MouseLeft>]', target: element})

  expect(element).toHaveFocus()
  expect(element).toHaveProperty('selectionStart', 11)
})

test('move focus to closest focusable element', async () => {
  const {element, user} = setup(`
    <div tabIndex="0">
      <div>this is not focusable</div>
      <button>this is focusable</button>
    </div>
  `)

  await user.pointer({keys: '[MouseLeft>]', target: element.children[1]})
  expect(element.children[1]).toHaveFocus()

  await user.pointer({keys: '[TouchA]', target: element.children[0]})
  expect(element).toHaveFocus()
})

test('blur when outside of focusable context', async () => {
  const {
    elements: [focusable, notFocusable],
    user,
  } = setup(`
    <div tabIndex="-1"></div>
    <div></div>
  `)

  expect(focusable).toHaveFocus()
  await user.pointer({keys: '[MouseLeft>]', target: notFocusable})
  expect(document.body).toHaveFocus()
})

test('mousedown handlers can prevent moving focus', async () => {
  const {element, user} = setup<HTMLInputElement>(`<input/>`, {focus: false})
  element.addEventListener('mousedown', e => e.preventDefault())

  await user.pointer({keys: '[MouseLeft>]', target: element})
  await user.pointer({keys: '[TouchA]', target: element})

  expect(element).not.toHaveFocus()
  expect(element).toHaveProperty('selectionStart', 0)
})

test('single mousedown moves cursor to the last text', async () => {
  const {element, user} = setup<HTMLInputElement>(
    `<div contenteditable>foo bar baz</div>`,
  )

  await user.pointer({keys: '[MouseLeft>]', target: element})

  expect(element).toHaveFocus()
  expect(document.getSelection()).toHaveProperty(
    'focusNode',
    element.firstChild,
  )
  expect(document.getSelection()).toHaveProperty('focusOffset', 11)
})

test('double mousedown selects a word or a sequence of whitespace', async () => {
  const {element, user} = setup<HTMLInputElement>(
    `<input value="foo bar baz"/>`,
  )

  await user.pointer({keys: '[MouseLeft][MouseLeft>]', target: element})

  expect(element).toHaveProperty('selectionStart', 8)
  expect(element).toHaveProperty('selectionEnd', 11)

  await user.pointer({
    keys: '[MouseLeft][MouseLeft>]',
    target: element,
    offset: 0,
  })

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 3)

  await user.pointer({
    keys: '[MouseLeft][MouseLeft]',
    target: element,
    offset: 11,
  })

  expect(element).toHaveProperty('selectionStart', 8)
  expect(element).toHaveProperty('selectionEnd', 11)

  element.value = 'foo bar  '

  await user.pointer({keys: '[MouseLeft][MouseLeft>]', target: element})

  expect(element).toHaveProperty('selectionStart', 7)
  expect(element).toHaveProperty('selectionEnd', 9)
})

test('triple mousedown selects whole line', async () => {
  const {element, user} = setup<HTMLInputElement>(
    `<input value="foo bar baz"/>`,
  )

  await user.pointer({
    keys: '[MouseLeft][MouseLeft][MouseLeft>]',
    target: element,
  })

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 11)

  await user.pointer({
    keys: '[MouseLeft][MouseLeft][MouseLeft>]',
    target: element,
    offset: 0,
  })

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 11)

  await user.pointer({
    keys: '[MouseLeft][MouseLeft][MouseLeft>]',
    target: element,
    offset: 11,
  })

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 11)
})

test('mousemove with pressed button extends selection', async () => {
  const {element, user} = setup<HTMLInputElement>(
    `<input value="foo bar baz"/>`,
  )

  await user.pointer({
    keys: '[MouseLeft][MouseLeft>]',
    target: element,
    offset: 6,
  })

  expect(element).toHaveProperty('selectionStart', 4)
  expect(element).toHaveProperty('selectionEnd', 7)

  await user.pointer({offset: 2})

  expect(element).toHaveProperty('selectionStart', 2)
  expect(element).toHaveProperty('selectionEnd', 7)

  await user.pointer({offset: 10})

  expect(element).toHaveProperty('selectionStart', 4)
  expect(element).toHaveProperty('selectionEnd', 10)

  await user.pointer({})

  expect(element).toHaveProperty('selectionStart', 4)
  expect(element).toHaveProperty('selectionEnd', 11)

  await user.pointer({offset: 5})

  expect(element).toHaveProperty('selectionStart', 4)
  expect(element).toHaveProperty('selectionEnd', 7)
})

test('selection is moved on non-input elements', async () => {
  const {element, user} = setup(
    `<section><a></a><span>foo</span> <span>bar</span> <span>baz</span></section>`,
  )
  const span = element.querySelectorAll('span')

  await user.pointer({
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

  await user.pointer({offset: 2})

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

  await user.pointer({offset: 10})

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

  await user.pointer({})

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
  const {element, user} = setup(
    `<section><div><span>foo</span> <span>bar</span></div> <span>baz</span></section>`,
  )
  const div = element.firstChild as HTMLDivElement
  const span = element.querySelectorAll('span')

  await user.pointer({
    keys: '[MouseLeft>]',
    target: element,
    node: span[0].firstChild as Node,
    offset: 1,
  })
  await user.pointer({node: div, offset: 3})

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

  await user.pointer({
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

  await user.pointer({
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

describe('focus control when clicking label', () => {
  test('click event on label moves focus to control', async () => {
    const {
      elements: [input, label],
      user,
    } = setup(`<input id="a" value="foo"/><label for="a" tabindex="-1"/>`)

    await user.pointer({
      keys: '[MouseLeft>]',
      target: label,
    })

    expect(label).toHaveFocus()

    await user.pointer('[/MouseLeft]')

    expect(label).not.toHaveFocus()
    expect(input).toHaveFocus()
  })

  test('click handlers can prevent moving focus per label', async () => {
    const {
      elements: [input, label],
      user,
    } = setup(`<input id="a"/><label for="a" tabindex="-1"/>`)
    label.addEventListener('click', e => e.preventDefault())

    await user.pointer({keys: '[MouseLeft]', target: label})

    expect(input).not.toHaveFocus()
  })

  test('do not move focus to disabled control', async () => {
    const {
      elements: [input, label],
      user,
    } = setup(`<input id="a" disabled/><label for="a" tabindex="-1"/>`)

    await user.pointer({keys: '[MouseLeft]', target: label})

    expect(label).toHaveFocus()
    expect(input).not.toHaveFocus()
  })
})

test('focus event handler can override selection', async () => {
  const {element, user} = setup(`<input value="hello"/>`, {
    focus: false,
  })
  element.addEventListener('focus', e =>
    (e.target as HTMLInputElement).select(),
  )

  await user.click(element)

  expect(element).toHaveProperty('selectionStart', 0)
  expect(element).toHaveProperty('selectionEnd', 5)
})
