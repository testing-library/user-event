import userEvent from '#src'
import {focus} from '#src/utils'
import {setup, addListeners} from '#testHelpers/utils'

test('fires events when tabbing between two elements', async () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(
    `<div><input id="a" /><input id="b" /></div>`,
  )
  const a = element.children[0]
  const b = element.children[1]
  focus(a)
  clearEventCalls()

  const aListeners = addListeners(a)
  const bListeners = addListeners(b)

  await userEvent.tab()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input#a[value=""] - keydown: Tab
    input#a[value=""] - focusout
    input#b[value=""] - focusin
    input#b[value=""] - keyup: Tab
  `)
  // blur/focus do not bubble
  expect(aListeners.eventWasFired('blur')).toBe(true)
  expect(bListeners.eventWasFired('focus')).toBe(true)
})

test('does not change focus if default prevented on keydown', async () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(
    `<div><input id="a" /><input id="b" /></div>`,
  )
  const a = element.children[0]
  const b = element.children[1]
  focus(a)
  clearEventCalls()

  const aListeners = addListeners(a, {
    eventHandlers: {keyDown: e => e.preventDefault()},
  })
  const bListeners = addListeners(b)

  await userEvent.tab()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input#a[value=""] - keydown: Tab
    input#a[value=""] - keyup: Tab
  `)
  // blur/focus do not bubble
  expect(aListeners.eventWasFired('blur')).toBe(false)
  expect(bListeners.eventWasFired('focus')).toBe(false)
})

test('tabs backward if shift is already pressed', async () => {
  const {
    elements: [elA, elB],
    getEventSnapshot,
    clearEventCalls,
  } = setup(`<input/><input/><input/>`)
  const user = userEvent.setup()
  await user.keyboard('[ShiftLeft>]')
  elB.focus()
  clearEventCalls()

  await user.tab()

  expect(elA).toHaveFocus()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input[value=""] - keydown: Tab {shift}
    input[value=""] - focusout
    input[value=""] - focusin
    input[value=""] - keyup: Tab {shift}
  `)
})

test('shift option lifts pressed shift key', async () => {
  const {
    elements: [, elB, elC],
    getEventSnapshot,
    clearEventCalls,
  } = setup(`<input/><input/><input/>`)
  const user = userEvent.setup()
  await user.keyboard('[ShiftRight>]')
  elB.focus()
  clearEventCalls()

  await user.tab({shift: false})

  expect(elC).toHaveFocus()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input[value=""] - keyup: Shift
    input[value=""] - keydown: Tab
    input[value=""] - focusout
    input[value=""] - focusin
    input[value=""] - keyup: Tab
  `)
})

test('shift option presses shift key', async () => {
  const {
    elements: [elA, elB],
    getEventSnapshot,
    clearEventCalls,
  } = setup(`<input/><input/><input/>`)
  const user = userEvent.setup()
  await user.keyboard('[ShiftLeft>]')
  elB.focus()
  clearEventCalls()

  await user.tab({shift: true})

  expect(elA).toHaveFocus()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input[value=""] - keyup: Shift
    input[value=""] - keydown: Shift {shift}
    input[value=""] - keydown: Tab {shift}
    input[value=""] - focusout
    input[value=""] - focusin
    input[value=""] - keyup: Tab {shift}
    input[value=""] - keyup: Shift
  `)
})

test('fires correct events with shift key', async () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(
    `<div><input id="a" /><input id="b" /></div>`,
  )
  const a = element.children[0]
  const b = element.children[1]
  focus(b)
  clearEventCalls()

  const aListeners = addListeners(a)
  const bListeners = addListeners(b)

  await userEvent.tab({shift: true})
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input#b[value=""] - keydown: Shift {shift}
    input#b[value=""] - keydown: Tab {shift}
    input#b[value=""] - focusout
    input#a[value=""] - focusin
    input#a[value=""] - keyup: Tab {shift}
    input#a[value=""] - keyup: Shift
  `)
  // blur/focus do not bubble
  expect(aListeners.eventWasFired('focus')).toBe(true)
  expect(bListeners.eventWasFired('blur')).toBe(true)
})

test('should cycle elements in document tab order', async () => {
  setup(`
    <div>
      <input data-testid="element" type="checkbox" />
      <input data-testid="element" type="radio" />
      <input data-testid="element" type="number" />
    </div>
  `)

  const [checkbox, radio, number] = Array.from(
    document.querySelectorAll<HTMLInputElement>('[data-testid="element"]'),
  )

  expect(document.body).toHaveFocus()

  await userEvent.tab()

  expect(checkbox).toHaveFocus()

  await userEvent.tab()

  expect(radio).toHaveFocus()

  await userEvent.tab()

  expect(number).toHaveFocus()

  await userEvent.tab()

  // cycle goes back to the body
  expect(document.body).toHaveFocus()

  await userEvent.tab()

  expect(checkbox).toHaveFocus()
})

