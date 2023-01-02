import { waitFor } from '@testing-library/dom'
import {createDataTransfer, getBlobFromDataTransferItem} from '#src/utils'

describe('create DataTransfer', () => {
  test('plain string', async () => {
    const dt = createDataTransfer(window)
    dt.setData('text/plain', 'foo')

    expect(dt.getData('text/plain')).toBe('foo')

    const callback = mocks.fn()
    dt.items[0].getAsString(callback)
    await waitFor(() => expect(callback).toBeCalledWith('foo'))
  })

  test('multi format', async () => {
    const dt = createDataTransfer(window)
    dt.setData('text/plain', 'foo')
    dt.setData('text/html', 'bar')

    expect(dt.types).toEqual(['text/plain', 'text/html'])

    expect(dt.getData('text/plain')).toBe('foo')
    expect(dt.getData('text/html')).toBe('bar')
    expect(dt.getData('text')).toBe('foo')

    dt.clearData()
    dt.setData('text', 'baz')
    expect(dt.getData('text/plain')).toBe('baz')
    expect(dt.getData('text')).toBe('baz')
  })

  test('overwrite item', async () => {
    const dt = createDataTransfer(window)
    dt.setData('text/plain', 'foo')
    dt.setData('text/plain', 'bar')

    expect(dt.types).toEqual(['text/plain'])
    expect(dt.getData('text')).toBe('bar')
  })

  test('files operation', async () => {
    const f0 = new File(['bar'], 'bar0.txt', {type: 'text/plain'})
    const f1 = new File(['bar'], 'bar1.txt', {type: 'text/plain'})
    const dt = createDataTransfer(window, [f0, f1])
    dt.setData('text/html', 'foo')

    expect(dt.types).toEqual(expect.arrayContaining(
        // TODO: Fix DataTransferStub
        typeof window.DataTransfer === 'undefined'
        ? ['Files', 'text/html']
        : ['text/html']
    ))
    expect(dt.files.length).toBe(2)
  })

  test('files item', async () => {
    const f0 = new File(['bar'], 'bar0.txt', {type: 'text/plain'})
    const dt = createDataTransfer(window)
    dt.setData('text/html', 'foo')
    dt.items.add(f0)

    expect(dt.types).toEqual(
      expect.arrayContaining(
        // TODO: Fix DataTransferStub
        typeof window.DataTransfer === 'undefined'
          ? ['text/html', 'text/plain']
          : ['text/html', 'Files'],
      ),
    )

    expect(dt.items[0].getAsFile()).toBe(null)
    expect(dt.items[1].getAsFile()).toBe(f0)

    const callback = mocks.fn()
    dt.items[1].getAsString(callback)
    expect(callback).not.toBeCalled()
  })

  test('clear data', async () => {
    const f0 = new File(['bar'], 'bar0.txt', {type: 'text/plain'})
    const dt = createDataTransfer(window)
    dt.setData('text/html', 'foo')
    dt.items.add(f0)

    dt.clearData('text/plain')

    expect(dt.types).toEqual(
      expect.arrayContaining(
        // TODO: Fix DataTransferStub
        typeof window.DataTransfer === 'undefined'
          ? ['text/html']
          : ['text/html', 'Files'],
      ),
    )

    dt.clearData('text/html')

    expect(dt.types).toEqual(
      // TODO: Fix DataTransferStub
      typeof window.DataTransfer === 'undefined' ? [] : ['Files'],
    )
  })
})

test('get Blob from DataTransfer', async () => {
  const dt = createDataTransfer(window)
  dt.items.add('foo', 'text/plain')
  dt.items.add(new File(['bar'], 'bar.txt', {type: 'text/plain'}))

  expect(getBlobFromDataTransferItem(window, dt.items[0])).toHaveProperty(
    'type',
    'text/plain',
  )
  expect(getBlobFromDataTransferItem(window, dt.items[0])).not.toBeInstanceOf(
    File,
  )
  expect(getBlobFromDataTransferItem(window, dt.items[1])).toHaveProperty(
    'type',
    'text/plain',
  )
  expect(getBlobFromDataTransferItem(window, dt.items[1])).toBeInstanceOf(File)
})
