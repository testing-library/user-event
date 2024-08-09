import {getWindow} from './getWindow'

const removeNotVisibleChildren = (element: Element) => {
  const window = getWindow(element)
  for (const child of Array.from(element.children)) {
    const {display, visibility} = window.getComputedStyle(child)
    if (
      child.getAttribute('aria-hidden') ||
      display === 'none' ||
      visibility === 'hidden'
    ) {
      child.remove()
    } else {
      removeNotVisibleChildren(child)
    }
  }
}

export const getVisibleText = (element: Element | null) => {
  if (!element) return

  const clone = element.cloneNode(true) as Element
  removeNotVisibleChildren(clone)
  return clone.textContent?.trim()
}
