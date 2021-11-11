import {UISelectionRange} from '../../document'
import {
  calculateNewValue,
  EditableInputType,
  fireInputEvent,
  getInputRange,
} from '../../utils'

export function prepareInput(
  data: string,
  element: Element,
  inputType: string = 'insertText',
):
  | {
      newValue: string
      commit: () => void
    }
  | undefined {
  const inputRange = getInputRange(element)

  // TODO: implement for ranges on multiple nodes
  /* istanbul ignore if */
  if (
    !inputRange ||
    ('startContainer' in inputRange &&
      inputRange.startContainer !== inputRange.endContainer)
  ) {
    return
  }
  const node = getNode(element, inputRange)

  const {newValue, newOffset, oldValue} = calculateNewValue(
    data,
    node,
    inputRange,
    inputType,
  )

  if (
    newValue === oldValue &&
    newOffset === inputRange.startOffset &&
    newOffset === inputRange.endOffset
  ) {
    return
  }

  return {
    newValue,
    commit: () =>
      fireInputEvent(element as HTMLElement, {
        newValue,
        newSelection: {
          node,
          offset: newOffset,
        },
        eventOverrides: {
          inputType,
        },
      }),
  }
}

function getNode(element: Element, inputRange: Range | UISelectionRange) {
  if ('startContainer' in inputRange) {
    if (inputRange.startContainer.nodeType === 3) {
      return inputRange.startContainer as Text
    }

    try {
      return inputRange.startContainer.insertBefore(
        element.ownerDocument.createTextNode(''),
        inputRange.startContainer.childNodes.item(inputRange.startOffset),
      )
    } catch {
      /* istanbul ignore next */
      throw new Error(
        'Invalid operation. Can not insert text at this position. The behavior is not implemented yet.',
      )
    }
  }

  return element as
    | HTMLTextAreaElement
    | (HTMLInputElement & {type: EditableInputType})
}
