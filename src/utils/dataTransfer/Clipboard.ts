// Clipboard is not available in jsdom

import {createDataTransfer, getBlobFromDataTransferItem, readBlobText} from '..'
import {getWindow} from '../misc/getWindow'

// Clipboard API is only fully available in secure context or for browser extensions.

const Window = Symbol('Window reference')

type ItemData = Record<string, Blob | string | Promise<Blob | string>>

class ClipboardItemStub implements ClipboardItem {
  private data: ItemData
  constructor(data: ItemData) {
    this.data = data
  }

  get types() {
    return Array.from(Object.keys(this.data))
  }

  async getType(type: string) {
    const data = await this.data[type]

    if (!data) {
      throw new Error(
        `${type} is not one of the available MIME types on this item.`,
      )
    }

    return data instanceof this[Window].Blob
      ? data
      : new this[Window].Blob([data], {type})
  }

  [Window] = window
}

const ClipboardStubControl = Symbol('Manage ClipboardSub')

class ClipboardStub extends window.EventTarget implements Clipboard {
  private items: ClipboardItem[] = []

  async read() {
    return Array.from(this.items)
  }

  async readText() {
    let text = ''
    for (const item of this.items) {
      const type = item.types.includes('text/plain')
        ? 'text/plain'
        : item.types.find(t => t.startsWith('text/'))
      if (type) {
        text += await item
          .getType(type)
          .then(b => readBlobText(b, this[Window].FileReader))
      }
    }
    return text
  }

  async write(data: ClipboardItem[]) {
    this.items = data
  }

  async writeText(text: string) {
    this.items = [createClipboardItem(this[Window], text)]
  }

  [Window] = window;
  [ClipboardStubControl]: {
    resetClipboardStub: () => void
    detachClipboardStub: () => void
  }
}

// MDN lists string|Blob|Promise<Blob|string> as possible types in ClipboardItemData
// lib.dom.d.ts lists only Promise<Blob|string>
// https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem/ClipboardItem#syntax
export function createClipboardItem(
  window: Window & typeof globalThis,
  ...blobs: Array<Blob | string>
): ClipboardItem {
  const data = Object.fromEntries(
    blobs.map(b => [
      typeof b === 'string' ? 'text/plain' : b.type,
      Promise.resolve(b),
    ]),
  )

  // use real ClipboardItem if available
  /* istanbul ignore else */
  if (typeof window.ClipboardItem === 'undefined') {
    const item = new ClipboardItemStub(data)
    item[Window] = window
    return item
  } else {
    return new window.ClipboardItem(data)
  }
}

export function attachClipboardStubToView(window: Window & typeof globalThis) {
  if (window.navigator.clipboard instanceof ClipboardStub) {
    return window.navigator.clipboard[ClipboardStubControl]
  }

  const realClipboard = Object.getOwnPropertyDescriptor(
    window.navigator,
    'clipboard',
  )

  let stub = new ClipboardStub()
  stub[Window] = window
  const control = {
    resetClipboardStub: () => {
      stub = new ClipboardStub()
      stub[Window] = window
      stub[ClipboardStubControl] = control
    },
    detachClipboardStub: () => {
      /* istanbul ignore if */
      if (realClipboard) {
        Object.defineProperty(window.navigator, 'clipboard', realClipboard)
      } else {
        Object.defineProperty(window.navigator, 'clipboard', {
          value: undefined,
          configurable: true,
        })
      }
    },
  }
  stub[ClipboardStubControl] = control

  Object.defineProperty(window.navigator, 'clipboard', {
    get: () => stub,
    configurable: true,
  })

  return stub[ClipboardStubControl]
}

export function resetClipboardStubOnView(window: Window & typeof globalThis) {
  if (window.navigator.clipboard instanceof ClipboardStub) {
    window.navigator.clipboard[ClipboardStubControl].resetClipboardStub()
  }
}

export function detachClipboardStubFromView(
  window: Window & typeof globalThis,
) {
  if (window.navigator.clipboard instanceof ClipboardStub) {
    window.navigator.clipboard[ClipboardStubControl].detachClipboardStub()
  }
}

export async function readDataTransferFromClipboard(document: Document) {
  const window = document.defaultView
  const clipboard = window?.navigator.clipboard
  const items = clipboard && (await clipboard.read())

  if (!items) {
    throw new Error('The Clipboard API is unavailable.')
  }

  const dt = createDataTransfer(window)
  for (const item of items) {
    for (const type of item.types) {
      dt.setData(
        type,
        await item.getType(type).then(b => readBlobText(b, window.FileReader)),
      )
    }
  }
  return dt
}

export async function writeDataTransferToClipboard(
  document: Document,
  clipboardData: DataTransfer,
) {
  const window = getWindow(document)
  const clipboard = window.navigator.clipboard as Clipboard | undefined

  const items = []
  for (let i = 0; i < clipboardData.items.length; i++) {
    const dtItem = clipboardData.items[i]
    const blob = getBlobFromDataTransferItem(window, dtItem)
    items.push(createClipboardItem(window, blob))
  }

  const written =
    clipboard &&
    (await clipboard.write(items).then(
      () => true,
      // Can happen with other implementations that e.g. require permissions
      /* istanbul ignore next */
      () => false,
    ))

  if (!written) {
    throw new Error('The Clipboard API is unavailable.')
  }
}

/* istanbul ignore else */
if (typeof afterEach === 'function') {
  afterEach(() => resetClipboardStubOnView(window))
}

/* istanbul ignore else */
if (typeof afterAll === 'function') {
  afterAll(() => detachClipboardStubFromView(window))
}
