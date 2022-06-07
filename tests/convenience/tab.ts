import {setup} from '#testHelpers'

test('tab', async () => {
  const {
    elements: [elA, elB, elC],
    user,
  } = setup(`<input id="a"/><input id="b"/><input id="c"/>`, {
    focus: '//input[@id="b"]',
  })

  await user.tab()
  expect(elC).toHaveFocus()

  await user.keyboard('[ShiftLeft>]')
  await user.tab()
  expect(elB).toHaveFocus()

  await user.tab()
  expect(elA).toHaveFocus()

  await user.tab({shift: false})
  expect(elB).toHaveFocus()

  await user.tab({shift: true})
  expect(elA).toHaveFocus()

  // shift=true lifted the shift key
  await user.tab()
  expect(elB).toHaveFocus()
})

test('does not focus disabled elements', async () => {
  const {
    elements: [elA, elB, elC],
    user,
  } = setup(`<input id="a" disabled /><input id="b"/><input id="c"/>`, {
    focus: '//input[@id="b"]',
  })

  expect(elA).toBeDisabled()
  expect(elB).toHaveFocus()

  await user.tab()
  expect(elC).toHaveFocus()

  await user.tab()
  await user.tab()
  expect(elB).toHaveFocus()
})

test('does not focus hidden elements', async () => {
  const {
    elements: [elA, elB, elC],
    user,
  } = setup(
    `
    <input id="a"/>
    <input id="b" hidden />
    <input id="c"/>`,
    {focus: '//input[@id="a"]'},
  )

  expect(elB).not.toBeVisible()
  expect(elA).toHaveFocus()

  await user.tab()
  expect(elC).toHaveFocus()

  await user.tab()
  await user.tab()
  expect(elA).toHaveFocus()
})

test('does not focus elements outside of tab order', async () => {
  const {
    elements: [elA, , elC],
    user,
  } = setup(
    `
    <input id="a"/>
    <input id="b" tabindex="-1" />
    <input id="c"/>`,
    {focus: '//input[@id="a"]'},
  )

  expect(elA).toHaveFocus()

  await user.tab()
  expect(elC).toHaveFocus()

  await user.tab()
  await user.tab()
  expect(elA).toHaveFocus()
})

test('does not focus invisible elements', async () => {
  const {
    elements: [elA, elB, elC, elD, elE],
    user,
  } = setup(
    `
    <input id="a"/>
    <input id="b" hidden />
    <input id="c" style="display: none" />
    <input id="d" style="visibility: hidden" />
    <input id="e"/>
  `,
    {focus: '//input[@id="a"]'},
  )

  expect(elB).not.toBeVisible()
  expect(elC).not.toBeVisible()
  expect(elD).not.toBeVisible()

  expect(elA).toHaveFocus()
  await user.tab()
  expect(elE).toHaveFocus()
})
