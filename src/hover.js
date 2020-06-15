import {fireEvent} from '@testing-library/dom'
import {
  isLabelWithInternallyDisabledControl,
  getMouseEventOptions,
} from './utils'

function hover(element, init) {
  if (isLabelWithInternallyDisabledControl(element)) return

  fireEvent.pointerOver(element, init)
  fireEvent.pointerEnter(element, init)
  if (!element.disabled) {
    fireEvent.mouseOver(element, getMouseEventOptions('mouseover', init))
    fireEvent.mouseEnter(element, getMouseEventOptions('mouseenter', init))
  }
  fireEvent.pointerMove(element, init)
  if (!element.disabled) {
    fireEvent.mouseMove(element, getMouseEventOptions('mousemove', init))
  }
}

function unhover(element, init) {
  if (isLabelWithInternallyDisabledControl(element)) return

  fireEvent.pointerMove(element, init)
  if (!element.disabled) {
    fireEvent.mouseMove(element, getMouseEventOptions('mousemove', init))
  }
  fireEvent.pointerOut(element, init)
  fireEvent.pointerLeave(element, init)
  if (!element.disabled) {
    fireEvent.mouseOut(element, getMouseEventOptions('mouseout', init))
    fireEvent.mouseLeave(element, getMouseEventOptions('mouseleave', init))
  }
}

export {hover, unhover}
