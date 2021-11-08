import {UISelectionRange} from '../../document'
import {
  calculateNewValue,
  EditableInputType,
  fireInputEvent,
  getInputRange,
  getInputRangesForDelete,
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
  // TODO: implement for multi-range selection
  const inputRange = getRangeForInputType(inputType, element)

  // TODO: implement for ranges on multiple nodes
  /** istanbul ignore if */
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
    } /** istanbul ignore next */ catch {
      throw new Error(
        'Invalid operation. Can not insert text at this position. The behavior is not implemented yet.',
      )
    }
  }

  return element as
    | HTMLTextAreaElement
    | (HTMLInputElement & {type: EditableInputType})
}

function getRangeForInputType(
  inputType: string,
  element: Element,
): Range | UISelectionRange | undefined {
  if (inputType.startsWith('delete')) {
    const ranges = getInputRangesForDelete(element)
    return ranges && ranges[ranges.length - 1]
  }

  return getInputRange(element)
}
