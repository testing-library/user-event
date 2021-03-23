import {isContentEditable} from './isContentEditable'

export function getSelectionRange(
  element: Element,
): {
  selectionStart: number | null
  selectionEnd: number | null
} {
  if (isContentEditable(element)) {
    const selection = element.ownerDocument.getSelection()

    if (selection?.rangeCount) {
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

  return {
    selectionStart: (element as HTMLInputElement).selectionStart,
    selectionEnd: (element as HTMLInputElement).selectionEnd,
  }
}
