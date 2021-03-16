import {isContentEditable} from './isContentEditable'

export function getSelectionRange(
  element: Element,
): {
  selectionStart: number | null
  selectionEnd: number | null
} {
  if (isContentEditable(element)) {
    const selection = element.ownerDocument.getSelection()
    const range = selection?.getRangeAt(0)

    // istanbul ignore else
    if (range) {
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
