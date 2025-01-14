import {isJsdomEnv, render} from '#testHelpers'

test('focus events are not dispatched in (hidden) browser window', () => {
  const {element, getEventSnapshot} = render(`<input/>`, {focus: false})

  element.focus()
  element.blur()

  if (isJsdomEnv()) {
    expect(document.visibilityState).not.toBe('hidden')
    expect(getEventSnapshot()).toMatchInlineSnapshot(`
          Events fired on: input[value=""]
          
          input[value=""] - focus: ← null
          input[value=""] - focusin: ← null
          input[value=""] - blur: → null
          input[value=""] - focusout: → null
        `)
  } else {
    expect(document.visibilityState).toBe('hidden')
    expect(getEventSnapshot()).toMatchInlineSnapshot(`
          No events were fired on: input[value=""]
        `)
  }
})
