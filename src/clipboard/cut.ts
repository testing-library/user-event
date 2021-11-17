import {fireEvent} from '@testing-library/dom'
import type {UserEvent} from '../setup'
import {
  copySelection,
  isEditable,
  prepareInput,
  writeDataTransferToClipboard,
} from '../utils'

export interface cutOptions {
  document?: Document
  writeToClipboard?: boolean
}

export function cut(
  this: UserEvent,
  options: Omit<cutOptions, 'writeToClipboard'> & {writeToClipboard: true},
): Promise<DataTransfer>
export function cut(
  this: UserEvent,
  options?: Omit<cutOptions, 'writeToClipboard'> & {writeToClipboard?: boolean},
): DataTransfer
export function cut(this: UserEvent, options?: cutOptions) {
  const doc = options?.document ?? document
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

  return options?.writeToClipboard
    ? writeDataTransferToClipboard(doc, clipboardData).then(() => clipboardData)
    : clipboardData
}
