import {isDisabled, isElementType} from './utils'
import {type} from './type'

function clear(element: Element) {
  if (!isElementType(element, ['input', 'textarea'])) {
    // TODO: support contenteditable
    throw new Error(
      'clear currently only supports input and textarea elements.',
    )
  }

  if (isDisabled(element)) {
    return
  }

  // TODO: track the selection range ourselves so we don't have to do this input "type" trickery
  // just like cypress does: https://github.com/cypress-io/cypress/blob/8d7f1a0bedc3c45a2ebf1ff50324b34129fdc683/packages/driver/src/dom/selection.ts#L16-L37

  const elementType = element.type

  if (elementType !== 'textarea') {
    // setSelectionRange is not supported on certain types of inputs, e.g. "number" or "email"
    ;(element as HTMLInputElement).type = 'text'
  }

  type(element, '{selectall}{del}', {
    delay: 0,
    initialSelectionStart:
      element.selectionStart ?? /* istanbul ignore next */ undefined,
    initialSelectionEnd:
      element.selectionEnd ?? /* istanbul ignore next */ undefined,
  })

  if (elementType !== 'textarea') {
    ;(element as HTMLInputElement).type = elementType
  }
}

export {clear}
