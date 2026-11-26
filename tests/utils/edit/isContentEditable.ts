import {setup} from '#testHelpers'
import {isContentEditable, isContentEditableFalse} from '#src/utils'

test('report if element is contenteditable', async () => {
  const {elements} = setup(
    `<div></div><div contenteditable="false"></div><div contenteditable></div><div contenteditable="true"></div>`,
  )

  expect(isContentEditable(elements[0])).toBe(false)
  expect(isContentEditable(elements[1])).toBe(false)
  expect(isContentEditable(elements[2])).toBe(true)
  expect(isContentEditable(elements[3])).toBe(true)
})

test('report if element is contenteditable=false', () => {
  const {elements} = setup(
    `<div contenteditable="false"></div><div contenteditable="true"></div><div contenteditable><span contenteditable="false"></span><span></span></div>`,
  )

  expect(isContentEditableFalse(elements[0])).toBe(true)
  expect(isContentEditableFalse(elements[1])).toBe(false)
  expect(isContentEditableFalse(elements[2].firstChild as Node)).toBe(true)
  expect(isContentEditableFalse(elements[2].lastChild as Node)).toBe(false)
  expect(isContentEditableFalse(document.createTextNode('x'))).toBe(false)
})
