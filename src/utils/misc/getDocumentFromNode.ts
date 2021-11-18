export function getDocumentFromNode(el: Node) {
  return isDocument(el) ? el : el.ownerDocument
}

function isDocument(node: Node): node is Document {
  return node.nodeType === 9
}
