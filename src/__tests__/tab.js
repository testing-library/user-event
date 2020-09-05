import userEvent from '../'
import {focus} from '../focus'
import {setup, addListeners} from './helpers/utils'

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

test('should suport a mix of elements with/without tab index', () => {
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

test('should stay within a focus trap', () => {
  setup(`
    <>
      <div data-testid="div1">
        <input data-testid="element" type="checkbox" />
        <input data-testid="element" type="radio" />
        <input data-testid="element" type="number" />
      </div>
      <div data-testid="div2">
        <input data-testid="element" foo="bar" type="checkbox" />
        <input data-testid="element" foo="bar" type="radio" />
        <input data-testid="element" foo="bar" type="number" />
      </div>
    </>`)

  const [div1, div2] = [
    document.querySelector('[data-testid="div1"]'),
    document.querySelector('[data-testid="div2"]'),
  ]
  const [
    checkbox1,
    radio1,
    number1,
    checkbox2,
    radio2,
    number2,
  ] = document.querySelectorAll('[data-testid="element"]')

  expect(document.body).toHaveFocus()

  userEvent.tab({focusTrap: div1})

  expect(checkbox1).toHaveFocus()

  userEvent.tab({focusTrap: div1})

  expect(radio1).toHaveFocus()

  userEvent.tab({focusTrap: div1})

  expect(number1).toHaveFocus()

  userEvent.tab({focusTrap: div1})

  // cycle goes back to first element
  expect(checkbox1).toHaveFocus()

  userEvent.tab({focusTrap: div2})

  expect(checkbox2).toHaveFocus()

  userEvent.tab({focusTrap: div2})

  expect(radio2).toHaveFocus()

  userEvent.tab({focusTrap: div2})

  expect(number2).toHaveFocus()

  userEvent.tab({focusTrap: div2})

  // cycle goes back to first element
  expect(checkbox2).toHaveFocus()
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

test('should keep focus on the document if there are no enabled, focusable elements', () => {
  setup(`<button disabled>no clicky</button>`)
  userEvent.tab()
  expect(document.body).toHaveFocus()

  userEvent.tab({shift: true})
  expect(document.body).toHaveFocus()
})

test('should respect radio groups', () => {
  setup(`
    <div>
      <input
        data-testid="element"
        type="radio"
        name="first"
        value="first_left"
      />
      <input
        data-testid="element"
        type="radio"
        name="first"
        value="first_right"
      />
      <input
        data-testid="element"
        type="radio"
        name="second"
        value="second_left"
      />
      <input
        data-testid="element"
        type="radio"
        name="second"
        value="second_right"
        checked
      />
    </div>`)

  const [firstLeft, firstRight, , secondRight] = document.querySelectorAll(
    '[data-testid="element"]',
  )

  userEvent.tab()
  expect(firstLeft).toHaveFocus()

  userEvent.tab()
  expect(secondRight).toHaveFocus()

  userEvent.tab({shift: true})
  expect(firstRight).toHaveFocus()
})

it('should respect the correct sequence when elements in the same radiogroup are not consecutive', () => {
  setup(`
    <div>
      <input
        data-testid="element"
        type="radio"
        name="first"
        value="radio_left"
      />
      <button  data-testid="element">Right Button</button>
      <input
        data-testid="element"
        type="radio"
        name="first"
        value="radio_right"
      />
    </div>
  `)

  const [leftRadio, centralButton, rightRadio] = document.querySelectorAll(
    '[data-testid="element"]',
  )
  userEvent.tab()
  expect(leftRadio).toHaveFocus()

  userEvent.tab()
  expect(centralButton).toHaveFocus()

  userEvent.tab()
  expect(rightRadio).toHaveFocus()
})

it('should respect the correct sequence when non focusable radio has the focus', () => {
  setup(`
    <div>
      <input
        data-testid="element"
        type="radio"
        name="first"
        value="radio_left"
      />
      <input
        data-testid="element"
        type="radio"
        name="first"
        value="radio_right"
      />
      <button  data-testid="element">Right Button</button>
    </div>
  `)

  const [leftRadio, rightRadio, rightButton] = document.querySelectorAll(
    '[data-testid="element"]',
  )

  userEvent.click(rightRadio)

  expect(rightRadio).toBeChecked()

  focus(leftRadio)

  userEvent.tab()
  expect(rightButton).toHaveFocus()
})

it('should respect the correct sequence when radio group is beetwen other elements', () => {
  setup(`
    <div>
      <button  data-testid="element">Left Button</button>
      <input
        data-testid="element"
        type="radio"
        name="first"
        value="radio_left"
      />
      <input
        data-testid="element"
        type="radio"
        name="first"
        value="radio_right"
        
      />
      <button  data-testid="element">Right Button</button>
    </div>
  `)

  const [
    leftButton,
    leftRadio,
    rightRadio,
    rightButton,
  ] = document.querySelectorAll('[data-testid="element"]')

  userEvent.tab()
  expect(leftButton).toHaveFocus()

  userEvent.tab()
  expect(leftRadio).toHaveFocus()

  userEvent.tab({shift: true})
  expect(leftButton).toHaveFocus()

  userEvent.tab()
  expect(leftRadio).toHaveFocus()

  userEvent.tab()
  expect(rightButton).toHaveFocus()

  userEvent.tab({shift: true})
  expect(rightRadio).toHaveFocus()
})

test('calls FocusEvents with relatedTarget', () => {
  const {element} = setup('<div><input/><input/></div>')

  const element0 = element.children[0]
  const element1 = element.children[1]
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
