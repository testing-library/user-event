import userEvent from '#src'
import {render, setup} from '#testHelpers'

test('cut selected value', async () => {
  const {getEvents, user} = setup<HTMLInputElement>(
    `<input value="foo bar baz"/>`,
    {
      selection: {anchorOffset: 4, focusOffset: 7},
    },
  )

  const dt = await user.cut()

  expect(dt?.getData('text')).toBe('bar')
  expect(getEvents('cut')).toHaveLength(1)
  expect(getEvents('input')).toHaveLength(1)

  await expect(window.navigator.clipboard.readText()).resolves.toBe('bar')
})

test('cut selected text outside of editable', async () => {
  const {getEvents, user} = setup(`<div tabindex="-1">foo bar baz</div>`, {
    selection: {focusNode: '//text()', anchorOffset: 1, focusOffset: 5},
  })

  const dt = await user.cut()

  expect(dt?.getData('text')).toBe('oo b')
  expect(getEvents('cut')).toHaveLength(1)
  expect(getEvents('input')).toHaveLength(0)

  await expect(window.navigator.clipboard.readText()).resolves.toBe('oo b')
})

test('cut selected text in contenteditable', async () => {
  const {element, getEvents, user} = setup(
    `<div contenteditable>foo bar baz</div>`,
    {
      selection: {focusNode: '//text()', anchorOffset: 1, focusOffset: 5},
    },
  )

  const dt = await user.cut()

  expect(dt?.getData('text')).toBe('oo b')
  expect(getEvents('cut')).toHaveLength(1)
  expect(getEvents('input')).toHaveLength(1)
  expect(element).toHaveTextContent('far baz')

  await expect(window.navigator.clipboard.readText()).resolves.toBe('oo b')
})

test('cut on empty selection does nothing', async () => {
  const {getEvents, user} = setup(`<input/>`)
  await window.navigator.clipboard.writeText('foo')

  await user.cut()

  await expect(window.navigator.clipboard.readText()).resolves.toBe('foo')
  expect(getEvents()).toHaveLength(0)
})

describe('without Clipboard API', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    })
  })

  test('reject if trying to use missing API', async () => {
    render<HTMLInputElement>(`<input value="foo bar baz"/>`, {
      selection: {anchorOffset: 4, focusOffset: 7},
    })

    await expect(
      userEvent.cut({writeToClipboard: true}),
    ).rejects.toMatchInlineSnapshot(
      `[Error: The Clipboard API is unavailable.]`,
    )
  })

  test('skip using missing API', async () => {
    render<HTMLInputElement>(`<input value="foo bar baz"/>`, {
      selection: {anchorOffset: 4, focusOffset: 7},
    })

    const dt = await userEvent.cut()
    expect(dt?.getData('text/plain')).toBe('bar')
  })
})
