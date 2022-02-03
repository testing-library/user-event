import {Config, Instance} from '../setup'
import {
  copySelection,
  isEditable,
  prepareInput,
  writeDataTransferToClipboard,
} from '../utils'

export async function cut(this: Instance) {
  const doc = this[Config].document
  const target = doc.activeElement ?? /* istanbul ignore next */ doc.body

  const clipboardData = copySelection(target)

  if (clipboardData.items.length === 0) {
    return
  }

  this.dispatchUIEvent(target, 'cut', {
    clipboardData,
  })

  if (isEditable(target)) {
    prepareInput(this[Config], '', target, 'deleteByCut')?.commit()
  }

  if (this[Config].writeToClipboard) {
    await writeDataTransferToClipboard(doc, clipboardData)
  }

  return clipboardData
}
