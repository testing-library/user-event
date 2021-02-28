import {fireEvent} from '@testing-library/dom'
import {
  getMouseEventOptions,
  isLabelWithInternallyDisabledControl,
  isFocusable,
} from './utils'
import {hover} from './hover'
import {blur} from './blur'
import {focus} from './focus'

function getPreviouslyFocusedElement(element) {
  const focusedElement = element.ownerDocument.activeElement
  const wasAnotherElementFocused =
    focusedElement &&
    focusedElement !== element.ownerDocument.body &&
    focusedElement !== element
  return wasAnotherElementFocused ? focusedElement : null
}

function clickLabel(label, init, {clickCount}) {
  if (isLabelWithInternallyDisabledControl(label)) return

  fireEvent.pointerDown(label, init)
  fireEvent.mouseDown(
    label,
    getMouseEventOptions('mousedown', init, clickCount),
  )
  fireEvent.pointerUp(label, init)
  fireEvent.mouseUp(label, getMouseEventOptions('mouseup', init, clickCount))
  fireEvent.click(label, getMouseEventOptions('click', init, clickCount))
  // clicking the label will trigger a click of the label.control
  // however, it will not focus the label.control so we have to do it
  // ourselves.
  if (label.control) focus(label.control)
}

function clickBooleanElement(element, init, clickCount) {
  fireEvent.pointerDown(element, init)
  if (!element.disabled) {
    fireEvent.mouseDown(
      element,
      getMouseEventOptions('mousedown', init, clickCount),
    )
  }
  focus(element, init)
  fireEvent.pointerUp(element, init)
  if (!element.disabled) {
    fireEvent.mouseUp(
      element,
      getMouseEventOptions('mouseup', init, clickCount),
    )
    fireEvent.click(element, getMouseEventOptions('click', init, clickCount))
  }
}

function clickElement(element, init, {clickCount}) {
  const previousElement = getPreviouslyFocusedElement(element)
  fireEvent.pointerDown(element, init)
  if (!element.disabled) {
    const continueDefaultHandling = fireEvent.mouseDown(
      element,
      getMouseEventOptions('mousedown', init, clickCount),
    )
    if (continueDefaultHandling) {
      const closestFocusable = findClosest(element, isFocusable)
      if (previousElement && !closestFocusable) {
        blur(previousElement, init)
      } else if (closestFocusable) {
        focus(closestFocusable, init)
      }
    }
  }
  fireEvent.pointerUp(element, init)
  if (!element.disabled) {
    fireEvent.mouseUp(
      element,
      getMouseEventOptions('mouseup', init, clickCount),
    )
    fireEvent.click(element, getMouseEventOptions('click', init, clickCount))
    const parentLabel = element.closest('label')
    if (parentLabel?.control) focus(parentLabel.control, init)
  }
}

function findClosest(el, callback) {
  do {
    if (callback(el)) {
      return el
    }
    el = el.parentElement
  } while (el && el !== document.body)
  return undefined
}

function click(element, init, {skipHover = false, clickCount = 0} = {}) {
  if (!skipHover) hover(element, init)
  switch (element.tagName) {
    case 'LABEL':
      clickLabel(element, init, {clickCount})
      break
    case 'INPUT':
      if (element.type === 'checkbox' || element.type === 'radio') {
        clickBooleanElement(element, init, {clickCount})
      } else {
        clickElement(element, init, {clickCount})
      }
      break
    default:
      clickElement(element, init, {clickCount})
  }
}

function dblClick(element, init) {
  hover(element, init)
  click(element, init, {skipHover: true, clickCount: 0})
  click(element, init, {skipHover: true, clickCount: 1})
  fireEvent.dblClick(element, getMouseEventOptions('dblclick', init, 2))
}

export {click, dblClick}
