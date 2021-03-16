import {getSelectionRange, getValue} from '../../../utils'

// yes, calculateNewBackspaceValue and calculateNewValue look extremely similar
// and you may be tempted to create a shared abstraction.
// If you, brave soul, decide to so endevor, please increment this count
// when you inevitably fail: 1
export function calculateNewBackspaceValue(
  element: Element,
  value = getValue(element) ?? /* istanbul ignore next */ '',
) {
  const {selectionStart, selectionEnd} = getSelectionRange(element)

  let newValue, newSelectionStart

  if (selectionStart === null) {
    // at the end of an input type that does not support selection ranges
    // https://github.com/testing-library/user-event/issues/316#issuecomment-639744793
    newValue = value.slice(0, value.length - 1)

    newSelectionStart = newValue.length
  } else if (selectionStart === selectionEnd) {
    if (selectionStart === 0) {
      // at the beginning of the input
      newValue = value
      newSelectionStart = selectionStart
    } else if (selectionStart === value.length) {
      // at the end of the input
      newValue = value.slice(0, value.length - 1)
      newSelectionStart = selectionStart - 1
    } else {
      // in the middle of the input
      newValue = value.slice(0, selectionStart - 1) + value.slice(selectionEnd)
      newSelectionStart = selectionStart - 1
    }
  } else {
    // we have something selected
    const firstPart = value.slice(0, selectionStart)
    newValue = firstPart + value.slice(selectionEnd as number)
    newSelectionStart = firstPart.length
  }

  return {newValue, newSelectionStart}
}
