import { patchFocus, restoreFocus } from '#src/document/patchFocus'
import { render } from '#testHelpers'

beforeAll(() => {
    patchFocus(globalThis.window.HTMLElement)
    return () => restoreFocus(globalThis.window.HTMLElement)
})

test('focus', () => {
    const {element, getEventSnapshot} = render(`<input/>`, {focus: false})

    element.focus()
    element.blur()

    expect(getEventSnapshot()).toMatchInlineSnapshot(`
        Events fired on: input[value=""]
        
        input[value=""] - focus: (from null)
        input[value=""] - focusin: (from null)
        input[value=""] - blur: (to null)
        input[value=""] - focusout: (to null)
    `)
})

describe('event handlers can override subsequent events', () => {
    test('blur', () => {
        const {element, getEventSnapshot} = render(`<input/>`, {focus: false})
    
        element.addEventListener('blur', () => { element.focus() })
    
        element.focus()
        element.blur()
    
        expect(getEventSnapshot()).toMatchInlineSnapshot(`
            Events fired on: input[value=""]
            
            input[value=""] - focus: (from null)
            input[value=""] - focusin: (from null)
            input[value=""] - blur: (to null)
            input[value=""] - focus: (from null)
            input[value=""] - focusin: (from null)
        `)
    })
})
