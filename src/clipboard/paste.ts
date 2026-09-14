import {type Instance} from '../setup'
import {
  createDataTransfer,
  getWindow,
  readDataTransferFromClipboard,
} from '../utils'

export async function paste(
  this: Instance,
  clipboardData?: DataTransfer | string,
) {
  const doc = this.config.document
  const target = doc.activeElement ?? /* istanbul ignore next */ doc.body

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
