export function isDocument(el: Document | Element): el is Document {
  return el.nodeType === el.DOCUMENT_NODE
}
