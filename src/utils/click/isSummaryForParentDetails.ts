import {isElementType} from '../misc/isElementType'

/**
 * Check if the element is the summary for its parent `<details>` element,
 * i.e. the first `<summary>` child of a `<details>` element.
 * Only this `<summary>` is activated per keyboard.
 */
export function isSummaryForParentDetails(element: Element) {
  const parent = element.parentElement
  return (
    isElementType(element, 'summary') &&
    !!parent &&
    isElementType(parent, 'details') &&
    Array.from(parent.children).find(child =>
      isElementType(child, 'summary'),
    ) === element
  )
}
