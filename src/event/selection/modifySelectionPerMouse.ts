import {setUISelection} from '../../document'
import type {SelectionRange} from '.'
import {resolveCaretPosition} from './resolveCaretPosition'

export function modifySelectionPerMouseMove(
  selectionRange: Range | SelectionRange,
  {
    document,
    target,
    node,
    offset,
  }: {
    document: Document
    target: Element
    node?: Node
    offset?: number
  },
) {
  const selectionFocus = resolveCaretPosition({target, node, offset})

  if ('node' in selectionRange) {
    // When the mouse is dragged outside of an input/textarea,
    // the selection is extended to the beginning or end of the input
    // depending on pointer position.
    // TODO: extend selection according to pointer position
    /* istanbul ignore else */
    if (selectionFocus.node === selectionRange.node) {
      const anchorOffset =
        selectionFocus.offset < selectionRange.start
          ? selectionRange.end
          : selectionRange.start
      const focusOffset =
        selectionFocus.offset > selectionRange.end ||
        selectionFocus.offset < selectionRange.start
          ? selectionFocus.offset
          : selectionRange.end

      setUISelection(selectionRange.node, {anchorOffset, focusOffset})
    }
  } else {
    const range = selectionRange.cloneRange()

    const cmp = range.comparePoint(selectionFocus.node, selectionFocus.offset)
    if (cmp < 0) {
      range.setStart(selectionFocus.node, selectionFocus.offset)
    } else if (cmp > 0) {
      range.setEnd(selectionFocus.node, selectionFocus.offset)
    }

    const selection = document.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range.cloneRange())
  }
}
