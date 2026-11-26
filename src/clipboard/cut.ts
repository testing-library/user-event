import {copySelection} from '../document'
import {type Instance} from '../setup'
import {
  createDataTransfer,
  getWindow,
  writeDataTransferToClipboard,
} from '../utils'

export async function cut(this: Instance) {
  const doc = this.config.document
  const target = doc.activeElement ?? /* istanbul ignore next */ doc.body

  const defaultClipboardData = copySelection(target)

  const clipboardData = createDataTransfer(getWindow(target))
  const shouldDoDefault = this.dispatchUIEvent(target, 'cut', {
    clipboardData,
  })
  if (shouldDoDefault) {
    defaultClipboardData.types.forEach(type => {
      clipboardData.setData(type, defaultClipboardData.getData(type))
    })
  }

  if (clipboardData.items.length > 0 && this.config.writeToClipboard) {
    await writeDataTransferToClipboard(target.ownerDocument, clipboardData)
  }

  return clipboardData
}
