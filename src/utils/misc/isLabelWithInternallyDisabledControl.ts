// Absolutely NO events fire on label elements that contain their control
// if that control is disabled. NUTS!

import {isDisabled} from './isDisabled'
import {isInstanceOfElement} from './isInstanceOfElement'

// no joke. There are NO events for: <label><input disabled /><label>
export function isLabelWithInternallyDisabledControl(
  element: Element,
): boolean {
  if (!isInstanceOfElement(element, 'HTMLLabelElement')) {
    return false
  }
  const control = (element as HTMLLabelElement).control
  return Boolean(control && element.contains(control) && isDisabled(control))
}
