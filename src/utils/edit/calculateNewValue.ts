import {getUIValue} from '../../document'
import {EditableInputType} from './isEditable'
import {isValidDateValue} from './isValidDateValue'
import {isValidInputTimeValue} from './isValidInputTimeValue'

/**
 * Calculate a new text value.
 */
// This implementation does not properly calculate a new DOM state.
// It only handles text values and neither cares for DOM offsets nor accounts for non-character elements.
// It can be used for text nodes and elements supporting value property.
// TODO: The implementation of `deleteContent` is brittle and should be replaced.
export function calculateNewValue(
  inputData: string,
  node:
    | (HTMLInputElement & {type: EditableInputType})
    | HTMLTextAreaElement
    | (Node & {nodeType: 3})
    | Text,
  {
    startOffset,
    endOffset,
  }: {
    startOffset: number
    endOffset: number
  },
  inputType?: string,
) {
  const value =
    node.nodeType === 3
      ? String(node.nodeValue)
      : getUIValue(node as HTMLInputElement)

  const prologEnd = Math.max(
    0,
    startOffset === endOffset && inputType === 'deleteContentBackward'
      ? startOffset - 1
      : startOffset,
  )
  const prolog = value.substring(0, prologEnd)
  const epilogStart = Math.min(
    value.length,
    startOffset === endOffset && inputType === 'deleteContentForward'
      ? startOffset + 1
      : endOffset,
  )
  const epilog = value.substring(epilogStart, value.length)

  let newValue = `${prolog}${inputData}${epilog}`
  const newOffset = prologEnd + inputData.length

  if (
    (node as HTMLInputElement).type === 'date' &&
    !isValidDateValue(node as HTMLInputElement & {type: 'date'}, newValue)
  ) {
    newValue = value
  }

  if (
    (node as HTMLInputElement).type === 'time' &&
    !isValidInputTimeValue(node as HTMLInputElement & {type: 'time'}, newValue)
  ) {
    if (
      isValidInputTimeValue(
        node as HTMLInputElement & {type: 'time'},
        inputData,
      )
    ) {
      newValue = inputData
    } else {
      newValue = value
    }
  }

  return {
    oldValue: value,
    newValue,
    newOffset,
  }
}
