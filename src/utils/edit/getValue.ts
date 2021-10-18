import {getUIValue} from '../../document'
import {isContentEditable} from './isContentEditable'

export function getValue<T extends Element | null>(
  element: T,
): T extends HTMLInputElement | HTMLTextAreaElement ? string : string | null
export function getValue(element: Element | null): string | null {
  // istanbul ignore if
  if (!element) {
    return null
  }
  if (isContentEditable(element)) {
    return element.textContent
  }
  return getUIValue(element as HTMLInputElement) ?? null
}
