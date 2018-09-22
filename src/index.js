import { fireEvent } from 'dom-testing-library'

function findTagInParents(element, tagName) {
  if (element.parentNode == null) return undefined
  if (element.parentNode.tagName === tagName) return element.parentNode
  return findTagInParents(element.parentNode, tagName)
}

function clickLabel(label) {
  fireEvent.mouseOver(label)
  fireEvent.mouseMove(label)
  fireEvent.mouseDown(label)
  fireEvent.mouseUp(label)
  fireEvent.click(label)

  if (label.htmlFor) {
    const input = document.getElementById(label.htmlFor)
    input.focus()
    fireEvent.click(label)
  } else {
    const input = label.querySelector('input,textarea')
    input.focus()
    label.focus()
    fireEvent.click(input)
    fireEvent.click(label)
  }
}

function clickElement(element) {
  fireEvent.mouseOver(element)
  fireEvent.mouseMove(element)
  fireEvent.mouseDown(element)
  element.focus()
  fireEvent.mouseUp(element)
  fireEvent.click(element)

  const labelAncestor = findTagInParents(element, 'LABEL')
  labelAncestor && clickLabel(labelAncestor)
}

const userEvent = {
  click(element) {
    const focusedElement = document.activeElement
    const wasAnotherElementFocused =
      focusedElement !== document.body && focusedElement !== element
    if (wasAnotherElementFocused) {
      fireEvent.mouseMove(focusedElement)
      fireEvent.mouseLeave(focusedElement)
    }

    if (element.tagName === 'LABEL') {
      clickLabel(element)
    } else {
      clickElement(element)
    }

    wasAnotherElementFocused && focusedElement.blur()
  },
}

export default userEvent
