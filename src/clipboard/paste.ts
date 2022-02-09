import {Config, Instance} from '../setup'
import {
  createDataTransfer,
  isEditable,
  readDataTransferFromClipboard,
  input,
} from '../utils'

export async function paste(
  this: Instance,
  clipboardData?: DataTransfer | string,
) {
  const doc = this[Config].document
  const target = doc.activeElement ?? /* istanbul ignore next */ doc.body

  const dataTransfer: DataTransfer =
    (typeof clipboardData === 'string'
      ? getClipboardDataFromString(clipboardData)
      : clipboardData) ??
    (await readDataTransferFromClipboard(doc).catch(() => {
      throw new Error(
        '`userEvent.paste()` without `clipboardData` requires the `ClipboardAPI` to be available.',
      )
    }))

  this.dispatchUIEvent(target, 'paste', {
    clipboardData: dataTransfer,
  })

  if (isEditable(target)) {
    input(this[Config], target, dataTransfer.getData('text'), 'insertFromPaste')
  }
}

function getClipboardDataFromString(text: string) {
  const dt = createDataTransfer()
  dt.setData('text', text)
  return dt
}
