import {setUISelection} from '../../document'
import {getTargetTypeAndSelection} from './getTargetTypeAndSelection'

/**
 * Extend/shrink the selection like with Shift+Arrows or Shift+Mouse
 */
export function modifySelection({
  focusNode,
  focusOffset,
}: {
  focusNode: Node
  /** DOM Offset */
  focusOffset: number
}) {
  const typeAndSelection = getTargetTypeAndSelection(focusNode)

  if (typeAndSelection.type === 'input') {
    return setUISelection(
      focusNode as HTMLInputElement,
      {
        anchorOffset: typeAndSelection.selection.anchorOffset,
        focusOffset,
      },
      'modify',
    )
  }

  focusNode.ownerDocument?.getSelection()?.extend(focusNode, focusOffset)
}
