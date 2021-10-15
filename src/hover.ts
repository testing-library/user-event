import {fireEvent} from '@testing-library/dom'
import {
  isLabelWithInternallyDisabledControl,
  getMouseEventOptions,
  isDisabled,
  hasPointerEvents,
  PointerOptions,
} from './utils'

// includes `element`
function getParentElements(element: Element) {
  const parentElements = [element]
  let currentElement: Element | null = element
  while ((currentElement = currentElement.parentElement) != null) {
    parentElements.push(currentElement)
  }
  return parentElements
}

function hover(
  element: Element,
  init?: MouseEventInit,
  {skipPointerEventsCheck = false}: PointerOptions = {},
) {
  if (!skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to hover element as it has or inherits pointer-events set to "none".',
    )
  }
  if (isLabelWithInternallyDisabledControl(element)) return

  const parentElements = getParentElements(element).reverse()

  fireEvent.pointerOver(element, init)
  for (const el of parentElements) {
    fireEvent.pointerEnter(el, init)
  }
  if (!isDisabled(element)) {
    fireEvent.mouseOver(element, getMouseEventOptions('mouseover', init))
    for (const el of parentElements) {
      fireEvent.mouseEnter(el, getMouseEventOptions('mouseenter', init))
    }
  }
  fireEvent.pointerMove(element, init)
  if (!isDisabled(element)) {
    fireEvent.mouseMove(element, getMouseEventOptions('mousemove', init))
  }
}

function unhover(
  element: Element,
  init?: MouseEventInit,
  {skipPointerEventsCheck = false}: PointerOptions = {},
) {
  if (!skipPointerEventsCheck && !hasPointerEvents(element)) {
    throw new Error(
      'unable to unhover element as it has or inherits pointer-events set to "none".',
    )
  }
  if (isLabelWithInternallyDisabledControl(element)) return

  const parentElements = getParentElements(element)

  fireEvent.pointerMove(element, init)
  if (!isDisabled(element)) {
    fireEvent.mouseMove(element, getMouseEventOptions('mousemove', init))
  }
  fireEvent.pointerOut(element, init)
  for (const el of parentElements) {
    fireEvent.pointerLeave(el, init)
  }
  if (!isDisabled(element)) {
    fireEvent.mouseOut(element, getMouseEventOptions('mouseout', init))
    for (const el of parentElements) {
      fireEvent.mouseLeave(el, getMouseEventOptions('mouseleave', init))
    }
  }
}

export {hover, unhover}
