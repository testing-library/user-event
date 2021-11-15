import userEvent from '#src'
import {wait} from '#src/utils'
import {setup} from '#testHelpers/utils'

test('double click', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  userEvent.pointer({keys: '[MouseLeft][MouseLeft]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=2
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=2
    click - button=0; buttons=0; detail=2
    dblclick - button=0; buttons=0; detail=2
  `)
})

test('two clicks', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  const pointerState = userEvent.pointer({keys: '[MouseLeft]', target: element})
  userEvent.pointer({keys: '[MouseLeft]', target: element}, {pointerState})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})

test('drag sequence', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  userEvent.pointer([
    {keys: '[MouseLeft>]', target: element},
    {coords: {x: 20, y: 20}},
    '[/MouseLeft]',
  ])

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointermove - pointerId=1; pointerType=mouse; isPrimary=undefined
    mousemove - button=0; buttons=0; detail=0
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})

test('hover to other element', () => {
  const {elements, getEventSnapshot} = setup(`<div></div><div></div>`)

  userEvent.pointer([
    {target: elements[0], coords: {x: 20, y: 20}},
    {target: elements[1], coords: {x: 40, y: 40}},
  ])

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - mouseover
    div - pointermove
    div - mousemove
    div - pointermove
    div - mousemove
    div - pointerout
    div - mouseout
    div - pointerover
    div - mouseover
    div - pointermove
    div - mousemove
  `)
})

test('hover inside element', () => {
  const {element, getEventSnapshot} = setup(`<div><a></a><p></p></div>`)

  userEvent.pointer([
    {target: element},
    {target: element.firstChild as Element},
    {target: element.lastChild as Element},
    {target: element},
  ])

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - mouseover
    div - mouseenter
    div - pointermove
    div - mousemove
    div - pointermove
    div - mousemove
    a - pointerover
    a - mouseover
    a - pointermove
    a - mousemove
    a - pointermove
    a - mousemove
    a - pointerout
    a - mouseout
    p - pointerover
    p - mouseover
    p - pointermove
    p - mousemove
    p - pointermove
    p - mousemove
    p - pointerout
    p - mouseout
    div - pointermove
    div - mousemove
  `)
})

test('continue previous target', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  const pointerState = userEvent.pointer({keys: '[MouseLeft]', target: element})
  userEvent.pointer('[MouseLeft]', {pointerState})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})

test('other keys reset click counter, but keyup/click still uses the old count', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  userEvent.pointer({
    keys: '[MouseLeft][MouseLeft>][MouseRight][MouseLeft]',
    target: element,
  })

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=2
    mousedown - button=2; buttons=3; detail=1
    mouseup - button=2; buttons=1; detail=1
    contextmenu - button=0; buttons=0; detail=0
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=2
    click - button=0; buttons=0; detail=2
    dblclick - button=0; buttons=0; detail=2
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})

test('click per touch device', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  userEvent.pointer({keys: '[TouchA]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerenter - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerdown - pointerId=2; pointerType=touch; isPrimary=true
    pointerup - pointerId=2; pointerType=touch; isPrimary=true
    pointerout - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerleave - pointerId=2; pointerType=touch; isPrimary=undefined
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    mousemove - button=0; buttons=0; detail=0
    mousedown - button=0; buttons=0; detail=1
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})

test('double click per touch device', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  userEvent.pointer({keys: '[TouchA][TouchA]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerenter - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerdown - pointerId=2; pointerType=touch; isPrimary=true
    pointerup - pointerId=2; pointerType=touch; isPrimary=true
    pointerout - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerleave - pointerId=2; pointerType=touch; isPrimary=undefined
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    mousemove - button=0; buttons=0; detail=0
    mousedown - button=0; buttons=0; detail=1
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointerover - pointerId=3; pointerType=touch; isPrimary=undefined
    pointerenter - pointerId=3; pointerType=touch; isPrimary=undefined
    pointerdown - pointerId=3; pointerType=touch; isPrimary=true
    pointerup - pointerId=3; pointerType=touch; isPrimary=true
    pointerout - pointerId=3; pointerType=touch; isPrimary=undefined
    pointerleave - pointerId=3; pointerType=touch; isPrimary=undefined
    mousemove - button=0; buttons=0; detail=0
    mousedown - button=0; buttons=0; detail=2
    mouseup - button=0; buttons=0; detail=2
    click - button=0; buttons=0; detail=2
    dblclick - button=0; buttons=0; detail=2
  `)
})

