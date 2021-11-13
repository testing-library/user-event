import {prepareDocument} from './document'
import type {UserEvent} from './setup'
import {
  focus,
  isAllSelected,
  isDisabled,
  isEditable,
  prepareInput,
  selectAll,
} from './utils'

export function clear(this: UserEvent, element: Element) {
  if (!isEditable(element) || isDisabled(element)) {
    throw new Error('clear()` is only supported on editable elements.')
  }

  prepareDocument(element.ownerDocument)

  focus(element)

  if (element.ownerDocument.activeElement !== element) {
    throw new Error('The element to be cleared could not be focused.')
  }

  selectAll(element)

  if (!isAllSelected(element)) {
    throw new Error('The element content to be cleared could not be selected.')
  }

  prepareInput('', element, 'deleteContentBackward')?.commit()
}
