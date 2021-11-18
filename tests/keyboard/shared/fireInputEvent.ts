import {setup} from '#testHelpers/utils'
import userEvent from '#src'

it('dispatch change event on blur', async () => {
  const {element, getEvents} = setup('<input/>')

  element.focus()
  await userEvent.keyboard('foo')
  element.blur()

  expect(getEvents('change')).toHaveLength(1)
})

it('do not dispatch change event if value did not change', async () => {
  const {element, getEvents} = setup('<input/>')

  element.focus()
  await userEvent.keyboard('foo')
  await userEvent.keyboard('{backspace}{backspace}{backspace}')
  element.blur()

  expect(getEvents('change')).toHaveLength(0)
})
