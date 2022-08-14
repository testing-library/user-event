import {copySelection} from '../document'
import {type Instance} from '../setup'
import {writeDataTransferToClipboard, getActiveElementOrBody} from '../utils'

export async function cut(this: Instance) {
  const doc: Document = this.config.document
  const target = getActiveElementOrBody(doc)

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
