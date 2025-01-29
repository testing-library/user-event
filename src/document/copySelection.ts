import {
  createDataTransfer,
  EditableInputOrTextarea,
  getWindow,
  hasOwnSelection,
} from '../utils'
import {getUISelection, getUIValue} from './UI'

export function copySelection(target: Element) {
  const data: Record<string, string> = hasOwnSelection(target)
    ? {'text/plain': readSelectedValueFromInput(target)}
    // TODO: We could implement text/html copying of DOM nodes here
    : {'text/plain': String(target.ownerDocument.getSelection())}

  const dt = createDataTransfer(getWindow(target))
  for (const type in data) {
    if (data[type]) {
      dt.setData(type, data[type])
    }
  }

  return dt
}

function readSelectedValueFromInput(target: EditableInputOrTextarea) {
  const sel = getUISelection(target)
  const val = getUIValue(target)

  return val.substring(sel.startOffset, sel.endOffset)
}
