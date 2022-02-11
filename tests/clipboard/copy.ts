import userEvent from '#src'
import {render, setup} from '#testHelpers'

test('copy selected value', async () => {
  const {element, getEvents, user} = setup<HTMLInputElement>(
    `<input value="foo bar baz"/>`,
  )
  element.focus()
  element.setSelectionRange(4, 7)

  const dt = await user.copy()

  expect(dt?.getData('text')).toBe('bar')
  expect(getEvents('copy')).toHaveLength(1)

  await expect(window.navigator.clipboard.readText()).resolves.toBe('bar')
})

test('copy selected text outside of editable', async () => {
  const {element, getEvents, user} = setup(
    `<div tabindex="-1">foo bar baz</div>`,
  )
  element.focus()
  document
    .getSelection()
    ?.setBaseAndExtent(
      element.firstChild as Text,
      1,
      element.firstChild as Text,
      5,
    )

  const dt = await user.copy()

  expect(dt?.getData('text')).toBe('oo b')
  expect(getEvents('copy')).toHaveLength(1)

  await expect(window.navigator.clipboard.readText()).resolves.toBe('oo b')
})

test('copy selected text in contenteditable', async () => {
  const {element, getEvents, user} = setup(
    `<div contenteditable>foo bar baz</div>`,
  )
  element.focus()
  document
    .getSelection()
    ?.setBaseAndExtent(
      element.firstChild as Text,
      1,
      element.firstChild as Text,
      5,
    )

  const dt = await user.copy()

  expect(dt?.getData('text')).toBe('oo b')
  expect(getEvents('copy')).toHaveLength(1)

  await expect(window.navigator.clipboard.readText()).resolves.toBe('oo b')
})

describe('without Clipboard API', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    })
  })

  test('reject if trying to use missing API', async () => {
    const {element} = render<HTMLInputElement>(`<input value="foo bar baz"/>`)
    element.focus()
    element.setSelectionRange(4, 7)

    await expect(
      userEvent.copy({writeToClipboard: true}),
    ).rejects.toMatchInlineSnapshot(
      `[Error: The Clipboard API is unavailable.]`,
    )
  })

  test('skip using missing API', async () => {
    const {element} = render<HTMLInputElement>(`<input value="foo bar baz"/>`)
    element.focus()
    element.setSelectionRange(4, 7)

    const dt = await userEvent.copy()
    expect(dt?.getData('text/plain')).toBe('bar')
  })
})
