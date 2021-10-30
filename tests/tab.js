import userEvent from '#src'
import {focus} from '#src/utils'
import {setup, addListeners} from '#testHelpers/utils'

test('fires events when tabbing between two elements', () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(
    `<div><input id="a" /><input id="b" /></div>`,
  )
  const a = element.children[0]
  const b = element.children[1]
  focus(a)
  clearEventCalls()

  const aListeners = addListeners(a)
  const bListeners = addListeners(b)

  userEvent.tab()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input#a[value=""] - keydown: Tab (9)
    input#a[value=""] - focusout
    input#b[value=""] - focusin
    input#b[value=""] - keyup: Tab (9)
  `)
  // blur/focus do not bubble
  expect(aListeners.eventWasFired('blur')).toBe(true)
  expect(bListeners.eventWasFired('focus')).toBe(true)
})

test('does not change focus if default prevented on keydown', () => {
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

  userEvent.tab()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input#a[value=""] - keydown: Tab (9)
    input#a[value=""] - keyup: Tab (9)
  `)
  // blur/focus do not bubble
  expect(aListeners.eventWasFired('blur')).toBe(false)
  expect(bListeners.eventWasFired('focus')).toBe(false)
})

test('tabs backward if shift is already pressed', () => {
  const {
    elements: [elA, elB],
    getEventSnapshot,
    clearEventCalls,
  } = setup(`<input/><input/><input/>`)
  const user = userEvent.setup()
  user.keyboard('[ShiftLeft>]')
  elB.focus()
  clearEventCalls()

  user.tab()

  expect(elA).toHaveFocus()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input[value=""] - keydown: Tab (9) {shift}
    input[value=""] - focusout
    input[value=""] - focusin
    input[value=""] - keyup: Tab (9) {shift}
  `)
})

test('shift option lifts pressed shift key', () => {
  const {
    elements: [, elB, elC],
    getEventSnapshot,
    clearEventCalls,
  } = setup(`<input/><input/><input/>`)
  const user = userEvent.setup()
  user.keyboard('[ShiftRight>]')
  elB.focus()
  clearEventCalls()

  user.tab({shift: false})

  expect(elC).toHaveFocus()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input[value=""] - keyup: Shift (16)
    input[value=""] - keydown: Tab (9)
    input[value=""] - focusout
    input[value=""] - focusin
    input[value=""] - keyup: Tab (9)
  `)
})

