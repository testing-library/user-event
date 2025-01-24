import {patchFocus, restoreFocus} from '#src/document/patchFocus'
import {isJsdomEnv, render} from '#testHelpers'

beforeAll(() => {
  patchFocus(globalThis.window.HTMLElement)
  return () => restoreFocus(globalThis.window.HTMLElement)
})

test('dispatch focus events', () => {
  const {
    elements: [a, b],
    getEventSnapshot,
  } = render(`<input id="a"/><input id="b"/>`, {focus: false})

  a.focus()
  b.focus()
  a.blur()
  b.blur()

  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: input#a[value=""],input#b[value=""]
    
    input#a[value=""] - focus: ← null
    input#a[value=""] - focusin: ← null
    input#a[value=""] - blur: → input#b[value=""]
    input#a[value=""] - focusout: → input#b[value=""]
    input#b[value=""] - focus: ← input#a[value=""]
    input#b[value=""] - focusin: ← input#a[value=""]
    input#b[value=""] - blur: → null
    input#b[value=""] - focusout: → null
  `)
})

describe('reassign focus and blur', () => {
  let currentFocus: HTMLElement['focus'],
   currentBlur: HTMLElement['blur']

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    currentFocus = HTMLElement.prototype.focus
    // eslint-disable-next-line @typescript-eslint/unbound-method
    currentBlur = HTMLElement.prototype.blur
  })

  afterEach(() => {
    HTMLElement.prototype.focus = currentFocus
    HTMLElement.prototype.blur = currentBlur
  })

  test('set custom focus and blur', () => {
    const {
      elements: [a],
      getEventSnapshot,
    } = render(`<input id="a"/>`, {focus: false})

    const mockFocus = mocks.fn()
    HTMLElement.prototype.focus = mockFocus
    const mockBlur = mocks.fn()
    HTMLElement.prototype.blur = mockBlur

    a.focus()
    a.blur()

    expect(getEventSnapshot()).toMatchInlineSnapshot(
      `No events were fired on: input#a[value=""]`,
    )
    expect(mockFocus).toHaveBeenCalledTimes(1)
    expect(mockBlur).toHaveBeenCalledTimes(1)
  })
})

test('`focus` handler can prevent subsequent `focusin`', () => {
  const {element, getEventSnapshot} = render(`<input/>`, {focus: false})

  element.addEventListener('focus', () => {
    element.blur()
  })

  element.focus()

  if (isJsdomEnv()) {
    // The unpatched focus in Jsdom behaves differently than the browser
    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value=""]
      
      input[value=""] - focus: ← null
      input[value=""] - blur: → null
      input[value=""] - focusout: → null
      input[value=""] - focusin: ← null
    `)
  } else {
    expect(getEventSnapshot()).toMatchInlineSnapshot(`
      Events fired on: input[value=""]
      
      input[value=""] - focus: ← null
      input[value=""] - blur: → null
      input[value=""] - focusout: → null
    `)
  }
})
