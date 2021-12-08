import userEvent from '#src'
import {setup} from '#testHelpers/utils'

test('tab', async () => {
  const {
    elements: [elA, elB, elC],
  } = setup(`<input id="a"/><input id="b"/><input id="c"/>`)
  const user = userEvent.setup()
  elB.focus()

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
