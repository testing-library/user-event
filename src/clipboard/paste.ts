import {type Instance} from '../setup'
import {
  createDataTransfer,
  getActiveElementOrBody,
  getWindow,
  readDataTransferFromClipboard,
} from '../utils'

export async function paste(
  this: Instance,
  clipboardData?: DataTransfer | string,
) {
  const doc: Document = this.config.document
  const target = getActiveElementOrBody(doc)
  const dataTransfer: DataTransfer =
    (typeof clipboardData === 'string'
      ? getClipboardDataFromString(doc, clipboardData)
      : clipboardData) ??
    (await readDataTransferFromClipboard(doc).catch(() => {
      throw new Error(
        '`userEvent.paste()` without `clipboardData` requires the `ClipboardAPI` to be available.',
      )
    }))

  this.dispatchUIEvent(target, 'paste', {
    clipboardData: dataTransfer,
  })
}

function getClipboardDataFromString(doc: Document, text: string) {
  const dt = createDataTransfer(getWindow(doc))
  dt.setData('text', text)
  return dt
}
