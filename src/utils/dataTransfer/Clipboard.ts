// Clipboard is not available in jsdom

import {getWindow} from '../misc/getWindow'
import {readBlobText} from './Blob'
import {createDataTransfer, getBlobFromDataTransferItem} from './DataTransfer'

// Clipboard API is only fully available in secure context or for browser extensions.

type ItemData = Record<string, Blob | string | Promise<Blob | string>>

// MDN lists string|Blob|Promise<Blob|string> as possible types in ClipboardItemData
// lib.dom.d.ts lists only Promise<Blob|string>
// https://developer.mozilla.org/en-US/docs/Web/API/ClipboardItem/ClipboardItem#syntax
export function createClipboardItem(
  window: Window & typeof globalThis,
  ...blobs: Array<Blob | string>
) {
  const dataMap = Object.fromEntries(
    blobs.map(b => [
      typeof b === 'string' ? 'text/plain' : b.type,
      Promise.resolve(b),
    ]),
  )

  // use real ClipboardItem if available
  /* istanbul ignore if */
  if (typeof window.ClipboardItem !== 'undefined') {
    return new window.ClipboardItem(dataMap)
  }

  return new (class ClipboardItem implements ClipboardItem {
    private data: ItemData
    constructor(d: ItemData) {
      this.data = d
    }

    get types() {
      return Array.from(Object.keys(this.data))
    }

    async getType(type: string) {
      const value = await this.data[type]

      if (!value) {
        throw new Error(
          `${type} is not one of the available MIME types on this item.`,
        )
      }

      return value instanceof window.Blob
        ? value
        : new window.Blob([value], {type})
    }
  })(dataMap)
}

const ClipboardStubControl = Symbol('Manage ClipboardSub')
type ClipboardStubControlInstance = {
  resetClipboardStub: () => void
  detachClipboardStub: () => void
}

function createClipboardStub(
  window: Window & typeof globalThis,
  control: ClipboardStubControlInstance,
) {
  return Object.assign(
    new (class Clipboard extends window.EventTarget {
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
              .then(b => readBlobText(b, window.FileReader))
          }
        }
        return text
      }

      async write(data: ClipboardItem[]) {
        this.items = data
      }

      async writeText(text: string) {
        this.items = [createClipboardItem(window, text)]
      }
    })(),
    {
      [ClipboardStubControl]: control,
    },
  )
}
type ClipboardStub = ReturnType<typeof createClipboardStub>

function isClipboardStub(
  clipboard: Clipboard | ClipboardStub | undefined,
): clipboard is ClipboardStub {
  return !!(clipboard as {[ClipboardStubControl]?: object} | undefined)?.[
    ClipboardStubControl
  ]
}

export function attachClipboardStubToView(window: Window & typeof globalThis) {
  if (isClipboardStub(window.navigator.clipboard)) {
    return window.navigator.clipboard[ClipboardStubControl]
  }

  const realClipboard = Object.getOwnPropertyDescriptor(
    window.navigator,
    'clipboard',
  )

  let stub: ClipboardStub
  const control: ClipboardStubControlInstance = {
    resetClipboardStub: () => {
      stub = createClipboardStub(window, control)
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
  stub = createClipboardStub(window, control)

  Object.defineProperty(window.navigator, 'clipboard', {
    get: () => stub,
    configurable: true,
  })

  return stub[ClipboardStubControl]
}

export function resetClipboardStubOnView(window: Window & typeof globalThis) {
  if (isClipboardStub(window.navigator.clipboard)) {
    window.navigator.clipboard[ClipboardStubControl].resetClipboardStub()
  }
}

export function detachClipboardStubFromView(
  window: Window & typeof globalThis,
) {
  if (isClipboardStub(window.navigator.clipboard)) {
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
    const blob = await getBlobFromDataTransferItem(window, dtItem)
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

const g = globalThis as {
  afterEach?: (cb?: () => void) => void
  afterAll?: (cb?: () => void) => void
}
/* istanbul ignore else */
if (typeof g.afterEach === 'function') {
  g.afterEach(() => {
    if (typeof globalThis.window !== 'undefined') {
      resetClipboardStubOnView(globalThis.window)
    }
  })
}

/* istanbul ignore else */
if (typeof g.afterAll === 'function') {
  g.afterAll(() => {
    if (typeof globalThis.window !== 'undefined') {
      resetClipboardStubOnView(globalThis.window)
    }
  })
}
