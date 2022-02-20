import {setSelection} from '#src/utils'
import {setup} from '#testHelpers'

describe('in text input', () => {
  test('collapse selection to the left', async () => {
    const {element, user} = setup<HTMLInputElement>(`<input value="foobar"/>`)
    element.focus()
    element.setSelectionRange(2, 4)

    await user.keyboard('[ArrowLeft]')

    expect(element.selectionStart).toBe(2)
    expect(element.selectionEnd).toBe(2)
  })

  test('collapse selection to the right', async () => {
    const {element, user} = setup<HTMLInputElement>(`<input value="foobar"/>`)
    element.focus()
    element.setSelectionRange(2, 4)

    await user.keyboard('[ArrowRight]')

    expect(element.selectionStart).toBe(4)
    expect(element.selectionEnd).toBe(4)
  })

  test('move cursor left', async () => {
    const {element, user} = setup<HTMLInputElement>(`<input value="foobar"/>`)
    element.focus()
    element.setSelectionRange(2, 2)

    await user.keyboard('[ArrowLeft]')

    expect(element.selectionStart).toBe(1)
    expect(element.selectionEnd).toBe(1)
  })

  test('move cursor right', async () => {
    const {element, user} = setup<HTMLInputElement>(`<input value="foobar"/>`)
    element.focus()
    element.setSelectionRange(2, 2)

    await user.keyboard('[ArrowRight]')

    expect(element.selectionStart).toBe(3)
    expect(element.selectionEnd).toBe(3)
  })
})

describe('in contenteditable', () => {
  test('collapse selection to the left', async () => {
    const {element, user} = setup(
      `<div contenteditable><span>foo</span><span>bar</span></div>`,
    )
    setSelection({
      anchorNode: element.firstChild?.firstChild as Text,
      anchorOffset: 2,
      focusNode: element.lastChild?.firstChild as Text,
      focusOffset: 1,
    })

    await user.keyboard('[ArrowLeft]')

    expect(element.ownerDocument.getSelection()).toHaveProperty(
      'focusNode',
      element.firstChild?.firstChild,
    )
    expect(element.ownerDocument.getSelection()).toHaveProperty(
      'focusOffset',
      2,
    )
  })

  test('collapse selection to the right', async () => {
    const {element, user} = setup(
      `<div contenteditable><span>foo</span><span>bar</span></div>`,
    )
    setSelection({
      anchorNode: element.firstChild?.firstChild as Text,
      anchorOffset: 2,
      focusNode: element.lastChild?.firstChild as Text,
      focusOffset: 1,
    })

    await user.keyboard('[ArrowRight]')

    expect(element.ownerDocument.getSelection()).toHaveProperty(
      'focusNode',
      element.lastChild?.firstChild,
    )
    expect(element.ownerDocument.getSelection()).toHaveProperty(
      'focusOffset',
      1,
    )
  })

  test('move cursor to the left', async () => {
    const {
      elements: [, div],
      user,
    } = setup(
      `<span>abc</span><div contenteditable><span>foo</span><span>bar</span></div><span>def</span>`,
    )
    setSelection({
      focusNode: div.lastChild?.firstChild as Text,
      focusOffset: 1,
    })

    await user.keyboard('[ArrowLeft][ArrowLeft]')

    expect(div.ownerDocument.getSelection()).toHaveProperty(
      'focusNode',
      div.firstChild?.firstChild,
    )
    expect(div.ownerDocument.getSelection()).toHaveProperty('focusOffset', 2)

    await user.keyboard('[ArrowLeft][ArrowLeft][ArrowLeft][ArrowLeft]')

    expect(div.ownerDocument.getSelection()).toHaveProperty(
      'focusNode',
      div.firstChild?.firstChild,
    )
    expect(div.ownerDocument.getSelection()).toHaveProperty('focusOffset', 0)
  })

  test('move cursor to the right', async () => {
    const {
      elements: [, div],
      user,
    } = setup(
      `<span>abc</span><div contenteditable><span>foo</span><span>bar</span></div><span>def</span>`,
    )
    setSelection({
      focusNode: div.firstChild?.firstChild as Text,
      focusOffset: 2,
    })

    await user.keyboard('[ArrowRight][ArrowRight]')

    expect(div.ownerDocument.getSelection()).toHaveProperty(
      'focusNode',
      div.lastChild?.firstChild,
    )
    expect(div.ownerDocument.getSelection()).toHaveProperty('focusOffset', 1)

    await user.keyboard('[ArrowRight][ArrowRight][ArrowRight][ArrowRight]')

    expect(div.ownerDocument.getSelection()).toHaveProperty(
      'focusNode',
      div.lastChild?.firstChild,
    )
    expect(div.ownerDocument.getSelection()).toHaveProperty('focusOffset', 3)
  })
})
