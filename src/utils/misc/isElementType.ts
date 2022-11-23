type tag = keyof HTMLElementTagNameMap

export function isElementType<
  T extends tag,
  P extends {[k: string]: unknown} | undefined = undefined
>(
  element: Element,
  tag: T | T[],
  props?: P,
): element is P extends undefined
  ? HTMLElementTagNameMap[T]
  : HTMLElementTagNameMap[T] & P {
  if (
    element.namespaceURI &&
    element.namespaceURI !== 'http://www.w3.org/1999/xhtml'
  ) {
    return false
  }

  tag = Array.isArray(tag) ? tag : [tag]

  // tagName is uppercase in HTMLDocument and lowercase in XMLDocument
  if (!tag.includes(element.tagName.toLowerCase() as T)) {
    return false
  }

  if (props) {
    return Object.entries(props).every(
      ([k, v]) => element[k as keyof Element] === v,
    )
  }

  return true
}
