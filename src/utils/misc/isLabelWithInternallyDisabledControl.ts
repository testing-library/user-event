// Absolutely NO events fire on label elements that contain their control
// if that control is disabled. NUTS!

import {isDisabled} from './isDisabled'
import {isElementType} from './isElementType'

// no joke. There are NO events for: <label><input disabled /><label>
export function isLabelWithInternallyDisabledControl(
  element: Element,
): boolean {
  if (!isElementType(element, 'label')) {
    return false
  }
  const control = element.control
  return Boolean(control && element.contains(control) && isDisabled(control))
}
