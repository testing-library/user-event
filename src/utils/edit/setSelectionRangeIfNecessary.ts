import { isElementType } from '../misc/isElementType'
import {getSelectionRange} from './getSelectionRange'
import { isContentEditable } from './isContentEditable'

// https://github.com/jsdom/jsdom/blob/c2fb8ff94917a4d45e2398543f5dd2a8fed0bdab/lib/jsdom/living/nodes/HTMLInputElement-impl.js#L45
enum selectionAllowedType {
  'text' = 'text',
  'search' = 'search',
  'url' = 'url',
  'tel' = 'tel',
  'password' = 'password',
}

export function setSelectionRangeIfNecessary(
  element: Element,
  newSelectionStart: number,
  newSelectionEnd: number,
) {
  const {selectionStart, selectionEnd} = getSelectionRange(element)

  if (
    !isContentEditable(element) &&
    (!(element as {setSelectionRange?: unknown}).setSelectionRange ||
      selectionStart === null)
  ) {
    // cannot set selection
    return
  }

  if (selectionStart === newSelectionStart && selectionEnd === newSelectionEnd) {
    return
  }

  if (isElementType(element, 'textarea')) {
    element.setSelectionRange(newSelectionStart, newSelectionEnd)

  } else if (isElementType(element, 'input')) {
    const elementType = element.type
    const setSelectionWorkaround = Boolean(selectionAllowedType[elementType as keyof typeof selectionAllowedType])

    if (setSelectionWorkaround) {
      element.type = 'text'
    }

    element.setSelectionRange(newSelectionStart, newSelectionEnd)

    if (setSelectionWorkaround) {
      element.type = elementType
    }

  } else {
    const range = element.ownerDocument.createRange()
      range.selectNodeContents(element)

      // istanbul ignore else
      if (element.firstChild) {
        range.setStart(element.firstChild, newSelectionStart)
        range.setEnd(element.firstChild, newSelectionEnd)
      }

      const selection = element.ownerDocument.getSelection()
      // istanbul ignore else
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
  }
}
