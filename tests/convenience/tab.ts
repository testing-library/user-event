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

test('tab skips focusable descendants of inert ancestors', async () => {
  const {
    elements: [elA, , elC],
    user,
  } = setup(
    `<input id="a"/><div inert><input id="b"/></div><input id="c"/>`,
    {focus: '//input[@id="a"]'},
  )

  await user.tab()
  expect(elC).toHaveFocus()

  await user.tab({shift: true})
  expect(elA).toHaveFocus()
})

test('tab can leave the active element after its ancestor becomes inert', async () => {
  const {
    elements: [, inertContainer, elC],
    xpathNode,
    user,
  } = setup(
    `<input id="a"/><div><input id="b"/></div><input id="c"/>`,
    {focus: '//input[@id="b"]'},
  )

  inertContainer.setAttribute('inert', '')

  await user.tab()
  expect(elC).toHaveFocus()
  expect(xpathNode('//input[@id="b"]')).not.toHaveFocus()
})

test('tab follows flat-tree ancestry when checking inertness', async () => {
  const {
    elements: [elA, host, elC],
    user,
  } = setup(
    `<input id="a"/><div><input id="b" slot="content"/></div><input id="c"/>`,
    {focus: '//input[@id="a"]'},
  )
  host.attachShadow({mode: 'open'}).innerHTML =
    '<div inert><slot name="content"></slot></div>'

  await user.tab()
  expect(elC).toHaveFocus()

  await user.tab({shift: true})
  expect(elA).toHaveFocus()
})

test('tab allows a modal dialog to escape ancestor inertness', async () => {
  const {
    elements: [elA, , elD],
    xpathNode,
    user,
  } = setup(
    `<input id="a"/><div inert><dialog open><input id="b"/><input id="c"/></dialog></div><input id="d"/>`,
    {focus: '//input[@id="b"]'},
  )
  const dialog = xpathNode<HTMLDialogElement>('//dialog')
  const matches = dialog.matches.bind(dialog)
  dialog.matches = selector => selector === ':modal' || matches(selector)

  await user.tab()
  expect(xpathNode('//input[@id="c"]')).toHaveFocus()

  await user.tab()
  expect(xpathNode('//input[@id="b"]')).toHaveFocus()
  expect(elD).not.toHaveFocus()

  await user.tab({shift: true})
  expect(xpathNode('//input[@id="c"]')).toHaveFocus()
  expect(elA).not.toHaveFocus()

  dialog.setAttribute('inert', '')
  elA.focus()
  await user.tab()
  expect(elA).toHaveFocus()
  expect(elD).not.toHaveFocus()
})
