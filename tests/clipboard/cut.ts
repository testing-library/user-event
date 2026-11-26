import userEvent from '#src'
import {render, setup} from '#testHelpers'
import {readDataTransferFromClipboard} from '#src/utils'

test('cut selected value', async () => {
  const {getEvents, user} = setup<HTMLInputElement>(
    `<input value="foo bar baz"/>`,
    {
      selection: {anchorOffset: 4, focusOffset: 7},
    },
  )

  const dt = await user.cut()

  expect(dt.getData('text')).toBe('bar')
  expect(getEvents('cut')).toHaveLength(1)
  expect(getEvents('input')).toHaveLength(1)

  await expect(window.navigator.clipboard.readText()).resolves.toBe('bar')
})

test('cut selected text outside of editable', async () => {
  const {getEvents, user} = setup(`<div tabindex="-1">foo bar baz</div>`, {
    selection: {focusNode: './/text()', anchorOffset: 1, focusOffset: 5},
  })

  const dt = await user.cut()

  expect(dt.getData('text')).toBe('oo b')
  expect(getEvents('cut')).toHaveLength(1)
  expect(getEvents('input')).toHaveLength(0)

  await expect(window.navigator.clipboard.readText()).resolves.toBe('oo b')
})

test('cut selected text in contenteditable', async () => {
  const {element, getEvents, user} = setup(
    `<div contenteditable>foo bar baz</div>`,
    {
      selection: {focusNode: './/text()', anchorOffset: 1, focusOffset: 5},
    },
  )

  const dt = await user.cut()

  expect(dt.getData('text')).toBe('oo b')
  expect(getEvents('cut')).toHaveLength(1)
  expect(getEvents('input')).toHaveLength(1)
  expect(element).toHaveTextContent('far baz')

  await expect(window.navigator.clipboard.readText()).resolves.toBe('oo b')
})

test('cut on empty selection does not change clipboard', async () => {
  const {getEvents, user} = setup(`<input/>`)
  await window.navigator.clipboard.writeText('foo')

  await user.cut()

  await expect(window.navigator.clipboard.readText()).resolves.toBe('foo')
  expect(getEvents('cut')).toHaveLength(1)
})

test('prevent default behavior per event handler', async () => {
  const {element, eventWasFired, getEvents, user} = setup(
    `<input value="bar"/>`,
    {
      selection: {anchorOffset: 0, focusOffset: 3},
    },
  )
  element.addEventListener('cut', e => e.preventDefault())
  await window.navigator.clipboard.writeText('foo')

  await user.cut()
  expect(eventWasFired('cut')).toBe(true)
  expect(getEvents('cut')[0].clipboardData?.getData('text')).toBe('')
  expect(eventWasFired('input')).toBe(false)
  await expect(window.navigator.clipboard.readText()).resolves.toBe('foo')
})

test('cuts all items added in event handler', async () => {
  const {element, user} = setup(`<div tabindex="-1" />`, {})

  element.addEventListener('cut', e => {
    e.clipboardData?.setData('text/plain', 'a = 42')
    e.clipboardData?.setData('application/json', '{"a": 42}')
    e.preventDefault()
  })

  await user.cut()

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
      userEvent.cut({writeToClipboard: true}),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `The Clipboard API is unavailable.`,
    )
  })

  test('skip using missing API', async () => {
    render<HTMLInputElement>(`<input value="foo bar baz"/>`, {
      selection: {anchorOffset: 4, focusOffset: 7},
    })

    const dt = await userEvent.cut()
    expect(dt.getData('text/plain')).toBe('bar')
  })
})
