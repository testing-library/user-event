export function isValidDateValue(
  element: HTMLInputElement & {type: 'date'},
  value: string,
): boolean {
  const clone = element.cloneNode() as HTMLInputElement
  clone.value = value
  return clone.value === value
}
