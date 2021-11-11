import {getUIValue} from '../../document'
import {getContentEditable} from '../edit/isContentEditable'
import {editableInputTypes} from '../edit/isEditable'
import {isElementType} from '../misc/isElementType'
import {setSelection} from './selection'

/**
 * Expand a selection like the browser does when pressing Ctrl+A.
 */
export function selectAll(target: Element): void {
  if (
    isElementType(target, 'textarea') ||
    (isElementType(target, 'input') && target.type in editableInputTypes)
  ) {
    return setSelection({
      focusNode: target,
      anchorOffset: 0,
      focusOffset: getUIValue(target).length,
    })
  }

  const focusNode = getContentEditable(target) ?? target.ownerDocument.body
  setSelection({
    focusNode,
    anchorOffset: 0,
    focusOffset: focusNode.childNodes.length,
  })
}
