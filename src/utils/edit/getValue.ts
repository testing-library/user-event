import {isContentEditable} from './isContentEditable'

export function getValue(element: Element | null): string | null {
  // istanbul ignore if
  if (!element) {
    return null
  }
  if (isContentEditable(element)) {
    return element.textContent
  }
  return (element as HTMLInputElement).value
}
