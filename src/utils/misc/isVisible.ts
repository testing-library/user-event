import {getWindow} from './getWindow'

function isAttributeVisible(element: Element, previousElement: Element | null) {
  let detailsVisibility

  if (previousElement) {
    detailsVisibility =
      element.nodeName === 'DETAILS' && previousElement.nodeName !== 'SUMMARY'
        ? element.hasAttribute('open')
        : true
  } else {
    detailsVisibility =
      element.nodeName === 'DETAILS' ? element.hasAttribute('open') : true
  }

  return detailsVisibility
}

export function isVisible(element: Element): boolean {
  const window = getWindow(element)

  for (
    let el: Element | null = element, prev: Element | null = null;
    el?.ownerDocument;
    prev = el, el = el.parentElement
  ) {
    const {display, visibility} = window.getComputedStyle(el)
    if (display === 'none') {
      return false
    }
    if (visibility === 'hidden' || visibility === 'collapse') {
      return false
    }
    if (!isAttributeVisible(el, prev)) {
      return false
    }
  }

  return true
}
