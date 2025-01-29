import {getUISelection} from '../../document'
import {getNextCursorPosition, hasOwnSelection} from '../../utils'
import {setSelection} from './setSelection'

/**
 * Move the selection
 */
export function moveSelection(node: Element, direction: -1 | 1) {
  // TODO: implement shift

  if (hasOwnSelection(node)) {
    const selection = getUISelection(node)

    setSelection({
      focusNode: node,
      focusOffset:
        selection.startOffset === selection.endOffset
          ? selection.focusOffset + direction
          : direction < 0
            ? selection.startOffset
            : selection.endOffset,
    })
  } else {
    const selection = node.ownerDocument.getSelection()

    if (!selection?.focusNode) {
      return
    }

    if (selection.isCollapsed) {
      const nextPosition = getNextCursorPosition(
        selection.focusNode,
        selection.focusOffset,
        direction,
      )
      if (nextPosition) {
        setSelection({
          focusNode: nextPosition.node,
          focusOffset: nextPosition.offset,
        })
      }
    } else {
      selection[direction < 0 ? 'collapseToStart' : 'collapseToEnd']()
    }
  }
}
