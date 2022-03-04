import {isElementType} from './isElementType'

// This should probably just rely on the :disabled pseudo-class, but JSDOM doesn't implement it properly.
export function isDisabled(element: Element | null): boolean {
  for (let el = element; el; el = el.parentElement) {
    if (
      isElementType(el, [
        'button',
        'input',
        'select',
        'textarea',
        'optgroup',
        'option',
      ])
    ) {
      if (el.hasAttribute('disabled')) {
        return true
      }
    } else if (isElementType(el, 'fieldset')) {
      if (
        el.hasAttribute('disabled') &&
        !el.querySelector('legend')?.contains(element)
      ) {
        return true
      }
    } else if (el.tagName.includes('-')) {
      if (
        (el.constructor as {formAssociated?: boolean}).formAssociated &&
        el.hasAttribute('disabled')
      ) {
        return true
      }
    }
  }

  return false
}
