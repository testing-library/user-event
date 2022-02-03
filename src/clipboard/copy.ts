import {Config, Instance} from '../setup'
import {copySelection, writeDataTransferToClipboard} from '../utils'

export async function copy(this: Instance) {
  const doc = this[Config].document
  const target = doc.activeElement ?? /* istanbul ignore next */ doc.body

  const clipboardData = copySelection(target)

  if (clipboardData.items.length === 0) {
    return
  }

  this.dispatchUIEvent(target, 'copy', {
    clipboardData,
  })

  if (this[Config].writeToClipboard) {
    await writeDataTransferToClipboard(doc, clipboardData)
  }

  return clipboardData
}
