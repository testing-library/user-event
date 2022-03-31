import {createFileList} from './FileList'

// DataTransfer is not implemented in jsdom.

// DataTransfer with FileList is being created by the browser on certain events.

class DataTransferItemStub implements DataTransferItem {
  readonly kind: DataTransferItem['kind']
  readonly type: DataTransferItem['type']

  private file: File | null = null
  private data: string | undefined = undefined

  constructor(data: string, type: string)
  constructor(file: File)
  constructor(dataOrFile: string | File, type?: string) {
    if (typeof dataOrFile === 'string') {
      this.kind = 'string'
      this.type = String(type)
      this.data = dataOrFile
    } else {
      this.kind = 'file'
      this.type = dataOrFile.type
      this.file = dataOrFile
    }
  }

  getAsFile() {
    return this.file
  }

  getAsString(callback: (data: string) => unknown) {
    if (typeof this.data === 'string') {
      callback(this.data)
    }
  }

  /* istanbul ignore next */
  webkitGetAsEntry(): never {
    throw new Error('not implemented')
  }
}

class DataTransferItemListStub
  extends Array<DataTransferItem>
  implements DataTransferItemList
{
  add(data: string, type: string): DataTransferItem
  add(file: File): DataTransferItem
  add(...args: never[]) {
    const item = new DataTransferItemStub(args[0], args[1])
    this.push(item)
    return item
  }

  clear() {
    this.splice(0, this.length)
  }

  remove(index: number) {
    this.splice(index, 1)
  }
}

function getTypeMatcher(type: string, exact: boolean) {
  const [group, sub] = type.split('/')
  const isGroup = !sub || sub === '*'
  return (item: DataTransferItem) => {
    return exact
      ? item.type === (isGroup ? group : type)
      : isGroup
      ? item.type.startsWith(`${group}/`)
      : item.type === group
  }
}

class DataTransferStub implements DataTransfer {
  getData(format: string) {
    const match =
      this.items.find(getTypeMatcher(format, true)) ??
      this.items.find(getTypeMatcher(format, false))

    let text = ''
    match?.getAsString(t => {
      text = t
    })

    return text
  }

  setData(format: string, data: string) {
    const matchIndex = this.items.findIndex(getTypeMatcher(format, true))

    const item = new DataTransferItemStub(data, format) as DataTransferItem
    if (matchIndex >= 0) {
      this.items.splice(matchIndex, 1, item)
    } else {
      this.items.push(item)
    }
  }

  clearData(format?: string) {
    if (format) {
      const matchIndex = this.items.findIndex(getTypeMatcher(format, true))

      if (matchIndex >= 0) {
        this.items.remove(matchIndex)
      }
    } else {
      this.items.clear()
    }
  }

  dropEffect: DataTransfer['dropEffect'] = 'none'
  effectAllowed: DataTransfer['effectAllowed'] = 'uninitialized'

  readonly items = new DataTransferItemListStub()
  readonly files = createFileList([])

  get types() {
    const t = []
    if (this.files.length) {
      t.push('Files')
    }
    this.items.forEach(i => t.push(i.type))

    Object.freeze(t)

    return t
  }

  /* istanbul ignore next */
  setDragImage() {}
}

export function createDataTransfer(
  window: Window & typeof globalThis,
  files: File[] = [],
): DataTransfer {
  // Use real DataTransfer if available
  const dt =
    typeof window.DataTransfer === 'undefined'
      ? (new DataTransferStub() as DataTransfer)
      : /* istanbul ignore next */ new window.DataTransfer()

  Object.defineProperty(dt, 'files', {get: () => createFileList(files)})

  return dt
}

export function getBlobFromDataTransferItem(
  window: Window & typeof globalThis,
  item: DataTransferItem,
) {
  if (item.kind === 'file') {
    return item.getAsFile() as File
  }
  let data: string = ''
  item.getAsString(s => {
    data = s
  })
  return new window.Blob([data], {type: item.type})
}
