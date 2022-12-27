import dtlHelpers from '../../_interop/dtlHelpers'

const {getWindowFromNode} = dtlHelpers

export function getWindow(node: Node) {
  return getWindowFromNode(node) as Window & typeof globalThis
}
