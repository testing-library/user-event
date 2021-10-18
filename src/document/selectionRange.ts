import {isElementType} from '../utils/misc/isElementType'
import {getUISelection, setUISelection} from './selection'

export function getSelectionRange(element: Element): {
  selectionStart: number | null
  selectionEnd: number | null
} {
  if (isElementType(element, ['input', 'textarea'])) {
    return getUISelection(element)
  }

  const selection = element.ownerDocument.getSelection()

  // there should be no editing if the focusNode is outside of element
  // TODO: properly handle selection ranges
  if (selection?.rangeCount && element.contains(selection.focusNode)) {
    const range = selection.getRangeAt(0)
    return {
      selectionStart: range.startOffset,
      selectionEnd: range.endOffset,
    }
  } else {
    return {
      selectionStart: null,
      selectionEnd: null,
    }
  }
}

export function setSelectionRange(
  element: Element,
  newSelectionStart: number,
  newSelectionEnd: number,
) {
  if (isElementType(element, ['input', 'textarea'])) {
    return setUISelection(element, newSelectionStart, newSelectionEnd)
  }

  const {selectionStart, selectionEnd} = getSelectionRange(element)

  if (
    selectionStart === newSelectionStart &&
    selectionEnd === newSelectionEnd
  ) {
    return
  }

  const range = element.ownerDocument.createRange()
  range.selectNodeContents(element)

  // istanbul ignore else
  if (element.firstChild) {
    range.setStart(element.firstChild, newSelectionStart)
    range.setEnd(element.firstChild, newSelectionEnd)
  }

  const selection = element.ownerDocument.getSelection()
  // istanbul ignore else
  if (selection) {
    selection.removeAllRanges()
    selection.addRange(range)
  }
}
