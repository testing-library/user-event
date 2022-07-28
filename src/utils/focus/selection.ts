import {isElementType} from '../misc/isElementType'
import {
  getUISelection,
  getUIValue,
  setUISelection,
  UISelectionRange,
} from '../../document'
import {isClickableInput} from '../click/isClickableInput'
import {EditableInputType, editableInputTypes} from '../edit/isEditable'
import {isContentEditable, getContentEditable} from '../edit/isContentEditable'
import {getNextCursorPosition} from './cursor'
import {resolveCaretPosition} from './resolveCaretPosition'

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

export function hasNoSelection(node: Node) {
  return isElement(node) && isClickableInput(node)
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

export type SelectionRange = {
  node: (HTMLInputElement & {type: EditableInputType}) | HTMLTextAreaElement
  start: number
  end: number
}

export function setSelectionPerMouseDown({
  document,
  target,
  clickCount,
  node,
  offset,
}: {
  document: Document
  target: Element
  clickCount: number
  node?: Node
  offset?: number
}) {
  if (hasNoSelection(target)) {
    return
  }
  const targetHasOwnSelection = hasOwnSelection(target)

  // On non-input elements the text selection per multiple click
  // can extend beyond the target boundaries.
  // The exact mechanism what is considered in the same line is unclear.
  // Looks it might be every inline element.
  // TODO: Check what might be considered part of the same line of text.
  const text = String(
    targetHasOwnSelection ? getUIValue(target) : target.textContent,
  )

  const [start, end] = node
    ? // As offset is describing a DOMOffset it is non-trivial to determine
      // which elements might be considered in the same line of text.
      // TODO: support expanding initial range on multiple clicks if node is given
      [offset, offset]
    : getTextRange(text, offset, clickCount)

  // TODO: implement modifying selection per shift/ctrl+mouse
  if (targetHasOwnSelection) {
    setUISelection(target, {
      anchorOffset: start ?? text.length,
      focusOffset: end ?? text.length,
    })
    return {
      node: target,
      start: start ?? 0,
      end: end ?? text.length,
    }
  } else {
    const {node: startNode, offset: startOffset} = resolveCaretPosition({
      target,
      node,
      offset: start,
    })
    const {node: endNode, offset: endOffset} = resolveCaretPosition({
      target,
      node,
      offset: end,
    })

    const range = target.ownerDocument.createRange()
    try {
      range.setStart(startNode, startOffset)
      range.setEnd(endNode, endOffset)
    } catch (e: unknown) {
      throw new Error('The given offset is out of bounds.')
    }

    const selection = document.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range.cloneRange())

    return range
  }
}

function getTextRange(
  text: string,
  pos: number | undefined,
  clickCount: number,
) {
  if (clickCount % 3 === 1 || text.length === 0) {
    return [pos, pos]
  }

  const textPos = pos ?? text.length
  if (clickCount % 3 === 2) {
    return [
      textPos -
        (text.substr(0, pos).match(/(\w+|\s+|\W)?$/) as RegExpMatchArray)[0]
          .length,
      pos === undefined
        ? pos
        : pos +
          (text.substr(pos).match(/^(\w+|\s+|\W)?/) as RegExpMatchArray)[0]
            .length,
    ]
  }

  // triple click
  return [
    textPos -
      (text.substr(0, pos).match(/[^\r\n]*$/) as RegExpMatchArray)[0].length,
    pos === undefined
      ? pos
      : pos +
        (text.substr(pos).match(/^[^\r\n]*/) as RegExpMatchArray)[0].length,
  ]
}

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
