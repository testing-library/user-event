import {fireEvent} from '@testing-library/dom'
import {
  getMouseEventOptions,
  isLabelWithInternallyDisabledControl,
  isFocusable,
  isDisabled,
  isElementType,
  hasPointerEvents,
  PointerOptions,
} from './utils'
import {hover} from './hover'
import {blur} from './blur'
import {focus} from './focus'

function getPreviouslyFocusedElement(element: Element) {
  const focusedElement = element.ownerDocument.activeElement
  const wasAnotherElementFocused =
    focusedElement &&
    focusedElement !== element.ownerDocument.body &&
    focusedElement !== element
  return wasAnotherElementFocused ? focusedElement : null
}

export declare interface clickOptions {
  skipHover?: boolean
  clickCount?: number
}

function clickLabel(
  label: HTMLLabelElement,
  init: MouseEventInit | undefined,
  {clickCount}: clickOptions & PointerOptions,
) {
  if (isLabelWithInternallyDisabledControl(label)) return

  fireEvent.pointerDown(label, init)
  fireEvent.mouseDown(
    label,
    getMouseEventOptions('mousedown', init, clickCount),
  )
  fireEvent.pointerUp(label, init)
  fireEvent.mouseUp(label, getMouseEventOptions('mouseup', init, clickCount))
  fireClick(label, getMouseEventOptions('click', init, clickCount))
  // clicking the label will trigger a click of the label.control
  // however, it will not focus the label.control so we have to do it
  // ourselves.
  if (label.control) focus(label.control)
}

function clickBooleanElement(
  element: HTMLInputElement,
  init: MouseEventInit | undefined,
  {clickCount}: clickOptions & PointerOptions,
) {
  fireEvent.pointerDown(element, init)
  if (!element.disabled) {
    fireEvent.mouseDown(
      element,
      getMouseEventOptions('mousedown', init, clickCount),
    )
  }
  focus(element)
  fireEvent.pointerUp(element, init)
  if (!element.disabled) {
    fireEvent.mouseUp(
      element,
      getMouseEventOptions('mouseup', init, clickCount),
    )
    fireClick(element, getMouseEventOptions('click', init, clickCount))
  }
}

function clickElement(
  element: Element,
  init: MouseEventInit | undefined,
  {clickCount}: clickOptions & PointerOptions,
) {
  const previousElement = getPreviouslyFocusedElement(element)
  fireEvent.pointerDown(element, init)
  if (!isDisabled(element)) {
    const continueDefaultHandling = fireEvent.mouseDown(
      element,
      getMouseEventOptions('mousedown', init, clickCount),
    )
    if (continueDefaultHandling) {
      const closestFocusable = findClosest(element, isFocusable)
      if (previousElement && !closestFocusable) {
        blur(previousElement)
      } else if (closestFocusable) {
        focus(closestFocusable)
      }
    }
  }
  fireEvent.pointerUp(element, init)
  if (!isDisabled(element)) {
    fireEvent.mouseUp(
      element,
      getMouseEventOptions('mouseup', init, clickCount),
    )
    fireClick(element, getMouseEventOptions('click', init, clickCount))
    const parentLabel = element.closest('label')
    if (parentLabel?.control) focus(parentLabel.control)
  }
}

function findClosest(element: Element, callback: (e: Element) => boolean) {
  let el: Element | null = element
  do {
    if (callback(el)) {
      return el
    }
    el = el.parentElement
  } while (el && el !== element.ownerDocument.body)
  return undefined
}

function click(
  element: Element,
  init?: MouseEventInit,
  {
    skipHover = false,
    clickCount = 0,
    skipPointerEventsCheck = false,
  }: clickOptions & PointerOptions = {},
) {
  if (!skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to click element as it has or inherits pointer-events set to "none".',
    )
  }
  if (!skipHover) hover(element, init, {skipPointerEventsCheck})

  if (isElementType(element, 'label')) {
    clickLabel(element, init, {clickCount})
  } else if (isElementType(element, 'input')) {
    if (element.type === 'checkbox' || element.type === 'radio') {
      clickBooleanElement(element, init, {clickCount})
    } else {
      clickElement(element, init, {clickCount})
    }
  } else {
    clickElement(element, init, {clickCount})
  }
}

function fireClick(element: Element, mouseEventOptions: MouseEventInit) {
  if (mouseEventOptions.button === 2) {
    fireEvent.contextMenu(element, mouseEventOptions)
  } else {
    fireEvent.click(element, mouseEventOptions)
  }
}

function dblClick(
  element: Element,
  init?: MouseEventInit,
  {skipPointerEventsCheck = false}: clickOptions & PointerOptions = {},
) {
  if (!skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to double-click element as it has or inherits pointer-events set to "none".',
    )
  }
  hover(element, init, {skipPointerEventsCheck})
  click(element, init, {skipHover: true, clickCount: 0, skipPointerEventsCheck})
  click(element, init, {skipHover: true, clickCount: 1, skipPointerEventsCheck})
  fireEvent.dblClick(element, getMouseEventOptions('dblclick', init, 2))
}

export {click, dblClick}
