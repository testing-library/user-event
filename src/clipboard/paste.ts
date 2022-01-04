import {fireEvent} from '@testing-library/dom'
import {Config, Instance} from '../setup'
import {
  createDataTransfer,
  getSpaceUntilMaxLength,
  prepareInput,
  isEditable,
  readDataTransferFromClipboard,
} from '../utils'

export async function paste(
  this: Instance,
  clipboardData?: DataTransfer | string,
) {
  const doc = this[Config].document
  const target = doc.activeElement ?? /* istanbul ignore next */ doc.body

  const data: DataTransfer =
    (typeof clipboardData === 'string'
      ? getClipboardDataFromString(clipboardData)
      : clipboardData) ??
    (await readDataTransferFromClipboard(doc).catch(() => {
      throw new Error(
        '`userEvent.paste()` without `clipboardData` requires the `ClipboardAPI` to be available.',
      )
    }))

  return pasteImpl(target, data)
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
