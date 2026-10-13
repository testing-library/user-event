import {render, setup} from '#testHelpers'
import {getContentEditable, isContentEditable} from '#src/utils'

test('report if element is contenteditable', async () => {
  const {elements} = setup(
    `<div></div><div contenteditable="false"></div><div contenteditable></div><div contenteditable="true"></div><div contenteditable="plaintext-only"></div>`,
  )

  expect(isContentEditable(elements[0])).toBe(false)
  expect(isContentEditable(elements[1])).toBe(false)
  expect(isContentEditable(elements[2])).toBe(true)
  expect(isContentEditable(elements[3])).toBe(true)
  expect(isContentEditable(elements[4])).toBe(true)
})

test.each([['true'], ['plaintext-only']])(
  'resolve the nearest editing host when it is contenteditable="%s"',
  async attr => {
    const {element} = render(
      `<div contenteditable=""><div contenteditable="${attr}"><span>foo</span></div></div>`,
    )
    const host = element.firstElementChild
    const span = element.querySelector('span') as Element

    expect(getContentEditable(span)).toBe(host)
  },
)

test('resolve the element itself when it is the editing host', async () => {
  const {element} = render(`<div contenteditable="plaintext-only">foo</div>`)

  expect(getContentEditable(element)).toBe(element)
})

test('resolve no editing host outside a contenteditable', async () => {
  const {element} = render(`<div><span>foo</span></div>`)

  expect(getContentEditable(element.querySelector('span') as Element)).toBe(
    null,
  )
})
