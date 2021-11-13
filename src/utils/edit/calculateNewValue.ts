import {getUIValue} from '../../document'
import {EditableInputType} from './isEditable'
import {isValidDateValue} from './isValidDateValue'
import {isValidInputTimeValue} from './isValidInputTimeValue'

/**
 * Calculate a new text value.
 */
export function calculateNewValue(
  inputData: string,
  node: (HTMLInputElement & {type: EditableInputType}) | HTMLTextAreaElement,
  {
    startOffset,
    endOffset,
  }: {
    startOffset: number
    endOffset: number
  },
  inputType?: string,
) {
  const value = getUIValue(node)

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
