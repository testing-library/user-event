import {getSelectionRange} from 'utils'

export function hasSelection(element: Element): boolean {
  const {selectionStart, selectionEnd} = getSelectionRange(element)
  return selectionStart !== selectionEnd
}
