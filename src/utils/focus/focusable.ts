/**
 * CSS selector to query focusable elements.
 *
 * This does not eliminate the following elements which are not focusable:
 *  - Custom elements with `tabindex` or `contenteditable` attribute
 *  - Shadow hosts with `delegatesFocus: true`
 */
export const FOCUSABLE_SELECTOR = [
  'input:not([type=hidden]):not([disabled])',
  'button:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[contenteditable=""]',
  '[contenteditable="true"]',
  'a[href]',
  '[tabindex]:not([disabled])',
].join(', ')

/**
 * Determine if an element can be the target for `focusElement()`.
 *
 * This does not necessarily mean that this element will be the `activeElement`,
 * as it might delegate focus into a shadow tree.
 */
export function isFocusTarget(element: Element): element is HTMLElement {
  if (element.tagName.includes('-')) {
    // custom elements without delegatesFocus are ignored
    return delegatesFocus(element)
  }
  // elements that don't delegateFocus behave normal even if they're a shadow host
  return delegatesFocus(element) || element.matches(FOCUSABLE_SELECTOR)
}

export function isFocusable(element: Element): element is HTMLElement {
  return (
    !element.tagName.includes('-') &&
    !delegatesFocus(element) &&
    element.matches(FOCUSABLE_SELECTOR)
  )
}

export function delegatesFocus(
  element: Element,
): element is HTMLElement & {shadowRoot: ShadowRoot & {delegatesFocus: true}} {
  // `delegatesFocus` is missing in Jsdom
  // see https://github.com/jsdom/jsdom/issues/3418
  // We'll treat `undefined` as `true`
  return (
    !!element.shadowRoot &&
    (element.shadowRoot.delegatesFocus as boolean | undefined) !== false
  )
}

/**
 * Find the first focusable element in a DOM tree.
 */
export function findFocusable(
  element: Element | ShadowRoot,
): HTMLElement | undefined {
  for (const el of Array.from(element.querySelectorAll('*'))) {
    if (isFocusable(el)) {
      return el
    } else if (el.shadowRoot) {
      const f = findFocusable(el.shadowRoot)
      if (f) {
        return f
      }
    }
  }
}

// TODO: use for tab
// /**
//  * Find the all focusable elements in a DOM tree.
//  */
// export function findAllFocusable(element: Element | ShadowRoot): HTMLElement[] {
//   const all: HTMLElement[] = []
//   for (const el of Array.from(element.querySelectorAll('*'))) {
//     if (isFocusable(el)) {
//       all.push(el)
//     } else if (el.shadowRoot) {
//       all.push(...findAllFocusable(el.shadowRoot))
//     }
//   }
//   return all
// }
