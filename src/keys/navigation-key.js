import {fireEvent} from '@testing-library/dom'

import {setSelectionRangeIfNecessary} from '../utils'

const keys = {
  ArrowLeft: {
    keyCode: 37,
  },
  ArrowRight: {
    keyCode: 39,
  },
}

function getSelectionRange(currentElement, key) {
  switch (key) {
    case 'ArrowLeft':
      return {
        selectionStart: currentElement().selectionStart - 1,
        selectionEnd: currentElement().selectionEnd - 1,
      }
    case 'ArrowRight':
      return {
        selectionStart: currentElement().selectionStart + 1,
        selectionEnd: currentElement().selectionEnd + 1,
      }
    default:
      return {}
  }
}

function navigationKey(key) {
  const event = {
    key,
    keyCode: keys[key].keyCode,
    which: keys[key].keyCode,
  }

  return ({currentElement, eventOverrides}) => {
    fireEvent.keyDown(currentElement(), {
      ...event,
      ...eventOverrides,
    })

    const range = getSelectionRange(currentElement, key)
    setSelectionRangeIfNecessary(
      currentElement(),
      range.selectionStart,
      range.selectionEnd,
    )

    fireEvent.keyUp(currentElement(), {
      ...event,
      ...eventOverrides,
    })
  }
}

export {navigationKey}
