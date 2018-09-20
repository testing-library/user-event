import { fireEvent } from 'dom-testing-library'

const userEvent = {
  click(element) {
    const focusedElement = document.activeElement
    const wasAnotherElementFocused =
      focusedElement !== document.body && focusedElement !== element
    if (wasAnotherElementFocused) {
      fireEvent.mouseMove(focusedElement)
      fireEvent.mouseLeave(focusedElement)
    }

    fireEvent.mouseOver(element)
    fireEvent.mouseMove(element)
    fireEvent.mouseDown(element)
    element.focus()
    fireEvent.mouseUp(element)
    fireEvent.click(element)

    wasAnotherElementFocused && focusedElement.blur()
  },
}

export default userEvent
