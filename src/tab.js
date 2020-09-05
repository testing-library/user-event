import {fireEvent} from '@testing-library/dom'
import {getActiveElement, FOCUSABLE_SELECTOR} from './utils'
import {focus} from './focus'
import {blur} from './blur'

function getNextElement(currentIndex, shift, elements, focusTrap) {
  if (focusTrap === document && currentIndex === 0 && shift) {
    return document.body
  } else if (
    focusTrap === document &&
    currentIndex === elements.length - 1 &&
    !shift
  ) {
    return document.body
  } else {
    const nextIndex = shift ? currentIndex - 1 : currentIndex + 1
    const defaultIndex = shift ? elements.length - 1 : 0
    return elements[nextIndex] || elements[defaultIndex]
  }
}

function tab({shift = false, focusTrap} = {}) {
  const previousElement = getActiveElement(focusTrap?.ownerDocument ?? document)

  if (!focusTrap) {
    focusTrap = document
  }

  const focusableElements = focusTrap.querySelectorAll(FOCUSABLE_SELECTOR)

  const enabledElements = [...focusableElements].filter(
    el => el.getAttribute('tabindex') !== '-1' && !el.disabled,
  )

  if (enabledElements.length === 0) return

  const orderedElements = enabledElements
    .map((el, idx) => ({el, idx}))
    .sort((a, b) => {
      const tabIndexA = a.el.getAttribute('tabindex')
      const tabIndexB = b.el.getAttribute('tabindex')

      const diff = tabIndexA - tabIndexB

      return diff === 0 ? a.idx - b.idx : diff
    })
    .map(({el}) => el)

  const checkedRadio = {}
  let radioSubgroupContainsFocusedElement = false
  let currentTakenElementInSubgroup
  // keep only the checked or first element in each radio group
  const prunedElements = []
  for (const el of orderedElements) {
    if (el.type === 'radio' && el.name) {
      if (
        currentTakenElementInSubgroup &&
        currentTakenElementInSubgroup.name !== el.name
      ) {
        prunedElements.push(currentTakenElementInSubgroup)
        currentTakenElementInSubgroup = null
        radioSubgroupContainsFocusedElement = false
      }
      if (el.ownerDocument.activeElement === el) {
        radioSubgroupContainsFocusedElement = true
        currentTakenElementInSubgroup = el
      } else if (el.checked && !radioSubgroupContainsFocusedElement) {
        checkedRadio[el.name] = el
        currentTakenElementInSubgroup = el
        const elementSameRadiogroup = prunedElements.filter(
          ({name}) => name === el.name,
        )
        elementSameRadiogroup.forEach(radio => {
          if (radio !== el.ownerDocument.activeElement) {
            const indexToDelete = prunedElements.findIndex(
              elementToDelete => elementToDelete === radio,
            )

            prunedElements.splice(indexToDelete, 1)
          }
        })
      } else if (
        !el.checked &&
        !radioSubgroupContainsFocusedElement &&
        !checkedRadio[el.name]
      ) {
        if (!currentTakenElementInSubgroup || shift)
          currentTakenElementInSubgroup = el
      }
    } else {
      if (currentTakenElementInSubgroup)
        prunedElements.push(currentTakenElementInSubgroup)
      currentTakenElementInSubgroup = null
      radioSubgroupContainsFocusedElement = false
      prunedElements.push(el)
    }
  }

  if (currentTakenElementInSubgroup)
    prunedElements.push(currentTakenElementInSubgroup)

  const index = prunedElements.findIndex(
    el => el === el.ownerDocument.activeElement,
  )
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
    if (nextElement === document.body) {
      blur(previousElement)
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
