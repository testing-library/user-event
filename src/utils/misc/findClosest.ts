export function findClosest(
  element: Element,
  callback: (e: Element) => boolean,
) {
  let el: Element | null = element
  do {
    if (callback(el)) {
      return el
    }
    el = el.parentElement
  } while (el && el !== element.ownerDocument.body)
  return undefined
}
