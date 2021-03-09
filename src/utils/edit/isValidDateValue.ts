import {isInstanceOfElement} from '../misc'

export function isValidDateValue(element: Element, value: string): boolean {
  if (
    !isInstanceOfElement(element, 'HTMLInputElement') ||
    (element as HTMLInputElement).type !== 'date'
  ) {
    return false
  }

  const clone = element.cloneNode() as HTMLInputElement
  clone.value = value
  return clone.value === value
}
