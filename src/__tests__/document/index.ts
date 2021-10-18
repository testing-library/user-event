import { setup } from "../helpers/utils";
import { prepareDocument } from "../../document";
import { getUIValue, setUIValue } from "../../document/value";

function prepare(element: Element) {
    prepareDocument(element.ownerDocument)
    // safe to call multiple times
    prepareDocument(element.ownerDocument)
    prepareDocument(element.ownerDocument)
}

test('keep track of value in UI', () => {
    const { element } = setup<HTMLInputElement>(`<input type="number"/>`)
    // The element has to either receive focus or be already focused when preparing.
    element.focus()

    prepare(element)

    setUIValue(element, '2e-')

    expect(element).toHaveValue(null)
    expect(getUIValue(element)).toBe('2e-')

    element.value = '3'

    expect(element).toHaveValue(3)
    expect(getUIValue(element)).toBe('3')
})
