import {isElementType} from 'utils/misc/isElementType'
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

  // can't use .maxLength property because of a jsdom bug:
  // https://github.com/jsdom/jsdom/issues/2927
  const maxLength = getSanitizedMaxLength(element)

  if (maxLength === undefined) {
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

function getSanitizedMaxLength(element: Element) {
  if (!supportsMaxLength(element)) {
    return undefined
  }

  const attr = element.getAttribute('maxlength') ?? ''

  return /^\d+$/.test(attr) && Number(attr) >= 0 ? Number(attr) : undefined
}

function supportsMaxLength(element: Element) {
  if (isElementType(element, 'textarea')) return true

  if (isElementType(element, 'input')) {
    const type = element.getAttribute('type')

    // Missing value default is "text"
    if (!type) return true

    // https://html.spec.whatwg.org/multipage/input.html#concept-input-apply
    if (type.match(/email|password|search|telephone|text|url/)) return true
  }

  return false
}
