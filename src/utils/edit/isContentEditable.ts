// jsdom is not supporting isContentEditable
export function isContentEditable(
  element: Element,
): element is HTMLElement & {contenteditable: 'true'} {
  return (
    element.hasAttribute('contenteditable') &&
    (element.getAttribute('contenteditable') == 'true' ||
        element.getAttribute('contenteditable') == '' ||
        element.getAttribute('contenteditable') == 'plaintext-only')
  )
}

/**
 * If a node is a contenteditable or inside one, return that element.
 */
export function getContentEditable(node: Node): Element | null {
  let element = getElement(node)
  while (element) {
    if (isContentEditable(element)) {
      return element
    }
    element = element.parentElement
  }
  return null
}

function getElement(node: Node) {
  return node.nodeType === 1 ? (node as Element) : node.parentElement
}
