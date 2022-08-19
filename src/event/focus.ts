import {setUISelection} from '../document'
import {
  delegatesFocus,
  findClosest,
  findFocusable,
  getActiveElementOrBody,
  hasOwnSelection,
  isFocusable,
  isFocusTarget,
} from '../utils'
import {updateSelectionOnFocus} from './selection'
import {wrapEvent} from './wrapEvent'

/**
 * Focus closest focusable element.
 */
export function focusElement(element: Element, select: boolean = false) {
  const target = findClosest(element, isFocusTarget)

  const activeElement = getActiveElementOrBody(element.ownerDocument)
  if ((target ?? element.ownerDocument.body) === activeElement) {
    return
  }

  if (target) {
    if (delegatesFocus(target)) {
      const effectiveTarget = findFocusable(target.shadowRoot)
      if (effectiveTarget) {
        doFocus(effectiveTarget, true, element)
      } else {
        // This is not consistent across browsers if there is a focusable ancestor.
        // Firefox falls back to the closest focusable ancestor
        // of the shadow host as if `delegatesFocus` was `false`.
        // Chrome falls back to `document.body`.
        // We follow the minimal implementation of Chrome.
        doBlur(activeElement, element)
      }
    } else {
      doFocus(target, select, element)
    }
  } else {
    doBlur(activeElement, element)
  }
}

function doBlur(target: Element, source: Element) {
  wrapEvent(() => (target as HTMLElement | null)?.blur(), source)
}

function doFocus(target: HTMLElement, select: boolean, source: Element) {
  wrapEvent(() => target.focus(), source)

  if (hasOwnSelection(target)) {
    if (select) {
      setUISelection(target, {
        anchorOffset: 0,
        focusOffset: target.value.length,
      })
    }

    updateSelectionOnFocus(target)
  }
}

export function blurElement(element: Element) {
  if (!isFocusable(element)) return

  const wasActive = getActiveElementOrBody(element.ownerDocument) === element
  if (!wasActive) return

  doBlur(element, element)
}
