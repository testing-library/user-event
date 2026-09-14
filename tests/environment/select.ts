import {isJsdomEnv, render} from '#testHelpers'
import {waitFor} from '@testing-library/dom'

test('`Selection.setBaseAndExtent()` resets input selection in browser', async () => {
  const {element} = render<HTMLInputElement>(`<input value="foo"/>`, {
    selection: {focusOffset: 3},
  })
  expect(element.selectionStart).toBe(3)

  element.ownerDocument.getSelection()?.setBaseAndExtent(element, 0, element, 0)

  expect(element.selectionStart).toBe(isJsdomEnv() ? 3 : 0)
})

test('events are not dispatched on same microtask in browser', async () => {
  const {element} = render<HTMLInputElement>(`<input value="foo"/>`)
  const onSelect = mocks.fn()
  element.addEventListener('select', onSelect)

  element.setSelectionRange(1, 2)

  expect(onSelect).toBeCalledTimes(isJsdomEnv() ? 1 : 0)

  await waitFor(() => expect(onSelect).toBeCalledTimes(1))
})

test('`HTMLInputElement.focus()` in contenteditable changes `Selection` in browser', () => {
  const {element, xpathNode} = render<HTMLInputElement>(
    `<div contenteditable="true"><input/></div><span></span>`,
    {
      selection: {
        focusNode: '//span',
      },
    },
  )

  expect(element.ownerDocument.getSelection()).toHaveProperty(
    'anchorNode',
    xpathNode('//span'),
  )

  xpathNode('//input').focus()

  expect(element.ownerDocument.getSelection()).toHaveProperty(
    'anchorNode',
    isJsdomEnv() ? xpathNode('//span') : element,
  )
})
