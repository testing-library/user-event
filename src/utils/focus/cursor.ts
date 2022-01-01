import {isElementType} from '..'

declare global {
  interface Text {
    nodeValue: string
  }
}

export function getNextCursorPosition(
  node: Node,
  offset: number,
  direction: -1 | 1,
  inputType?: string,
):
  | {
      node: Node
      offset: number
    }
  | undefined {
  // The behavior at text node zero offset is inconsistent.
  // When walking backwards:
  // Firefox always moves to zero offset and jumps over last offset.
  // Chrome jumps over zero offset per default but over last offset when Shift is pressed.
  // The cursor always moves to zero offset if the focus area (contenteditable or body) ends there.
  // When walking foward both ignore zero offset.
  // When walking over input elements the cursor moves before or after that element.
  // When walking over line breaks the cursor moves inside any following text node.

  if (
    isTextNode(node) &&
    offset + direction >= 0 &&
    offset + direction <= node.nodeValue.length
  ) {
    return {node, offset: offset + direction}
  }
  const nextNode = getNextCharacterContentNode(node, offset, direction)
  if (nextNode) {
    if (isTextNode(nextNode)) {
      return {
        node: nextNode,
        offset:
          direction > 0
            ? Math.min(1, nextNode.nodeValue.length)
            : Math.max(nextNode.nodeValue.length - 1, 0),
      }
    } else if (isElementType(nextNode, 'br')) {
      const nextPlusOne = getNextCharacterContentNode(
        nextNode,
        undefined,
        direction,
      )
      if (!nextPlusOne) {
        // The behavior when there is no possible cursor position beyond the line break is inconsistent.
        // In Chrome outside of contenteditable moving before a leading line break is possible.
        // A leading line break can still be removed per deleteContentBackward.
        // A trailing line break on the other hand is not removed by deleteContentForward.
        if (direction < 0 && inputType === 'deleteContentBackward') {
          return {
            node: nextNode.parentNode as Node,
            offset: getOffset(nextNode),
          }
        }
        return undefined
      } else if (isTextNode(nextPlusOne)) {
        return {
          node: nextPlusOne,
          offset: direction > 0 ? 0 : nextPlusOne.nodeValue.length,
        }
      } else if (direction < 0 && isElementType(nextPlusOne, 'br')) {
        return {
          node: nextNode.parentNode as Node,
          offset: getOffset(nextNode),
        }
      } else {
        return {
          node: nextPlusOne.parentNode as Node,
          offset: getOffset(nextPlusOne) + (direction > 0 ? 0 : 1),
        }
      }
    } else {
      return {
        node: nextNode.parentNode as Node,
        offset: getOffset(nextNode) + (direction > 0 ? 1 : 0),
      }
    }
  }
}

function getNextCharacterContentNode(
  node: Node,
  offset: number | undefined,
  direction: -1 | 1,
) {
  const nextOffset = Number(offset) + (direction < 0 ? -1 : 0)
  if (
    offset !== undefined &&
    isElement(node) &&
    nextOffset >= 0 &&
    nextOffset < node.children.length
  ) {
    node = node.children[nextOffset]
  }
  return walkNodes(
    node,
    direction === 1 ? 'next' : 'previous',
    isTreatedAsCharacterContent,
  )
}

function isTreatedAsCharacterContent(node: Node): node is Text | HTMLElement {
  if (isTextNode(node)) {
    return true
  }
  if (isElement(node)) {
    if (isElementType(node, ['input', 'textarea'])) {
      return (node as HTMLInputElement).type !== 'hidden'
    } else if (isElementType(node, 'br')) {
      return true
    }
  }
  return false
}

function getOffset(node: Node) {
  let i = 0
  while (node.previousSibling) {
    i++
    node = node.previousSibling
  }
  return i
}

function isElement(node: Node): node is Element {
  return node.nodeType === 1
}

function isTextNode(node: Node): node is Text {
  return node.nodeType === 3
}

function walkNodes<T extends Node>(
  node: Node,
  direction: 'previous' | 'next',
  callback: (node: Node) => node is T,
) {
  for (;;) {
    const sibling = node[`${direction}Sibling`]
    if (sibling) {
      node = getDescendant(sibling, direction === 'next' ? 'first' : 'last')
      if (callback(node)) {
        return node
      }
    } else if (
      node.parentNode &&
      node.parentNode !== node.ownerDocument?.body
    ) {
      node = node.parentNode
    } else {
      break
    }
  }
}

function getDescendant(node: Node, direction: 'first' | 'last') {
  while (node.hasChildNodes()) {
    node = node[`${direction}Child`] as ChildNode
  }
  return node
}
