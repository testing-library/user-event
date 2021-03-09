export function getActiveElement(
  document: Document | ShadowRoot,
): Element | null {
  const activeElement = document.activeElement
  if (activeElement?.shadowRoot) {
    return getActiveElement(activeElement.shadowRoot)
  } else {
    return activeElement
  }
}
