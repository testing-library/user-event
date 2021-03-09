import {fireEvent} from '@testing-library/dom'
import {callback} from '../callbacks'

import {setSelectionRangeIfNecessary} from '../../utils/edit'

const keys = {
  Home: {
    keyCode: 36,
  },
  End: {
    keyCode: 35,
  },
  ArrowLeft: {
    keyCode: 37,
  },
  ArrowRight: {
    keyCode: 39,
  },
}

export function navigationKey(key: keyof typeof keys): callback {
  const event = {
    key,
    keyCode: keys[key].keyCode,
    which: keys[key].keyCode,
  }

  return ({currentElement, eventOverrides}) => {
    fireEvent.keyDown(currentElement() as Element, {
      ...event,
      ...eventOverrides,
    })

    const range = getSelectionRange(currentElement() as HTMLInputElement, key)
    setSelectionRangeIfNecessary(
      currentElement() as Element,
      range.selectionStart,
      range.selectionEnd,
    )

    fireEvent.keyUp(currentElement() as Element, {
      ...event,
      ...eventOverrides,
    })

    return undefined
  }
}

function getSelectionRange(element: HTMLInputElement, key: string) {
  const {selectionStart, selectionEnd} = element

  // istanbul ignore if
  if (typeof selectionStart !== 'number' || typeof selectionEnd !== 'number') {
    return {selectionStart: 0, selectionEnd: 0}
  }

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
