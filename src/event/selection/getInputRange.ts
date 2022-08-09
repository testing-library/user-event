import {UISelectionRange} from '../../document'
import {getTargetTypeAndSelection} from './getTargetTypeAndSelection'

/**
 * Get the range that would be overwritten by input.
 */
export function getInputRange(
  focusNode: Node,
): UISelectionRange | Range | undefined {
  const typeAndSelection = getTargetTypeAndSelection(focusNode)

  if (typeAndSelection.type === 'input') {
    return typeAndSelection.selection
  } else if (typeAndSelection.type === 'contenteditable') {
    // Multi-range on contenteditable edits the first selection instead of the last
    return typeAndSelection.selection?.getRangeAt(0)
  }
}
