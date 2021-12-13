import {getTabDestination} from '#src/utils'
import {setup} from '#testHelpers/utils'

function assertTabOrderForward(tabOrder: Element[]) {
  expect(getTabDestination(document.body, false)).toBe(
    tabOrder[0] ?? document.body,
  )

  for (let i = 0; i < tabOrder.length - 1; i++) {
    expect(getTabDestination(tabOrder[i], false)).toBe(
      i === tabOrder.length - 1 ? document.body : tabOrder[i + 1],
    )
  }
}

function assertTabOrderBackward(tabOrder: Element[]) {
  expect(getTabDestination(document.body, true)).toBe(
    tabOrder[tabOrder.length - 1] ?? document.body,
  )

  for (let i = tabOrder.length - 1; i >= 0; i--) {
    expect(getTabDestination(tabOrder[i], true)).toBe(
      i === 0 ? document.body : tabOrder[i - 1],
    )
  }
}

function assertTabOrder(tabOrder: Element[]) {
  assertTabOrderForward(tabOrder)
  assertTabOrderBackward(tabOrder)
}

test('get next focusable element in document order', () => {
  const {
    elements: [elA, , elC],
  } = setup(`
        <input id="a"/>
        <div></div>
        <input id="c"/>
    `)

  assertTabOrder([elA, elC])
})

test('get next focusable element in tab order', () => {
  const {
    elements: [elA, elB, elC, elD, elE, elF],
  } = setup(`
        <input id="a" tabIndex="2"/>
        <input id="b" tabIndex="0">
        <input id="c" tabIndex="-1"/>
        <input id="d" tabIndex="0">
        <input id="e" tabIndex="1">
        <input id="f" />
    `)

  assertTabOrder([elE, elA, elB, elD, elF])

  expect(getTabDestination(elC, false)).toBe(elD)
  expect(getTabDestination(elC, true)).toBe(elB)
})

test('fall back to document.body', () => {
  setup(`<div tabIndex='></div>`)

  assertTabOrder([])
})

test('exclude hidden elements', () => {
  const {
    elements: [elA],
  } = setup(`
        <input/>
        <input type="hidden"/>
        <input style="visibility: hidden"/>
        <input style="display: none"/>
    `)

  assertTabOrder([elA])
})

test('exclude disabled elements', () => {
  const {
    elements: [elA],
  } = setup(`
        <input/>
        <input disabled/>
    `)

  assertTabOrder([elA])
})

test('exclude anchors without `href` from tab order', () => {
  const {
    elements: [, elB, elC],
  } = setup(`
        <a></a>
        <a href="//example.com"></a>
        <a tabIndex="1"></a>
    `)

  assertTabOrder([elC, elB])
})

test('skip consecutive radios of same group', () => {
  const {
    elements: [elA, elB, elC, elD, elE, elF, elG, elH],
  } = setup(`
    <input id="a"/>
    <input id="b" type="radio" name="radio1"/>
    <input id="c" type="radio" name="radio1"/>
    <input id="d"/>
    <input id="e" type="radio" name="radio1"/>
    <input id="f" type="radio" name="radio2"/>
    <input id="g" type="radio" name="radio2"/>
    <input id="h"/>
  `)

  assertTabOrderForward([elA, elB, elD, elE, elF, elH])
  assertTabOrderBackward([elA, elC, elD, elE, elG, elH])
})

test('skip unchecked radios if group has one checked', () => {
  const {
    elements: [elA, , elC, elD, elE, elF, elG],
  } = setup(`
        <input id="a"/>
        <input id="b" type="radio" name="radio"/>
        <input id="c"/>
        <input id="d" type="radio" name="radio" checked/>
        <input id="e"/>
        <input id="f" type="radio" name="radio"/>
        <input id="g"/>
    `)

  assertTabOrder([elA, elC, elD, elE, elG])

  // Provide normal tab order if an unchecked radio is focused
  expect(getTabDestination(elF, false)).toBe(elG)
  expect(getTabDestination(elF, true)).toBe(elE)
})