test('should go backwards when shift = true', async () => {
  setup(`
    <div>
      <input data-testid="element" type="checkbox" />
      <input data-testid="element" type="radio" />
      <input data-testid="element" type="number" />
    </div>`)

  const [checkbox, radio, number] = Array.from(
    document.querySelectorAll<HTMLInputElement>('[data-testid="element"]'),
  )

  expect(document.body).toHaveFocus()

  await userEvent.tab({shift: true})

  expect(number).toHaveFocus()

  await userEvent.tab({shift: true})

  expect(radio).toHaveFocus()

  await userEvent.tab({shift: true})

  expect(checkbox).toHaveFocus()

  await userEvent.tab({shift: true})

  // cycle goes back to the body
  expect(document.body).toHaveFocus()

  await userEvent.tab({shift: true})

  expect(number).toHaveFocus()
})

test('should respect tabindex, regardless of dom position', async () => {
  setup(`
    <div>
      <input data-testid="element" tabIndex="2" type="checkbox" />
      <input data-testid="element" tabIndex="1" type="radio" />
      <input data-testid="element" tabIndex="3" type="number" />
    </div>`)

  const [checkbox, radio, number] = Array.from(
    document.querySelectorAll<HTMLInputElement>('[data-testid="element"]'),
  )

  await userEvent.tab()

  expect(radio).toHaveFocus()

  await userEvent.tab()

  expect(checkbox).toHaveFocus()

  await userEvent.tab()

  expect(number).toHaveFocus()

  await userEvent.tab()

  expect(document.body).toHaveFocus()

  await userEvent.tab()

  expect(radio).toHaveFocus()
})

test('should respect tab index order, then DOM order', async () => {
  setup(`
    <div>
      <input data-testid="element" tabIndex="0" type="checkbox" />
      <input data-testid="element" tabIndex="1" type="radio" />
      <input data-testid="element" tabIndex="0" type="number" />
    </div>`)

  const [checkbox, radio, number] = Array.from(
    document.querySelectorAll<HTMLInputElement>('[data-testid="element"]'),
  )

  await userEvent.tab()

  expect(checkbox).toHaveFocus()

  await userEvent.tab()

  expect(number).toHaveFocus()

  await userEvent.tab()

  expect(radio).toHaveFocus()

  await userEvent.tab()

  expect(document.body).toHaveFocus()

  await userEvent.tab()

  expect(checkbox).toHaveFocus()
})

test('should support a mix of elements with/without tab index', async () => {
  setup(`
    <div>
      <input data-testid="element" tabIndex="0" type="checkbox" />
      <input data-testid="element" tabIndex="1" type="radio" />
      <input data-testid="element" type="number" />
    </div>`)

  const [checkbox, radio, number] = Array.from(
    document.querySelectorAll<HTMLInputElement>('[data-testid="element"]'),
  )

  await userEvent.tab()

  expect(checkbox).toHaveFocus()
  await userEvent.tab()

  expect(number).toHaveFocus()
  await userEvent.tab()

  expect(radio).toHaveFocus()
})

test('ignore tabindex when active element has tabindex="-1"', async () => {
  const {
    elements: [inputA, inputB, inputC, inputD],
  } = setup(`
    <input tabindex='1'/>
    <input tabindex='0'/>
    <input tabindex='-1'/>
    <input tabindex='2'/>
  `)

  inputB.focus()
  await userEvent.tab()

  expect(inputA).toHaveFocus()

  inputC.focus()
  await userEvent.tab()

  expect(inputD).toHaveFocus()
})

test('should not tab to <a> with no href', async () => {
  setup(`
    <div>
      <input data-testid="element" tabIndex="0" type="checkbox" />
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a>ignore this</a>
      <a data-testid="element" href="http://www.testingjavascript.com">
        a link
      </a>
    </div>`)

  const [checkbox, link] = Array.from(
    document.querySelectorAll<HTMLInputElement>('[data-testid="element"]'),
  )

  await userEvent.tab()

  expect(checkbox).toHaveFocus()

  await userEvent.tab()

  expect(link).toHaveFocus()
})

test('should not tab to <input> with type="hidden"', async () => {
  const {
    elements: [checkbox, , text],
  } = setup(`
    <input tabIndex="0" type="checkbox" />
    <input type="hidden" />
    <input type="text" />
  `)

  await userEvent.tab()

  expect(checkbox).toHaveFocus()

  await userEvent.tab()

  expect(text).toHaveFocus()
})

