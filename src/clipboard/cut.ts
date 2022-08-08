import {copySelection} from '../document'
import type {Instance} from '../setup'
import {writeDataTransferToClipboard} from '../utils'

export async function cut(this: Instance) {
  const doc = this.config.document
  const target = doc.activeElement ?? /* istanbul ignore next */ doc.body

  const clipboardData = copySelection(target)

  if (clipboardData.items.length === 0) {
    return
  }

  if (
    this.dispatchUIEvent(target, 'cut', {
      clipboardData,
    }) &&
    this.config.writeToClipboard
  ) {
    await writeDataTransferToClipboard(target.ownerDocument, clipboardData)
  }

  return clipboardData
}
