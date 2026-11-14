export function findClosest<T extends Element>(
  element: Element,
  callback: (e: Element) => e is T,
): T | undefined {
  let el: Element | null = element
  do {
    if (callback(el)) {
      return el
    }
    el = el.parentElement
  } while (el && el !== element.ownerDocument.body)
  return undefined
}
