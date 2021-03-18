import {getSelectionRange} from './getSelectionRange'
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

  // can't use .maxLength property because of a jsdom bug:
  // https://github.com/jsdom/jsdom/issues/2927
  //
  // '' is a valid value in DOM with the same meaning as -1, not 0 => use ||
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const maxLength = Number(element.getAttribute('maxlength') || -1)

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

  if (!supportsMaxLength(element) || maxLength < 0) {
    return {
      newValue,
      newSelectionStart,
    }
  } else {
    return {
      newValue: newValue.slice(0, maxLength),
      newSelectionStart:
        newSelectionStart > maxLength ? maxLength : newSelectionStart,
    }
  }
}

function supportsMaxLength(element: Element) {
  if (element.tagName === 'TEXTAREA') return true

  if (element.tagName === 'INPUT') {
    const type = element.getAttribute('type')

    // Missing value default is "text"
    if (!type) return true

    // https://html.spec.whatwg.org/multipage/input.html#concept-input-apply
    if (type.match(/email|password|search|telephone|text|url/)) return true
  }

  return false
}