test('multi touch does not click', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  userEvent.pointer({keys: '[TouchA>][TouchB][/TouchA]', target: element})

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerenter - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerdown - pointerId=2; pointerType=touch; isPrimary=true
    pointerover - pointerId=3; pointerType=touch; isPrimary=undefined
    pointerenter - pointerId=3; pointerType=touch; isPrimary=undefined
    pointerdown - pointerId=3; pointerType=touch; isPrimary=false
    pointerup - pointerId=3; pointerType=touch; isPrimary=false
    pointerout - pointerId=3; pointerType=touch; isPrimary=undefined
    pointerleave - pointerId=3; pointerType=touch; isPrimary=undefined
    pointerup - pointerId=2; pointerType=touch; isPrimary=true
    pointerout - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerleave - pointerId=2; pointerType=touch; isPrimary=undefined
  `)
})

test('drag touch', () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  userEvent.pointer([
    {keys: '[TouchA>]', target: element},
    {pointerName: 'TouchA', coords: {x: 20, y: 20}},
    '[/TouchA]',
  ])

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerover - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerenter - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerdown - pointerId=2; pointerType=touch; isPrimary=true
    pointermove - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerup - pointerId=2; pointerType=touch; isPrimary=true
    pointerout - pointerId=2; pointerType=touch; isPrimary=undefined
    pointerleave - pointerId=2; pointerType=touch; isPrimary=undefined
    mouseover - button=0; buttons=0; detail=0
    mouseenter - button=0; buttons=0; detail=0
    mousemove - button=0; buttons=0; detail=0
    mousedown - button=0; buttons=0; detail=1
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
  `)
})

