import {isContentEditable} from './isContentEditable'

export function getValue(element: Element): string | null {
  if (isContentEditable(element)) {
    return element.textContent
  }
  return (element as HTMLInputElement).value
}
