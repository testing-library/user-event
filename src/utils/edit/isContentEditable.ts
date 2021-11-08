//jsdom is not supporting isContentEditable
export function isContentEditable(
  element: Element,
): element is HTMLElement & {contenteditable: 'true'} {
  return (
    element.hasAttribute('contenteditable') &&
    (element.getAttribute('contenteditable') == 'true' ||
      element.getAttribute('contenteditable') == '')
  )
}

/**
 * Determine if a node is a contenteditable or inside one.
 */
export function isInContentEditable(node: Node) {
  const element = getElement(node)
  return Boolean(
    element &&
      (element.closest('[contenteditable=""]') ||
        element.closest('[contenteditable="true"]')),
  )
}

function getElement(node: Node) {
  return node.nodeType === 1 ? (node as Element) : node.parentElement
}
