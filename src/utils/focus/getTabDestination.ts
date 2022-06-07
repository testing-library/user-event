import {isDisabled} from '../misc/isDisabled'
import {isElementType} from '../misc/isElementType'
import {isVisible} from '../misc/isVisible'
import {FOCUSABLE_SELECTOR} from './selector'

/**
 * Checks if an element can be focused based on its state. Assumes that the element being
 * passed in is already focusable (input, button, etc.).
 * @param element The element to check for focusability.
 * @param activeElement The currently active element in the document.
 * @returns
 */
function hasFocusableState(
  element: Element,
  activeElement: Element,
  {
    ignoreVisibility = false,
  }: {
    /**
     * Whether or not to ignore the visibility of the element in calculating
     * if the element can be focused. If the visibility is known or can be
     * ignored, then this may improve performance by bypassing computing styles.
     */
    ignoreVisibility?: boolean
  } = {},
): boolean {
  if (element === activeElement) return true
  if (element.getAttribute('tabindex') === '-1') return false
  if (isDisabled(element)) return false
  if (!ignoreVisibility && !isVisible(element)) return false
  return true
}

export function getTabDestination(activeElement: Element, shift: boolean) {
  const document = activeElement.ownerDocument
  const focusableElements = document.querySelectorAll(FOCUSABLE_SELECTOR)

  let enabledElements
  const useNewImpl = 1 + 1 === 2
  if (useNewImpl) {
    enabledElements = Array.from(focusableElements).filter(el =>
      hasFocusableState(el, activeElement, {ignoreVisibility: true}),
    )
  } else {
    enabledElements = Array.from(focusableElements).filter(el => {
      const isActiveElement = el === activeElement
      const focusable =
        el.getAttribute('tabindex') !== '-1' &&
        !isDisabled(el) &&
        // Hidden elements are not tabable
        isVisible(el)
      return isActiveElement || focusable
    })
  }

  if (activeElement.getAttribute('tabindex') !== '-1') {
    // tabindex has no effect if the active element has tabindex="-1"
    enabledElements.sort((a, b) => {
      const i = Number(a.getAttribute('tabindex'))
      const j = Number(b.getAttribute('tabindex'))
      if (i === j) {
        return 0
      } else if (i === 0) {
        return 1
      } else if (j === 0) {
        return -1
      }
      return i - j
    })
  }

  const checkedRadio: Record<string, HTMLInputElement> = {}
  let prunedElements = [document.body]
  const activeRadioGroup = isElementType(activeElement, 'input', {
    type: 'radio',
  })
    ? activeElement.name
    : undefined
  enabledElements.forEach(currentElement => {
    const el = currentElement as HTMLInputElement

    // For radio groups keep only the active radio
    // If there is no active radio, keep only the checked radio
    // If there is no checked radio, treat like everything else
    if (isElementType(el, 'input', {type: 'radio'}) && el.name) {
      // If the active element is part of the group, add only that
      if (el === activeElement) {
        prunedElements.push(el)
        return
      } else if (el.name === activeRadioGroup) {
        return
      }

      // If we stumble upon a checked radio, remove the others
      if (el.checked) {
        prunedElements = prunedElements.filter(
          e => !isElementType(e, 'input', {type: 'radio', name: el.name}),
        )
        prunedElements.push(el)
        checkedRadio[el.name] = el
        return
      }

      // If we already found the checked one, skip
      if (typeof checkedRadio[el.name] !== 'undefined') {
        return
      }
    }

    prunedElements.push(el)
  })

  if (useNewImpl) {
    const currentIndex = prunedElements.findIndex(el => el === activeElement)
    const defaultIndex = shift ? prunedElements.length - 1 : 0

    let foundNextFocus = false
    let nextIndex = currentIndex
    while (!foundNextFocus) {
      if (!shift && nextIndex === prunedElements.length - 1) {
        // Loop back to the beginning of tab order
        nextIndex = 0
      } else if (shift && nextIndex === 0) {
        // Loop back to the end of tab order
        nextIndex = prunedElements.length - 1
      } else {
        nextIndex = shift ? nextIndex - 1 : nextIndex + 1
      }

      // Do a just-in-time focusable check
      if (nextIndex === currentIndex) {
        // We've looped back to the current element, so we're done
        break
      } else if (
        prunedElements[nextIndex] &&
        hasFocusableState(prunedElements[nextIndex], activeElement)
      ) {
        foundNextFocus = true
      }
    }

    return prunedElements[nextIndex] ?? prunedElements[defaultIndex]
  } else {
    const currentIndex = prunedElements.findIndex(el => el === activeElement)

    const nextIndex = shift ? currentIndex - 1 : currentIndex + 1
    const defaultIndex = shift ? prunedElements.length - 1 : 0
    return prunedElements[nextIndex] || prunedElements[defaultIndex]
  }
}
