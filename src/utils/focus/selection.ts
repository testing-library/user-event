import {isElementType} from '../misc/isElementType'
import {getUISelection, setUISelection, UISelectionRange} from '../../document'
import {editableInputTypes} from '../edit/isEditable'
import {isContentEditable, isInContentEditable} from '../edit/isContentEditable'

/**
 * Backward-compatible selection.
 *
 * Handles input elements and contenteditable if it only contains a single text node.
 */
export function setSelectionRange(
  element: Element,
  anchorOffset: number,
  focusOffset: number,
) {
  if (hasOwnSelection(element)) {
    return setSelection({
      focusNode: element,
      anchorOffset,
      focusOffset,
    })
  } else if (isContentEditable(element) && element.firstChild?.nodeType === 3) {
    return setSelection({
      focusNode: element.firstChild,
      anchorOffset,
      focusOffset,
    })
  }
  /* istanbul ignore next */
  throw new Error(
    'Not implemented. The result of this interaction is unreliable.',
  )
}

/**
 * Determine if the element has its own selection implementation
 * and does not interact with the Document Selection API.
 */
export function hasOwnSelection(
  node: Node,
): node is
  | HTMLTextAreaElement
  | (HTMLInputElement & {type: editableInputTypes}) {
  return (
    isElement(node) &&
    (isElementType(node, 'textarea') ||
      (isElementType(node, 'input') && node.type in editableInputTypes))
  )
}

function isElement(node: Node): node is Element {
  return node.nodeType === 1
}

/**
 * Determine which selection logic and selection ranges to consider.
 */
function getTargetTypeAndSelection(node: Node) {
  const element = getElement(node)

  if (element && hasOwnSelection(element)) {
    return {
      type: 'input',
      selection: getUISelection(element),
    } as const
  }

  const selection = element?.ownerDocument.getSelection()

  // It is possible to extend a single-range selection into a contenteditable.
  // This results in the range acting like a range outside of contenteditable.
  const isCE =
    isInContentEditable(node) &&
    selection?.anchorNode &&
    isInContentEditable(selection.anchorNode)

  return {
    type: isCE ? 'contenteditable' : 'default',
    selection,
  } as const
}

function getElement(node: Node) {
  return node.nodeType === 1 ? (node as Element) : node.parentElement
}

/**
 * Reset the Document Selection when moving focus into an element
 * with own selection implementation.
 */
export function updateSelectionOnFocus(element: Element) {
  const selection = element.ownerDocument.getSelection()

  /* istanbul ignore if */
  if (!selection) {
    return
  }

  // If the focus moves inside an element with own selection implementation,
  // a selection on the document is removed.
  // But if the selection is collapsed, the cursor position is retained.
  if (hasOwnSelection(element) && !selection.isCollapsed) {
    selection.removeAllRanges()
  }
}

/**
 * Get input ranges for delete operations.
 *
 * Delete operations support multi-range selections.
 */
export function getInputRangesForDelete(
  focusNode: Node,
): Array<{startOffset: number; endOffset: number}> | Range[] | undefined {
  const typeAndSelection = getTargetTypeAndSelection(focusNode)

  if (typeAndSelection.type === 'input') {
    return typeAndSelection.selection.ranges
  } else if (typeAndSelection.type === 'contenteditable') {
    const selection = typeAndSelection.selection
    // We don't need to care for multi-ranges outside of the contenteditable
    // because you can not move focus into a contenteditable without resetting selection.
    /* istanbul ignore else */
    if (selection) {
      return Array(selection.rangeCount)
        .fill(null)
        .map((v, i) => selection.getRangeAt(i))
    }
  }
}

/**
 * Get the range that would be overwritten by input.
 */
export function getInputRange(
  focusNode: Node,
): UISelectionRange | Range | undefined {
  const typeAndSelection = getTargetTypeAndSelection(focusNode)

  if (typeAndSelection.type === 'input') {
    return typeAndSelection.selection.ranges[
      typeAndSelection.selection.ranges.length - 1
    ]
  } else if (typeAndSelection.type === 'contenteditable') {
    // Multi-range on contenteditable edits the first selection instead of the last
    return typeAndSelection.selection?.getRangeAt(0)
  }
}

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

/**
 * Add a selection range like with Ctrl+Mouse
 */
export function addSelection({
  anchorNode,
  anchorOffset,
  focusNode = anchorNode,
  focusOffset,
}: {
  anchorNode: Node
  /** DOM offset */
  anchorOffset: number
  focusNode?: Node
  focusOffset: number
}) {
  const typeAndSelection = getTargetTypeAndSelection(anchorNode)

  if (typeAndSelection.type === 'input') {
    return setUISelection(
      focusNode as HTMLInputElement,
      {anchorOffset, focusOffset},
      'add',
    )
  }

  const range = new Range()
  range.setStart(anchorNode, anchorOffset)
  range.setEnd(anchorNode, anchorOffset)
  const targetBeforeAnchor = range.comparePoint(focusNode, focusOffset)
  range[targetBeforeAnchor ? 'setStart' : 'setEnd'](focusNode, focusOffset)

  focusNode.ownerDocument?.getSelection()?.addRange(range)
}

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
