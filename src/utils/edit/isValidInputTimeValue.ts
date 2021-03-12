export function isValidInputTimeValue(
  element: HTMLInputElement & {type: 'time'},
  timeValue: string,
): boolean {
  const clone = element.cloneNode() as HTMLInputElement
  clone.value = timeValue
  return clone.value === timeValue
}
