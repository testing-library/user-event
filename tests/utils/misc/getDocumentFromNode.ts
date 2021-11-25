import {getDocumentFromNode} from '#src/utils'

test('get document node', () => {
  expect(getDocumentFromNode(document.createElement('a'))).toBe(document)
  expect(getDocumentFromNode(document)).toBe(document)
})
