export function getWindow(node: Node) {
  if (isDocument(node) && node.defaultView) {
    return node.defaultView
  } else if (node.ownerDocument?.defaultView) {
    return node.ownerDocument.defaultView
  }
  throw new Error(
    `Could not determine window of node. Node was ${describe(node)}`,
  )
}

function isDocument(node: Node): node is Document {
  return node.nodeType === 9
}

function describe(val: unknown) {
  return typeof val === 'function'
    ? `function ${val.name}`
    : val === null
      ? 'null'
      // eslint-disable-next-line @typescript-eslint/no-base-to-string
      : String(val)
}
