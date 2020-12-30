import {fireEvent} from '@testing-library/dom'

import {setSelectionRangeIfNecessary} from '../utils'

const keys = {
  Home: {
    keyCode: 35,
  },
  End: {
    keyCode: 36,
  },
  ArrowLeft: {
    keyCode: 37,
  },
  ArrowRight: {
    keyCode: 39,
  },
}

function getSelectionRange(currentElement, key) {
  const {selectionStart, selectionEnd} = currentElement()

  if (key === 'Home') {
    return {
      selectionStart: 0,
      selectionEnd: 0,
    }
  }

  if (key === 'End') {
    return {
      selectionStart: selectionEnd + 1,
      selectionEnd: selectionEnd + 1,
    }
  }

  const cursorChange = Number(key in keys) * (key === 'ArrowLeft' ? -1 : 1)
  return {
    selectionStart: selectionStart + cursorChange,
    selectionEnd: selectionEnd + cursorChange,
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
