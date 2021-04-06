export function isDocument(el?: Document | Element): el is Document {
  return !!el && el.nodeType === el.DOCUMENT_NODE
}
