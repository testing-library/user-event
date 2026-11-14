import {getUISelection, getUIValue} from '../../document'
import {hasOwnSelection} from '../../utils'
import {getContentEditable} from '../../utils/edit/isContentEditable'
import {setSelection} from './setSelection'

/**
 * Expand a selection like the browser does when pressing Ctrl+A.
 */
export function selectAll(target: Element): void {
  if (hasOwnSelection(target)) {
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

export function isAllSelected(target: Element): boolean {
  if (hasOwnSelection(target)) {
    return (
      getUISelection(target).startOffset === 0 &&
      getUISelection(target).endOffset === getUIValue(target).length
    )
  }

  const focusNode = getContentEditable(target) ?? target.ownerDocument.body
  const selection = target.ownerDocument.getSelection()

  return (
    selection?.anchorNode === focusNode &&
    selection.focusNode === focusNode &&
    selection.anchorOffset === 0 &&
    selection.focusOffset === focusNode.childNodes.length
  )
}
