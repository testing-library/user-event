import {setUISelection} from '../../document'
import {getTargetTypeAndSelection} from './getTargetTypeAndSelection'

/**
 * Set the selection
 */
export function setSelection({
  focusNode,
  focusOffset,
  anchorNode = focusNode,
  anchorOffset = focusOffset,
}: {
  anchorNode?: Node
  /** DOM offset */
  anchorOffset?: number
  focusNode: Node
  focusOffset: number
}) {
  const typeAndSelection = getTargetTypeAndSelection(focusNode)

  if (typeAndSelection.type === 'input') {
    return setUISelection(focusNode as HTMLInputElement, {
      anchorOffset,
      focusOffset,
    })
  }

  anchorNode.ownerDocument
    ?.getSelection()
    ?.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset)
}
