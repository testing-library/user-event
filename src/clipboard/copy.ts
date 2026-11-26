import {copySelection} from '../document'
import {type Instance} from '../setup'
import {
  createDataTransfer,
  getWindow,
  writeDataTransferToClipboard,
} from '../utils'

export async function copy(this: Instance) {
  const doc = this.config.document
  const target = doc.activeElement ?? /* istanbul ignore next */ doc.body

  const clipboardData = createDataTransfer(getWindow(target))
  const shouldDoDefault = this.dispatchUIEvent(target, 'copy', {
    clipboardData,
  })
  if (shouldDoDefault) {
    const defaultClipboardData = copySelection(target)
    defaultClipboardData.types.forEach(type => {
      clipboardData.setData(type, defaultClipboardData.getData(type))
    })
  }

  if (clipboardData.items.length > 0 && this.config.writeToClipboard) {
    await writeDataTransferToClipboard(doc, clipboardData)
  }

  return clipboardData
}
