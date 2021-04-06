import {fireEvent} from '@testing-library/dom'
import {
  getActiveElement,
  FOCUSABLE_SELECTOR,
  isVisible,
  isDisabled,
  isDocument,
} from './utils'
import {focus} from './focus'
import {blur} from './blur'

function getNextElement(
  currentIndex: number,
  shift: boolean,
  elements: Element[],
  focusTrap?: Document | Element,
) {
  if (isDocument(focusTrap) && currentIndex === 0 && shift) {
    return focusTrap.body
  } else if (
    isDocument(focusTrap) &&
    currentIndex === elements.length - 1 &&
    !shift
  ) {
    return focusTrap.body
  } else {
    const nextIndex = shift ? currentIndex - 1 : currentIndex + 1
    const defaultIndex = shift ? elements.length - 1 : 0
    return elements[nextIndex] || elements[defaultIndex]
  }
}

interface tabOptions {
  shift?: boolean
  focusTrap?: Document | Element
}

function tab({shift = false, focusTrap}: tabOptions = {}) {
  const doc = focusTrap?.ownerDocument ?? document
  const previousElement = getActiveElement(doc)

  if (!focusTrap) {
    focusTrap = doc
  }

  const focusableElements = focusTrap.querySelectorAll(FOCUSABLE_SELECTOR)

  const enabledElements = Array.from(focusableElements).filter(
    el =>
      el === previousElement ||
      (el.getAttribute('tabindex') !== '-1' &&
        !isDisabled(el) &&
        // Hidden elements are not tabable
        isVisible(el)),
  )

  if (enabledElements.length === 0) return

  const orderedElements = enabledElements
    .map((el, idx) => ({el, idx}))
    .sort((a, b) => {
      // tabindex has no effect if the active element has tabindex="-1"
      if (
        previousElement &&
        previousElement.getAttribute('tabindex') === '-1'
      ) {
        return a.idx - b.idx
      }

      const tabIndexA = Number(a.el.getAttribute('tabindex'))
      const tabIndexB = Number(b.el.getAttribute('tabindex'))

      const diff = tabIndexA - tabIndexB

      return diff === 0 ? a.idx - b.idx : diff
    })
    .map(({el}) => el)

  // TODO: verify/remove type casts

  const checkedRadio: Record<string, HTMLInputElement> = {}
  let prunedElements: HTMLInputElement[] = []
  orderedElements.forEach(currentElement => {
    // For radio groups keep only the active radio
    // If there is no active radio, keep only the checked radio
    // If there is no checked radio, treat like everything else

    const el = currentElement as HTMLInputElement

    if (el.type === 'radio' && el.name) {
      // If the active element is part of the group, add only that
      const prev = previousElement as HTMLInputElement | null
      if (prev && prev.type === el.type && prev.name === el.name) {
        if (el === prev) {
          prunedElements.push(el)
        }
        return
      }

      // If we stumble upon a checked radio, remove the others
      if (el.checked) {
        prunedElements = prunedElements.filter(
          e => e.type !== el.type || e.name !== el.name,
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

  const index = prunedElements.findIndex(el => el === previousElement)
  const nextElement = getNextElement(index, shift, prunedElements, focusTrap)

  const shiftKeyInit = {
    key: 'Shift',
    keyCode: 16,
    shiftKey: true,
  }
  const tabKeyInit = {
    key: 'Tab',
    keyCode: 9,
    shiftKey: shift,
  }

  let continueToTab = true

  // not sure how to make it so there's no previous element...
  // istanbul ignore else
  if (previousElement) {
    // preventDefault on the shift key makes no difference
    if (shift) fireEvent.keyDown(previousElement, {...shiftKeyInit})
    continueToTab = fireEvent.keyDown(previousElement, {...tabKeyInit})
  }

  const keyUpTarget =
    !continueToTab && previousElement ? previousElement : nextElement

  if (continueToTab) {
    if (nextElement === doc.body) {
      /* istanbul ignore else */
      if (previousElement) {
        blur(previousElement)
      }
    } else {
      focus(nextElement)
    }
  }

  fireEvent.keyUp(keyUpTarget, {...tabKeyInit})

  if (shift) {
    fireEvent.keyUp(keyUpTarget, {...shiftKeyInit, shiftKey: false})
  }
}

export {tab}

/*
eslint
  complexity: "off",
  max-statements: "off",
*/
