import { isJsdomEnv, render } from '#testHelpers'

test('visibilityState is predictable', () => {
    expect(document.visibilityState).toBe(isJsdomEnv() ? 'prerender' : 'hidden')
})

test('focus events are not dispatched in hidden window', () => {
    const {element, getEventSnapshot} = render(`<input/>`, {focus: false})

    element.focus()
    element.blur()

    if (isJsdomEnv()) {
        expect(getEventSnapshot()).toMatchInlineSnapshot(`
          Events fired on: input[value=""]
          
          input[value=""] - focus
          input[value=""] - focusin
          input[value=""] - blur
          input[value=""] - focusout
        `)
    } else {
        expect(getEventSnapshot()).toMatchInlineSnapshot(`
          No events were fired on: input[value=""]
        `)
    }
})