test('move touch over elements', () => {
  const {element, getEventSnapshot} = setup(`<div><a></a><p></p></div>`)

  userEvent.pointer([
    {keys: '[TouchA>]', target: element},
    {pointerName: 'TouchA', target: element.firstChild as Element},
    {pointerName: 'TouchA', target: element.lastChild as Element},
    {pointerName: 'TouchA', target: element},
    {keys: '[/TouchA]', target: element},
  ])

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    div - pointerover
    div - pointerenter
    div - pointerdown
    div - pointermove
    a - pointerover
    a - pointermove
    a - pointermove
    a - pointerout
    p - pointerover
    p - pointermove
    p - pointermove
    p - pointerout
    div - pointermove
    div - pointerup
    div - pointerout
    div - pointerleave
    div - mouseover
    div - mouseenter
    div - mousemove
    div - mousedown: primary
    div - mouseup: primary
    div - click: primary
  `)
})

test('unknown button does nothing', () => {
  const {element, getEvents} = setup(`<div></div>`)

  userEvent.pointer({keys: '[foo]', target: element})

  expect(getEvents()).toEqual([])
})

test('pointer without previous target results in error', async () => {
  await expect(
    userEvent.pointer({keys: '[MouseLeft]'}, {delay: 1}),
  ).rejects.toThrowError('no previous position')
})

describe('error', () => {
  afterEach(() => {
    ;(console.error as jest.MockedFunction<typeof console.error>).mockClear()
  })

  it('error for unknown pointer in sync', async () => {
    const err = jest.spyOn(console, 'error')
    err.mockImplementation(() => {})

    const {element} = setup(`<div></div>`)
    userEvent.pointer({pointerName: 'foo', target: element})

    // the catch will be asynchronous
    await wait(10)

    expect(err).toHaveBeenCalledWith(expect.any(Error) as unknown)
    expect(err.mock.calls[0][0]).toHaveProperty(
      'message',
      expect.stringContaining('does not exist'),
    )
  })

  it('error for unknown pointer in async', async () => {
    const {element} = setup(`<div></div>`)
    const promise = userEvent.pointer(
      {pointerName: 'foo', target: element},
      {delay: 1},
    )

    return expect(promise).rejects.toThrowError('does not exist')
  })
})

test('asynchronous pointer', async () => {
  const {element, getClickEventsSnapshot} = setup(`<div></div>`)

  // eslint-disable-next-line testing-library/no-await-sync-events
  const pointerState = await userEvent.pointer(
    {keys: '[MouseLeft]', target: element},
    {delay: 1},
  )
  // eslint-disable-next-line testing-library/no-await-sync-events
  await userEvent.pointer([{coords: {x: 20, y: 20}}, '[/MouseLeft]'], {
    delay: 1,
    pointerState,
  })

  expect(getClickEventsSnapshot()).toMatchInlineSnapshot(`
    pointerdown - pointerId=1; pointerType=mouse; isPrimary=true
    mousedown - button=0; buttons=1; detail=1
    pointerup - pointerId=1; pointerType=mouse; isPrimary=true
    mouseup - button=0; buttons=0; detail=1
    click - button=0; buttons=0; detail=1
    pointermove - pointerId=1; pointerType=mouse; isPrimary=undefined
    mousemove - button=0; buttons=0; detail=0
  `)
})

test('apply modifiers from keyboardstate', async () => {
  const {element, getEvents} = setup(`<input/>`)

  element.focus()
  let keyboardState = userEvent.keyboard('[ShiftLeft>]')
  userEvent.pointer({keys: '[MouseLeft]', target: element}, {keyboardState})
  keyboardState = userEvent.keyboard('[/ShiftLeft][ControlRight>]', {
    keyboardState,
  })
  userEvent.pointer({keys: '[MouseLeft]', target: element}, {keyboardState})
  keyboardState = userEvent.keyboard('[/ControlRight][AltLeft>]', {
    keyboardState,
  })
  userEvent.pointer({keys: '[MouseLeft]', target: element}, {keyboardState})
  keyboardState = userEvent.keyboard('[/AltLeft][MetaLeft>]', {keyboardState})
  userEvent.pointer({keys: '[MouseLeft]', target: element}, {keyboardState})

  expect(getEvents('click')).toEqual([
    expect.objectContaining({shiftKey: true}),
    expect.objectContaining({ctrlKey: true}),
    expect.objectContaining({altKey: true}),
    expect.objectContaining({metaKey: true}),
  ])
})

describe('mousedown moves selection', () => {
  // On an unprevented mousedown the browser moves the cursor to the closest character.
  // As we have no layout, we are not able to determine the correct character.
  // So we try an approximation:
  // We treat any mousedown as if it happened on the space after the last character.

  test('single click moves cursor to the end', () => {
    const {element} = setup<HTMLInputElement>(`<input value="foo bar baz"/>`)

    userEvent.pointer({keys: '[MouseLeft]', target: element})

    expect(element).toHaveProperty('selectionStart', 11)
  })

  test('single click moves cursor to the last text', () => {
    const {element} = setup<HTMLInputElement>(
      `<div contenteditable>foo bar baz</div>`,
    )

    userEvent.pointer({keys: '[MouseLeft]', target: element})

    expect(document.getSelection()).toHaveProperty(
      'focusNode',
      element.firstChild,
    )
    expect(document.getSelection()).toHaveProperty('focusOffset', 11)
  })

  test('double click selects a word or a sequence of whitespace', () => {
    const {element} = setup<HTMLInputElement>(`<input value="foo bar baz"/>`)

    userEvent.pointer({keys: '[MouseLeft][MouseLeft]', target: element})

    expect(element).toHaveProperty('selectionStart', 8)
    expect(element).toHaveProperty('selectionEnd', 11)

    userEvent.pointer({
      keys: '[MouseLeft][MouseLeft]',
      target: element,
      offset: 0,
    })

    expect(element).toHaveProperty('selectionStart', 0)
    expect(element).toHaveProperty('selectionEnd', 3)

    userEvent.pointer({
      keys: '[MouseLeft][MouseLeft]',
      target: element,
      offset: 11,
    })

    expect(element).toHaveProperty('selectionStart', 8)
    expect(element).toHaveProperty('selectionEnd', 11)

    element.value = 'foo bar  '

    userEvent.pointer({keys: '[MouseLeft][MouseLeft]', target: element})

    expect(element).toHaveProperty('selectionStart', 7)
    expect(element).toHaveProperty('selectionEnd', 9)
  })

  test('triple click selects whole line', () => {
    const {element} = setup<HTMLInputElement>(`<input value="foo bar baz"/>`)

    userEvent.pointer({
      keys: '[MouseLeft][MouseLeft][MouseLeft]',
      target: element,
    })

    expect(element).toHaveProperty('selectionStart', 0)
    expect(element).toHaveProperty('selectionEnd', 11)

    userEvent.pointer({
      keys: '[MouseLeft][MouseLeft][MouseLeft]',
      target: element,
      offset: 0,
    })

    expect(element).toHaveProperty('selectionStart', 0)
    expect(element).toHaveProperty('selectionEnd', 11)

    userEvent.pointer({
      keys: '[MouseLeft][MouseLeft][MouseLeft]',
      target: element,
      offset: 11,
    })

    expect(element).toHaveProperty('selectionStart', 0)
    expect(element).toHaveProperty('selectionEnd', 11)
  })

  test('mousemove with pressed button extends selection', () => {
    const {element} = setup<HTMLInputElement>(`<input value="foo bar baz"/>`)

    const pointerState = userEvent.pointer({
      keys: '[MouseLeft][MouseLeft>]',
      target: element,
      offset: 6,
    })

    expect(element).toHaveProperty('selectionStart', 4)
    expect(element).toHaveProperty('selectionEnd', 7)

    userEvent.pointer({offset: 2}, {pointerState})

    expect(element).toHaveProperty('selectionStart', 2)
    expect(element).toHaveProperty('selectionEnd', 7)

    userEvent.pointer({offset: 10}, {pointerState})

    expect(element).toHaveProperty('selectionStart', 4)
    expect(element).toHaveProperty('selectionEnd', 10)

    userEvent.pointer({}, {pointerState})

    expect(element).toHaveProperty('selectionStart', 4)
    expect(element).toHaveProperty('selectionEnd', 11)

    userEvent.pointer({offset: 5}, {pointerState})

    expect(element).toHaveProperty('selectionStart', 4)
    expect(element).toHaveProperty('selectionEnd', 7)
  })

  test('selection is moved on non-input elements', () => {
    const {element} = setup(
      `<section><a></a><span>foo</span> <span>bar</span> <span>baz</span></section>`,
    )
    const span = element.querySelectorAll('span')

    const pointerState = userEvent.pointer({
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
    expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
      'endOffset',
      3,
    )

    userEvent.pointer({offset: 2}, {pointerState})

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
    expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
      'endOffset',
      3,
    )

    userEvent.pointer({offset: 10}, {pointerState})

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
    expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
      'endOffset',
      2,
    )

    userEvent.pointer({}, {pointerState})

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
    expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
      'endOffset',
      3,
    )
  })

  test('`node` overrides the text offset approximation', () => {
    const {element} = setup(
      `<section><div><span>foo</span> <span>bar</span></div> <span>baz</span></section>`,
    )
    const div = element.firstChild as HTMLDivElement
    const span = element.querySelectorAll('span')

    const pointerState = userEvent.pointer({
      keys: '[MouseLeft>]',
      target: element,
      node: span[0].firstChild as Node,
      offset: 1,
    })
    userEvent.pointer({node: div, offset: 3}, {pointerState})

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
    expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
      'endOffset',
      3,
    )

    userEvent.pointer({
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
    expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
      'endOffset',
      3,
    )

    userEvent.pointer({
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
    expect(document.getSelection()?.getRangeAt(0)).toHaveProperty(
      'endOffset',
      1,
    )
  })
})