import userEvent from '#src'
import {setup} from '#testHelpers'

test('cut selected value', async () => {
  const {element, getEvents} = setup<HTMLInputElement>(
    `<input value="foo bar baz"/>`,
  )
  element.focus()
  element.setSelectionRange(4, 7)

  const dt = await userEvent.cut()

  expect(dt?.getData('text')).toBe('bar')
  expect(getEvents('cut')).toHaveLength(1)
  expect(getEvents('input')).toHaveLength(1)
})

test('cut selected text outside of editable', async () => {
  const {element, getEvents} = setup(`<div tabindex="-1">foo bar baz</div>`)
  element.focus()
  document
    .getSelection()
    ?.setBaseAndExtent(
      element.firstChild as Text,
      1,
      element.firstChild as Text,
      5,
    )

  const dt = await userEvent.cut()

  expect(dt?.getData('text')).toBe('oo b')
  expect(getEvents('cut')).toHaveLength(1)
  expect(getEvents('input')).toHaveLength(0)
})

test('cut selected text in contenteditable', async () => {
  const {element, getEvents} = setup(`<div contenteditable>foo bar baz</div>`)
  element.focus()
  document
    .getSelection()
    ?.setBaseAndExtent(
      element.firstChild as Text,
      1,
      element.firstChild as Text,
      5,
    )

  const dt = await userEvent.cut()

  expect(dt?.getData('text')).toBe('oo b')
  expect(getEvents('cut')).toHaveLength(1)
  expect(getEvents('input')).toHaveLength(1)
  expect(element).toHaveTextContent('far baz')
})

describe('write to clipboard', () => {
  test('without Clipboard API', async () => {
    const {element} = setup<HTMLInputElement>(`<input value="foo bar baz"/>`)
    element.focus()
    element.setSelectionRange(4, 7)

    await expect(
      userEvent.cut({writeToClipboard: true}),
    ).rejects.toMatchInlineSnapshot(
      `[Error: The Clipboard API is unavailable.]`,
    )
  })

  test('cut selected value', async () => {
    const {element, getEvents} = setup<HTMLInputElement>(
      `<input value="foo bar baz"/>`,
    )
    element.focus()
    element.setSelectionRange(4, 7)

    const dt = userEvent.setup().cut()

    await expect(dt).resolves.toBeTruthy()
    expect((await dt)?.getData('text')).toBe('bar')

    await expect(window.navigator.clipboard.readText()).resolves.toBe('bar')

    expect(getEvents('cut')).toHaveLength(1)
    expect(getEvents('input')).toHaveLength(1)
    expect(element).toHaveValue('foo  baz')
  })

  test('cut selected text outside of editable', async () => {
    const {element, getEvents} = setup(`<div tabindex="-1">foo bar baz</div>`)
    element.focus()
    document
      .getSelection()
      ?.setBaseAndExtent(
        element.firstChild as Text,
        1,
        element.firstChild as Text,
        5,
      )

    const dt = userEvent.setup().cut()

    await expect(dt).resolves.toBeTruthy()
    expect((await dt)?.getData('text')).toBe('oo b')

    await expect(window.navigator.clipboard.readText()).resolves.toBe('oo b')

    expect(getEvents('cut')).toHaveLength(1)
    expect(getEvents('input')).toHaveLength(0)
  })

  test('cut selected text in contenteditable', async () => {
    const {element, getEvents} = setup(`<div contenteditable>foo bar baz</div>`)
    element.focus()
    document
      .getSelection()
      ?.setBaseAndExtent(
        element.firstChild as Text,
        1,
        element.firstChild as Text,
        5,
      )

    const dt = userEvent.setup().cut()

    await expect(dt).resolves.toBeTruthy()
    expect((await dt)?.getData('text')).toBe('oo b')

    await expect(window.navigator.clipboard.readText()).resolves.toBe('oo b')

    expect(getEvents('cut')).toHaveLength(1)
    expect(getEvents('input')).toHaveLength(1)
    expect(element).toHaveTextContent('far baz')
  })
})
