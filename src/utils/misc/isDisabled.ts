// This should probably be extended with checking the element type
// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/disabled
export function isDisabled(element: Element | null): boolean {
  return Boolean(element && (element as {disabled?: boolean}).disabled)
}
