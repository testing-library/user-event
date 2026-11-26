import {isDisabled} from '../misc/isDisabled'
import {isElementType} from '../misc/isElementType'
import {isVisible} from '../misc/isVisible'
import {FOCUSABLE_SELECTOR} from './selector'

/** Return the element's parent in the flat tree. */
function getFlatTreeParent(element: Element) {
  if (element.assignedSlot) {
    return element.assignedSlot
  }

  if (element.parentElement) {
    return element.parentElement
  }

  const root = element.getRootNode()
  const ShadowRoot = element.ownerDocument.defaultView?.ShadowRoot
  return ShadowRoot && root instanceof ShadowRoot ? root.host : null
}

/** Check whether an element is an active modal dialog. */
function isActiveModal(element: Element) {
  if (isElementType(element, 'dialog')) {
    try {
      return element.matches(':modal')
    } catch {
      // `:modal` is not implemented in all DOM environments.
    }
  }

  return false
}

/** Return the document's active modal dialog. */
function getActiveModal(document: Document): HTMLDialogElement | null {
  const dialogs = document.querySelectorAll('dialog')
  for (let index = dialogs.length - 1; index >= 0; index--) {
    if (isActiveModal(dialogs[index])) {
      return dialogs[index]
    }
  }

  return null
}

/** Check whether an element is a flat-tree descendant of another element. */
function isDescendantOrSelf(element: Element, ancestor: Element) {
  for (
    let currentElement: Element | null = element;
    currentElement;
    currentElement = getFlatTreeParent(currentElement)
  ) {
    if (currentElement === ancestor) {
      return true
    }
  }

  return false
}

/** Check whether an element is inert according to its flat-tree ancestry. */
function isInert(element: Element, activeModal: HTMLDialogElement | null) {
  if (activeModal && !isDescendantOrSelf(element, activeModal)) {
    return true
  }

  for (
    let currentElement: Element | null = element;
    currentElement;
    currentElement = getFlatTreeParent(currentElement)
  ) {
    if (currentElement.hasAttribute('inert')) {
      return true
    }

    if (currentElement === activeModal) {
      return false
    }
  }

  return false
}

/** Find the next focus target for sequential keyboard navigation. */
export function getTabDestination(activeElement: Element, shift: boolean) {
  const document = activeElement.ownerDocument
  const focusableElements = document.querySelectorAll(FOCUSABLE_SELECTOR)
  const activeModal = getActiveModal(document)

  const enabledElements = Array.from(focusableElements).filter(
    el =>
      el === activeElement ||
      (!isInert(el, activeModal) &&
          !(Number(el.getAttribute('tabindex')) < 0 || isDisabled(el))),
  )

  // tabindex has no effect if the active element has negative tabindex
  if (Number(activeElement.getAttribute('tabindex')) >= 0) {
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
  let prunedElements = activeModal ? [] : [document.body]
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

  for (let index = prunedElements.findIndex(el => el === activeElement); ;) {
    index += shift ? -1 : 1

    // loop at overflow
    if (index === prunedElements.length) {
      index = 0
    } else if (index === -1) {
      index = prunedElements.length - 1
    }

    if (
      prunedElements[index] === activeElement ||
      prunedElements[index] === document.body ||
      isVisible(prunedElements[index])
    ) {
      return prunedElements[index]
    }
  }
}
