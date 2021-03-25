//jsdom is not supporting isContentEditable
export function isContentEditable(element: Element): element is HTMLElement & { contenteditable: 'true' } {
  return (
    element.hasAttribute('contenteditable') &&
    (element.getAttribute('contenteditable') == 'true' ||
      element.getAttribute('contenteditable') == '')
  )
}
