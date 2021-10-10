import {setup} from '__tests__/helpers/utils'
import userEvent from '../../../'

it('dispatch change event on blur', () => {
  const {element, getEvents} = setup('<input/>')

  element.focus()
  userEvent.keyboard('foo')
  element.blur()

  expect(getEvents('change')).toHaveLength(1)
})

it('do not dispatch change event if value did not change', () => {
  const {element, getEvents} = setup('<input/>')

  element.focus()
  userEvent.keyboard('foo')
  userEvent.keyboard('{backspace}{backspace}{backspace}')
  element.blur()

  expect(getEvents('change')).toHaveLength(0)
})
