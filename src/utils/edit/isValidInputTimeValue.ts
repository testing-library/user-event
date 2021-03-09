import {isInstanceOfElement} from '../misc'

export function isValidInputTimeValue(
  element: Element,
  timeValue: string,
): boolean {
  if (
    !isInstanceOfElement(element, 'HTMLInputElement') ||
    (element as HTMLInputElement).type !== 'time'
  ) {
    return false
  }

  const clone = element.cloneNode() as HTMLInputElement
  clone.value = timeValue
  return clone.value === timeValue
}
