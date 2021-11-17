import {
  attachClipboardStubToView,
  createClipboardItem,
  detachClipboardStubFromView,
  readBlobText,
  resetClipboardStubOnView,
} from '#src/utils'

describe('read from and write to clipboard', () => {
  beforeEach(() => {
    attachClipboardStubToView(window)
  })

  test('read and write text', async () => {
    await window.navigator.clipboard.writeText('foo')
    await expect(window.navigator.clipboard.readText()).resolves.toBe('foo')
  })

  test('read and write item', async () => {
    const items = [
      createClipboardItem(new Blob(['foo'], {type: 'text/plain'})),
      createClipboardItem(new Blob(['bar'], {type: 'text/html'})),
      createClipboardItem(new Blob(['PNG'], {type: 'image/png'})),
      createClipboardItem(
        new Blob(['baz1'], {type: 'text/plain'}),
        new Blob(['baz2'], {type: 'text/html'}),
      ),
    ]
    expect(items[0]).toHaveProperty('types', ['text/plain'])
    expect(items[3]).toHaveProperty('types', ['text/plain', 'text/html'])
    await expect(items[3].getType('text/html')).resolves.toBeInstanceOf(Blob)
    await expect(
      readBlobText(await items[3].getType('text/html')),
    ).resolves.toBe('baz2')
    await expect(items[3].getType('image/png')).rejects.toThrowError()

    await window.navigator.clipboard.write(items)

    await expect(window.navigator.clipboard.read()).resolves.toEqual(items)
    await expect(window.navigator.clipboard.readText()).resolves.toBe(
      'foobarbaz1',
    )
  })

  test('reset clipboard', async () => {
    await window.navigator.clipboard.writeText('foo')
    resetClipboardStubOnView(window)
    await expect(window.navigator.clipboard.readText()).resolves.toBe('')
  })

  test('detach clipboard', () => {
    expect(window.navigator.clipboard).not.toBe(undefined)
    detachClipboardStubFromView(window)
    expect(window.navigator.clipboard).toBe(undefined)
  })
})
