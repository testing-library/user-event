import {isDisabled} from '../misc/isDisabled'

export function getActiveElement(
  document: Document | ShadowRoot,
): Element | null {
  const activeElement = document.activeElement

  if (activeElement?.shadowRoot) {
    return getActiveElement(activeElement.shadowRoot)
  } else {
    // Browser does not yield disabled elements as document.activeElement - jsdom does
    if (isDisabled(activeElement)) {
      return document.ownerDocument
        // TODO: verify behavior in ShadowRoot
        ? /* istanbul ignore next */ document.ownerDocument.body
        : document.body
    }

    return activeElement
  }
}

export function getActiveElementOrBody(document: Document): Element {
  return getActiveElement(document) ?? /* istanbul ignore next */ document.body
}
