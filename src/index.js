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

    if (element.tagName === 'LABEL') {
      fireEvent.mouseOver(element)
      fireEvent.mouseMove(element)
      fireEvent.mouseDown(element)
      fireEvent.mouseUp(element)
      fireEvent.click(element)

      if (element.htmlFor) {
        const input = document.getElementById(element.htmlFor)
        input.focus()
        fireEvent.click(element)
      } else {
        const input = element.querySelector('input')
        input.focus()
        element.focus()
        fireEvent.click(input)
        fireEvent.click(element)
      }
    } else {
      fireEvent.mouseOver(element)
      fireEvent.mouseMove(element)
      fireEvent.mouseDown(element)
      element.focus()
      fireEvent.mouseUp(element)
      fireEvent.click(element)
    }

    wasAnotherElementFocused && focusedElement.blur()
  },
}

export default userEvent
