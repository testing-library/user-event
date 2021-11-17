import {createDataTransfer, getBlobFromDataTransferItem} from '#src/utils'

describe('create DataTransfer', () => {
  test('plain string', () => {
    const dt = createDataTransfer()
    dt.setData('text/plain', 'foo')

    expect(dt.getData('text/plain')).toBe('foo')

    const callback = jest.fn()
    dt.items[0].getAsString(callback)
    expect(callback).toBeCalledWith('foo')
  })

  test('multi format', () => {
    const dt = createDataTransfer()
    dt.setData('text/plain', 'foo')
    dt.setData('text/html', 'bar')

    expect(dt.types).toEqual(['text/plain', 'text/html'])

    expect(dt.getData('text/plain')).toBe('foo')
    expect(dt.getData('text/html')).toBe('bar')
    expect(dt.getData('text/*')).toBe('foo')
    expect(dt.getData('text')).toBe('foo')

    dt.clearData()
    dt.setData('text', 'baz')
    expect(dt.getData('text/plain')).toBe('baz')
    expect(dt.getData('text')).toBe('baz')
  })

  test('overwrite item', () => {
    const dt = createDataTransfer()
    dt.setData('text/plain', 'foo')
    dt.setData('text/plain', 'bar')

    expect(dt.types).toEqual(['text/plain'])
    expect(dt.getData('text')).toBe('bar')
  })

  test('files operation', () => {
    const f0 = new File(['bar'], 'bar0.txt', {type: 'text/plain'})
    const f1 = new File(['bar'], 'bar1.txt', {type: 'text/plain'})
    const dt = createDataTransfer([f0, f1])
    dt.setData('text/html', 'foo')

    expect(dt.types).toEqual(['Files', 'text/html'])
    expect(dt.files.length).toBe(2)
  })

  test('files item', () => {
    const f0 = new File(['bar'], 'bar0.txt', {type: 'text/plain'})
    const dt = createDataTransfer()
    dt.setData('text/html', 'foo')
    dt.items.add(f0)

    expect(dt.types).toEqual(['text/html', 'text/plain'])

    expect(dt.items[0].getAsFile()).toBe(null)
    expect(dt.items[1].getAsFile()).toBe(f0)

    const callback = jest.fn()
    dt.items[1].getAsString(callback)
    expect(callback).not.toBeCalled()
  })

  test('clear data', () => {
    const f0 = new File(['bar'], 'bar0.txt', {type: 'text/plain'})
    const dt = createDataTransfer()
    dt.setData('text/html', 'foo')
    dt.items.add(f0)

    dt.clearData('text/plain')

    expect(dt.types).toEqual(['text/html'])

    dt.clearData('text/plain')

    expect(dt.types).toEqual(['text/html'])

    dt.clearData()

    expect(dt.types).toEqual([])
  })
})

test('get Blob from DataTransfer', () => {
  const dt = createDataTransfer()
  dt.items.add('foo', 'text/plain')
  dt.items.add(new File(['bar'], 'bar.txt', {type: 'text/plain'}))

  expect(getBlobFromDataTransferItem(dt.items[0])).toHaveProperty(
    'type',
    'text/plain',
  )
  expect(getBlobFromDataTransferItem(dt.items[0])).not.toBeInstanceOf(File)
  expect(getBlobFromDataTransferItem(dt.items[1])).toHaveProperty(
    'type',
    'text/plain',
  )
  expect(getBlobFromDataTransferItem(dt.items[1])).toBeInstanceOf(File)
})
