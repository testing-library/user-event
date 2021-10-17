import {getSelectionRange} from '../../document/selectionRange'
import {getValue} from './getValue'

export function isCursorAtEnd(element: Element) {
  const {selectionStart, selectionEnd} = getSelectionRange(element)

  return (
    selectionStart === selectionEnd &&
    (selectionStart ?? /* istanbul ignore next */ 0) ===
      (getValue(element) ?? /* istanbul ignore next */ '').length
  )
}

export function isCursorAtStart(element: Element) {
  const {selectionStart, selectionEnd} = getSelectionRange(element)

  return (
    selectionStart === selectionEnd &&
    (selectionStart ?? /* istanbul ignore next */ 0) === 0
  )
}
