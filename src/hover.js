import {fireEvent} from '@testing-library/dom'
import {
  isLabelWithInternallyDisabledControl,
  getMouseEventOptions,
} from './utils'

// includes `element`
function getParentElements(element) {
  const parentElements = [element]
  let currentElement = element
  while ((currentElement = currentElement.parentElement) != null) {
    parentElements.push(currentElement)
  }
  return parentElements
}

function hover(element, init) {
  if (isLabelWithInternallyDisabledControl(element)) return

  const parentElements = getParentElements(element).reverse()

  fireEvent.pointerOver(element, init)
  for (const el of parentElements) {
    fireEvent.pointerEnter(el, init)
  }
  if (!element.disabled) {
    fireEvent.mouseOver(element, getMouseEventOptions('mouseover', init))
    for (const el of parentElements) {
      fireEvent.mouseEnter(el, getMouseEventOptions('mouseenter', init))
    }
  }
  fireEvent.pointerMove(element, init)
  if (!element.disabled) {
    fireEvent.mouseMove(element, getMouseEventOptions('mousemove', init))
  }
}

function unhover(element, init) {
  if (isLabelWithInternallyDisabledControl(element)) return

  const parentElements = getParentElements(element)

  fireEvent.pointerMove(element, init)
  if (!element.disabled) {
    fireEvent.mouseMove(element, getMouseEventOptions('mousemove', init))
  }
  fireEvent.pointerOut(element, init)
  for (const el of parentElements) {
    fireEvent.pointerLeave(el, init)
  }
  if (!element.disabled) {
    fireEvent.mouseOut(element, getMouseEventOptions('mouseout', init))
    for (const el of parentElements) {
      fireEvent.mouseLeave(el, getMouseEventOptions('mouseleave', init))
    }
  }
}

export {hover, unhover}
