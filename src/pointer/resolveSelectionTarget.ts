import {getUIValue} from '../document'
import {isElementType} from '../utils'
import {PointerTarget, SelectionTarget} from './types'

export function resolveSelectionTarget({
  target,
  node,
  offset,
}: PointerTarget & SelectionTarget) {
  if (isElementType(target, ['input', 'textarea'])) {
    return {
      node: target,
      offset:
        offset ?? (getUIValue(target) ?? /* istanbul ignore next */ '').length,
    }
  } else if (node) {
    return {
      node,
      offset:
        offset ??
        (node.nodeType === 3
          ? (node.nodeValue as string).length
          : node.childNodes.length),
    }
  }

  return findNodeAtTextOffset(target, offset)
}

function findNodeAtTextOffset(
  node: Node,
  offset: number | undefined,
  isRoot = true,
): {
  node: Node
  offset: number
} {
  // When clicking after the content the browser behavior can be complicated:
  // 1. If there is textContent after the last element child,
  // the cursor is moved there.
  // 2. If there is textContent in the last element child,
  // the browser moves the cursor to the last non-empty text node inside this element.
  // 3. Otherwise the cursor is moved to the end of the target.

  let i = offset === undefined ? node.childNodes.length - 1 : 0
  const step = offset === undefined ? -1 : +1

  while (
    offset === undefined
      ? i >= (isRoot ? Math.max(node.childNodes.length - 1, 0) : 0)
      : i <= node.childNodes.length
  ) {
    const c = node.childNodes.item(i)

    const text = String(c.textContent)
    if (text.length) {
      if (offset !== undefined && text.length < offset) {
        offset -= text.length
      } else if (c.nodeType === 1) {
        return findNodeAtTextOffset(c as Element, offset, false)
      } else /* istanbul ignore else */ if (c.nodeType === 3) {
        return {
          node: c as Node,
          offset: offset ?? (c.nodeValue as string).length,
        }
      }
    }

    i += step
  }

  return {node, offset: node.childNodes.length}
}
