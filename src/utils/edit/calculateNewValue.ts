import {getSelectionRange} from './selectionRange'
import {getValue} from './getValue'
import {isValidDateValue} from './isValidDateValue'
import {isValidInputTimeValue} from './isValidInputTimeValue'

export function calculateNewValue(
  newEntry: string,
  element: HTMLElement,
  value = getValue(element) ?? /* istanbul ignore next */ '',
  selectionRange = getSelectionRange(element),
  deleteContent?: 'backward' | 'forward',
): {
  newValue: string
  newSelectionStart: number
} {
  const selectionStart =
    selectionRange.selectionStart === null
      ? value.length
      : selectionRange.selectionStart
  const selectionEnd =
    selectionRange.selectionEnd === null
      ? value.length
      : selectionRange.selectionEnd

  const prologEnd = Math.max(
    0,
    selectionStart === selectionEnd && deleteContent === 'backward'
      ? selectionStart - 1
      : selectionStart,
  )
  const prolog = value.substring(0, prologEnd)
  const epilogStart = Math.min(
    value.length,
    selectionStart === selectionEnd && deleteContent === 'forward'
      ? selectionEnd + 1
      : selectionEnd,
  )
  const epilog = value.substring(epilogStart, value.length)

  let newValue = `${prolog}${newEntry}${epilog}`
  const newSelectionStart = prologEnd + newEntry.length

  if (
    (element as HTMLInputElement).type === 'date' &&
    !isValidDateValue(element as HTMLInputElement & {type: 'date'}, newValue)
  ) {
    newValue = value
  }

  if (
    (element as HTMLInputElement).type === 'time' &&
    !isValidInputTimeValue(
      element as HTMLInputElement & {type: 'time'},
      newValue,
    )
  ) {
    if (
      isValidInputTimeValue(
        element as HTMLInputElement & {type: 'time'},
        newEntry,
      )
    ) {
      newValue = newEntry
    } else {
      newValue = value
    }
  }

  return {
    newValue,
    newSelectionStart,
  }
}
