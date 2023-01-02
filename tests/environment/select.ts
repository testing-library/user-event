import {isJsdomEnv, render} from '#testHelpers'

test('`Selection.setBaseAndExtent()` resets input selection in browser', async () => {
  const {element} = render<HTMLInputElement>(`<input value="foo"/>`, {
    selection: {focusOffset: 3},
  })
  expect(element.selectionStart).toBe(3)

  element.ownerDocument.getSelection()?.setBaseAndExtent(element, 0, element, 0)

  expect(element.selectionStart).toBe(isJsdomEnv() ? 3 : 0)
})
