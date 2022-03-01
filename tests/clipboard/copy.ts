import userEvent from '#src'
import {render, setup} from '#testHelpers'

test('copy selected value', async () => {
  const {getEvents, user} = setup<HTMLInputElement>(
    `<input value="foo bar baz"/>`,
    {
      selection: {anchorOffset: 4, focusOffset: 7},
    },
  )

  const dt = await user.copy()

  expect(dt?.getData('text')).toBe('bar')
  expect(getEvents('copy')).toHaveLength(1)

  await expect(window.navigator.clipboard.readText()).resolves.toBe('bar')
})

test('copy selected text outside of editable', async () => {
  const {getEvents, user} = setup(`<div tabindex="-1">foo bar baz</div>`, {
    selection: {focusNode: '//text()', anchorOffset: 1, focusOffset: 5},
  })

  const dt = await user.copy()

  expect(dt?.getData('text')).toBe('oo b')
  expect(getEvents('copy')).toHaveLength(1)

  await expect(window.navigator.clipboard.readText()).resolves.toBe('oo b')
})

test('copy selected text in contenteditable', async () => {
  const {getEvents, user} = setup(`<div contenteditable>foo bar baz</div>`, {
    selection: {focusNode: '//text()', anchorOffset: 1, focusOffset: 5},
  })

  const dt = await user.copy()

  expect(dt?.getData('text')).toBe('oo b')
  expect(getEvents('copy')).toHaveLength(1)

  await expect(window.navigator.clipboard.readText()).resolves.toBe('oo b')
})

test('copy on empty selection does nothing', async () => {
  const {getEvents, user} = setup(`<input/>`)
  await window.navigator.clipboard.writeText('foo')

  await user.copy()

  await expect(window.navigator.clipboard.readText()).resolves.toBe('foo')
  expect(getEvents()).toHaveLength(0)
})

test('prevent default behavior per event handler', async () => {
  const {element, eventWasFired, getEvents, user} = setup(
    `<input value="bar"/>`,
    {
      selection: {anchorOffset: 0, focusOffset: 3},
    },
  )
  element.addEventListener('copy', e => e.preventDefault())
  await window.navigator.clipboard.writeText('foo')

  await user.copy()
  expect(eventWasFired('copy')).toBe(true)
  expect(getEvents('copy')[0].clipboardData?.getData('text')).toBe('bar')
  await expect(window.navigator.clipboard.readText()).resolves.toBe('foo')
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
      userEvent.copy({writeToClipboard: true}),
    ).rejects.toMatchInlineSnapshot(
      `[Error: The Clipboard API is unavailable.]`,
    )
  })

  test('skip using missing API', async () => {
    render<HTMLInputElement>(`<input value="foo bar baz"/>`, {
      selection: {anchorOffset: 4, focusOffset: 7},
    })

    const dt = await userEvent.copy()
    expect(dt?.getData('text/plain')).toBe('bar')
  })
})
