import {getUIValue} from '../../document'
import {hasOwnSelection} from '../../utils'

export function resolveCaretPosition({
  target,
  node,
  offset,
}: {
  target: Element
  node?: Node
  offset?: number
}) {
  if (hasOwnSelection(target)) {
    return {
      node: target,
      offset: offset ?? getUIValue(target).length,
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
    if (offset && i === node.childNodes.length) {
      throw new Error('The given offset is out of bounds.')
    }
    const c = node.childNodes.item(i)

    const text = String(c.textContent)
    if (text.length) {
      if (offset !== undefined && text.length < offset) {
        offset -= text.length
      } else if (c.nodeType === 1) {
        return findNodeAtTextOffset(c as Element, offset, false)
      } else {
        // The pre-commit hooks keeps changing this
        // See https://github.com/kentcdodds/kcd-scripts/issues/218
        /* istanbul ignore else */

        if (c.nodeType === 3) {
          return {
            node: c as Node,
            offset: offset ?? (c.nodeValue as string).length,
          }
        }
      }
    }

    i += step
  }

  return {node, offset: node.childNodes.length}
}
