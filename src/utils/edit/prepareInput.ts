import {fireEvent} from '@testing-library/dom'
import {calculateNewValue, fireInputEvent, getInputRange} from '../../utils'

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
        const del = !inputRange.collapsed

        if (del) {
          inputRange.deleteContents()
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

        fireInputEvent(element as HTMLElement, {
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
