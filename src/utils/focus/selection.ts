import {
  ClickableInputOrButton,
  isClickableInput,
} from '../click/isClickableInput'
import {
  EditableInputOrTextarea,
  isEditableInputOrTextArea,
} from '../edit/isEditable'

/**
 * Determine if the element has its own selection implementation
 * and does not interact with the Document Selection API.
 */
export function hasOwnSelection(node: Node): node is EditableInputOrTextarea {
  return isElement(node) && isEditableInputOrTextArea(node)
}

export function hasNoSelection(node: Node): node is ClickableInputOrButton {
  return isElement(node) && isClickableInput(node)
}

function isElement(node: Node): node is Element {
  return node.nodeType === 1
}