test('shift option presses shift key', () => {
  const {
    elements: [elA, elB],
    getEventSnapshot,
    clearEventCalls,
  } = setup(`<input/><input/><input/>`)
  const user = userEvent.setup()
  user.keyboard('[ShiftLeft>]')
  elB.focus()
  clearEventCalls()

  user.tab({shift: true})

  expect(elA).toHaveFocus()
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input[value=""] - keyup: Shift (16)
    input[value=""] - keydown: Shift (16) {shift}
    input[value=""] - keydown: Tab (9) {shift}
    input[value=""] - focusout
    input[value=""] - focusin
    input[value=""] - keyup: Tab (9) {shift}
    input[value=""] - keyup: Shift (16)
  `)
})

test('fires correct events with shift key', () => {
  const {element, getEventSnapshot, clearEventCalls} = setup(
    `<div><input id="a" /><input id="b" /></div>`,
  )
  const a = element.children[0]
  const b = element.children[1]
  focus(b)
  clearEventCalls()

  const aListeners = addListeners(a)
  const bListeners = addListeners(b)

  userEvent.tab({shift: true})
  expect(getEventSnapshot()).toMatchInlineSnapshot(`
    Events fired on: div

    input#b[value=""] - keydown: Shift (16) {shift}
    input#b[value=""] - keydown: Tab (9) {shift}
    input#b[value=""] - focusout
    input#a[value=""] - focusin
    input#a[value=""] - keyup: Tab (9) {shift}
    input#a[value=""] - keyup: Shift (16)
  `)
  // blur/focus do not bubble
  expect(aListeners.eventWasFired('focus')).toBe(true)
  expect(bListeners.eventWasFired('blur')).toBe(true)
})

test('should cycle elements in document tab order', () => {
  setup(`
    <div>
      <input data-testid="element" type="checkbox" />
      <input data-testid="element" type="radio" />
      <input data-testid="element" type="number" />
    </div>
  `)

  const [checkbox, radio, number] = document.querySelectorAll(
    '[data-testid="element"]',
  )

  expect(document.body).toHaveFocus()

  userEvent.tab()

  expect(checkbox).toHaveFocus()

  userEvent.tab()

  expect(radio).toHaveFocus()

  userEvent.tab()

  expect(number).toHaveFocus()

  userEvent.tab()

  // cycle goes back to the body
  expect(document.body).toHaveFocus()

  userEvent.tab()

  expect(checkbox).toHaveFocus()
})

test('should go backwards when shift = true', () => {
  setup(`
    <div>
      <input data-testid="element" type="checkbox" />
      <input data-testid="element" type="radio" />
      <input data-testid="element" type="number" />
    </div>`)

  const [checkbox, radio, number] = document.querySelectorAll(
    '[data-testid="element"]',
  )

  expect(document.body).toHaveFocus()

  userEvent.tab({shift: true})

  expect(number).toHaveFocus()

  userEvent.tab({shift: true})

  expect(radio).toHaveFocus()

  userEvent.tab({shift: true})

  expect(checkbox).toHaveFocus()

  userEvent.tab({shift: true})

  // cycle goes back to the body
  expect(document.body).toHaveFocus()

  userEvent.tab({shift: true})

  expect(number).toHaveFocus()
})

test('should respect tabindex, regardless of dom position', () => {
  setup(`
    <div>
      <input data-testid="element" tabIndex="2" type="checkbox" />
      <input data-testid="element" tabIndex="1" type="radio" />
      <input data-testid="element" tabIndex="3" type="number" />
    </div>`)

  const [checkbox, radio, number] = document.querySelectorAll(
    '[data-testid="element"]',
  )

  userEvent.tab()

  expect(radio).toHaveFocus()

  userEvent.tab()

  expect(checkbox).toHaveFocus()

  userEvent.tab()

  expect(number).toHaveFocus()

  userEvent.tab()

  expect(document.body).toHaveFocus()

  userEvent.tab()

  expect(radio).toHaveFocus()
})

test('should respect tab index order, then DOM order', () => {
  setup(`
    <div>
      <input data-testid="element" tabIndex="0" type="checkbox" />
      <input data-testid="element" tabIndex="1" type="radio" />
      <input data-testid="element" tabIndex="0" type="number" />
    </div>`)

  const [checkbox, radio, number] = document.querySelectorAll(
    '[data-testid="element"]',
  )

  userEvent.tab()

  expect(checkbox).toHaveFocus()

  userEvent.tab()

  expect(number).toHaveFocus()

  userEvent.tab()

  expect(radio).toHaveFocus()

  userEvent.tab()

  expect(document.body).toHaveFocus()

  userEvent.tab()

  expect(checkbox).toHaveFocus()
})

test('should support a mix of elements with/without tab index', () => {
  setup(`
    <div>
      <input data-testid="element" tabIndex="0" type="checkbox" />
      <input data-testid="element" tabIndex="1" type="radio" />
      <input data-testid="element" type="number" />
    </div>`)

  const [checkbox, radio, number] = document.querySelectorAll(
    '[data-testid="element"]',
  )

  userEvent.tab()

  expect(checkbox).toHaveFocus()
  userEvent.tab()

  expect(number).toHaveFocus()
  userEvent.tab()

  expect(radio).toHaveFocus()
})

test('ignore tabindex when active element has tabindex="-1"', () => {
  const {
    elements: [inputA, inputB, inputC, inputD],
  } = setup(`
    <input tabindex='1'/>
    <input tabindex='0'/>
    <input tabindex='-1'/>
    <input tabindex='2'/>
  `)

  inputB.focus()
  userEvent.tab()

  expect(inputA).toHaveFocus()

  inputC.focus()
  userEvent.tab()

  expect(inputD).toHaveFocus()
})

test('should not tab to <a> with no href', () => {
  setup(`
    <div>
      <input data-testid="element" tabIndex="0" type="checkbox" />
      {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
      <a>ignore this</a>
      <a data-testid="element" href="http://www.testingjavascript.com">
        a link
      </a>
    </div>`)

  const [checkbox, link] = document.querySelectorAll('[data-testid="element"]')

  userEvent.tab()

  expect(checkbox).toHaveFocus()

  userEvent.tab()

  expect(link).toHaveFocus()
})

test('should not tab to <input> with type="hidden"', () => {
  const {
    elements: [checkbox, , text],
  } = setup(`
    <input tabIndex="0" type="checkbox" />
    <input type="hidden" />
    <input type="text" />
  `)

  userEvent.tab()

  expect(checkbox).toHaveFocus()

  userEvent.tab()

  expect(text).toHaveFocus()
})

// prior to node 11, Array.sort was unstable for arrays w/ length > 10.
// https://twitter.com/mathias/status/1036626116654637057
// for this reason, the tab() function needs to account for this in it's sorting.
// for example under node 10 in this test:
// > 'abcdefghijklmnopqrstuvwxyz'.split('').sort(() => 0).join('')
// will give you 'nacdefghijklmbopqrstuvwxyz'
test('should support unstable sorting environments like node 10', () => {
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
    userEvent.tab()
    expect(document.querySelector(`[data-testid="${letter}"]`)).toHaveFocus()
  }
})

test('should not focus disabled elements', () => {
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

  userEvent.tab()
  expect(one).toHaveFocus()

  userEvent.tab()
  expect(five).toHaveFocus()
})

test('should not focus elements inside a hidden parent', () => {
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

  userEvent.tab()
  expect(one).toHaveFocus()

  userEvent.tab()
  expect(three).toHaveFocus()
})

test('should keep focus on the document if there are no enabled, focusable elements', () => {
  setup(`<button disabled>no clicky</button>`)
  userEvent.tab()
  expect(document.body).toHaveFocus()

  userEvent.tab({shift: true})
  expect(document.body).toHaveFocus()
})

test('skip consecutive radios of same group', () => {
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

  userEvent.tab()
  expect(radioA).toHaveFocus()
  userEvent.tab()
  expect(inputB).toHaveFocus()
  userEvent.tab()
  expect(radioC).toHaveFocus()
  userEvent.tab()
  expect(radioD).toHaveFocus()
  userEvent.tab()

  expect(inputC).toHaveFocus()

  userEvent.tab({shift: true})
  expect(radioE).toHaveFocus()
  userEvent.tab({shift: true})
  expect(radioC).toHaveFocus()
  userEvent.tab({shift: true})
  expect(inputB).toHaveFocus()
  userEvent.tab({shift: true})
  expect(radioB).toHaveFocus()
  userEvent.tab({shift: true})

  expect(inputA).toHaveFocus()
})

test('skip unchecked radios if that group has a checked one', () => {
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

  userEvent.tab()
  expect(inputB).toHaveFocus()
  userEvent.tab()
  expect(radioB).toHaveFocus()
  userEvent.tab()
  expect(inputC).toHaveFocus()
  userEvent.tab()
  expect(inputD).toHaveFocus()
})

test('tab from active radio when another one is checked', () => {
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

  userEvent.tab()

  expect(inputC).toHaveFocus()
})

test('calls FocusEvents with relatedTarget', () => {
  const {
    elements: [element0, element1],
  } = setup('<input/><input/>')

  element0.focus()
  const events0 = addListeners(element0)
  const events1 = addListeners(element1)

  userEvent.tab()

  expect(events0.getEvents().find(e => e.type === 'blur').relatedTarget).toBe(
    element1,
  )
  expect(events1.getEvents().find(e => e.type === 'focus').relatedTarget).toBe(
    element0,
  )
})
