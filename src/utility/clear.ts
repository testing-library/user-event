import {Config, Instance} from '../setup'
import {
  focus,
  input,
  isAllSelected,
  isDisabled,
  isEditable,
  selectAll,
} from '../utils'

export async function clear(this: Instance, element: Element) {
  if (!isEditable(element) || isDisabled(element)) {
    throw new Error('clear()` is only supported on editable elements.')
  }

  focus(element)

  if (element.ownerDocument.activeElement !== element) {
    throw new Error('The element to be cleared could not be focused.')
  }

  selectAll(element)

  if (!isAllSelected(element)) {
    throw new Error('The element content to be cleared could not be selected.')
  }

  input(this[Config], element, '', 'deleteContentBackward')
}