// prior to node 11, Array.sort was unstable for arrays w/ length > 10.
// https://twitter.com/mathias/status/1036626116654637057
// for this reason, the tab() function needs to account for this in it's sorting.
// for example under node 10 in this test:
// > 'abcdefghijklmnopqrstuvwxyz'.split('').sort(() => 0).join('')
// will give you 'nacdefghijklmbopqrstuvwxyz'
test('should support unstable sorting environments like node 10', async () => {
  const letters = 'abcdefghijklmnopqrstuvwxyz'

  setup(`
    <div>
      ${letters
        .split('')
        .map(
          letter => `<input key=${letter} type="text" data-testid=${letter} />`,
        )}
    </div>`)

  expect.assertions(26)

  for (const letter of letters.split('')) {
    await userEvent.tab()
    expect(document.querySelector(`[data-testid="${letter}"]`)).toHaveFocus()
  }
})

test('should not focus disabled elements', async () => {
  setup(`
    <div>
      <input data-testid="one" />
      <input tabIndex="-1" />
      <button disabled>click</button>
      <input disabled />
      <input data-testid="five" />
    </div>`)

  const [one, five] = [
    document.querySelector('[data-testid="one"]'),
    document.querySelector('[data-testid="five"]'),
  ]

  await userEvent.tab()
  expect(one).toHaveFocus()

  await userEvent.tab()
  expect(five).toHaveFocus()
})

test('should not focus elements inside a hidden parent', async () => {
  setup(`
    <div>
      <input data-testid="one" />
      <div hidden="">
        <button>click</button>
      </div>
      <input data-testid="three" />
    </div>`)

  const one = document.querySelector('[data-testid="one"]')
  const three = document.querySelector('[data-testid="three"]')

  await userEvent.tab()
  expect(one).toHaveFocus()

  await userEvent.tab()
  expect(three).toHaveFocus()
})

test('should keep focus on the document if there are no enabled, focusable elements', async () => {
  setup(`<button disabled>no clicky</button>`)
  await userEvent.tab()
  expect(document.body).toHaveFocus()

  await userEvent.tab({shift: true})
  expect(document.body).toHaveFocus()
})

test('skip consecutive radios of same group', async () => {
  const {
    elements: [inputA, radioA, radioB, inputB, radioC, radioD, radioE, inputC],
  } = setup(`
    <input/>
    <input type="radio" name="radio1"/>
    <input type="radio" name="radio1"/>
    <input/>
    <input type="radio" name="radio1"/>
    <input type="radio" name="radio2"/>
    <input type="radio" name="radio2"/>
    <input/>
  `)

  inputA.focus()

  await userEvent.tab()
  expect(radioA).toHaveFocus()
  await userEvent.tab()
  expect(inputB).toHaveFocus()
  await userEvent.tab()
  expect(radioC).toHaveFocus()
  await userEvent.tab()
  expect(radioD).toHaveFocus()
  await userEvent.tab()

  expect(inputC).toHaveFocus()

  await userEvent.tab({shift: true})
  expect(radioE).toHaveFocus()
  await userEvent.tab({shift: true})
  expect(radioC).toHaveFocus()
  await userEvent.tab({shift: true})
  expect(inputB).toHaveFocus()
  await userEvent.tab({shift: true})
  expect(radioB).toHaveFocus()
  await userEvent.tab({shift: true})

  expect(inputA).toHaveFocus()
})

test('skip unchecked radios if that group has a checked one', async () => {
  const {
    elements: [inputA, , inputB, radioB, inputC, , inputD],
  } = setup(`
    <input/>
    <input type="radio" name="radio"/>
    <input/>
    <input type="radio" name="radio" checked/>
    <input/>
    <input type="radio" name="radio"/>
    <input/>
  `)

  inputA.focus()

  await userEvent.tab()
  expect(inputB).toHaveFocus()
  await userEvent.tab()
  expect(radioB).toHaveFocus()
  await userEvent.tab()
  expect(inputC).toHaveFocus()
  await userEvent.tab()
  expect(inputD).toHaveFocus()
})

test('tab from active radio when another one is checked', async () => {
  const {
    elements: [, , , radioB, inputC],
  } = setup(`
    <input/>
    <input type="radio" name="radio" checked/>
    <input/>
    <input type="radio" name="radio"/>
    <input/>
  `)

  radioB.focus()

  await userEvent.tab()

  expect(inputC).toHaveFocus()
})

test('calls FocusEvents with relatedTarget', async () => {
  const {
    elements: [element0, element1],
  } = setup('<input/><input/>')

  element0.focus()
  const events0 = addListeners(element0)
  const events1 = addListeners(element1)

  await userEvent.tab()

  expect(
    events0.getEvents().find((e): e is FocusEvent => e.type === 'blur')
      ?.relatedTarget,
  ).toBe(element1)
  expect(
    events1.getEvents().find((e): e is FocusEvent => e.type === 'focus')
      ?.relatedTarget,
  ).toBe(element0)
})

test('should not focus on children of element with style `visiblity: hidden`', () => {
  const {
    elements: [inputA, , inputB],
  } = setup(`
    <input/>
    <div style="visibility: hidden;">
      <input/>
    </div>
    <input/>
  `)

  inputA.focus()
  userEvent.tab()
  expect(inputB).toHaveFocus()
})
