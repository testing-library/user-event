import {isContentEditable} from '../utils'
import {getUIValue} from './UI'

export function getValueOrTextContent<T extends Element | null>(
  element: T,
): T extends HTMLInputElement | HTMLTextAreaElement ? string : string | null
export function getValueOrTextContent(
  element: Element | null,
): string | null | undefined {
  // istanbul ignore if
  if (!element) {
    return null
  }
  if (isContentEditable(element)) {
    return element.textContent
  }
  return getUIValue(element as HTMLInputElement)
}
