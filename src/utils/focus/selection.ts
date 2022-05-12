import {isElementType} from '../misc/isElementType'
import {getUISelection, setUISelection, UISelectionRange} from '../../document'
import {editableInputTypes} from '../edit/isEditable'
import {isContentEditable, getContentEditable} from '../edit/isContentEditable'
import {getNextCursorPosition} from './cursor'

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
  }

  /* istanbul ignore else */
  if (isContentEditable(element) && element.firstChild?.nodeType === 3) {
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
    getContentEditable(node) &&
    selection?.anchorNode &&
    getContentEditable(selection.anchorNode)

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
  if (!selection?.focusNode) {
    return
  }

  // If the focus moves inside an element with own selection implementation,
  // the document selection will be this element.
  // But if the focused element is inside a contenteditable,
  // 1) a collapsed selection will be retained.
  // 2) other selections will be replaced by a cursor
  //  2.a) at the start of the first child if it is a text node
  //  2.b) at the start of the contenteditable.
  if (hasOwnSelection(element)) {
    const contenteditable = getContentEditable(selection.focusNode)
    if (contenteditable) {
      if (!selection.isCollapsed) {
        const focusNode =
          contenteditable.firstChild?.nodeType === 3
            ? contenteditable.firstChild
            : contenteditable
        selection.setBaseAndExtent(focusNode, 0, focusNode, 0)
      }
    } else {
      selection.setBaseAndExtent(element, 0, element, 0)
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
    return typeAndSelection.selection
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
