import {copySelection} from '../document'
import {Instance} from '../setup'
import {getActiveElementOrBody, writeDataTransferToClipboard} from '../utils'

export async function copy(this: Instance) {
  const doc: Document = this.config.document
  const target = getActiveElementOrBody(doc)

  const clipboardData = copySelection(target)

  if (clipboardData.items.length === 0) {
    return
  }

  if (
    this.dispatchUIEvent(target, 'copy', {
      clipboardData,
    }) &&
    this.config.writeToClipboard
  ) {
    await writeDataTransferToClipboard(doc, clipboardData)
  }

  return clipboardData
}
