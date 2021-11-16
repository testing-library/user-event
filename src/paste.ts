import {fireEvent} from '@testing-library/dom'
import type {UserEvent} from './setup'
import {
  createDataTransfer,
  getSpaceUntilMaxLength,
  prepareInput,
  isEditable,
  readBlobText,
} from './utils'

export interface pasteOptions {
  document?: Document
}

export function paste(
  this: UserEvent,
  clipboardData?: undefined,
  options?: pasteOptions,
): Promise<void>
export function paste(
  this: UserEvent,
  clipboardData: DataTransfer | string,
  options?: pasteOptions,
): void
export function paste(
  this: UserEvent,
  clipboardData?: DataTransfer | string,
  options?: pasteOptions,
) {
  const doc = options?.document ?? document
  const target = doc.activeElement ?? /* istanbul ignore next */ doc.body

  const data: DataTransfer | undefined =
    typeof clipboardData === 'string'
      ? getClipboardDataFromString(clipboardData)
      : clipboardData

  return data
    ? pasteImpl(target, data)
    : readClipboardDataFromClipboardApi(doc).then(dt => pasteImpl(target, dt))
}

function pasteImpl(target: Element, clipboardData: DataTransfer) {
  fireEvent.paste(target, {
    clipboardData,
  })

  if (isEditable(target)) {
    const data = clipboardData
      .getData('text')
      .substr(0, getSpaceUntilMaxLength(target))

    if (data) {
      prepareInput(data, target, 'insertFromPaste')?.commit()
    }
  }
}

function getClipboardDataFromString(text: string) {
  const dt = createDataTransfer()
  dt.setData('text', text)
  return dt
}

async function readClipboardDataFromClipboardApi(document: Document) {
  const clipboard = document.defaultView?.navigator.clipboard
  const items = clipboard && (await clipboard.read())

  if (!items) {
    throw new Error(
      '`userEvent.paste() without `clipboardData` requires the `ClipboardAPI` to be available.',
    )
  }

  const dt = createDataTransfer()
  for (const item of items) {
    for (const type of item.types) {
      dt.setData(type, await item.getType(type).then(b => readBlobText(b)))
    }
  }
  return dt
}
