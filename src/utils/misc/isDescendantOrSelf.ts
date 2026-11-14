export function isDescendantOrSelf(
  potentialDescendant: Element,
  potentialAncestor: Element,
) {
  let el: Element | null = potentialDescendant

  do {
    if (el === potentialAncestor) {
      return true
    }
    el = el.parentElement
  } while (el)

  return false
}
