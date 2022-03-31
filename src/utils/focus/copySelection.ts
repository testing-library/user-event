import {getUISelection, getUIValue} from '../../document'
import {createDataTransfer} from '../dataTransfer/DataTransfer'
import {EditableInputType} from '../edit/isEditable'
import {getWindow} from '../misc/getWindow'
import {hasOwnSelection} from './selection'

export function copySelection(target: Element) {
  const data: Record<string, string> = hasOwnSelection(target)
    ? {'text/plain': readSelectedValueFromInput(target)}
    : // TODO: We could implement text/html copying of DOM nodes here
      {'text/plain': String(target.ownerDocument.getSelection())}

  const dt = createDataTransfer(getWindow(target))
  for (const type in data) {
    if (data[type]) {
      dt.setData(type, data[type])
    }
  }

  return dt
}

function readSelectedValueFromInput(
  target: (HTMLInputElement & {type: EditableInputType}) | HTMLTextAreaElement,
) {
  const sel = getUISelection(target)
  const val = getUIValue(target)

  return val.substring(sel.startOffset, sel.endOffset)
}
