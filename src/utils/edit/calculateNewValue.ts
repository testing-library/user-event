import {getSelectionRange} from './selectionRange'
import {getValue} from './getValue'
import {isValidDateValue} from './isValidDateValue'
import {isValidInputTimeValue} from './isValidInputTimeValue'

export function calculateNewValue(
  newEntry: string,
  element: HTMLElement,
  value = getValue(element),
  selectionRange = getSelectionRange(element),
): {
  newValue: string
  newSelectionStart: number
} {
  const {selectionStart, selectionEnd} = selectionRange

  let newValue: string, newSelectionStart: number

  if (selectionStart === null) {
    // at the end of an input type that does not support selection ranges
    // https://github.com/testing-library/user-event/issues/316#issuecomment-639744793
    newValue = `${value}${newEntry}`
    newSelectionStart = newValue.length
  } else if (selectionStart === selectionEnd) {
    if (selectionStart === 0) {
      // at the beginning of the input
      newValue = `${newEntry}${value}`
    } else if (selectionStart === value?.length) {
      // at the end of the input
      newValue = `${value}${newEntry}`
    } else {
      // in the middle of the input
      newValue = `${value?.slice(0, selectionStart)}${newEntry}${value?.slice(
        selectionEnd,
      )}`
    }
    newSelectionStart = selectionStart + newEntry.length
  } else {
    // we have something selected
    const firstPart = `${value?.slice(0, selectionStart)}${newEntry}`
    newValue = `${firstPart}${value?.slice(selectionEnd as number)}`
    newSelectionStart = firstPart.length
  }

  if (
    (element as HTMLInputElement).type === 'date' &&
    !isValidDateValue(element as HTMLInputElement & {type: 'date'}, newValue)
  ) {
    newValue = value as string
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
      newValue = value as string
    }
  }

  return {
    newValue,
    newSelectionStart,
  }
}
