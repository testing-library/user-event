import {fireEvent} from '@testing-library/dom'
import {calculateNewValue, editInputElement, getInputRange} from '../../utils'
import {getNextCursorPosition} from '../focus/cursor'

export function prepareInput(
  data: string,
  element: Element,
  inputType: string = 'insertText',
) {
  const inputRange = getInputRange(element)

  /* istanbul ignore if */
  if (!inputRange) {
    return
  }

  if ('startContainer' in inputRange) {
    return {
      commit: () => {
        let del: boolean = false

        if (!inputRange.collapsed) {
          del = true
          inputRange.deleteContents()
        } else if (
          ['deleteContentBackward', 'deleteContentForward'].includes(inputType)
        ) {
          const nextPosition = getNextCursorPosition(
            inputRange.startContainer,
            inputRange.startOffset,
            inputType === 'deleteContentBackward' ? -1 : 1,
            inputType,
          )
          if (nextPosition) {
            del = true
            const delRange = inputRange.cloneRange()
            if (
              delRange.comparePoint(nextPosition.node, nextPosition.offset) < 0
            ) {
              delRange.setStart(nextPosition.node, nextPosition.offset)
            } else {
              delRange.setEnd(nextPosition.node, nextPosition.offset)
            }
            delRange.deleteContents()
          }
        }

        if (data) {
          if (inputRange.endContainer.nodeType === 3) {
            const offset = inputRange.endOffset
            ;(inputRange.endContainer as Text).insertData(offset, data)
            inputRange.setStart(inputRange.endContainer, offset + data.length)
            inputRange.setEnd(inputRange.endContainer, offset + data.length)
          } else {
            const text = element.ownerDocument.createTextNode(data)
            inputRange.insertNode(text)
            inputRange.setStart(text, data.length)
            inputRange.setEnd(text, data.length)
          }
        }

        if (del || data) {
          fireEvent.input(element, {inputType})
        }
      },
    }
  } else {
    return {
      getNewValue: () =>
        calculateNewValue(
          data,
          element as HTMLTextAreaElement,
          inputRange,
          inputType,
        ).newValue,
      commit: () => {
        const {newValue, newOffset, oldValue} = calculateNewValue(
          data,
          element as HTMLTextAreaElement,
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

        editInputElement(element as HTMLTextAreaElement, {
          newValue,
          newSelection: {
            node: element,
            offset: newOffset,
          },
          eventOverrides: {
            inputType,
          },
        })
      },
    }
  }
}
