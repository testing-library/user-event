export function isValidDateOrTimeValue(
  element: HTMLInputElement & {type: 'date' | 'time'},
  value: string,
) {
  const clone = element.cloneNode() as HTMLInputElement
  clone.value = value
  return clone.value === value
}
