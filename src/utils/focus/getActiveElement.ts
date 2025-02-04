import {isDisabled} from '../misc/isDisabled'

export function getActiveElement(
  document: Document | ShadowRoot,
): Element | null {
  const activeElement = document.activeElement

  if (activeElement?.shadowRoot) {
    const activeElementInShadowTree = getActiveElement(activeElement.shadowRoot)
    if (activeElementInShadowTree) {
      return activeElementInShadowTree
    }
  }
  // Browser does not yield disabled elements as document.activeElement - jsdom does
  if (isDisabled(activeElement)) {
    return document.ownerDocument
      // TODO: verify behavior in ShadowRoot
      ? /* istanbul ignore next */ document.ownerDocument.body
      : document.body
  }

  return activeElement
}

export function getActiveElementOrBody(document: Document): Element {
  return getActiveElement(document) ?? /* istanbul ignore next */ document.body
}
