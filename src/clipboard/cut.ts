import {fireEvent} from '@testing-library/dom'
import {Config, UserEvent} from '../setup'
import {
  copySelection,
  isEditable,
  prepareInput,
  writeDataTransferToClipboard,
} from '../utils'

export async function cut(this: UserEvent) {
  const doc = this[Config].document
  const target = doc.activeElement ?? /* istanbul ignore next */ doc.body

  const clipboardData = copySelection(target)

  if (clipboardData.items.length === 0) {
    return
  }

  fireEvent.cut(target, {
    clipboardData,
  })

  if (isEditable(target)) {
    prepareInput('', target, 'deleteByCut')?.commit()
  }

  if (this[Config].writeToClipboard) {
    await writeDataTransferToClipboard(doc, clipboardData)
  }

  return clipboardData
}
