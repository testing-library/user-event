import {isDisabled} from '../misc/isDisabled'
import {isDocument} from '../misc/isDocument'
import {isElementType} from '../misc/isElementType'
import {isVisible} from '../misc/isVisible'
import {FOCUSABLE_SELECTOR} from './selector'

export function getTabDestination(
  activeElement: Element,
  shift: boolean,
  focusTrap: Document | Element,
) {
  const focusableElements = focusTrap.querySelectorAll(FOCUSABLE_SELECTOR)

  const enabledElements = Array.from(focusableElements).filter(
    el =>
      el === activeElement ||
      (el.getAttribute('tabindex') !== '-1' &&
        !isDisabled(el) &&
        // Hidden elements are not tabable
        isVisible(el)),
  )

  if (enabledElements.length === 0) return

  if (activeElement.getAttribute('tabindex') !== '-1') {
    // tabindex has no effect if the active element has tabindex="-1"
    enabledElements.sort(
      (a, b) =>
        Number(a.getAttribute('tabindex')) - Number(b.getAttribute('tabindex')),
    )
  }

  const checkedRadio: Record<string, HTMLInputElement> = {}
  let prunedElements: HTMLInputElement[] = []
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

  const currentIndex = prunedElements.findIndex(el => el === activeElement)

  if (
    isDocument(focusTrap) &&
    ((currentIndex === 0 && shift) ||
      (currentIndex === prunedElements.length - 1 && !shift))
  ) {
    return focusTrap.body
  }

  const nextIndex = shift ? currentIndex - 1 : currentIndex + 1
  const defaultIndex = shift ? prunedElements.length - 1 : 0
  return prunedElements[nextIndex] || prunedElements[defaultIndex]
}
