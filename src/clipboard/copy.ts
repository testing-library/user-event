import {fireEvent} from '@testing-library/dom'
import type {UserEvent} from '../setup'
import {copySelection, writeDataTransferToClipboard} from '../utils'

export interface copyOptions {
  document?: Document
  writeToClipboard?: boolean
}

export function copy(
  this: UserEvent,
  options: Omit<copyOptions, 'writeToClipboard'> & {writeToClipboard: true},
): Promise<DataTransfer>
export function copy(
  this: UserEvent,
  options?: Omit<copyOptions, 'writeToClipboard'> & {
    writeToClipboard?: boolean
  },
): DataTransfer
export function copy(this: UserEvent, options?: copyOptions) {
  const doc = options?.document ?? document
  const target = doc.activeElement ?? /* istanbul ignore next */ doc.body

  const clipboardData = copySelection(target)

  if (clipboardData.items.length === 0) {
    return
  }

  fireEvent.copy(target, {
    clipboardData,
  })

  return options?.writeToClipboard
    ? writeDataTransferToClipboard(doc, clipboardData).then(() => clipboardData)
    : clipboardData
}
