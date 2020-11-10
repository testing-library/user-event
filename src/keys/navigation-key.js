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
  const {selectionStart, selectionEnd} = currentElement()
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
