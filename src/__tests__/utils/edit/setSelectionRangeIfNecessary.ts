import { setSelectionRangeIfNecessary } from "utils"
import { setup } from "__tests__/helpers/utils"

test('set range on input', () => {
    const {element} = setup('<input/>')

    setSelectionRangeIfNecessary(element as HTMLInputElement, 0, 0)

    expect(element).toHaveProperty('selectionStart', 0)
    expect(element).toHaveProperty('selectionEnd', 0)

    ;(element as HTMLInputElement).value = 'foo'

    setSelectionRangeIfNecessary(element as HTMLInputElement, 2, 3)

    expect(element).toHaveProperty('selectionStart', 2)
    expect(element).toHaveProperty('selectionEnd', 3)
})

test('set range on contenteditable', () => {
    const {element} = setup('<div contenteditable="true"/>')

    setSelectionRangeIfNecessary(element as HTMLDivElement, 0, 0)

    expect(document.getSelection()?.focusNode).toBe(element)
    expect(document.getSelection()?.focusOffset).toBe(element)

    ;(element as HTMLDivElement).textContent = 'foo'

    setSelectionRangeIfNecessary(element as HTMLDivElement, 2, 3)

    expect(document.getSelection()?.anchorNode).toBe(element?.firstChild)
    expect(document.getSelection()?.focusNode).toBe(element?.firstChild)
    expect(document.getSelection()?.anchorOffset).toBe(2)
    expect(document.getSelection()?.focusOffset).toBe(3)
})
