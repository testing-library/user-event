import {copySelection} from '../document'
import type {type Instance} from '../setup'
import {writeDataTransferToClipboard,  getActiveElementOrBody,} from '../utils'

export async function copy(this: Instance) {
  const doc = this.config.document
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
