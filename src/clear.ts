import {isDisabled, isInstanceOfElement} from './utils'
import {type} from './type'

function clear(element: Element) {
  if (
    !isInstanceOfElement(element, 'HTMLInputElement') &&
    !isInstanceOfElement(element, 'HTMLTextAreaElement')
  ) {
    // TODO: support contenteditable
    throw new Error(
      'clear currently only supports input and textarea elements.',
    )
  }
  const el = element as HTMLInputElement | HTMLTextAreaElement

  if (isDisabled(el)) {
    return
  }

  // TODO: track the selection range ourselves so we don't have to do this input "type" trickery
  // just like cypress does: https://github.com/cypress-io/cypress/blob/8d7f1a0bedc3c45a2ebf1ff50324b34129fdc683/packages/driver/src/dom/selection.ts#L16-L37

  const elementType = el.type

  if (elementType !== 'textarea') {
    // setSelectionRange is not supported on certain types of inputs, e.g. "number" or "email"
    ;(element as HTMLInputElement).type = 'text'
  }

  type(element, '{selectall}{del}', {
    delay: 0,
    initialSelectionStart: el.selectionStart ?? undefined,
    initialSelectionEnd: el.selectionEnd ?? undefined,
  })

  if (elementType !== 'textarea') {
    ;(el as HTMLInputElement).type = elementType
  }
}

export {clear}
