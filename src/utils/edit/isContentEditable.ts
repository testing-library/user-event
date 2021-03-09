//jsdom is not supporting isContentEditable
export function isContentEditable(element: Element): boolean {
  return (
    element.hasAttribute('contenteditable') &&
    (element.getAttribute('contenteditable') == 'true' ||
      element.getAttribute('contenteditable') == '')
  )
}
