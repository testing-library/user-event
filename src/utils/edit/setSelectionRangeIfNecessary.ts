import {isContentEditable} from './isContentEditable'
import {getSelectionRange} from './getSelectionRange'

export function setSelectionRangeIfNecessary(
  element: Element,
  newSelectionStart: number,
  newSelectionEnd: number,
) {
  const {selectionStart, selectionEnd} = getSelectionRange(element)

  if (
    !isContentEditable(element) &&
    (!(element as {setSelectionRange?: unknown}).setSelectionRange ||
      selectionStart === null)
  ) {
    // cannot set selection
    return
  }
  if (
    selectionStart !== newSelectionStart ||
    selectionEnd !== newSelectionStart
  ) {
    if (isContentEditable(element)) {
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
    } else {
      ;(element as HTMLInputElement).setSelectionRange(
        newSelectionStart,
        newSelectionEnd,
      )
    }
  }
}
