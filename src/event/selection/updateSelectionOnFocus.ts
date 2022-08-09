import {getContentEditable, hasOwnSelection} from '../../utils'

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
