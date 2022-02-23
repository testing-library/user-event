import {setup} from '#testHelpers'

describe('in text input', () => {
  test('collapse selection to the left', async () => {
    const {element, user} = setup<HTMLInputElement>(`<input value="foobar"/>`, {
      selection: {anchorOffset: 2, focusOffset: 4},
    })

    await user.keyboard('[ArrowLeft]')

    expect(element.selectionStart).toBe(2)
    expect(element.selectionEnd).toBe(2)
  })

  test('collapse selection to the right', async () => {
    const {element, user} = setup<HTMLInputElement>(`<input value="foobar"/>`, {
      selection: {anchorOffset: 2, focusOffset: 4},
    })

    await user.keyboard('[ArrowRight]')

    expect(element.selectionStart).toBe(4)
    expect(element.selectionEnd).toBe(4)
  })

  test('move cursor left', async () => {
    const {element, user} = setup<HTMLInputElement>(`<input value="foobar"/>`, {
      selection: {focusOffset: 2},
    })

    await user.keyboard('[ArrowLeft]')

    expect(element.selectionStart).toBe(1)
    expect(element.selectionEnd).toBe(1)
  })

  test('move cursor right', async () => {
    const {element, user} = setup<HTMLInputElement>(`<input value="foobar"/>`, {
      selection: {focusOffset: 2},
    })

    await user.keyboard('[ArrowRight]')

    expect(element.selectionStart).toBe(3)
    expect(element.selectionEnd).toBe(3)
  })
})

describe('in contenteditable', () => {
  test('collapse selection to the left', async () => {
    const {user, xpathNode} = setup(
      `<div contenteditable><span>foo</span><span>bar</span></div>`,
      {
        selection: {
          anchorNode: 'div/span[1]/text()',
          anchorOffset: 2,
          focusNode: 'div/span[2]/text()',
          focusOffset: 1,
        },
      },
    )

    await user.keyboard('[ArrowLeft]')

    expect(document.getSelection()).toHaveProperty(
      'focusNode',
      xpathNode('div/span[1]/text()'),
    )
    expect(document.getSelection()).toHaveProperty('focusOffset', 2)
  })

  test('collapse selection to the right', async () => {
    const {user, xpathNode} = setup(
      `<div contenteditable><span>foo</span><span>bar</span></div>`,
      {
        selection: {
          anchorNode: 'div/span[1]/text()',
          anchorOffset: 2,
          focusNode: 'div/span[2]/text()',
          focusOffset: 1,
        },
      },
    )

    await user.keyboard('[ArrowRight]')

    expect(document.getSelection()).toHaveProperty(
      'focusNode',
      xpathNode('div/span[2]/text()'),
    )
    expect(document.getSelection()).toHaveProperty('focusOffset', 1)
  })

  test('move cursor to the left', async () => {
    const {user, xpathNode} = setup(
      `<span>abc</span><div contenteditable><span>foo</span><span>bar</span></div><span>def</span>`,
      {
        selection: {
          focusNode: 'div/span[2]/text()',
          focusOffset: 1,
        },
      },
    )

    await user.keyboard('[ArrowLeft][ArrowLeft]')

    expect(document.getSelection()).toHaveProperty(
      'focusNode',
      xpathNode('div/span[1]/text()'),
    )
    expect(document.getSelection()).toHaveProperty('focusOffset', 2)

    await user.keyboard('[ArrowLeft][ArrowLeft][ArrowLeft][ArrowLeft]')

    expect(document.getSelection()).toHaveProperty(
      'focusNode',
      xpathNode('div/span[1]/text()'),
    )
    expect(document.getSelection()).toHaveProperty('focusOffset', 0)
  })

  test('move cursor to the right', async () => {
    const {user, xpathNode} = setup(
      `<span>abc</span><div contenteditable><span>foo</span><span>bar</span></div><span>def</span>`,
      {
        selection: {
          focusNode: 'div/span[1]/text()',
          focusOffset: 2,
        },
      },
    )

    await user.keyboard('[ArrowRight][ArrowRight]')

    expect(document.getSelection()).toHaveProperty(
      'focusNode',
      xpathNode('div/span[2]/text()'),
    )
    expect(document.getSelection()).toHaveProperty('focusOffset', 1)

    await user.keyboard('[ArrowRight][ArrowRight][ArrowRight][ArrowRight]')

    expect(document.getSelection()).toHaveProperty(
      'focusNode',
      xpathNode('div/span[2]/text()'),
    )
    expect(document.getSelection()).toHaveProperty('focusOffset', 3)
  })
})
