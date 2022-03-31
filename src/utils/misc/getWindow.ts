import {getWindowFromNode} from '@testing-library/dom/dist/helpers.js'

export function getWindow(node: Node) {
  return getWindowFromNode(node) as Window & typeof globalThis
}
