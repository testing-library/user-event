import {Config, Instance} from '../setup'
import {copySelection, writeDataTransferToClipboard} from '../utils'

export async function cut(this: Instance) {
  const doc = this[Config].document
  const target = doc.activeElement ?? /* istanbul ignore next */ doc.body

  const clipboardData = copySelection(target)

  if (clipboardData.items.length === 0) {
    return
  }

  if (
    this.dispatchUIEvent(target, 'cut', {
      clipboardData,
    }) &&
    this[Config].writeToClipboard
  ) {
    await writeDataTransferToClipboard(target.ownerDocument, clipboardData)
  }

  return clipboardData
}
