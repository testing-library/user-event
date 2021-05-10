import {isElementType} from '../misc/isElementType'

// https://github.com/jsdom/jsdom/blob/c2fb8ff94917a4d45e2398543f5dd2a8fed0bdab/lib/jsdom/living/nodes/HTMLInputElement-impl.js#L45
enum selectionSupportType {
  'text' = 'text',
  'search' = 'search',
  'url' = 'url',
  'tel' = 'tel',
  'password' = 'password',
}

const InputSelection = Symbol('inputSelection')
type InputWithInternalSelection = HTMLInputElement & {
  [InputSelection]?: {
    selectionStart: number
    selectionEnd: number
  }
}

export function hasSelectionSupport(
  element: Element,
): element is
  | HTMLTextAreaElement
  | (HTMLInputElement & {type: selectionSupportType}) {
  return (
    isElementType(element, 'textarea') ||
    (isElementType(element, 'input') &&
      Boolean(
        selectionSupportType[element.type as keyof typeof selectionSupportType],
      ))
  )
}

export function getSelectionRange(
  element: Element,
): {
  selectionStart: number | null
  selectionEnd: number | null
} {
  if (hasSelectionSupport(element)) {
    return {
      selectionStart: element.selectionStart,
      selectionEnd: element.selectionEnd,
    }
  }

  if (isElementType(element, 'input')) {
    return (
      (element as InputWithInternalSelection)[InputSelection] ?? {
        selectionStart: null,
        selectionEnd: null,
      }
    )
  }

  const selection = element.ownerDocument.getSelection()

  // there should be no editing if the focusNode is outside of element
  // TODO: properly handle selection ranges
  if (selection?.rangeCount && element.contains(selection.focusNode)) {
    const range = selection.getRangeAt(0)
    return {
      selectionStart: range.startOffset,
      selectionEnd: range.endOffset,
    }
  } else {
    return {
      selectionStart: null,
      selectionEnd: null,
    }
  }
}

export function setSelectionRange(
  element: Element,
  newSelectionStart: number,
  newSelectionEnd: number,
) {
  const {selectionStart, selectionEnd} = getSelectionRange(element)

  if (
    selectionStart === newSelectionStart &&
    selectionEnd === newSelectionEnd
  ) {
    return
  }

  if (hasSelectionSupport(element)) {
    element.setSelectionRange(newSelectionStart, newSelectionEnd)
  }

  if (isElementType(element, 'input')) {
    ;(element as InputWithInternalSelection)[InputSelection] = {
      selectionStart: newSelectionStart,
      selectionEnd: newSelectionEnd,
    }
  }

  const range = element.ownerDocument.createRange()
  range.selectNodeContents(element)

  // istanbul ignore else
  if (element.firstChild) {
    range.setStart(element.firstChild, newSelectionStart)
    range.setEnd(element.firstChild, newSelectionEnd)
  }

  const selection = element.ownerDocument.getSelection()
  // istanbul ignore else
  if (
    selection &&
    // Skip setting the range for <input> and <textarea> because
    // the parent <div> will be selected.
    !isElementType(element, 'input') &&
    !isElementType(element, 'textarea')
  ) {
    selection.removeAllRanges()
    selection.addRange(range)
  }
}
