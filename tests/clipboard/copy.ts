import userEvent from '#src'
import {render, setup} from '#testHelpers'
import {readDataTransferFromClipboard} from '#src/utils'

test('copy selected value', async () => {
  const {getEvents, user} = setup<HTMLInputElement>(
    `<input value="foo bar baz"/>`,
    {
      selection: {anchorOffset: 4, focusOffset: 7},
    },
  )

  const dt = await user.copy()

  expect(dt.getData('text')).toBe('bar')
  expect(getEvents('copy')).toHaveLength(1)

  await expect(window.navigator.clipboard.readText()).resolves.toBe('bar')
})

test('copy selected text outside of editable', async () => {
  const {getEvents, user} = setup(`<div tabindex="-1">foo bar baz</div>`, {
    selection: {focusNode: './/text()', anchorOffset: 1, focusOffset: 5},
  })

  const dt = await user.copy()

  expect(dt.getData('text')).toBe('oo b')
  expect(getEvents('copy')).toHaveLength(1)

  await expect(window.navigator.clipboard.readText()).resolves.toBe('oo b')
})

test('copy selected text in contenteditable', async () => {
  const {getEvents, user} = setup(`<div contenteditable>foo bar baz</div>`, {
    selection: {focusNode: './/text()', anchorOffset: 1, focusOffset: 5},
  })

  const dt = await user.copy()

  expect(dt.getData('text')).toBe('oo b')
  expect(getEvents('copy')).toHaveLength(1)

  await expect(window.navigator.clipboard.readText()).resolves.toBe('oo b')
})

test('copy on empty selection does not change clipboard', async () => {
  const {getEvents, user} = setup(`<input/>`)
  await window.navigator.clipboard.writeText('foo')

  await user.copy()

  await expect(window.navigator.clipboard.readText()).resolves.toBe('foo')
  expect(getEvents('copy')).toHaveLength(1)
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
  expect(getEvents('copy')[0].clipboardData?.getData('text')).toBe('')
  await expect(window.navigator.clipboard.readText()).resolves.toBe('foo')
})

test('copies all items added in event handler', async () => {
  const {element, user} = setup(`<div tabindex="-1" />`, {})

  element.addEventListener('copy', e => {
    e.clipboardData?.setData('text/plain', 'a = 42')
    e.clipboardData?.setData('application/json', '{"a": 42}')
    e.preventDefault()
  })

  await user.copy()

  const receivedClipboardData = await readDataTransferFromClipboard(
    element.ownerDocument,
  )
  expect(receivedClipboardData.types).toEqual([
    'text/plain',
    'application/json',
  ])
  expect(receivedClipboardData.getData('text/plain')).toBe('a = 42')
  expect(receivedClipboardData.getData('application/json')).toBe('{"a": 42}')
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
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `The Clipboard API is unavailable.`,
    )
  })

  test('skip using missing API', async () => {
    render<HTMLInputElement>(`<input value="foo bar baz"/>`, {
      selection: {anchorOffset: 4, focusOffset: 7},
    })

    const dt = await userEvent.copy()
    expect(dt.getData('text/plain')).toBe('bar')
  })
})
