import {setup} from '#testHelpers/utils'
import {isContentEditable} from '#src/utils'

test('report if element is contenteditable', () => {
  const {elements} = setup(
    `<div></div><div contenteditable="false"></div><div contenteditable></div><div contenteditable="true"></div>`,
  )

  expect(isContentEditable(elements[0])).toBe(false)
  expect(isContentEditable(elements[1])).toBe(false)
  expect(isContentEditable(elements[2])).toBe(true)
  expect(isContentEditable(elements[3])).toBe(true)
})
